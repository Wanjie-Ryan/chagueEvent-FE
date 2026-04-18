import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ShieldAlert, CheckCircle, Ban, UserCheck, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const getInitial = (name?: string) => (name?.charAt(0) || "P").toUpperCase();

const ProvidersManager = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newProv, setNewProv] = useState({ username: "", email: "", password: "" });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: async () => {
      const { data } = await api.get("/auth/admin/providers");
      return data.data || [];
    },
  });

  const toggleProvider = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/auth/admin/toggle-provider/${id}`);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-providers"] });
      toast({ title: "Success", description: data.msg });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update provider status", variant: "destructive" });
    }
  });

  const createProvider = useMutation({
    mutationFn: async (payload: typeof newProv) => {
      const { data } = await api.post("/auth/admin/create-provider", payload);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-providers"] });
      toast({ title: "Provider Created", description: data.msg });
      setShowCreate(false);
      setNewProv({ username: "", email: "", password: "" });
    },
    onError: (err: { response?: { data?: { msg?: string } } }) => {
      toast({ title: "Error", description: err.response?.data?.msg || "Failed to create", variant: "destructive" });
    }
  });

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Loading providers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Service Providers</h2>
          <span className="font-body text-xs text-muted-foreground tracking-widest">{providers.length} TOTAL · {providers.filter((p: { isVerified?: boolean }) => !p.isVerified).length} PENDING</span>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-display uppercase tracking-widest text-xs hover:opacity-90"
        >
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? "Cancel" : "Create manually"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted p-6 border border-border space-y-4">
          <h3 className="font-display font-medium text-lg">Register New Provider</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Username / Brand Name"
              value={newProv.username} onChange={e => setNewProv({ ...newProv, username: e.target.value })}
              className="p-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground"
            />
            <input type="email" placeholder="Email Address"
              value={newProv.email} onChange={e => setNewProv({ ...newProv, email: e.target.value })}
              className="p-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground"
            />
            <input type="password" placeholder="Temporary Password"
              value={newProv.password} onChange={e => setNewProv({ ...newProv, password: e.target.value })}
              className="p-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground"
            />
          </div>
          <button
            onClick={() => createProvider.mutate(newProv)}
            disabled={createProvider.isPending || !newProv.username || !newProv.email || !newProv.password}
            className="bg-foreground text-background px-6 py-2 font-body text-sm disabled:opacity-50"
          >
            {createProvider.isPending ? "Creating..." : "Confirm & Create"}
          </button>
        </div>
      )}

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providers.map((p: { _id: string; email?: string; isVerified?: boolean; profile?: { username?: string; phone?: string } }) => {
                const isPending = !p.isVerified;
                const name = p.profile?.username || "Provider";
                return (
                  <tr key={p._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-secondary border border-border">
                          <span className="text-muted-foreground font-display text-lg">{getInitial(name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{p.email}</p>
                      <p className="text-xs text-muted-foreground">{p.profile?.phone || "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${isPending ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                        {isPending ? <ShieldAlert size={12} /> : <CheckCircle size={12} />}
                        {isPending ? "Pending Review" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleProvider.mutate(p._id)}
                        disabled={toggleProvider.isPending}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium border transition-colors ${
                          isPending
                            ? "bg-foreground text-background border-foreground hover:opacity-90"
                            : "bg-transparent text-destructive border-destructive hover:bg-destructive/10"
                        }`}
                      >
                        {isPending ? <><UserCheck size={14} /> Approve</> : <><Ban size={14} /> Suspend</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {providers.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No service providers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProvidersManager;
