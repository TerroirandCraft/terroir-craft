import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { sql } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // ── Create DB tables if they don't exist ──────────────────────────────────
  if (!process.env.DATABASE_URL) {
    console.warn("[DB] DATABASE_URL not set — running without persistent member storage");
  } else try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        password_hash TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        tier TEXT NOT NULL DEFAULT 'Silver',
        bonus_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
        bonus_ig BOOLEAN NOT NULL DEFAULT FALSE,
        bonus_facebook BOOLEAN NOT NULL DEFAULT FALSE,
        bonus_first_order BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS points_log (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL,
        delta INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        token TEXT PRIMARY KEY,
        member_id INTEGER NOT NULL,
        expires_at BIGINT NOT NULL
      )
    `);
    // Add new columns if they don't exist (safe migrations)
    await db.execute(sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`);
    await db.execute(sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS district TEXT DEFAULT ''`);
    console.log("[DB] Tables ready");
  } catch (err) {
    console.error("[DB] Table creation error:", err);
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
