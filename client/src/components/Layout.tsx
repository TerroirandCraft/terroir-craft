import { ReactNode, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ShoppingCart, Menu, X, Wine, Bot, UserCircle, ChevronDown, Tag } from "lucide-react";
import { PROMOTIONS } from "@/pages/PromotionPage";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import tcLogo from "@/assets/tc-logo.jpg";

const navLinks: { href: string; label: string; labelZh: string; isGold?: boolean }[] = [
  { href: "/", label: "Home", labelZh: "首頁" },
  { href: "/wines", label: "Wines", labelZh: "酒款" },
  { href: "/brands", label: "Brands", labelZh: "品牌" },
  { href: "/fine-rare", label: "Fine & Rare", labelZh: "珍稀藏酒", isGold: true },
  { href: "/sommelier", label: "AI Sommelier", labelZh: "AI 侍酒師" },
  { href: "/about", label: "About", labelZh: "關於我們" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useHashLocation();
  const { totalItems } = useCart();
  const { member, isLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const promoRef = useRef<HTMLDivElement>(null);
  const promoList = Object.values(PROMOTIONS);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <div className="bg-[hsl(355,62%,28%)] text-white text-xs py-2 px-4 text-center font-body tracking-wide">
        Free delivery in Hong Kong for orders over HK$1,000 &nbsp;|&nbsp; 香港訂單滿 HK$1,000 免運費
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[hsl(20,12%,8%)/95] backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 shrink-0">
              <img
                src={tcLogo}
                alt="Terroir & Craft 天地人酒業"
                className="h-14 w-auto object-contain"
              />
            </a>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`px-4 py-2 rounded-md text-sm font-medium font-body transition-colors ${
                    link.isGold
                      ? location === link.href
                        ? "text-amber-600 bg-amber-500/10 font-semibold"
                        : "text-amber-600/80 hover:text-amber-600 hover:bg-amber-500/8 font-semibold"
                      : location === link.href
                        ? "text-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                  {link.href === "/sommelier" && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[hsl(355,62%,28%)] text-white uppercase tracking-wide">
                      AI
                    </span>
                  )}
                </a>
              </Link>
            ))}

            {/* Promotions Dropdown */}
            {promoList.length > 0 && (
              <div className="relative" ref={promoRef}>
                <button
                  onClick={() => setPromoOpen(o => !o)}
                  onBlur={(e) => { if (!promoRef.current?.contains(e.relatedTarget as Node)) setPromoOpen(false); }}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium font-body transition-colors ${
                    location.startsWith('/promotions')
                      ? "text-red-600 bg-red-500/10 font-semibold"
                      : "text-red-600/80 hover:text-red-600 hover:bg-red-500/8 font-semibold"
                  }`}
                  data-testid="nav-promotions"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Promotions
                  <ChevronDown className={`w-3 h-3 transition-transform ${promoOpen ? 'rotate-180' : ''}`} />
                </button>

                {promoOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[hsl(20,12%,10%)] border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    {promoList.map(promo => (
                      <Link key={promo.id} href={`/promotions/${promo.id}`}>
                        <a
                          onClick={() => setPromoOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Tag className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-body text-sm font-semibold text-foreground">{promo.title}</p>
                            <p className="font-body text-xs text-muted-foreground">{promo.subtitle}</p>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Member icon */}
            <Link href="/member">
              <a
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors ${
                  location === "/member"
                    ? "text-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-testid="nav-member"
              >
                <UserCircle className="w-4 h-4" />
                {isLoggedIn
                  ? <span className="hidden sm:inline text-xs">{member?.points.toLocaleString()} pts</span>
                  : <span className="hidden sm:inline text-xs">Login</span>
                }
              </a>
            </Link>
            {/* Cart */}
            <Link href="/cart">
              <a className="relative p-2 rounded-md hover:bg-muted transition-colors" data-testid="nav-cart">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(355,62%,28%)] text-white text-[10px] flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </a>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              data-testid="nav-mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    link.isGold
                      ? location === link.href
                        ? "text-amber-600 bg-amber-500/10 font-semibold"
                        : "text-amber-600/80 hover:bg-amber-500/8 font-semibold"
                      : location === link.href
                        ? "text-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/8"
                        : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <span className={`text-xs ${link.isGold ? "text-amber-500/60" : "text-muted-foreground"}`}>{link.labelZh}</span>
                </a>
              </Link>
            ))}
            {/* Promotions in mobile */}
            {promoList.map(promo => (
              <Link key={promo.id} href={`/promotions/${promo.id}`}>
                <a
                  className="flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors text-red-600/90 hover:bg-red-500/8 font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5" />{promo.title}</span>
                  <span className="text-xs text-red-400/60">限時優惠</span>
                </a>
              </Link>
            ))}
            {/* Member link in mobile */}
            <Link href="/member">
              <a
                className={`flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location === "/member"
                    ? "text-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/8"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{isLoggedIn ? member?.name : "Login / Register"}</span>
                <span className="text-xs text-muted-foreground">{isLoggedIn ? `${member?.points} pts` : "會員"}</span>
              </a>
            </Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[hsl(20,12%,10%)] text-white/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src={tcLogo} alt="Terroir & Craft" className="h-12 w-auto mb-4 brightness-200 contrast-50" />
              <p className="text-sm text-white/60 leading-relaxed">
                天地人酒業<br />
                Premium wine importer,<br />
                Hong Kong & Macau.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-display font-semibold text-white mb-3 text-base">Explore</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/wines", label: "Our Wines 酒款" },
                  { href: "/brands", label: "Brands 品牌" },
                  { href: "/fine-rare", label: "Fine & Rare 珍稀藏酒" },
                  { href: "/sommelier", label: "AI Sommelier" },
                  { href: "/about", label: "About Us 關於" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      <a className="text-white/60 hover:text-white transition-colors">{l.label}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-white mb-3 text-base">Contact</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>📞 <a href="tel:+85229818868" className="hover:text-white transition-colors">+852 2981 8868</a></li>
                <li>✉️ <a href="mailto:info@terroirandcraft.com" className="hover:text-white transition-colors">info@terroirandcraft.com</a></li>
                <li className="leading-relaxed">📍 Room 509, 5/F, Seaview Centre,<br />139 Hoi Bun Road, Kwun Tong</li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-display font-semibold text-white mb-3 text-base">Follow Us</h4>
              <div className="flex flex-col gap-2">
                {[
                  {
                    name: "Instagram",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                    href: "https://www.instagram.com/terroirandcraft",
                    color: "hover:text-pink-400",
                  },
                  {
                    name: "Facebook",
                    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                    href: "https://www.facebook.com/terroirandcraft",
                    color: "hover:text-blue-400",
                  },
                  {
                    name: "Threads",
                    icon: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.505-1.808-1.346-3.216-2.537-4.185-1.27-1.036-2.994-1.56-5.12-1.575-2.629.016-4.674.847-6.08 2.467-1.318 1.52-1.985 3.741-2.013 6.585.028 2.844.697 5.063 2.013 6.585 1.406 1.62 3.451 2.45 6.08 2.467.893 0 2.019-.107 2.956-.379 1.064-.308 1.97-.872 2.59-1.618.634-.764.986-1.72 1.047-2.842-.588.087-1.107.136-1.559.142-2.29.044-4.065-.564-5.277-1.807-.697-.71-1.136-1.66-1.297-2.8-.148-1.051-.025-2.13.354-3.12C14.83 6.946 16.515 6 18.756 6c.27 0 .558.013.857.04l-.137-1.254-.002-.014c-.083-.695-.147-1.26-.147-1.83 0-1.015.287-1.76.878-2.278.554-.485 1.365-.721 2.39-.7l.17.005.005-.005.062.005c.814.037 1.514.264 2.077.676.55.403.946.978 1.179 1.712.136.425.19.872.16 1.333a4.3 4.3 0 0 1-.402 1.621c.463.232.827.567 1.077 1.006.25.438.37.944.354 1.498-.023.782-.301 1.468-.826 2.04-.524.57-1.251.93-2.16 1.073-.085.014-.17.026-.256.036.026.337.04.678.04 1.023 0 2.152-.567 4.047-1.686 5.631-1.131 1.6-2.747 2.77-4.807 3.48C21.002 23.656 19.7 24 17.5 24h-5.314z",
                    href: "https://www.threads.net/@terroirandcraft",
                    color: "hover:text-gray-300",
                  },
                ].map(social => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 text-white/60 transition-colors ${social.color}`}
                    data-testid={`social-${social.name.toLowerCase()}`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                      <path d={social.icon} />
                    </svg>
                    <span className="text-sm">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <div className="flex flex-wrap items-center gap-3">
              <p>© 2026 Terroir & Craft 天地人酒業. All rights reserved.</p>
              <span className="text-white/20">·</span>
              <Link href="/terms">
                <a className="hover:text-white/70 transition-colors underline underline-offset-2">Terms & Conditions 服務條款</a>
              </Link>
            </div>
            <a
              href="https://www.perplexity.ai/computer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              Created with Perplexity Computer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
