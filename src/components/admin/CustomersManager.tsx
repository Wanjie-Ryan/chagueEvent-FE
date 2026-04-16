import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, Users, ShoppingBag, Download } from "lucide-react";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csvExport";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  email: string | null;
  created_at: string;
};

type CustomerOrder = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

const CustomersManager = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id, user_id, total, status, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data as (CustomerOrder & { user_id: string })[];
    },
  });

  const filtered = profiles.filter((p) =>
    !search || (p.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const getCustomerOrders = (userId: string) => allOrders.filter((o) => o.user_id === userId);
  const getCustomerTotal = (userId: string) => getCustomerOrders(userId).reduce((s, o) => s + Number(o.total), 0);

  if (isLoading) return <div className="py-8 text-center font-body text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">Customers ({profiles.length})</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email..."
            className="border border-border bg-background text-foreground px-4 py-2 font-body text-sm focus:outline-none focus:border-foreground flex-1 sm:w-48" />
          <button onClick={() => {
            downloadCSV(profiles.map(p => ({
              email: p.email || "", joined: p.created_at,
              total_orders: getCustomerOrders(p.id).length,
              lifetime_revenue: getCustomerTotal(p.id),
            })), "customers");
            toast({ title: "Customers exported" });
          }} className="flex items-center gap-2 border border-border text-foreground px-3 py-2 font-body text-sm font-medium hover:bg-secondary transition-colors shrink-0">
            <Download size={14} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-muted-foreground" /></div>
          <p className="font-display text-2xl font-bold text-foreground">{profiles.length}</p>
          <p className="font-body text-xs text-muted-foreground">Total Customers</p>
        </div>
        <div className="border border-border p-4">
          <div className="flex items-center gap-2 mb-1"><ShoppingBag size={14} className="text-muted-foreground" /></div>
          <p className="font-display text-2xl font-bold text-foreground">{allOrders.length}</p>
          <p className="font-body text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-display text-2xl font-bold text-foreground">
            KSH {allOrders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}
          </p>
          <p className="font-body text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-display text-2xl font-bold text-foreground">
            KSH {profiles.length > 0 ? Math.round(allOrders.reduce((s, o) => s + Number(o.total), 0) / profiles.length).toLocaleString() : 0}
          </p>
          <p className="font-body text-xs text-muted-foreground">Avg Revenue / Customer</p>
        </div>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-muted-foreground">No customers found.</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((p) => {
            const orders = getCustomerOrders(p.id);
            const total = getCustomerTotal(p.id);
            const isExpanded = expandedId === p.id;

            return (
              <div key={p.id} className="border border-border/50">
                <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="font-body text-xs font-bold text-foreground">
                      {(p.email?.[0] || "?").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">{p.email || "No email"}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      Joined {format(new Date(p.created_at), "MMM dd, yyyy")} · {orders.length} order{orders.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-body text-sm font-medium text-foreground">KSH {total.toLocaleString()}</p>
                    <p className="font-body text-xs text-muted-foreground">lifetime</p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/30">
                    {orders.length === 0 ? (
                      <p className="font-body text-xs text-muted-foreground pt-3">No orders yet.</p>
                    ) : (
                      <table className="w-full mt-2">
                        <thead>
                          <tr className="border-b border-border/30">
                            <th className="text-left font-body text-xs font-medium text-muted-foreground py-2">Order ID</th>
                            <th className="text-left font-body text-xs font-medium text-muted-foreground py-2 hidden sm:table-cell">Date</th>
                            <th className="text-left font-body text-xs font-medium text-muted-foreground py-2">Status</th>
                            <th className="text-right font-body text-xs font-medium text-muted-foreground py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id} className="border-b border-border/20">
                              <td className="font-body text-xs text-foreground py-2 font-mono">{o.id.slice(0, 8)}...</td>
                              <td className="font-body text-xs text-muted-foreground py-2 hidden sm:table-cell">
                                {format(new Date(o.created_at), "MMM dd, yyyy")}
                              </td>
                              <td className="py-2">
                                <span className={`font-body text-xs font-medium capitalize ${
                                  o.status === "delivered" ? "text-green-600" :
                                  o.status === "shipped" ? "text-purple-600" :
                                  o.status === "confirmed" ? "text-blue-600" : "text-yellow-600"
                                }`}>{o.status}</span>
                              </td>
                              <td className="font-body text-xs text-foreground py-2 text-right">KSH {Number(o.total).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomersManager;
