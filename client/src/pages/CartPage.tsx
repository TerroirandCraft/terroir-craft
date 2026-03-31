import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Star, Tag, CreditCard, MapPin, Phone, Gift, User } from "lucide-react";
import { API_BASE } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/products";
import { getReferral, setReferral, clearReferral } from "@/lib/referral";

// HK Districts for dropdown
const HK_DISTRICTS = [
  "Hong Kong Island — Central & Western 中西區",
  "Hong Kong Island — Wan Chai 灣仔",
  "Hong Kong Island — Eastern 東區",
  "Hong Kong Island — Southern 南區",
  "Kowloon — Yau Tsim Mong 油尖旺",
  "Kowloon — Sham Shui Po 深水埗",
  "Kowloon — Kowloon City 九龍城",
  "Kowloon — Wong Tai Sin 黃大仙",
  "Kowloon — Kwun Tong 觀塘",
  "New Territories — Kwai Tsing 葵青",
  "New Territories — Tsuen Wan 荃灣",
  "New Territories — Tuen Mun 屯門",
  "New Territories — Yuen Long 元朗",
  "New Territories — North 北區",
  "New Territories — Tai Po 大埔",
  "New Territories — Sha Tin 沙田",
  "New Territories — Sai Kung 西貢",
  "New Territories — Islands 離島",
  "Macau 澳門",
];

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const { member, isLoggedIn, refreshMember } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [referralCode, setReferralCode] = useState(getReferral() || "");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Delivery info — pre-fill from member profile
  const [phone, setPhone] = useState(member?.phone || "");
  const [address, setAddress] = useState((member as any)?.address || "");
  const [district, setDistrict] = useState((member as any)?.district || "");

  // Gift toggle
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Points redemption
  const [usePoints, setUsePoints] = useState(false);

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

  // ── Tier discount (exclusive brand items only) ─────────────────────────────
  const TIER_DISCOUNT: Record<string, number> = { Silver: 0.05, Gold: 0.08, Platinum: 0.10 };
  const tierDiscountRate = isLoggedIn && member ? (TIER_DISCOUNT[member.tier] || 0) : 0;

  // Calculate subtotal with tier discount applied to exclusive items only
  const subtotalWithDiscount = items.reduce((sum, item) => {
    const basePrice = item.product.promo_price ?? item.product.price;
    const lineTotal = basePrice * item.quantity;
    // Apply tier discount only to exclusive brand items (not promo_price items)
    const isExclusive = (item.product as any).exclusive === true;
    const isPromo = !!item.product.promo_price;
    const discountedLine = isExclusive && !isPromo
      ? lineTotal * (1 - tierDiscountRate)
      : lineTotal;
    return sum + discountedLine;
  }, 0);

  const tierSavings = totalPrice - subtotalWithDiscount;

  // ── Points redemption ─────────────────────────────────────────────────────
  const POINTS_TO_HKD = 0.10; // 100 pts = HK$10
  const MIN_POINTS_REDEEM = 100;
  const availablePoints = member?.points || 0;
  const maxRedeemable = Math.floor(availablePoints / MIN_POINTS_REDEEM) * MIN_POINTS_REDEEM; // round down to 100s
  const pointsDiscount = usePoints && maxRedeemable >= MIN_POINTS_REDEEM
    ? Math.min(maxRedeemable * POINTS_TO_HKD, subtotalWithDiscount) // cap at subtotal, applies to all items
    : 0;
  const pointsUsed = pointsDiscount / POINTS_TO_HKD; // how many pts being used

  // ── Final totals ─────────────────────────────────────────────────────────
  const subtotalAfterAll = subtotalWithDiscount - pointsDiscount;
  const deliveryFee = subtotalAfterAll >= 1000 ? 0 : 80;
  const orderTotal = subtotalAfterAll + deliveryFee;
  const pointsWillEarn = Math.floor(orderTotal / 5) + (!member?.bonus_first_order ? 100 : 0);

  // Save delivery info to member profile
  const saveDeliveryInfo = async () => {
    if (!member) return;
    try {
      await apiRequest("PATCH", `/api/members/${member.id}/delivery`, {
        phone: phone.trim(),
        address: address.trim(),
        district: district.trim(),
      });
    } catch {
      // Non-blocking — don't fail checkout if this fails
    }
  };

  const handleCheckout = async () => {
    if (!isLoggedIn || !member) {
      toast({ title: "Please login first", description: "Login or register to place an order.", variant: "destructive" });
      return;
    }
    if (!address.trim() || !district.trim()) {
      toast({ title: "送貨地址必填", description: "請填寫送貨地址及地區", variant: "destructive" });
      return;
    }

    setIsOrdering(true);
    try {
      await saveDeliveryInfo();
      if (referralCode.trim()) setReferral(referralCode.trim());
      const ref = getReferral();

      const orderRes = await apiRequest("POST", "/api/orders", {
        customerName: member.name,
        customerEmail: member.email,
        memberId: member.id,
        referredBy: ref || undefined,
        deliveryAddress: `${address.trim()}, ${district.trim()}`,
        customerPhone: phone.trim() || member.phone,
        items: items.map(i => ({
          name: i.product.name,
          itemCode: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.promo_price ?? i.product.price,
        })),
      });
      const orderData = await orderRes.json();

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

  const handlePayNow = async () => {
    if (!isLoggedIn || !member) {
      toast({ title: "Please login first", description: "Login or register to pay.", variant: "destructive" });
      return;
    }
    if (!address.trim() || !district.trim()) {
      toast({ title: "送貨地址必填", description: "請填寫送貨地址及地區", variant: "destructive" });
      return;
    }

    setIsPaying(true);
    try {
      await saveDeliveryInfo();
      if (referralCode.trim()) setReferral(referralCode.trim());
      const orderRef = `TC-${Date.now().toString(36).toUpperCase()}`;
      const subject = items.map(i => i.product.name.split(" - ").pop()).join(", ").substring(0, 64);

      const res = await apiRequest("POST", "/api/payment/create", {
        merchantReference: orderRef,
        amount: orderTotal,
        customerName: member.name,
        customerEmail: member.email,
        customerPhone: phone.trim() || member.phone,
        subject,
        memberId: member.id,
        referredBy: getReferral() || undefined,
        deliveryAddress: `${address.trim()}, ${district.trim()}`,
        isGift,
        recipientName: isGift ? recipientName.trim() : undefined,
        recipientPhone: isGift ? recipientPhone.trim() : undefined,
        pointsRedeemed: usePoints ? pointsUsed : 0,
        items: items.map(i => ({
          name: i.product.name,
          itemCode: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.promo_price ?? i.product.price,
        })),
      });
      const data = await res.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({ title: "Payment failed", description: data.error || "Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      // Show actual server error so we can debug
      const msg = err?.message || "Please try again or contact us.";
      toast({ title: "Payment error", description: msg, variant: "destructive" });
    } finally {
      setIsPaying(false);
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
                <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[hsl(20,10%,12%)]"
                >
                  {item.product.image_url ? (
                    <img
                      src={`${API_BASE}${item.product.image_url}`}
                      alt={item.product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 30 60" className="h-16 w-auto" fill="none" aria-hidden="true">
                      <path d="M10 22 C8 25 7 32 7 40 L7 52 C7 55 10 57 15 57 C20 57 23 55 23 52 L23 40 C23 32 22 25 20 22 L20 14 L10 14 Z" fill="#7B1F2E" opacity="0.9" />
                      <rect x="12" y="9" width="6" height="7" rx="1.5" fill="#7B1F2E" opacity="0.9" />
                    </svg>
                  )}
                </div>
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
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    data-testid={`remove-${item.product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 border border-border rounded-md">
                    <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground" data-testid={`qty-minus-${item.product.id}`}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-sm font-body font-medium w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground" data-testid={`qty-plus-${item.product.id}`}>
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

            {/* Delivery Info — shown when logged in */}
            {isLoggedIn && (
              <div className="bg-card border border-border rounded-xl p-5 mt-2 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-medium mb-0.5">送貨資料 Delivery Info</h3>
                    <p className="font-body text-xs text-muted-foreground">資料會儲存至你的會員帳戶</p>
                  </div>
                  {/* Gift toggle */}
                  <button
                    type="button"
                    onClick={() => setIsGift(g => !g)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-body font-medium transition-all ${
                      isGift
                        ? "bg-[hsl(355,62%,28%)] text-white border-[hsl(355,62%,28%)]"
                        : "bg-background text-muted-foreground border-border hover:border-[hsl(355,62%,28%)]/50"
                    }`}
                    data-testid="gift-toggle"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    送禮 Gift
                  </button>
                </div>

                {/* Gift notice */}
                {isGift && (
                  <div className="bg-[hsl(355,62%,28%)]/8 border border-[hsl(355,62%,28%)]/20 rounded-lg p-3">
                    <p className="font-body text-xs text-[hsl(355,62%,28%)] leading-relaxed">
                      🎁 送禮模式：我們會隨訂單附上 Delivery Note，<strong>不顯示價格</strong>。可場合填寫收禮人資料。
                    </p>
                  </div>
                )}

                {/* Recipient info (gift only) */}
                {isGift && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="font-body text-xs font-medium text-foreground col-span-full">收禮人資料 Recipient</p>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="收禮人姓名 Recipient name"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        className="pl-9 font-body"
                        data-testid="recipient-name"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="收禮人電話 Recipient phone"
                        value={recipientPhone}
                        onChange={e => setRecipientPhone(e.target.value)}
                        className="pl-9 font-body"
                        data-testid="recipient-phone"
                      />
                    </div>
                  </div>
                )}

                {/* Buyer phone */}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="購買人聯絡電話 Your contact number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="pl-9 font-body"
                    data-testid="delivery-phone"
                  />
                </div>

                {/* District */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="delivery-district"
                  >
                    <option value="">選擇地區 Select District *</option>
                    {HK_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    placeholder="送貨地址 Delivery address (樓層、單位、街道、大廈) *"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full pl-9 pr-4 py-2.5 rounded-md border border-input bg-background font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="delivery-address"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
              <h2 className="font-display text-xl font-medium mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm font-body mb-5">
                {/* Original subtotal */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {/* Tier discount row */}
                {isLoggedIn && tierSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {member?.tier} discount ({tierDiscountRate * 100}%)
                    </span>
                    <span>-{formatPrice(tierSavings)}</span>
                  </div>
                )}

                {/* Points redemption toggle */}
                {isLoggedIn && availablePoints >= MIN_POINTS_REDEEM && (
                  <div className={`rounded-lg border p-3 transition-all ${
                    usePoints ? "border-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/5" : "border-border bg-muted/20"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body text-xs font-medium text-foreground">
                          用積分抵扣 Use Points
                        </p>
                        <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                          {availablePoints.toLocaleString()} pts 可用 · 最多扣 {formatPrice(maxRedeemable * POINTS_TO_HKD)}
                        </p>
                      </div>
                      <button
                        onClick={() => setUsePoints(u => !u)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          usePoints ? "bg-[hsl(355,62%,28%)]" : "bg-muted-foreground/30"
                        }`}
                        data-testid="use-points-toggle"
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          usePoints ? "translate-x-5" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                    {usePoints && pointsDiscount > 0 && (
                      <p className="font-body text-xs text-green-600 mt-2">
                        扣減 {formatPrice(pointsDiscount)}（用了 {pointsUsed.toLocaleString()} pts）
                      </p>
                    )}
                  </div>
                )}

                {/* Points discount row */}
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>積分抵扣 Points redemption</span>
                    <span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {subtotalAfterAll < 1000 && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    Add {formatPrice(1000 - subtotalAfterAll)} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-[hsl(355,62%,28%)] font-display">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {/* Points to earn */}
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

              {/* Referral Code */}
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

              {/* Checkout CTAs */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body font-semibold h-12"
                  onClick={handlePayNow}
                  disabled={isPaying || isOrdering}
                  data-testid="pay-now-btn"
                >
                  <CreditCard className="mr-2 w-4 h-4" />
                  {isPaying ? "Redirecting to payment..." : `Pay HK$${orderTotal.toLocaleString()} Now`}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground font-body">
                  Visa / Mastercard · PayMe · FPS · Alipay · WeChat Pay · Octopus
                </p>
                <Button
                  variant="outline"
                  className="w-full font-body text-sm text-muted-foreground"
                  onClick={handleCheckout}
                  disabled={isOrdering || isPaying}
                  data-testid="checkout-btn"
                >
                  {isOrdering ? "Processing..." : "Place Order (Pay Later)"}
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
