import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const getInitial = (name?: string) => (name?.charAt(0) || "C").toUpperCase();

const ClientsManager = () => {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data } = await api.get("/auth/admin/clients");
      return data.data || [];
    },
  });

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Loading clients...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Registered Clients</h2>
          <span className="font-body text-xs text-muted-foreground tracking-widest">{clients.length} TOTAL</span>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c: { _id: string; email?: string; createdAt?: string; profile?: { username?: string } }) => {
                const name = c.profile?.username || "Client";
                return (
                  <tr key={c._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-secondary border border-border">
                          <span className="text-muted-foreground font-display text-lg">{getInitial(name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{c._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{c.email}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No clients registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsManager;
