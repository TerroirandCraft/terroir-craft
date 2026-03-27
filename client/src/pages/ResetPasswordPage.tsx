import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Read token from hash query string: /#/reset-password?token=xxx
  const token = new URLSearchParams(window.location.search).get("token") ||
    new URLSearchParams(window.location.hash.split("?")[1] || "").get("token") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.password !== form.confirm) throw new Error("兩次密碼唔一樣");
      if (form.password.length < 6) throw new Error("密碼最少 6 個字元");
      const res = await apiRequest("POST", "/api/members/reset-password", {
        token,
        password: form.password,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重設失敗");
      return data;
    },
    onSuccess: () => {
      setDone(true);
      toast({ title: "密碼已重設！", description: "請用新密碼登入。" });
    },
    onError: (e: any) => setErr(e.message),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="font-display text-2xl font-light">連結無效</h1>
          <p className="font-body text-sm text-muted-foreground">
            此重設連結無效或已過期。請重新申請。
          </p>
          <Button
            className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
            onClick={() => navigate("/members")}
          >
            返回登入頁面
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h1 className="font-display text-2xl font-light">密碼已重設！</h1>
          <p className="font-body text-sm text-muted-foreground">
            你的密碼已成功更改。請用新密碼登入。
          </p>
          <Button
            className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
            onClick={() => navigate("/members")}
          >
            前往登入 Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Member Club</p>
          <h1 className="font-display text-4xl font-light">重設密碼</h1>
          <p className="font-body text-white/70 text-sm mt-1">Reset Password</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-4">
          <p className="font-body text-sm text-muted-foreground">
            請輸入你的新密碼。密碼最少 6 個字元。
          </p>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="新密碼 New password"
              value={form.password}
              onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErr(""); }}
              className="pl-9 font-body"
              data-testid="reset-password"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="確認新密碼 Confirm new password"
              value={form.confirm}
              onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setErr(""); }}
              className="pl-9 font-body"
              data-testid="reset-confirm"
            />
          </div>

          {err && <p className="text-sm text-red-500 font-body">{err}</p>}

          <Button
            className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            data-testid="reset-submit"
          >
            {mutation.isPending ? "重設中..." : "確認重設 Reset Password"}
          </Button>

          <p className="text-center text-sm font-body text-muted-foreground">
            <button
              className="text-[hsl(355,62%,28%)] underline"
              onClick={() => navigate("/members")}
            >
              返回登入
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
