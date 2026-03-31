import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import {
  User, Mail, Lock, Phone, Star, Gift, Instagram,
  Newspaper, ShoppingBag, ChevronRight, LogOut, Award, TrendingUp, Tag
} from "lucide-react";

// ─── Tier config ─────────────────────────────────────────────────────────────
const TIERS = {
  Silver: {
    color: "from-slate-400 to-slate-500",
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "🥈 Silver",
    next: "Gold",
    nextPts: 1000,
  },
  Gold: {
    color: "from-amber-400 to-yellow-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "🥇 Gold",
    next: "Platinum",
    nextPts: 3000,
  },
  Platinum: {
    color: "from-violet-400 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
    label: "💎 Platinum",
    next: null,
    nextPts: null,
  },
};

const BONUS_ACTIONS = [
  {
    key: "newsletter",
    icon: Newspaper,
    label: "Subscribe to Newsletter",
    labelZh: "訂閱電子通訊",
    points: 30,
    flag: "bonus_newsletter" as const,
    href: null,
  },
  {
    key: "ig",
    icon: Instagram,
    label: "Follow on Instagram",
    labelZh: "Follow IG @terroirandcraft",
    points: 20,
    flag: "bonus_ig" as const,
    href: "https://www.instagram.com/terroirandcraft",
    note: "自願申領，毋須驗證是否已 Follow",
  },
];

// ─── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }: { onSuccess: (m: any) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.password !== form.confirm) throw new Error("兩次密碼唔一樣");
      if (form.password.length < 6) throw new Error("密碼最少 6 個字元");
      const res = await apiRequest("POST", "/api/members/register", {
        email: form.email,
        name: form.name,
        phone: form.phone,
        password: form.password,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "歡迎加入！", description: `已獲得 50 積分作為歡迎禮遇 🎉` });
      onSuccess(data);
    },
    onError: (e: any) => setErr(e.message),
  });

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErr("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Full Name 全名" value={form.name} onChange={f("name")} className="pl-9 font-body" data-testid="reg-name" />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Phone 電話 (optional)" value={form.phone} onChange={f("phone")} className="pl-9 font-body" data-testid="reg-phone" />
        </div>
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="email" placeholder="Email address" value={form.email} onChange={f("email")} className="pl-9 font-body" data-testid="reg-email" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="password" placeholder="Password 密碼" value={form.password} onChange={f("password")} className="pl-9 font-body" data-testid="reg-password" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="password" placeholder="Confirm password 確認密碼" value={form.confirm} onChange={f("confirm")} className="pl-9 font-body" data-testid="reg-confirm" />
        </div>
      </div>
      {err && <p className="text-sm text-red-500 font-body">{err}</p>}
      <Button
        className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        data-testid="reg-submit"
      >
        {mutation.isPending ? "Registering..." : "Create Account 登記會員"}
      </Button>
      {/* Perks preview */}
      <div className="rounded-lg bg-[hsl(30,15%,96%)] p-4 text-sm font-body">
        <p className="font-medium text-foreground mb-2">加入即享：</p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>✦ 歡迎積分 <strong>+50 pts</strong></li>
          <li>✦ 每消費 HK$5 賺 1 積分（約 2% 回贈）</li>
          <li>✦ 完成首單額外 <strong>+100 pts</strong></li>
          <li>✦ 積分可用於換取折扣優惠</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Forgot Password Form ────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/members/forgot-password", { email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: () => setSent(true),
    onError: (e: any) => setErr(e.message),
  });

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <Mail className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-display text-lg">電郵已發送！</p>
        <p className="font-body text-sm text-muted-foreground">
          如果此電郵已登記，你會收到重設連結。請檢查收件箱（包括垃圾郵件）。<br/>
          <span className="text-xs">If the email is registered, you'll receive a reset link. Check your inbox and spam folder.</span>
        </p>
        <Button
          variant="outline"
          className="font-body w-full"
          onClick={onBack}
        >
          返回登入 Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          輸入你的登記電郵，我們會發送重設連結給你。<br/>
          <span className="text-xs">Enter your registered email and we'll send you a reset link.</span>
        </p>
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          className="pl-9 font-body"
          data-testid="forgot-email"
        />
      </div>
      {err && <p className="text-sm text-red-500 font-body">{err}</p>}
      <Button
        className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        data-testid="forgot-submit"
      >
        {mutation.isPending ? "發送中..." : "發送重設連結 Send Reset Link"}
      </Button>
      <button
        className="w-full text-center text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        onClick={onBack}
      >
        ← 返回登入
      </button>
    </div>
  );
}

