import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { DollarSign, ShoppingBag, TrendingUp, Users, Package, Download, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { downloadCSV } from "@/lib/csvExport";
import { toast } from "@/hooks/use-toast";
import InventoryAlerts from "@/components/admin/InventoryAlerts";

const AnalyticsDashboard = () => {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useProducts();

  const { data: customerCount = 0 } = useQuery({
    queryKey: ["admin-customer-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Best-selling products query
  const { data: bestSellers = [] } = useQuery({
    queryKey: ["admin-best-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, unit_price");
      if (error) throw error;
      const agg: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {};
      (data as any[]).forEach((item) => {
        const key = item.product_id || item.product_name;
        if (!agg[key]) agg[key] = { name: item.product_name, totalQty: 0, totalRevenue: 0 };
        agg[key].totalQty += Number(item.quantity);
        agg[key].totalRevenue += Number(item.quantity) * Number(item.unit_price);
      });
      return Object.values(agg).sort((a, b) => b.totalQty - a.totalQty);
    },
  });

  const promoOrderCount = orders.filter(o => o.promo_code).length;

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const revenueByDay = last30.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayOrders = orders.filter(o => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr);
    return { date: format(day, "MMM dd"), revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0), orders: dayOrders.length };
  });

  const statusCounts = [
    { status: "Pending", count: orders.filter(o => o.status === "pending").length },
    { status: "Paid", count: orders.filter(o => o.status === "paid").length },
    { status: "Processing", count: orders.filter(o => o.status === "processing").length },
    { status: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { status: "Shipped", count: orders.filter(o => o.status === "shipped").length },
    { status: "Delivered", count: orders.filter(o => o.status === "delivered").length },
    { status: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ].filter(s => s.count > 0);

  const recentOrders = orders.filter(o => new Date(o.created_at) > subDays(new Date(), 7));
  const prevWeekOrders = orders.filter(o => { const d = new Date(o.created_at); return d > subDays(new Date(), 14) && d <= subDays(new Date(), 7); });
  const orderTrend = prevWeekOrders.length > 0 ? ((recentOrders.length - prevWeekOrders.length) / prevWeekOrders.length) * 100 : 0;

  // Category breakdown
  const categoryData = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryChart = Object.entries(categoryData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-semibold text-foreground">Analytics</h2>
        <button onClick={() => {
          downloadCSV(revenueByDay.map(d => ({ date: d.date, revenue: d.revenue, orders: d.orders })), "analytics");
          toast({ title: "Analytics exported" });
        }} className="flex items-center gap-2 border border-border text-foreground px-4 py-2 font-body text-sm font-medium hover:bg-secondary transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Inventory Alerts */}
      <InventoryAlerts />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`KSH ${totalRevenue.toLocaleString()}`} />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toString()} sub={`${orderTrend >= 0 ? "+" : ""}${orderTrend.toFixed(0)}% vs last week`} />
        <KpiCard icon={TrendingUp} label="Avg Order Value" value={`KSH ${Math.round(avgOrderValue).toLocaleString()}`} />
        <KpiCard icon={Users} label="Customers" value={customerCount.toString()} />
        <KpiCard icon={Package} label="Fulfillment Rate" value={`${conversionRate.toFixed(1)}%`} sub={`${deliveredOrders} delivered`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border p-4 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                formatter={(value: number) => [`KSH ${value.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground) / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border p-4 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusCounts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border p-4 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Daily Orders (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Bar dataKey="orders" fill="hsl(var(--foreground) / 0.6)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border p-4 sm:p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Products by Category</h3>
          {categoryChart.length > 0 ? (
            <div className="space-y-3">
              {categoryChart.slice(0, 6).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="font-body text-sm text-foreground">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: `${(c.value / Math.max(...categoryChart.map(x => x.value))) * 100}%`, opacity: 1 - i * 0.15 }} />
                    </div>
                    <span className="font-body text-xs text-muted-foreground w-6 text-right">{c.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="font-body text-xs text-muted-foreground">No products yet.</p>}
        </div>
      </div>

      {/* Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="border border-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold text-foreground">Top Products (Units Sold)</h3>
          </div>
          {bestSellers.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bestSellers.slice(0, 8).map(b => ({ name: b.name.length > 18 ? b.name.slice(0, 18) + "…" : b.name, units: b.totalQty, revenue: b.totalRevenue }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(value: number, name: string) => [name === "units" ? `${value} units` : `KSH ${value.toLocaleString()}`, name === "units" ? "Units Sold" : "Revenue"]} />
                <Bar dataKey="units" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="font-body text-xs text-muted-foreground">No sales data yet.</p>}
        </div>

        {/* Table */}
        <div className="border border-border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold text-foreground">Best-Selling Products</h3>
          </div>
          {bestSellers.length > 0 ? (
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-body text-muted-foreground uppercase tracking-wider border-b border-border">
                <span className="col-span-1">#</span>
                <span className="col-span-5">Product</span>
                <span className="col-span-3 text-right">Units Sold</span>
                <span className="col-span-3 text-right">Revenue</span>
              </div>
              {bestSellers.slice(0, 10).map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5 text-sm font-body items-center hover:bg-secondary/50 transition-colors">
                  <span className="col-span-1 text-muted-foreground font-medium">{i + 1}</span>
                  <span className="col-span-5 text-foreground truncate">{item.name}</span>
                  <span className="col-span-3 text-right text-foreground font-medium">{item.totalQty}</span>
                  <span className="col-span-3 text-right text-foreground font-medium">KSH {item.totalRevenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p className="font-body text-xs text-muted-foreground">No sales data yet.</p>}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Products</p>
          <p className="font-display text-2xl font-bold text-foreground">{products.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">This Week Orders</p>
          <p className="font-display text-2xl font-bold text-foreground">{recentOrders.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">This Week Revenue</p>
          <p className="font-display text-2xl font-bold text-foreground">KSH {recentOrders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Total Discounts Given</p>
          <p className="font-display text-2xl font-bold text-foreground">KSH {totalDiscount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

function KpiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <Icon size={16} className="text-muted-foreground" />
        <span className="font-body text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-lg sm:text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="font-body text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default AnalyticsDashboard;
