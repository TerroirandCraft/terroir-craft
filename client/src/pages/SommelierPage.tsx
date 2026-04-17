import { useState, useRef, useEffect } from "react";
import { Bot, Send, Trash2, Wine, Sparkles, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Extract item codes from AI message text e.g. [TCGE-VH0223] or (TCAU-MO0324)
function extractItemCodes(text: string): string[] {
  const matches = text.match(/\[([A-Z]{2,8}-[A-Z]{2,4}[0-9]{2,6}[A-Z0-9]*)\]/g) || [];
  const parens = text.match(/\(([A-Z]{2,8}-[A-Z]{2,4}[0-9]{2,6}[A-Z0-9]*)\)/g) || [];
  const all = [...matches, ...parens].map(m => m.slice(1,-1));
  return [...new Set(all)];
}

// Mini wine card shown below assistant message
function SuggestedWineCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const price = product.promo_price || product.price;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-3 mt-2 hover:border-[hsl(355,62%,28%)]/30 transition-colors">
      {/* Bottle thumbnail */}
      <div className="w-10 h-14 flex items-center justify-center bg-muted rounded-lg shrink-0 overflow-hidden">
        {product.image_url ? (
          <img src={`${API_BASE}${product.image_url}`} alt={product.name}
            className="h-14 w-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
        ) : (
          <Wine className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-xs font-medium text-foreground truncate" style={{fontStyle:"italic"}}>
          {product.name}
        </p>
        <p className="font-body text-[10px] text-muted-foreground">
          {product.brand} · {product.vintage || "NV"}
        </p>
        <p className="font-body text-xs font-semibold mt-0.5" style={{color:"hsl(355,62%,28%)}}"}>
          {formatPrice(price)}
        </p>
      </div>
      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={handleAdd}
          disabled={added || product.status === "Sold Out"}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-body text-[10px] font-semibold text-white transition-all"
          style={{background: added ? "#16a34a" : "hsl(355,62%,28%)"}}
        >
          <ShoppingCart className="w-3 h-3" />
          {added ? "Added!" : "Add"}
        </button>
        <Link href={`/wines/${product.id}`}>
          <a className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-body text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="w-3 h-3" /> Details
          </a>
        </Link>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "紅酒 HK$300以下推薦",
  "白酒推薦 under HK$400",
  "生日送禮揀咩好？",
  "BBQ wine pairing",
  "打邊爐配咩酒？",
  "Burgundy Pinot Noir推薦",
  "Champagne for celebration",
  "有冇促銷優惠？",
];

export default function SommelierPage() {
  const { member } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all products for wine card lookup
  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Add empty assistant message that we'll stream into
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionId }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: (updated[updated.length - 1].content || "") + data.text,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div style={{ background: "hsl(355,62%,28%)", padding: "24px 24px 20px" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg text-white">AI Sommelier</h1>
                <span className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-body font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> LIVE
                </span>
              </div>
              <p className="font-body text-xs text-white/60">
                {member ? `Hi ${member.name.split(" ")[0]}！` : ""}
                問我任何選酒問題 · Ask me anything about wine
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-white/40 hover:text-white/80 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[hsl(355,62%,28%)]/10 flex items-center justify-center mx-auto mb-4">
                <Wine className="w-8 h-8 text-[hsl(355,62%,28%)]" />
              </div>
              <p className="font-display text-xl text-foreground mb-1">你好！我係 T&C AI 侍酒師</p>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Tell me your budget, occasion or favourite style — I'll find the perfect bottle from our catalogue.
              </p>
              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="font-body text-xs px-3 py-1.5 rounded-full border border-border hover:border-[hsl(355,62%,28%)]/50 hover:bg-[hsl(355,62%,28%)]/5 transition-all text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const suggestedIds = msg.role === "assistant" ? extractItemCodes(msg.content) : [];
            const suggestedProducts = suggestedIds.map(id => productMap[id]).filter(Boolean);

            return (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[hsl(355,62%,28%)] flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[hsl(355,62%,28%)] text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                    {msg.role === "assistant" && !msg.content && isLoading && (
                      <span className="inline-flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Wine cards for suggested products */}
                {suggestedProducts.length > 0 && !isLoading && (
                  <div className="ml-11 mt-1 space-y-1 max-w-[80%]">
                    {suggestedProducts.map(p => (
                      <SuggestedWineCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="問我揀酒… Ask me about wine…"
            className="flex-1 font-body text-sm px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-[hsl(355,62%,28%)]/50 focus:ring-1 focus:ring-[hsl(355,62%,28%)]/30 transition-all"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-4"
            style={{ background: "hsl(355,62%,28%)" }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
