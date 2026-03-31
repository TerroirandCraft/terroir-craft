import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wine, ArrowRight } from "lucide-react";

export default function NewArrivalsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">最新到貨</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">New Arrivals</h1>
        </div>
      </div>

      {/* Empty state */}
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[hsl(355,62%,28%)]/8 flex items-center justify-center mx-auto mb-8">
          <Wine className="w-9 h-9 text-[hsl(355,62%,28%)]/60" />
        </div>

        <h2 className="font-display text-2xl font-light text-foreground mb-4">
          我們正在為您精心挑選
        </h2>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-2">
          團隊正四處搜羅有溫度、有故事的優質佳釀，<br className="hidden sm:block" />
          務求為您帶來真正值得珍藏的好酒。
        </p>
        <p className="font-body text-sm text-muted-foreground/80 leading-relaxed mb-10">
          We're out hunting for wines with soul — bottles worth every sip.<br className="hidden sm:block" />
          Stay tuned, good things take time. 🍷
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/wines">
            <Button className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body px-6">
              瀏覽現有酒款 Browse All Wines
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/occasion">
            <Button variant="outline" className="font-body px-6">
              依場合揀酒 Shop by Occasion
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
