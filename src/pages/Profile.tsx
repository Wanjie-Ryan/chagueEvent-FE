import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { Package, MapPin, Settings, Plus, Pencil, Trash2, LogOut, Clock, CreditCard, Cog, Truck, CheckCircle, XCircle, ArrowLeft, Eye, Ticket } from "lucide-react";
import MyTickets from "@/components/profile/MyTickets";
import { format } from "date-fns";

type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
};

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  customer_email: string | null;
  payment_method: string;
  shipping_address: any;
  discount_amount: number;
  promo_code: string | null;
  notes: string | null;
};

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "tickets" | "addresses" | "settings">("orders");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">My Account</h1>
            <p className="font-body text-sm text-muted-foreground mt-1 truncate max-w-[250px] sm:max-w-none">{user.email}</p>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "orders" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Package size={16} /> Orders
          </button>
          <button onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "tickets" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Ticket size={16} /> My Tickets
          </button>
          <button onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "addresses" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <MapPin size={16} /> Addresses
          </button>
          <button onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Settings size={16} /> Settings
          </button>
        </div>

        {activeTab === "orders" && <OrderHistory userId={user.id} />}
        {activeTab === "tickets" && <MyTickets />}
        {activeTab === "addresses" && <AddressBook userId={user.id} />}
        {activeTab === "settings" && <AccountSettings user={user} signOut={signOut} />}
      </main>

      <Footer />
    </div>
  );
};

function OrderHistory({ userId }: { userId: string }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my_orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (selectedOrder) {
    return <CustomerOrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <Package size={40} className="text-muted-foreground mx-auto mb-4" />
      <p className="font-display text-lg text-muted-foreground">No orders yet</p>
      <Link to="/products" className="font-body text-sm underline text-foreground mt-2 inline-block">Start Shopping</Link>
    </div>
  );

  const statusColor = (s: string) => {
    switch (s) {
      case "delivered": return "bg-foreground text-background";
      case "shipped": return "bg-accent text-accent-foreground";
      case "confirmed": case "paid": return "bg-secondary text-secondary-foreground";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/10 transition-colors cursor-pointer"
          onClick={() => setSelectedOrder(order)}
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-body text-sm font-medium text-foreground">#{order.id.slice(0, 8)}</span>
              <span className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 ${statusColor(order.status)}`}>{order.status}</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-display text-lg font-bold text-foreground">KSH {Number(order.total).toLocaleString()}</p>
            <Eye size={16} className="text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_TIMELINE = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "paid", label: "Paid", icon: CreditCard },
  { key: "processing", label: "Processing", icon: Cog },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function CustomerOrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my_order_items", order.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      if (error) throw error;
      return data;
    },
  });

  const addr = order.shipping_address || {};
  const currentIdx = STATUS_TIMELINE.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h2>
        <p className="font-body text-sm text-muted-foreground">{format(new Date(order.created_at), "MMMM d, yyyy · h:mm a")}</p>
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" ? (
        <div className="border border-border p-5">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-4">Delivery Progress</h3>
          <div className="flex items-center gap-0">
            {STATUS_TIMELINE.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCurrent ? "border-foreground bg-foreground text-background" :
                      isActive ? "border-foreground/50 bg-foreground/10 text-foreground" :
                      "border-border bg-secondary text-muted-foreground"
                    }`}>
                      <StepIcon size={14} />
                    </div>
                    <span className={`font-body text-[10px] mt-1 text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-foreground/50" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <XCircle size={20} className="text-destructive" />
          <p className="font-body text-sm text-destructive font-medium">This order has been cancelled.</p>
        </div>
      )}

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-border p-4 space-y-2">
          <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Payment</h4>
          <p className="font-body text-sm text-foreground">{order.payment_method || "—"}</p>
        </div>
        <div className="border border-border p-4 space-y-2">
          <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Shipping Address</h4>
          {addr.line1 ? (
            <div className="font-body text-sm text-foreground">
              <p>{addr.name || order.customer_name}</p>
              <p className="text-muted-foreground text-xs">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p className="text-muted-foreground text-xs">{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</p>
            </div>
          ) : (
            <p className="font-body text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="border border-border p-5">
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-4">Items</h3>
        {isLoading ? (
          <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="font-body text-sm text-foreground">{item.product_name}</p>
                  {item.variant_info && <p className="font-body text-xs text-muted-foreground">{item.variant_info}</p>}
                  <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-body text-sm font-medium text-foreground">KSH {(Number(item.unit_price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border space-y-1">
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between">
              <span className="font-body text-sm text-muted-foreground">Discount {order.promo_code ? `(${order.promo_code})` : ""}</span>
              <span className="font-body text-sm text-green-600">-KSH {Number(order.discount_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-display text-base font-bold text-foreground">Total</span>
            <span className="font-display text-base font-bold text-foreground">KSH {Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressBook({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["my_addresses", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "Home", full_name: "", address_line1: "", address_line2: "", city: "", state: "", zip_code: "", country: "", is_default: false });

  const saveMutation = useMutation({
    mutationFn: async (addr: typeof form & { id?: string }) => {
      if (addr.id) {
        const { id, ...rest } = addr;
        const { error } = await supabase.from("user_addresses").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_addresses").insert({ ...addr, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my_addresses"] }); setEditing(null); toast({ title: "Address saved" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_addresses"] }),
  });

  const startEdit = (addr?: Address) => {
    if (addr) {
      setEditing(addr.id);
      setForm({ label: addr.label, full_name: addr.full_name, address_line1: addr.address_line1, address_line2: addr.address_line2, city: addr.city, state: addr.state, zip_code: addr.zip_code, country: addr.country, is_default: addr.is_default });
    } else {
      setEditing("new");
      setForm({ label: "Home", full_name: "", address_line1: "", address_line2: "", city: "", state: "", zip_code: "", country: "", is_default: false });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm text-muted-foreground">{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">
          <Plus size={14} /> Add Address
        </button>
      </div>

      {editing && (
        <div className="border border-border p-5 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Label (Home, Work...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <input placeholder="Address Line 1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <input placeholder="Address Line 2 (optional)" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="ZIP" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4" /> Default address
          </label>
          <div className="flex gap-3">
            <button onClick={() => saveMutation.mutate(editing === "new" ? form : { ...form, id: editing! })} className="bg-foreground text-background px-5 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">Save</button>
            <button onClick={() => setEditing(null)} className="border border-border px-5 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !editing ? (
        <div className="text-center py-16">
          <MapPin size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg text-muted-foreground">No saved addresses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-border p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-sm font-medium text-foreground">{addr.label}</span>
                  {addr.is_default && <span className="font-body text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">Default</span>}
                </div>
                <p className="font-body text-sm text-foreground">{addr.full_name}</p>
                <p className="font-body text-xs text-muted-foreground">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="font-body text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.zip_code}, {addr.country}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(addr)} className="p-2 hover:bg-secondary transition-colors text-foreground"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(addr.id); }} className="p-2 hover:bg-secondary transition-colors text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountSettings({ user, signOut }: { user: any; signOut: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setNewPassword("");
    }
  };

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground uppercase mb-4">Account Details</h3>
        <div className="space-y-3">
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Email</label>
            <p className="font-body text-sm text-foreground border border-border px-3 py-2 bg-muted">{user.email}</p>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Member Since</label>
            <p className="font-body text-sm text-foreground border border-border px-3 py-2 bg-muted">{format(new Date(user.created_at), "MMMM d, yyyy")}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-foreground uppercase mb-4">Change Password</h3>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
          />
          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="bg-foreground text-background px-5 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
