import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { UserCheck, Users, Package, Clock, ArrowRight } from "lucide-react";

type TabKey = "dashboard" | "providers" | "clients" | "listings" | "settings";

const AdminDashboard = ({ onNavigate }: { onNavigate: (tab: TabKey) => void }) => {
  const { data: providers = [] } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: async () => {
      const { data } = await api.get("/auth/admin/providers");
      return data.data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data } = await api.get("/auth/admin/clients");
      return data.data || [];
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data } = await api.get("/listings/admin/all");
      return data.data || [];
    },
  });

  const pendingProviders = providers.filter((p: any) => !p.isVerified).length;
  const pendingListings = listings.filter((l: any) => !l.isApproved).length;

  const cards: { key: TabKey; label: string; icon: typeof Users; value: string; sub?: string }[] = [
    { key: "providers", label: "Service Providers", icon: UserCheck, value: providers.length.toString(), sub: pendingProviders > 0 ? `${pendingProviders} pending verification` : "All verified" },
    { key: "clients", label: "Registered Clients", icon: Users, value: clients.length.toString(), sub: "Active users" },
    { key: "listings", label: "Event Services", icon: Package, value: listings.length.toString(), sub: pendingListings > 0 ? `${pendingListings} pending approval` : "All approved" },
    { key: "providers", label: "Pending Actions", icon: Clock, value: (pendingProviders + pendingListings).toString(), sub: "Providers & listings needing review" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-semibold text-foreground">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, label, icon: Icon, value, sub }) => (
          <button
            key={label}
            onClick={() => onNavigate(key)}
            className="border border-border p-4 sm:p-5 text-left bg-card hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={18} className="text-muted-foreground" />
              <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
            {sub && <p className={`font-body text-[10px] mt-1 ${sub.includes("pending") ? "text-amber-500" : "text-muted-foreground"}`}>{sub}</p>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
