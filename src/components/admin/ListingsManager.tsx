import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CheckCircle, EyeOff, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ListingsManager = () => {
  const qc = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data } = await api.get("/listings/admin/all");
      return data.data || [];
    },
  });

  const toggleApproval = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/listings/admin/approve/${id}`);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
      toast({ title: "Success", description: data.msg });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update listing status", variant: "destructive" });
    }
  });

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Loading listings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Service Listings</h2>
          <span className="font-body text-xs text-muted-foreground tracking-widest">{listings.length} TOTAL · {listings.filter((l: { isApproved?: boolean }) => !l.isApproved).length} PENDING APPROVAL</span>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Category / Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((l: { _id: string; title?: string; category?: string; price?: number; isApproved?: boolean; images?: string[]; providerId?: { username?: string; email?: string } }) => {
                const isApproved = l.isApproved;
                const imageUrl = l.images && l.images.length > 0
                  ? (l.images[0].startsWith("http") ? l.images[0] : `http://localhost:3005${l.images[0]}`)
                  : null;
                return (
                  <tr key={l._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 shrink-0 bg-secondary overflow-hidden border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="h-full w-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : "NO IMG"}
                        </div>
                        <p className="font-display font-medium text-foreground">{l.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{l.providerId?.username || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{l.providerId?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="uppercase text-xs tracking-wider text-muted-foreground">{l.category}</p>
                      <p className="font-medium text-foreground">KSH {l.price?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${isApproved ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                        {isApproved ? <CheckCircle size={12} /> : <EyeOff size={12} />}
                        {isApproved ? "Public" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleApproval.mutate(l._id)}
                        disabled={toggleApproval.isPending}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium border transition-colors ${
                          !isApproved
                            ? "bg-foreground text-background border-foreground hover:opacity-90"
                            : "bg-transparent text-destructive border-destructive hover:bg-destructive/10"
                        }`}
                      >
                        {!isApproved ? <><Check size={14} /> Approve</> : <><X size={14} /> Hide</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {listings.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No listings from providers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListingsManager;
