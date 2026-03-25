import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/products";
import { getReferral, setReferral, clearReferral } from "@/lib/referral";

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { member, isLoggedIn, refreshMember } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [referralCode, setReferralCode] = useState(getReferral() || "");
  const [isOrdering, setIsOrdering] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl mb-2">Your cart is empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Add some wines from our catalogue to get started.
          </p>
          <Link href="/wines">
            <Button className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body" data-testid="cart-browse-btn">
              Browse Wines <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = totalPrice >= 1000 ? 0 : 80;
  const orderTotal = totalPrice + deliveryFee;
  const pointsWillEarn = Math.floor(orderTotal / 5) + (!member?.bonus_first_order ? 100 : 0);

  const handleCheckout = async () => {
    if (!isLoggedIn || !member) {
      toast({ title: "Please login first", description: "Login or register to place an order.", variant: "destructive" });
      return;
    }

    setIsOrdering(true);
    try {
      // Save referral code if entered manually
      if (referralCode.trim()) setReferral(referralCode.trim());
      const ref = getReferral();

      // Create order + Xero invoice
      const orderRes = await apiRequest("POST", "/api/orders", {
        customerName: member.name,
        customerEmail: member.email,
        memberId: member.id,
        referredBy: ref || undefined,
        items: items.map(i => ({
          name: i.product.name,
          itemCode: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.promo_price ?? i.product.price,
        })),
      });
      const orderData = await orderRes.json();

      // Record points
      try {
        const pointsRes = await apiRequest("POST", `/api/members/${member.id}/purchase`, { totalHKD: orderTotal });
        const pointsData = await pointsRes.json();
        if (pointsRes.ok) await refreshMember();
        toast({
          title: `Order Confirmed! ${orderData.invoiceNumber ? `(${orderData.invoiceNumber})` : ""}`,
          description: `+${pointsData.pointsEarned || 0} pts added · Invoice sent to ${member.email}`,
        });
      } catch {
        toast({ title: "Order Confirmed!", description: orderData.message || "Invoice will be sent to your email." });
      }

      clearCart();
      clearReferral();
    } catch (err) {
      toast({ title: "Order failed", description: "Please try again or contact us.", variant: "destructive" });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[hsl(355,62%,28%)] text-white py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-light">Your Cart 購物車</h1>
          <p className="font-body text-sm text-white/70 mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start" data-testid={`cart-item-${item.product.id}`}>
                {/* Mini bottle */}
                <div
                  className="w-14 h-20 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(160deg, hsl(20,10%,12%), hsl(355,62%,28%,0.2))" }}
                >
                  <svg viewBox="0 0 30 60" className="h-16 w-auto" fill="none" aria-hidden="true">
                    <path d="M10 22 C8 25 7 32 7 40 L7 52 C7 55 10 57 15 57 C20 57 23 55 23 52 L23 40 C23 32 22 25 20 22 L20 14 L10 14 Z"
                      fill="#7B1F2E" opacity="0.9" />
                    <rect x="12" y="9" width="6" height="7" rx="1.5" fill="#7B1F2E" opacity="0.9" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-muted-foreground mb-0.5">{item.product.brand}</p>
                  <h3 className="font-display text-sm font-medium text-foreground leading-snug line-clamp-2 mb-1">
                    {item.product.name.replace(item.product.brand + " - ", "")}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">
                    {item.product.type} · {item.product.vintage || "NV"} · {item.product.size}
                  </p>
                  <p className="font-display text-sm font-semibold text-[hsl(355,62%,28%)] mt-2">
                    {formatPrice(item.product.price)} each
                  </p>
                </div>

                {/* Qty + remove */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    data-testid={`remove-${item.product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 border border-border rounded-md">
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                      data-testid={`qty-minus-${item.product.id}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-sm font-body font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-muted-foreground hover:text-foreground"
                      data-testid={`qty-plus-${item.product.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="font-body text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 mt-2">
              <Trash2 className="w-3.5 h-3.5" /> Clear cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
              <h2 className="font-display text-xl font-medium mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm font-body mb-5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {totalPrice < 1000 && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    Add {formatPrice(1000 - totalPrice)} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-[hsl(355,62%,28%)] font-display">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Points preview for logged-in members */}
              {isLoggedIn && (
                <div className="mb-4 flex items-center gap-2.5 bg-[hsl(355,62%,28%)]/8 border border-[hsl(355,62%,28%)]/20 rounded-lg p-3">
                  <Star className="w-4 h-4 text-[hsl(355,62%,28%)] shrink-0" />
                  <p className="font-body text-xs text-foreground">
                    此訂單可賺取 <strong className="text-[hsl(355,62%,28%)]">{pointsWillEarn} 積分</strong>
                    {!member?.bonus_first_order && " （含首單 +100 pts）"}
                  </p>
                </div>
              )}
              {!isLoggedIn && (
                <Link href="/member">
                  <a className="mb-4 flex items-center gap-2.5 bg-muted/50 border border-border rounded-lg p-3 hover:border-[hsl(355,62%,28%)]/30 transition-colors block">
                    <Star className="w-4 h-4 text-[hsl(355,62%,28%)] shrink-0" />
                    <p className="font-body text-xs text-muted-foreground">
                      登入會員可賺取 <strong>{Math.floor(orderTotal / 5) + 100} 積分</strong>（首單額外 +100）
                    </p>
                  </a>
                </Link>
              )}

              {/* Referral Code input */}
              <div className="mb-4">
                <label className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Referral Code （介紹人代碼）
                </label>
                <Input
                  placeholder="e.g. ALAN"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  className="font-body text-sm h-9"
                  data-testid="referral-code-input"
                />
                {getReferral() && (
                  <p className="font-body text-[11px] text-emerald-600 mt-1">✓ Referred by: {getReferral()}</p>
                )}
              </div>

              {/* Checkout CTA */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
                  onClick={handleCheckout}
                  disabled={isOrdering}
                  data-testid="checkout-btn"
                >
                  {isOrdering ? "Processing..." : "Place Order"}
                  {!isOrdering && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
                <a href="mailto:info@terroirandcraft.com?subject=Wine Order Enquiry">
                  <Button variant="outline" className="w-full font-body text-sm">
                    Email Order to Us
                  </Button>
                </a>
              </div>

              <div className="mt-5 flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
                <Package className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Free delivery on orders over HK$1,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
