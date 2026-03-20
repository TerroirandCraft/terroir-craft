import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, RefreshCw, Wine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const SUGGESTED = [
  "推薦一支唔超過 HK$500 嘅法國紅酒，配牛扒",
  "Recommend a gift wine under HK$800",
  "有冇好飲嘅 Port Wine？",
  "What's your best Burgundy white wine?",
  "我想搵款澳洲 Shiraz，唔太貴",
  "Suggest a Champagne for a celebration",
];

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-[hsl(355,62%,28%)] flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function SommelierPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg, id: `u_${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId: SESSION_ID }),
      });

      if (!res.ok) throw new Error("Chat failed");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") {
              fullText += data.text;
              setStreamingText(fullText);
            } else if (data.type === "done") {
              setMessages(prev => [
                ...prev,
                { role: "assistant", content: fullText, id: `a_${Date.now()}` },
              ]);
              setStreamingText("");
              setIsLoading(false);
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again.", id: `err_${Date.now()}` },
      ]);
      setStreamingText("");
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const clearChat = async () => {
    setMessages([]);
    setStreamingText("");
    await fetch(`/api/chat/${SESSION_ID}`, { method: "DELETE" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-1">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-1">Terroir & Craft</p>
            <h1 className="font-display text-3xl font-light mb-2">AI Sommelier</h1>
            <p className="font-body text-sm text-white/75 max-w-lg leading-relaxed">
              Your personal wine expert — trained on all 112 wines in our exclusive collection. Ask in <strong>Cantonese or English</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">

        {/* Welcome / suggestions */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[hsl(355,62%,28%)]/10 flex items-center justify-center mx-auto mb-4">
              <Wine className="w-8 h-8 text-[hsl(355,62%,28%)]" />
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">How can I help you find the perfect wine?</h2>
            <p className="font-body text-sm text-muted-foreground mb-8">Ask me anything — budget, occasion, food pairing, or a specific region.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-body text-foreground hover:border-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,28%)]/5 transition-colors text-left"
                  data-testid={`suggestion-${s.slice(0, 20)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 message-enter ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-muted"
                  : "bg-[hsl(355,62%,28%)]"
              }`}>
                {msg.role === "user"
                  ? <span className="font-body text-xs font-semibold text-foreground">You</span>
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <div className={`rounded-2xl px-4 py-3 max-w-[85%] font-body text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[hsl(355,62%,28%)] text-white rounded-tr-none"
                  : "bg-card border border-border text-foreground rounded-tl-none"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming */}
          {streamingText && (
            <div className="flex items-start gap-3 message-enter">
              <div className="w-8 h-8 rounded-full bg-[hsl(355,62%,28%)] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] font-body text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {streamingText}
                <span className="inline-block w-1 h-4 bg-[hsl(355,62%,28%)] ml-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {isLoading && !streamingText && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive"
              title="Clear conversation"
              data-testid="clear-chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about wines, regions, food pairings... (Cantonese or English)"
            rows={1}
            className="resize-none font-body text-sm min-h-10 max-h-32 flex-1"
            data-testid="chat-input"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white h-10 px-4"
            data-testid="chat-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 font-body text-[11px] text-muted-foreground text-center">
          AI Sommelier recommends only from T&C's exclusive catalogue. Press Enter to send.
        </p>
      </div>
    </div>
  );
}
