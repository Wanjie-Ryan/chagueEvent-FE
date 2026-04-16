import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Package, Warehouse, ShoppingBag, Users, Tag, Flame, Music, FileText, CalendarDays, Camera, File, ArrowRight, Truck, RotateCcw, ShoppingCart, Image, Shield } from "lucide-react";
import InventoryAlerts from "@/components/admin/InventoryAlerts";

type TabKey = "dashboard" | "analytics" | "products" | "inventory" | "orders" | "customers" | "promos" | "drops" | "artists" | "blog" | "events" | "lookbooks" | "pages" | "shipping" | "returns" | "abandoned" | "media" | "roles" | "settings";

const AdminDashboard = ({ onNavigate }: { onNavigate: (tab: TabKey) => void }) => {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();

  const { data: customerCount = 0 } = useQuery({
    queryKey: ["admin-customer-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: dropCount = 0 } = useQuery({
    queryKey: ["admin-drop-count"],
    queryFn: async () => {
      const { count } = await supabase.from("drops").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: blogCount = 0 } = useQuery({
    queryKey: ["admin-blog-count"],
    queryFn: async () => {
      const { count } = await supabase.from("blog_posts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: eventCount = 0 } = useQuery({
    queryKey: ["admin-event-count"],
    queryFn: async () => {
      const { count } = await supabase.from("events").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: returnCount = 0 } = useQuery({
    queryKey: ["admin-return-count"],
    queryFn: async () => {
      const { count } = await supabase.from("returns" as any).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: abandonedCount = 0 } = useQuery({
    queryKey: ["admin-abandoned-count"],
    queryFn: async () => {
      const { count } = await supabase.from("abandoned_carts" as any).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;

  const cards: { key: TabKey; label: string; icon: typeof BarChart3; value: string; sub?: string }[] = [
    { key: "analytics", label: "Analytics", icon: BarChart3, value: `KSH ${totalRevenue.toLocaleString()}`, sub: "Total Revenue" },
    { key: "products", label: "Products", icon: Package, value: products.length.toString(), sub: "In catalog" },
    { key: "orders", label: "Orders", icon: ShoppingBag, value: orders.length.toString(), sub: pendingOrders > 0 ? `${pendingOrders} pending` : "All fulfilled" },
    { key: "customers", label: "Customers", icon: Users, value: customerCount.toString(), sub: "Registered" },
    { key: "shipping", label: "Shipping", icon: Truck, value: "Manage", sub: "Zones & tracking" },
    { key: "returns", label: "Returns", icon: RotateCcw, value: returnCount.toString(), sub: "Return requests" },
    { key: "drops", label: "Drops", icon: Flame, value: dropCount.toString(), sub: "Scheduled" },
    { key: "blog", label: "Blog Posts", icon: FileText, value: blogCount.toString(), sub: "Published" },
    { key: "events", label: "Events", icon: CalendarDays, value: eventCount.toString(), sub: "Created" },
    { key: "abandoned", label: "Abandoned Carts", icon: ShoppingCart, value: abandonedCount.toString(), sub: "Lost revenue" },
    { key: "inventory", label: "Inventory", icon: Warehouse, value: "Manage", sub: "Stock levels" },
    { key: "promos", label: "Promos", icon: Tag, value: "Manage", sub: "Discount codes" },
    { key: "artists", label: "Artists", icon: Music, value: "Manage", sub: "Music & merch" },
    { key: "lookbooks", label: "Lookbooks", icon: Camera, value: "Manage", sub: "Seasonal" },
    { key: "pages", label: "Pages", icon: File, value: "Manage", sub: "Custom pages" },
    { key: "media", label: "Media Library", icon: Image, value: "Manage", sub: "Files & images" },
    { key: "roles", label: "User Roles", icon: Shield, value: "Manage", sub: "Permissions" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-semibold text-foreground">Dashboard</h2>

      <InventoryAlerts />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(({ key, label, icon: Icon, value, sub }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className="border border-border p-4 sm:p-5 text-left hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={18} className="text-muted-foreground" />
              <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-foreground">{value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
            {sub && <p className="font-body text-[10px] text-muted-foreground">{sub}</p>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
