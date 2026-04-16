import { useState } from "react";
import { useOrders, useOrderItems, useUpdateOrderStatus, useCreateOrder, useDeleteOrder, type Order, type OrderStatus } from "@/hooks/useOrders";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Trash2, Plus, X, Save, Package, Truck, CheckCircle, Clock,
  Download, Search, XCircle, CreditCard, Cog, Eye, ArrowLeft
} from "lucide-react";
import { downloadCSV } from "@/lib/csvExport";
import { format } from "date-fns";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600" },
  paid: { label: "Paid", icon: CreditCard, color: "text-emerald-600" },
  processing: { label: "Processing", icon: Cog, color: "text-orange-600" },
  confirmed: { label: "Confirmed", icon: Package, color: "text-blue-600" },
  shipped: { label: "Shipped", icon: Truck, color: "text-purple-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
};

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "confirmed", "shipped", "delivered", "cancelled"];

const OrdersManager = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "",
    notes: "",
    items: [{ product_name: "", variant_info: "", quantity: 1, unit_price: 0 }],
  });

  const filteredOrders = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    });

  const handleStatusChange = async (id: string, status: OrderStatus, order?: Order) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: `Order marked as ${STATUS_CONFIG[status].label}` });

      // Send status change notification to customer
      if (order?.customer_email) {
        try {
          await supabase.functions.invoke("send-order-status-update", {
            body: {
              order_id: id,
              customer_email: order.customer_email,
              customer_name: order.customer_name,
              new_status: status,
              status_label: STATUS_CONFIG[status].label,
            },
          });
        } catch {
          // Silent fail for notification — order status already updated
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      await deleteOrder.mutateAsync(id);
      toast({ title: "Order deleted" });
      if (detailOrder?.id === id) setDetailOrder(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateOrder = async () => {
    const total = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    try {
      await createOrder.mutateAsync({
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || undefined,
        payment_method: form.payment_method,
        notes: form.notes,
        total,
        items: form.items,
      });
      toast({ title: "Order created" });
      setShowNew(false);
      setForm({ customer_name: "", customer_phone: "", customer_email: "", payment_method: "", notes: "", items: [{ product_name: "", variant_info: "", quantity: 1, unit_price: 0 }] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const addItemRow = () => setForm((f) => ({ ...f, items: [...f.items, { product_name: "", variant_info: "", quantity: 1, unit_price: 0 }] }));
  const removeItemRow = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItemRow = (idx: number, field: string, value: any) =>
    setForm((f) => ({ ...f, items: f.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)) }));

  if (isLoading) return <div className="py-8 text-center text-muted-foreground font-body text-sm">Loading orders...</div>;

  // Detail View
  if (detailOrder) {
    return <OrderDetailView order={detailOrder} onBack={() => setDetailOrder(null)} onStatusChange={handleStatusChange} onDelete={handleDelete} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-semibold text-foreground">Orders ({orders.length})</h2>
        <div className="flex items-center gap-2">
          <button onClick={async () => {
            // Fetch all order items for export
            const { data: allItems } = await supabase.from("order_items").select("*");
            const itemsByOrder: Record<string, any[]> = {};
            (allItems || []).forEach((item: any) => {
              if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
              itemsByOrder[item.order_id].push(item);
            });
            const rows: Record<string, any>[] = [];
            orders.forEach(o => {
              const items = itemsByOrder[o.id] || [];
              if (items.length === 0) {
                rows.push({
                  order_id: o.id, customer: o.customer_name, phone: o.customer_phone, email: o.customer_email || "",
                  status: o.status, total: o.total, payment: o.payment_method || "", discount: o.discount_amount,
                  promo: o.promo_code || "", date: o.created_at, product: "", variant: "", qty: "", unit_price: "", line_total: "",
                });
              } else {
                items.forEach((item: any) => {
                  rows.push({
                    order_id: o.id, customer: o.customer_name, phone: o.customer_phone, email: o.customer_email || "",
                    status: o.status, total: o.total, payment: o.payment_method || "", discount: o.discount_amount,
                    promo: o.promo_code || "", date: o.created_at, product: item.product_name, variant: item.variant_info,
                    qty: item.quantity, unit_price: item.unit_price, line_total: item.quantity * item.unit_price,
                  });
                });
              }
            });
            downloadCSV(rows, "orders-with-items");
            toast({ title: "Orders exported with items" });
          }} className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 font-body text-sm font-medium hover:bg-secondary transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or order ID..."
          className="w-full border border-border bg-background text-foreground pl-10 pr-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...STATUSES] as const).map((s) => {
          const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 font-body text-xs font-medium border transition-colors ${filter === s ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "All" : STATUS_CONFIG[s].label} ({count})
            </button>
          );
        })}
      </div>

      {/* New Order Form */}
      {showNew && (
        <div className="border border-border p-6 space-y-4 bg-secondary/30">
          <h3 className="font-display text-lg font-semibold text-foreground">New Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Phone Number" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Email (optional)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
          </div>
          <input placeholder="Payment Method" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
            className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />

          <div className="space-y-2">
            <p className="font-body text-xs font-semibold text-foreground">Items</p>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                <input placeholder="Product name" value={item.product_name} onChange={(e) => updateItemRow(idx, "product_name", e.target.value)}
                  className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground col-span-2 md:col-span-1" />
                <input placeholder="Variant (size/color)" value={item.variant_info} onChange={(e) => updateItemRow(idx, "variant_info", e.target.value)}
                  className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
                <input type="number" placeholder="Qty" value={item.quantity || ""} onChange={(e) => updateItemRow(idx, "quantity", Number(e.target.value))}
                  className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
                <input type="number" placeholder="Price (KSH)" value={item.unit_price || ""} onChange={(e) => updateItemRow(idx, "unit_price", Number(e.target.value))}
                  className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
                <button onClick={() => removeItemRow(idx)} className="text-muted-foreground hover:text-destructive p-1 justify-self-start">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={addItemRow} className="font-body text-xs text-primary hover:opacity-80 flex items-center gap-1">
              <Plus size={12} /> Add Item
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreateOrder} disabled={createOrder.isPending}
              className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
              <Save size={14} /> {createOrder.isPending ? "Saving..." : "Save Order"}
            </button>
            <button onClick={() => setShowNew(false)} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-muted-foreground">
          {search ? `No orders matching "${search}"` : "No orders found."}
        </p>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider">Order ID</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider">Customer</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider">Total</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider">Status</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-3 px-4 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="font-body text-xs font-mono text-foreground py-3 px-4">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-body text-sm font-medium text-foreground">{order.customer_name || "—"}</p>
                      <p className="font-body text-xs text-muted-foreground md:hidden">{order.customer_email || ""}</p>
                    </td>
                    <td className="font-body text-xs text-muted-foreground py-3 px-4 hidden md:table-cell">{order.customer_email || "—"}</td>
                    <td className="font-body text-sm font-semibold text-foreground py-3 px-4">KSH {Number(order.total).toLocaleString()}</td>
                    <td className="font-body text-xs text-muted-foreground py-3 px-4 hidden sm:table-cell">{order.payment_method || "—"}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus, order)}
                        className={`border border-border bg-background px-2 py-1 font-body text-xs focus:outline-none ${config.color}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                    </td>
                    <td className="font-body text-xs text-muted-foreground py-3 px-4 hidden lg:table-cell">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailOrder(order)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Order Detail View ───
const OrderDetailView = ({ order, onBack, onStatusChange, onDelete }: {
  order: Order;
  onBack: () => void;
  onStatusChange: (id: string, status: OrderStatus, order?: Order) => void;
  onDelete: (id: string) => void;
}) => {
  const { data: items = [], isLoading } = useOrderItems(order.id);
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const addr = order.shipping_address || {};

  const timeline: string[] = STATUSES.filter(s => s !== "cancelled");
  const currentIdx = timeline.indexOf(order.status);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h2>
          <p className="font-body text-sm text-muted-foreground">{format(new Date(order.created_at), "MMMM d, yyyy · h:mm a")}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus, order)}
            className={`border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none ${config.color}`}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <button onClick={() => onDelete(order.id)} className="p-2 text-muted-foreground hover:text-destructive border border-border hover:border-destructive transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Order Timeline */}
      {order.status !== "cancelled" && (
        <div className="border border-border p-5">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-4">Order Timeline</h3>
          <div className="flex items-center gap-0">
            {timeline.map((s, i) => {
              const stepConfig = STATUS_CONFIG[s];
              const StepIcon = stepConfig.icon;
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCurrent ? "border-foreground bg-foreground text-background" :
                      isActive ? "border-foreground/50 bg-foreground/10 text-foreground" :
                      "border-border bg-secondary text-muted-foreground"
                    }`}>
                      <StepIcon size={14} />
                    </div>
                    <span className={`font-body text-[10px] mt-1 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {stepConfig.label}
                    </span>
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-foreground/50" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <XCircle size={20} className="text-destructive" />
          <p className="font-body text-sm text-destructive font-medium">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="border border-border p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Customer Information</h3>
          <div className="space-y-2">
            <div><span className="font-body text-xs text-muted-foreground">Name</span><p className="font-body text-sm text-foreground">{order.customer_name || "—"}</p></div>
            <div><span className="font-body text-xs text-muted-foreground">Email</span><p className="font-body text-sm text-foreground">{order.customer_email || "—"}</p></div>
            <div><span className="font-body text-xs text-muted-foreground">Phone</span><p className="font-body text-sm text-foreground">{order.customer_phone || "—"}</p></div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="border border-border p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Shipping & Payment</h3>
          <div className="space-y-2">
            <div>
              <span className="font-body text-xs text-muted-foreground">Payment Method</span>
              <p className="font-body text-sm text-foreground">{order.payment_method || "—"}</p>
            </div>
            <div>
              <span className="font-body text-xs text-muted-foreground">Shipping Address</span>
              {addr.line1 ? (
                <div className="font-body text-sm text-foreground">
                  <p>{addr.name || order.customer_name}</p>
                  <p className="text-muted-foreground text-xs">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-muted-foreground text-xs">{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}{addr.country ? `, ${addr.country}` : ""}</p>
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">No address provided</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border border-border p-5">
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-4">Products Ordered</h3>
        {isLoading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No items found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="font-body text-xs font-medium text-muted-foreground py-2">Product</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2">Variant</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 text-center">Qty</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 text-right">Unit Price</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/30">
                  <td className="font-body text-sm text-foreground py-2.5">{item.product_name}</td>
                  <td className="font-body text-xs text-muted-foreground py-2.5">{item.variant_info || "—"}</td>
                  <td className="font-body text-sm text-foreground py-2.5 text-center">{item.quantity}</td>
                  <td className="font-body text-sm text-foreground py-2.5 text-right">KSH {Number(item.unit_price).toLocaleString()}</td>
                  <td className="font-body text-sm font-medium text-foreground py-2.5 text-right">KSH {(Number(item.unit_price) * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 pt-4 border-t border-border space-y-1">
          {order.discount_amount > 0 && (
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

      {order.notes && (
        <div className="border border-border p-5">
          <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-2">Notes</h3>
          <p className="font-body text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
