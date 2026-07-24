import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle, Clock, ShoppingBag, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/CartContext";

export default function PaymentResultPage() {
  let clearCart: (() => void) | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const cart = useCart();
    clearCart = cart.clearCart;
  } catch {
    // CartContext may not be available in some edge cases
  }

  const [ref, setRef] = useState("");
  const [status, setStatus] = useState<"success" | "pending" | "unknown">("pending");

  useEffect(() => {
    try {
      // History API: /payment-result?ref=TC-xxx (also supports legacy hash)
      const hash = window.location.hash;
      const qIndex = hash.indexOf("?");
      const hashQuery = window.location.search.startsWith("?")
        ? window.location.search.slice(1)
        : (qIndex !== -1 ? hash.slice(qIndex + 1) : "");
      const params = new URLSearchParams(hashQuery);
      const refParam = params.get("ref") || "";
      setRef(refParam);

      // If we landed here, payment was completed (Payment Asia only redirects on completion)
      if (refParam) {
        setStatus("success");
        try { clearCart?.(); } catch { /* ignore */ }
      } else {
        setStatus("unknown");
      }
    } catch (e) {
      console.error("[PaymentResult] useEffect error:", e);
      setStatus("unknown");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-light text-foreground mb-2">
                Payment Received!
              </h1>
              <p className="font-display text-xl font-light text-foreground mb-1">
                多謝您的訂購 🎉
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Your payment has been received. We will prepare your order and arrange delivery shortly.
              </p>
            </div>

            {/* Order ref */}
            {ref && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="font-body text-xs text-muted-foreground mb-1">訂單編號 Order Reference</p>
                <p className="font-display text-lg font-medium text-foreground">{ref}</p>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-[hsl(355,62%,28%)]/5 border border-[hsl(355,62%,28%)]/20 rounded-xl p-4 text-left space-y-2">
              <p className="font-body text-xs font-semibold text-[hsl(355,62%,28%)] uppercase tracking-wide">接下來 What happens next</p>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(355,62%,28%)] mt-0.5">✦</span>
                  <span>A <strong>confirmation email</strong> with your invoice has been sent to you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(355,62%,28%)] mt-0.5">✦</span>
                  <span>Delivery within <strong>Hong Kong & Macau</strong> — we'll contact you to confirm timing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(355,62%,28%)] mt-0.5">✦</span>
                  <span><strong>Loyalty points</strong> will be credited to your account automatically</span>
                </li>
              </ul>
            </div>

            {/* WhatsApp support */}
            <div className="rounded-xl border border-border p-4 text-left">
              <p className="font-body text-xs text-muted-foreground mb-2">Questions about your order?</p>
              <a
                href={`https://wa.me/85298055609?text=${encodeURIComponent(`Hi, I just placed order ${ref} and have a question.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium text-white transition-opacity hover:opacity-85"
                style={{ background: "#25D366" }}
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp 查詢訂單
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body">
                  <Home className="mr-2 w-4 h-4" />
                  返回主頁 Return to Homepage
                </Button>
              </Link>
              <Link href="/wines">
                <Button variant="outline" className="w-full font-body">
                  <ShoppingBag className="mr-2 w-4 h-4" />
                  繼續購物 Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}

        {(status === "pending" || status === "unknown") && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="font-display text-2xl font-light">Payment Processing</h1>
            <p className="font-body text-sm text-muted-foreground">
              Your payment is being processed. If successful, you will receive a confirmation email shortly.
            </p>
            <Link href="/">
              <Button className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body">
                Return to Homepage
              </Button>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
