import { Bot, Sparkles } from "lucide-react";

export default function SommelierPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-[hsl(355,62%,28%)]/10 border border-[hsl(355,62%,28%)]/20 flex items-center justify-center mb-6">
        <Bot className="w-9 h-9 text-[hsl(355,62%,28%)]" />
      </div>

      {/* Badge */}
      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-body font-semibold px-3 py-1 rounded-full mb-4">
        <Sparkles className="w-3 h-3" />
        即將推出 · Coming Soon
      </div>

      {/* Heading */}
      <h1 className="font-display text-2xl font-bold text-foreground mb-3">
        AI Sommelier
      </h1>

      {/* Description */}
      <p className="font-body text-muted-foreground max-w-sm leading-relaxed mb-2">
        我哋嘅 AI 侍酒師即將上線，為您提供專業嘅選酒建議。
      </p>
      <p className="font-body text-muted-foreground max-w-sm leading-relaxed text-sm">
        Our AI Sommelier is coming soon — helping you discover the perfect wine for every occasion, in Cantonese & English.
      </p>
    </div>
  );
}
