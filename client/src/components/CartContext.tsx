import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawItems, setItems] = useState<CartItem[]>([]);

  // Always price cart lines from the latest product data (promo_price included),
  // so a product added before a promotion changed still shows the current price.
  const { data: liveProducts } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const items = useMemo(() => {
    if (!liveProducts || !Array.isArray(liveProducts)) return rawItems;
    const map = new Map(liveProducts.map(p => [p.id, p]));
    return rawItems.map(i => {
      const fresh = map.get(i.product.id);
      return fresh ? { ...i, product: { ...i.product, ...fresh } } : i;
    });
  }, [rawItems, liveProducts]);

  const addToCart = (product: Product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.product.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setItems(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.product.promo_price ?? i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
