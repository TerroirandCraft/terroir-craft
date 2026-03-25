// ── Referral tracking ─────────────────────────────────────────────────────
// Reads ?ref= from URL, stores in cookie for 30 days
// Also allows manual referral code entry

const COOKIE_KEY = "tc_ref";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Call once on app load — reads ?ref= from URL and saves to cookie */
export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && ref.trim()) {
    setCookie(COOKIE_KEY, ref.trim().toUpperCase(), COOKIE_DAYS);
  }
}

/** Get current referral code (cookie or null) */
export function getReferral(): string | null {
  return getCookie(COOKIE_KEY);
}

/** Manually set referral code (from form input) */
export function setReferral(code: string) {
  if (code.trim()) {
    setCookie(COOKIE_KEY, code.trim().toUpperCase(), COOKIE_DAYS);
  }
}

/** Clear referral (after order placed) */
export function clearReferral() {
  document.cookie = `${COOKIE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}
