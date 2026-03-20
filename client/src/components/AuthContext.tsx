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

// Persist member id in memory (no localStorage — sandboxed iframe blocks it)
let _cachedMemberId: number | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberProfile | null>(null);

  const refreshMember = async () => {
    if (!_cachedMemberId) return;
    try {
      const res = await apiRequest("GET", `/api/members/${_cachedMemberId}`);
      const data = await res.json();
      if (data && !data.error) setMember(data);
    } catch {
      // silently ignore
    }
  };

  const login = (m: MemberProfile) => {
    _cachedMemberId = m.id;
    setMember(m);
  };

  const logout = () => {
    _cachedMemberId = null;
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
