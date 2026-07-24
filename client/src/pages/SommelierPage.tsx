import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Trash2, Wine, Sparkles, ShoppingCart, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { Link } from "wouter";
import { navigate } from "wouter/use-hash-location";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// CODE_PATTERN: AI embeds item codes as {TCAU-MO0123} or {WT355} or {MAN00123} in response text
// Matches codes with or without hyphens, 3-25 chars total
const CODE_PATTERN = /\{([A-Z][A-Z0-9]{1,8}(?:-[A-Z0-9]{2,12})?(?:[0-9]{2,8})?)\}/g;

// Extract item codes embedded by AI as {CODE}
function extractItemCodes(text: string): string[] {
  const codes: string[] = [];
  let m;
  const re = new RegExp(CODE_PATTERN.source, 'g');
  while ((m = re.exec(text)) !== null) {
    codes.push(m[1].trim());
  }
  return [...new Set(codes)].slice(0, 8);
}

// Strip {CODE} tags from display text so customers don't see them
function stripCodes(text: string): string {
  return text.replace(CODE_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
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
        <p className="font-body text-xs font-semibold mt-0.5" style={{color:"hsl(355,62%,28%)"}}>
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
        <Link href={`/wines/${product.id}`} asChild>
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

  // Auto-ask about a specific wine if ?wine=ITEM_CODE in URL
  const autoAskedRef = useRef(false);

  // Extract wine ID from URL — works with hash router (#/sommelier?wine=XXX)
  const getWineIdFromUrl = useCallback(() => {
    // History API: /sommelier?wine=XXX
    const searchWineId = new URLSearchParams(window.location.search).get('wine');
    if (searchWineId) return decodeURIComponent(searchWineId);
    // Fallback: legacy hash compat
    const hash = window.location.hash;
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const wineId = new URLSearchParams(hashQuery).get('wine');
    if (wineId) return decodeURIComponent(wineId);
    // Fallback: sessionStorage (set by ProductPage before navigate)
    return sessionStorage.getItem('tc_ask_wine');
  }, []);

  useEffect(() => {
    if (autoAskedRef.current) return;
    if (!member) return;
    if (allProducts.length === 0) return;
    const wineId = getWineIdFromUrl();
    if (!wineId) return;
    const product = productMap[wineId];
    if (!product) return;
    autoAskedRef.current = true;
    sessionStorage.removeItem('tc_ask_wine');
    // Small delay to ensure sendMessage is ready and UI is rendered
    const autoQuestion = `請介紹一下 ${product.name}，包括佢嘅口感特點、食物配搭同埋適合咩場合飲。`;
    setTimeout(() => sendMessage(autoQuestion), 300);
  }, [member, allProducts]);

  // Only scroll to bottom when a NEW message is added (not on every streaming chunk)
  const msgCountRef = useRef(0);
  useEffect(() => {
    const count = messages.length;
    if (count > msgCountRef.current) {
      msgCountRef.current = count;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
        body: JSON.stringify({ message: text.trim(), sessionId, memberId: member?.id }),
      });

      if (res.status === 401) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "唔好意思，AI Sommelier 係會員專屬功能。請先登入或免費登記成為會員！",
          };
          return updated;
        });
        setIsLoading(false);
        return;
      }

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

  // Members-only gate — show login wall if not logged in
  if (!member) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0" style={{ background: "hsl(355,62%,28%)", padding: "24px 24px 20px" }}>
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
              <img src={`${API_BASE}/ai-sommelier-robot.jpg`} alt="AI Sommelier" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-lg text-white">AI Sommelier</h1>
              <p className="font-body text-xs text-white/60">會員專屬 · Members Only</p>
            </div>
          </div>
        </div>

        {/* Lock card */}
        <div className="text-center max-w-sm w-full mt-24">
          <div className="w-28 h-28 rounded-full bg-[hsl(355,62%,28%)]/10 flex items-center justify-center mx-auto mb-5">
            <img src={`${API_BASE}/ai-sommelier-robot.jpg`} alt="AI Sommelier" className="w-24 h-24 rounded-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-body font-semibold px-3 py-1 rounded-full mb-4">
            <Lock className="w-3 h-3" /> 會員專屬功能
          </div>
          <h2 className="font-display text-2xl font-light text-foreground mb-3">AI 侍酒師</h2>
          <p className="font-body text-sm text-muted-foreground mb-2 leading-relaxed">
            AI Sommelier 係 T&C 會員專屬功能。
          </p>
          <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed">
            登入或免費登記，即可用廣東話或英文問我選酒、配餐、揀禮物！
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/member")}
              className="w-full font-body"
              style={{ background: "hsl(355,62%,28%)" }}
            >
              登入 / 登記會員 Log In / Register
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/wines")}
              className="w-full font-body"
            >
              繼續瀏覽酒款 Browse Wines
            </Button>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-4">免費登記 · 立即使用 · Free to join</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col" style={{ height: "calc(100dvh - 112px)" }}>
      {/* Header */}
      <div style={{ background: "hsl(355,62%,28%)", padding: "24px 24px 20px" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
              <img src={`${API_BASE}/ai-sommelier-robot.jpg`} alt="AI Sommelier" className="w-full h-full object-cover" />
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
              <img src={`${API_BASE}/ai-sommelier-robot.jpg`} alt="AI Sommelier" className="w-48 h-48 object-contain mx-auto mb-4 rounded-full drop-shadow-lg" />
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
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-[hsl(355,62%,28%)]/30">
                      <img src={`${API_BASE}/ai-sommelier-robot.jpg`} alt="" className="w-full h-full object-cover" />
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
                    {msg.role === "assistant" ? stripCodes(msg.content) : msg.content}
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
