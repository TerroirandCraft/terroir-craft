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
      // Get ref from hash query: /#/payment-result?ref=TC-xxx
      // Hash looks like: #/payment-result?ref=TC-xxx
      const hash = window.location.hash; // e.g. "#/payment-result?ref=TC-MNEDUVXE"
      const qIndex = hash.indexOf("?");
      const hashQuery = qIndex !== -1 ? hash.slice(qIndex + 1) : window.location.search.slice(1);
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

            {ref && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="font-body text-xs text-muted-foreground mb-1">訂單編號 Order Reference</p>
                <p className="font-display text-lg font-medium text-foreground">{ref}</p>
              </div>
            )}

            <div className="bg-[hsl(355,62%,28%)]/5 border border-[hsl(355,62%,28%)]/20 rounded-xl p-4 text-left space-y-2">
              <p className="font-body text-xs font-semibold text-[hsl(355,62%,28%)] uppercase tracking-wide">Next steps 接下來</p>
              <ul className="space-y-1.5 font-body text-sm text-muted-foreground">
                <li>✦ An invoice will be emailed to you shortly</li>
                <li>✦ We will contact you to confirm delivery details</li>
                <li>✦ Loyalty points will be added to your account</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body">
                  <Home className="mr-2 w-4 h-4" />
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/wines">
                <Button variant="outline" className="w-full font-body">
                  <ShoppingBag className="mr-2 w-4 h-4" />
                  Continue Shopping
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
