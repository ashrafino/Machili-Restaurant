import { useEffect, useRef, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const PRIMARY = "#00AB84";
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = "";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  phone: string;
  role: string;
  restaurantId?: string;
  restaurantName?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  notes?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isPopular: boolean;
}

type Tab = "orders" | "menu";
type OrderFilter = "active" | "all";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: "New",       bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  confirmed: { label: "Confirmed", bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  preparing: { label: "Preparing", bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6" },
  picked_up: { label: "On the Way",bg: "#CFFAFE", text: "#155E75", dot: "#06B6D4" },
  delivered: { label: "Delivered", bg: "#D1FAE5", text: "#065F46", dot: PRIMARY },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("fr-MA");
}

function useLocalStorage<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback((v: T) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set] as const;
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (token: string, account: Account) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/partner-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      if (data.account?.role !== "restaurant") {
        setError("This portal is for restaurant accounts only.");
        return;
      }
      onLogin(data.token, {
        id: data.account.id,
        name: data.account.name,
        phone: data.account.phone,
        role: data.account.role,
        restaurantId: data.account.restaurant_id,
        restaurantName: data.account.restaurant_name,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: PRIMARY }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Machili Restaurant</h1>
          <p className="text-sm text-gray-500 mt-1">Partner Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+212528881001"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": PRIMARY } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": PRIMARY } as any}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onUpdateStatus,
  updating,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: string) => void;
  updating: string | null;
}) {
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF" };
  const isUpdating = updating === order.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-base">{order.customerName}</span>
            {order.customerPhone && (
              <a
                href={`tel:${order.customerPhone}`}
                className="text-xs font-medium px-2 py-0.5 rounded-full border"
                style={{ borderColor: PRIMARY, color: PRIMARY }}
              >
                Call
              </a>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.text }}
        >
          <span className="mr-1">●</span>{cfg.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0"
                style={{ background: PRIMARY }}
              >
                {item.quantity}
              </span>
              <span className="text-sm text-gray-800">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">{(item.price * item.quantity).toFixed(0)} MAD</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 space-y-3">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Subtotal: <span className="font-semibold text-gray-800">{order.subtotal.toFixed(0)} MAD</span></div>
            {order.deliveryAddress && (
              <div className="flex items-center gap-1">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#9CA3AF"/>
                </svg>
                <span className="truncate max-w-[180px]">{order.deliveryAddress}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-base font-black" style={{ color: PRIMARY }}>{order.total.toFixed(0)} MAD</div>
          </div>
        </div>

        {order.notes && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <span className="text-amber-500 mt-0.5">📝</span>
            <p className="text-xs text-amber-800">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        {order.status === "pending" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
              className="py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 bg-red-50 disabled:opacity-60 transition hover:bg-red-100"
            >
              Decline
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, "confirmed")}
              disabled={isUpdating}
              className="py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition"
              style={{ background: PRIMARY }}
            >
              {isUpdating ? "…" : "Confirm ✓"}
            </button>
          </div>
        )}
        {order.status === "confirmed" && (
          <button
            onClick={() => onUpdateStatus(order.id, "preparing")}
            disabled={isUpdating}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition"
            style={{ background: "#8B5CF6" }}
          >
            {isUpdating ? "…" : "Start Preparing 🍳"}
          </button>
        )}
        {order.status === "preparing" && (
          <div
            className="w-full py-2.5 rounded-xl text-sm font-bold text-center"
            style={{ background: "#EDE9FE", color: "#5B21B6" }}
          >
            Preparing… Waiting for driver pickup
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Menu Section ─────────────────────────────────────────────────────────────

function MenuSection({ token, restaurantName }: { token: string; restaurantName: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/restaurant-app/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const toggleItem = async (itemId: string, current: boolean) => {
    setToggling(itemId);
    try {
      const res = await fetch(`${API}/api/restaurant-app/menu/${itemId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable: !current } : i));
        toast({ title: !current ? "Item enabled" : "Item hidden", description: "Menu updated." });
      }
    } finally {
      setToggling(null);
    }
  };

  const byCategory = items.reduce((acc, item) => {
    const cat = item.categoryName || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-3 border-t-transparent animate-spin" style={{ borderColor: PRIMARY, borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{category}</h3>
          <div className="space-y-2">
            {categoryItems.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition ${
                  item.isAvailable ? "border-gray-100 opacity-100" : "border-gray-100 opacity-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${item.isAvailable ? "text-gray-900" : "text-gray-400 line-through"}`}>
                      {item.name}
                    </span>
                    {item.isPopular && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">🔥 Popular</span>
                    )}
                    {item.isVegetarian && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">🌿 Veg</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                  )}
                  <p className="text-sm font-bold mt-1" style={{ color: PRIMARY }}>{item.price.toFixed(0)} MAD</p>
                </div>
                <button
                  onClick={() => toggleItem(item.id, item.isAvailable)}
                  disabled={toggling === item.id}
                  className={`relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${
                    item.isAvailable ? "" : "bg-gray-200"
                  } ${toggling === item.id ? "opacity-50" : ""}`}
                  style={item.isAvailable ? { background: PRIMARY } : {}}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                      item.isAvailable ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-semibold">No menu items yet</p>
          <p className="text-sm mt-1">Contact Machili support to add items</p>
        </div>
      )}
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function OrdersSection({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>("active");
  const [updating, setUpdating] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const load = useCallback(async (f: OrderFilter = filter) => {
    try {
      const res = await fetch(`${API}/api/restaurant-app/orders${f === "all" ? "?status=all" : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    timerRef.current = setInterval(() => load(), 20000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`${API}/api/restaurant-app/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        const labels: Record<string, string> = { confirmed: "Order confirmed", preparing: "Preparing started", cancelled: "Order declined" };
        toast({ title: labels[status] ?? "Status updated" });
      } else {
        toast({ title: "Failed to update", variant: "destructive" });
      }
    } finally {
      setUpdating(null);
    }
  };

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const shown = filter === "active" ? activeOrders : orders;
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("active")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
            filter === "active" ? "text-white shadow-sm" : "bg-gray-100 text-gray-600"
          }`}
          style={filter === "active" ? { background: PRIMARY } : {}}
        >
          Active
          {pendingCount > 0 && (
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${filter === "active" ? "bg-white" : "text-white"}`}
              style={filter !== "active" ? { background: "#EF4444" } : { color: "#EF4444" }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            filter === "all" ? "text-white shadow-sm" : "bg-gray-100 text-gray-600"
          }`}
          style={filter === "all" ? { background: PRIMARY } : {}}
        >
          All Orders
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: PRIMARY, borderTopColor: "transparent" }} />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-semibold text-gray-600">
            {filter === "active" ? "No active orders" : "No orders yet"}
          </p>
          <p className="text-sm mt-1">
            {filter === "active" ? "New orders will appear here automatically" : "Orders will show up here once you start receiving them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={updateStatus}
              updating={updating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard({
  token,
  account,
  onLogout,
}: {
  token: string;
  account: Account;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("orders");
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/api/restaurant-app/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setIsOpen(d.isOpen !== false))
      .catch(() => setIsOpen(true));
  }, [token]);

  const toggleOpen = async () => {
    if (isOpen === null) return;
    setTogglingStatus(true);
    const next = !isOpen;
    try {
      const res = await fetch(`${API}/api/restaurant-app/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: next }),
      });
      if (res.ok) {
        setIsOpen(next);
        toast({ title: next ? "Restaurant is now Open" : "Restaurant is now Closed" });
      }
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: PRIMARY }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-gray-900 text-base leading-tight truncate">
              {account.restaurantName || account.name}
            </h1>
            <p className="text-xs text-gray-400">Restaurant Portal</p>
          </div>

          {/* Open/Closed toggle */}
          <button
            onClick={toggleOpen}
            disabled={togglingStatus || isOpen === null}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              isOpen ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"
            } disabled:opacity-60`}
          >
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
            {isOpen === null ? "…" : isOpen ? "Open" : "Closed"}
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex border-t border-gray-50">
          {(["orders", "menu"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-bold relative transition ${
                tab === t ? "" : "text-gray-400"
              }`}
              style={tab === t ? { color: PRIMARY } : {}}
            >
              {t === "orders" ? "📋 Orders" : "🍽️ Menu"}
              {tab === t && (
                <span
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: PRIMARY }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {tab === "orders" ? (
          <OrdersSection token={token} />
        ) : (
          <MenuSection token={token} restaurantName={account.restaurantName || account.name} />
        )}
      </main>

      {/* Bottom safe area */}
      <div className="h-8" />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [token, setToken] = useLocalStorage<string | null>("machili_restaurant_token", null);
  const [account, setAccount] = useLocalStorage<Account | null>("machili_restaurant_account", null);

  const handleLogin = (t: string, a: Account) => {
    setToken(t);
    setAccount(a);
  };

  const handleLogout = () => {
    setToken(null);
    setAccount(null);
  };

  if (!token || !account) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Dashboard token={token} account={account} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}
