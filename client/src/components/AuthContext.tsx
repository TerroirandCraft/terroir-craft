import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

export interface MemberProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  points: number;
  tier: "Silver" | "Gold" | "Platinum";
  bonus_newsletter: boolean;
  bonus_ig: boolean;
  bonus_facebook: boolean;
  bonus_first_order: boolean;
  created_at: string;
}

interface AuthContextValue {
  member: MemberProfile | null;
  isLoggedIn: boolean;
  login: (member: MemberProfile) => void;
  logout: () => void;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  member: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  refreshMember: async () => {},
});

// Persist member id in sessionStorage (survives page refresh, cleared on browser close)
// Falls back to in-memory if sessionStorage is unavailable (sandboxed iframe)
function getStoredMemberId(): number | null {
  try { const v = sessionStorage.getItem("tc_member_id"); return v ? Number(v) : null; } catch { return null; }
}
function setStoredMemberId(id: number | null) {
  try {
    if (id === null) sessionStorage.removeItem("tc_member_id");
    else sessionStorage.setItem("tc_member_id", String(id));
  } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberProfile | null>(null);

  // On mount: restore session if stored
  useEffect(() => {
    const storedId = getStoredMemberId();
    if (storedId) {
      apiRequest("GET", `/api/members/${storedId}`)
        .then(r => r.json())
        .then(data => { if (data && !data.error) setMember(data); else setStoredMemberId(null); })
        .catch(() => setStoredMemberId(null));
    }
  }, []);

  const refreshMember = async () => {
    const storedId = getStoredMemberId();
    if (!storedId) return;
    try {
      const res = await apiRequest("GET", `/api/members/${storedId}`);
      const data = await res.json();
      if (data && !data.error) setMember(data);
    } catch {
      // silently ignore
    }
  };

  const login = (m: MemberProfile) => {
    setStoredMemberId(m.id);
    setMember(m);
  };

  const logout = () => {
    setStoredMemberId(null);
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{ member, isLoggedIn: !!member, login, logout, refreshMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
