import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // No-cache for images so updates show immediately
  app.use("/bottle-shots", express.static(path.join(distPath, "bottle-shots"), {
    setHeaders: (res) => { res.setHeader("Cache-Control", "no-cache, must-revalidate"); }
  }));
  app.use("/brand-logos", express.static(path.join(distPath, "brand-logos"), {
    setHeaders: (res) => { res.setHeader("Cache-Control", "no-cache, must-revalidate"); }
  }));
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
