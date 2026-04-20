import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/queryClient";

const SECRET = "tc-admin-2026";
type Tab = "orders" | "lines" | "members";

function fmt(d: string) {
  return new Date(d).toLocaleString("zh-HK", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function parseItems(json: string) {
  try { return JSON.parse(json); } catch { return []; }
}

function Cell({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td className={`py-2 px-3 text-xs text-white/75 border-b border-white/5 whitespace-nowrap ${right ? "text-right" : ""}`}>
      {children}
    </td>
  );
}

function Head({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/10 whitespace-nowrap ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("orders");
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading: oLoad, error: oErr, refetch: oRefetch } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/orders?secret=${SECRET}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed");
      return data;
    },
    staleTime: 30000,
  });

  const { data: linesData, isLoading: lLoad, error: lErr, refetch: lRefetch } = useQuery({
    queryKey: ["admin", "order-lines"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/order-lines?secret=${SECRET}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed");
      return data;
    },
    staleTime: 30000,
  });

  const { data: membersData, isLoading: mLoad, refetch: mRefetch } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/admin/members?secret=${SECRET}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    staleTime: 30000,
  });

  const orders: any[] = ordersData?.orders ?? [];
  const lines: any[] = linesData?.lines ?? [];
  const members: any[] = membersData?.members ?? [];

  const q = search.toLowerCase();
  const filteredOrders = orders.filter(o => !q || [o.order_ref, o.customer_name, o.customer_email, o.customer_phone, o.delivery_address].join(" ").toLowerCase().includes(q));
  const filteredLines = lines.filter(l => !q || [l.order_ref, l.item_code, l.item_name, l.brand, l.customer_name, l.customer_email].join(" ").toLowerCase().includes(q));
  const filteredMembers = members.filter(m => !q || [m.name, m.email, m.phone].join(" ").toLowerCase().includes(q));

  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount_paid), 0);
  const totalOrders = orders.length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "orders", label: "訂單 Orders", count: orders.length },
    { key: "lines", label: "銷售記錄 Sales Lines", count: lines.length },
    { key: "members", label: "會員 Members", count: members.length },
  ];

  const refetchAll = () => { oRefetch(); lRefetch(); mRefetch(); };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-body">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/8 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="font-display text-base font-semibold text-white">T&C Admin</span>
          <span className="ml-3 text-xs text-white/30">天地人酒業 · Internal</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span className="text-green-400 font-semibold">HK${totalRevenue.toLocaleString()}</span>
          <span>{totalOrders} orders</span>
          <span>{members.length} members</span>
          <button onClick={refetchAll} className="text-white/40 hover:text-white/70 transition-colors text-xs border border-white/10 rounded px-2 py-1">↻ Refresh</button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-[#111] border-b border-white/8 px-5 py-2 flex items-center gap-3 flex-wrap">
        <div className="flex gap-0.5">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.key ? "bg-[hsl(355,62%,28%)] text-white" : "text-white/40 hover:text-white/70"}`}>
              {t.label} <span className="ml-1 opacity-60">({t.count})</span>
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/25" />
      </div>

      <div className="overflow-x-auto">

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="p-4">
            {oLoad && <p className="text-white/30 text-xs text-center py-8">Loading...</p>}
            {oErr && <p className="text-red-400 text-xs text-center py-8">{String(oErr)}</p>}
            <div className="space-y-2">
              {filteredOrders.map(o => {
                const items = parseItems(o.items_json);
                return (
                  <div key={o.id} className="bg-white/3 border border-white/8 rounded-lg p-3 hover:border-white/15 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[hsl(355,72%,65%)]">{o.order_ref}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${o.xero_status === "PAID" ? "bg-green-500/20 text-green-400" : o.xero_status === "AUTHORISED" ? "bg-blue-500/20 text-blue-400" : "bg-white/8 text-white/30"}`}>{o.xero_status || "pending"}</span>
                        {o.is_gift && <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold">GIFT</span>}
                        <span className="text-[9px] text-white/25">{fmt(o.created_at)}</span>
                      </div>
                      <span className="font-bold text-sm text-white">HK${Number(o.amount_paid).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[11px] mb-2">
                      <div><span className="text-white/30">Name: </span>{o.customer_name}</div>
                      <div><span className="text-white/30">Email: </span>{o.customer_email}</div>
                      <div><span className="text-white/30">Phone: </span>{o.customer_phone || "—"}</div>
                      {o.referred_by && <div><span className="text-white/30">Ref: </span>{o.referred_by}</div>}
                      {o.points_redeemed > 0 && <div><span className="text-white/30">Pts used: </span><span className="text-amber-400">{o.points_redeemed}</span></div>}
                      {o.delivery_address && <div className="col-span-2 sm:col-span-3"><span className="text-white/30">Address: </span>{o.delivery_address}</div>}
                      {o.is_gift && o.recipient_name && <div><span className="text-white/30">Recipient: </span>{o.recipient_name}</div>}
                    </div>
                    {items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                        {items.map((item: any, i: number) => (
                          <span key={i} className="text-[10px] bg-white/4 border border-white/8 rounded px-2 py-0.5 text-white/50">
                            {(item.name || "").replace(/^.*? - /, "")} ×{item.quantity || 1} · HK${item.unitPrice}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SALES LINES TAB ── */}
        {tab === "lines" && (
          <table className="w-full text-xs">
            <thead className="bg-[#111] sticky top-0">
              <tr>
                <Head>Date</Head>
                <Head>Order Ref</Head>
                <Head>Item Code</Head>
                <Head>Item Name</Head>
                <Head>Brand</Head>
                <Head right>Qty</Head>
                <Head right>Orig Price</Head>
                <Head right>Unit Price</Head>
                <Head right>Discount%</Head>
                <Head right>Line Total</Head>
                <Head>Promo</Head>
                <Head>Customer</Head>
                <Head>Email</Head>
                <Head>Phone</Head>
                <Head>Address</Head>
                <Head>Ref By</Head>
                <Head>Tier</Head>
                <Head right>Pts Used</Head>
                <Head right>Order Total</Head>
                <Head>Gift</Head>
                <Head>Recipient</Head>
                <Head>Invoice</Head>
              </tr>
            </thead>
            <tbody>
              {lLoad && <tr><td colSpan={22} className="text-center py-8 text-white/30 text-xs">Loading...</td></tr>}
              {lErr && <tr><td colSpan={22} className="text-center py-8 text-red-400 text-xs">{String(lErr)}</td></tr>}
              {filteredLines.map((l, i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  <Cell>{fmt(l.created_at)}</Cell>
                  <Cell><span className="font-mono text-[hsl(355,72%,65%)]">{l.order_ref}</span></Cell>
                  <Cell><span className="font-mono">{l.item_code}</span></Cell>
                  <Cell>{(l.item_name || "").replace(/^.*? - /, "")}</Cell>
                  <Cell>{l.brand}</Cell>
                  <Cell right>{l.quantity}</Cell>
                  <Cell right>HK${Number(l.original_price).toLocaleString()}</Cell>
                  <Cell right>HK${Number(l.unit_price).toLocaleString()}</Cell>
                  <Cell right>{l.tier_discount_rate > 0 ? `${(Number(l.tier_discount_rate) * 100).toFixed(0)}%` : "—"}</Cell>
                  <Cell right><span className="font-semibold text-white">HK${Number(l.line_total).toLocaleString()}</span></Cell>
                  <Cell>{l.is_promo ? <span className="text-amber-400">PROMO</span> : "—"}</Cell>
                  <Cell>{l.customer_name}</Cell>
                  <Cell>{l.customer_email}</Cell>
                  <Cell>{l.customer_phone || "—"}</Cell>
                  <Cell>{l.delivery_address || "—"}</Cell>
                  <Cell>{l.referred_by || "—"}</Cell>
                  <Cell>
                    {l.member_tier ? (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${l.member_tier === "Platinum" ? "bg-purple-500/20 text-purple-400" : l.member_tier === "Gold" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-300"}`}>
                        {l.member_tier}
                      </span>
                    ) : "—"}
                  </Cell>
                  <Cell right>{l.points_redeemed > 0 ? <span className="text-amber-400">{l.points_redeemed}</span> : "—"}</Cell>
                  <Cell right>HK${Number(l.order_total).toLocaleString()}</Cell>
                  <Cell>{l.is_gift ? <span className="text-pink-400">✓</span> : "—"}</Cell>
                  <Cell>{l.recipient_name || "—"}</Cell>
                  <Cell>{l.xero_invoice ? <span className="text-green-400 font-mono text-[9px]">{l.xero_invoice}</span> : "—"}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <table className="w-full text-xs">
            <thead className="bg-[#111] sticky top-0">
              <tr>
                <Head>ID</Head>
                <Head>Name</Head>
                <Head>Email</Head>
                <Head>Phone</Head>
                <Head>Tier</Head>
                <Head right>Points</Head>
                <Head>Joined</Head>
              </tr>
            </thead>
            <tbody>
              {mLoad && <tr><td colSpan={7} className="text-center py-8 text-white/30 text-xs">Loading...</td></tr>}
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-white/3 transition-colors">
                  <Cell><span className="text-white/30">#{m.id}</span></Cell>
                  <Cell><span className="text-white/90 font-medium">{m.name}</span></Cell>
                  <Cell>{m.email}</Cell>
                  <Cell>{m.phone || "—"}</Cell>
                  <Cell>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${m.tier === "Platinum" ? "bg-purple-500/20 text-purple-400" : m.tier === "Gold" ? "bg-amber-500/20 text-amber-400" : m.tier === "Silver" ? "bg-blue-500/20 text-blue-300" : "bg-white/8 text-white/30"}`}>
                      {m.tier || "Member"}
                    </span>
                  </Cell>
                  <Cell right><span className="text-amber-400 font-semibold">{Number(m.points).toLocaleString()}</span></Cell>
                  <Cell>{fmt(m.created_at)}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