// ─── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: (m: any) => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/members/login", form);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    },
    onSuccess,
    onError: (e: any) => setErr(e.message),
  });

  if (showForgot) {
    return <ForgotPasswordForm onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErr(""); }}
          className="pl-9 font-body"
          data-testid="login-email"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="Password 密碼"
          value={form.password}
          onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErr(""); }}
          className="pl-9 font-body"
          data-testid="login-password"
        />
      </div>
      <div className="flex justify-end">
        <button
          className="text-xs font-body text-muted-foreground hover:text-[hsl(355,62%,28%)] transition-colors underline"
          onClick={() => setShowForgot(true)}
          data-testid="forgot-link"
        >
          忘記密碼？ Forgot password?
        </button>
      </div>
      {err && <p className="text-sm text-red-500 font-body">{err}</p>}
      <Button
        className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        data-testid="login-submit"
      >
        {mutation.isPending ? "Logging in..." : "Login 登入"}
      </Button>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function MemberDashboard() {
  const { member, logout, refreshMember } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: log = [] } = useQuery({
    queryKey: ["/api/members", member?.id, "points"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/members/${member!.id}/points`);
      return res.json();
    },
    enabled: !!member,
  });

  const bonusMutation = useMutation({
    mutationFn: async (action: string) => {
      const res = await apiRequest("POST", `/api/members/${member!.id}/bonus`, { action });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: (updated, action) => {
      const pts = action === "newsletter" ? 30 : 20;
      toast({ title: `+${pts} 積分！`, description: "積分已加入你的帳戶 🎉" });
      refreshMember();
      qc.invalidateQueries({ queryKey: ["/api/members", member?.id, "points"] });
    },
    onError: (e: any) => {
      if (e.message?.includes("already claimed")) {
        toast({ title: "已領取", description: "此獎勵已經領取過了", variant: "destructive" });
      }
    },
  });

  if (!member) return null;

  const tier = TIERS[member.tier as keyof typeof TIERS] || TIERS.Silver;
  const ptsToNext = tier.nextPts ? tier.nextPts - member.points : 0;
  const progressPct = tier.nextPts
    ? Math.min(100, (member.points / tier.nextPts) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div
        className={`rounded-2xl p-6 text-white bg-gradient-to-br ${tier.color} shadow-lg`}
        data-testid="points-card"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs font-body uppercase tracking-wider mb-1">
              {member.name}
            </p>
            <p className="text-white/60 text-xs font-body">{member.email}</p>
          </div>
          <span className="font-body text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
            {tier.label}
          </span>
        </div>
        <div className="mb-4">
          <span className="font-display text-5xl font-light">{member.points.toLocaleString()}</span>
          <span className="font-body text-white/70 ml-2 text-sm">pts</span>
        </div>
        {/* Progress to next tier */}
        {tier.nextPts && (
          <div>
            <div className="flex justify-between text-xs text-white/70 font-body mb-1">
              <span>升級至 {tier.next}</span>
              <span>{ptsToNext > 0 ? `差 ${ptsToNext} pts` : "已達標！"}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-white/50 text-[10px] font-body mt-1">
              Gold 1,000 pts · Platinum 3,000 pts
            </p>
          </div>
        )}
      </div>

      {/* Earn Points Section */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display text-lg font-medium mb-1">賺取積分 Earn Points</h3>
        <p className="font-body text-xs text-muted-foreground mb-4">完成以下行動，即可額外賺取積分</p>
        <div className="space-y-3">
          {BONUS_ACTIONS.map((action) => {
            const claimed = member[action.flag];
            return (
              <div
                key={action.key}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  claimed
                    ? "bg-muted/30 border-muted opacity-60"
                    : "bg-background border-border hover:border-[hsl(355,62%,28%)]/40"
                }`}
                data-testid={`bonus-${action.key}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${claimed ? "bg-muted" : "bg-[hsl(355,62%,28%)]/10"}`}>
                  <action.icon className={`w-4 h-4 ${claimed ? "text-muted-foreground" : "text-[hsl(355,62%,28%)]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground truncate">{action.labelZh}</p>
                  <p className="font-body text-xs text-muted-foreground">+{action.points} pts</p>
                </div>
                {claimed ? (
                  <span className="font-body text-xs text-green-600 font-medium shrink-0">✓ 已領取</span>
                ) : (
                  <div className="flex gap-2 shrink-0">
                    {action.href && (
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        前往
                      </a>
                    )}
                    <Button
                      size="sm"
                      className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white text-xs h-7 px-3 font-body"
                      onClick={() => bonusMutation.mutate(action.key)}
                      disabled={bonusMutation.isPending}
                    >
                      領取 +{action.points}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* First order — info only */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              member.bonus_first_order
                ? "bg-muted/30 border-muted opacity-60"
                : "bg-background border-border"
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${member.bonus_first_order ? "bg-muted" : "bg-[hsl(355,62%,28%)]/10"}`}>
              <ShoppingBag className={`w-4 h-4 ${member.bonus_first_order ? "text-muted-foreground" : "text-[hsl(355,62%,28%)]"}`} />
            </div>
            <div className="flex-1">
              <p className="font-body text-sm font-medium">完成首張訂單</p>
              <p className="font-body text-xs text-muted-foreground">+100 pts（結帳時自動發放）</p>
            </div>
            {member.bonus_first_order
              ? <span className="font-body text-xs text-green-600 font-medium shrink-0">✓ 已領取</span>
              : <span className="font-body text-xs text-muted-foreground shrink-0">自動</span>
            }
          </div>

          {/* Spending — info */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
            <div className="w-9 h-9 rounded-full bg-[hsl(355,62%,28%)]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-[hsl(355,62%,28%)]" />
            </div>
            <div className="flex-1">
              <p className="font-body text-sm font-medium">消費賺分</p>
              <p className="font-body text-xs text-muted-foreground">每消費 HK$5 = 1 積分（~2% 回贈）</p>
            </div>
            <span className="font-body text-xs text-muted-foreground shrink-0">自動</span>
          </div>
        </div>
      </div>

      {/* Points Log */}
      {log.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-lg font-medium mb-4">積分記錄 History</h3>
          <div className="space-y-2">
            {log.slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-body text-sm text-foreground">{entry.reason}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("zh-HK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`font-display font-semibold text-sm ${entry.delta > 0 ? "text-green-600" : "text-red-500"}`}>
                  {entry.delta > 0 ? "+" : ""}{entry.delta} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier benefits */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display text-lg font-medium mb-1">會員等級 Tiers</h3>
        <p className="font-body text-xs text-muted-foreground mb-4">折扣僅適用於獨家品牌常規商品 · Fine & Rare、促銷及 Promotion 商品不適用</p>
        <div className="space-y-3">
          {([
            { key: "Silver", discount: "5%", discountZh: "九五折" },
            { key: "Gold", discount: "8%", discountZh: "九二折" },
            { key: "Platinum", discount: "10%", discountZh: "九折" },
          ] as const).map(({ key: t, discount, discountZh }) => {
            const tc = TIERS[t];
            const isActive = member.tier === t;
            return (
              <div
                key={t}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                  isActive ? "border-[hsl(355,62%,28%)] bg-[hsl(355,62%,28%)]/5" : "border-border"
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tc.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-body text-sm font-semibold">{tc.label}</p>
                    <span className="font-body text-xs px-2 py-0.5 rounded-full bg-[hsl(355,62%,28%)]/10 text-[hsl(355,62%,28%)] font-medium">
                      {discount} off
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {t === "Silver" && "0 – 999 pts"}
                    {t === "Gold" && "1,000 – 2,999 pts"}
                    {t === "Platinum" && "3,000+ pts"}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    <Tag className="w-3 h-3 inline mr-1" />
                    獨家品牌常規商品 {discountZh}
                  </p>
                </div>
                {isActive && (
                  <span className="font-body text-xs text-[hsl(355,62%,28%)] font-medium shrink-0">當前等級</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="font-body text-[11px] text-muted-foreground mt-3 leading-relaxed">
          ⚠️ Fine & Rare、Bordeaux 2022 Promotion 及其他特價商品均不適用會員折扣
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
        data-testid="logout-btn"
      >
        <LogOut className="w-4 h-4" />
        登出 Log out
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MemberPage() {
  const { member, isLoggedIn, login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Member Club</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">
            {isLoggedIn ? `歡迎回來, ${member?.name?.split(" ")[0]}` : "會員俱樂部"}
          </h1>
          <p className="font-body text-white/70 text-sm">
            {isLoggedIn
              ? `你現有 ${member?.points.toLocaleString()} 積分 · ${member?.tier} 會員`
              : "加入即享積分獎賞，每消費賺取回贈"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {isLoggedIn ? (
          <MemberDashboard />
        ) : (
          <div>
            {/* Tab switcher */}
            <div className="flex bg-muted rounded-lg p-1 mb-8">
              <button
                className={`flex-1 py-2 text-sm font-body font-medium rounded-md transition-all ${
                  mode === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setMode("login")}
                data-testid="tab-login"
              >
                登入 Login
              </button>
              <button
                className={`flex-1 py-2 text-sm font-body font-medium rounded-md transition-all ${
                  mode === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setMode("register")}
                data-testid="tab-register"
              >
                登記 Register
              </button>
            </div>

            {mode === "register" ? (
              <RegisterForm onSuccess={login} />
            ) : (
              <LoginForm onSuccess={login} />
            )}

            {mode === "login" && (
              <p className="text-center mt-4 text-sm font-body text-muted-foreground">
                未有帳戶？{" "}
                <button
                  className="text-[hsl(355,62%,28%)] underline"
                  onClick={() => setMode("register")}
                >
                  立即登記
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
