import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

type Return = {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: string;
  admin_notes: string;
  refund_amount: number;
  created_at: string;
};

const RETURN_STATUSES = ["requested", "approved", "received", "refunded", "rejected"];

const ReturnsManager = () => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("returns" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Return[]) || [];
    },
  });

  const filtered = filterStatus === "all" ? returns : returns.filter(r => r.status === filterStatus);

  const updateReturn = async (id: string, status: string) => {
    const updates: any = { status };
    if (notes[id]) updates.admin_notes = notes[id];
    if (refundAmounts[id]) updates.refund_amount = parseFloat(refundAmounts[id]);
    const { error } = await supabase.from("returns" as any).update(updates).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Return ${status}` }); queryClient.invalidateQueries({ queryKey: ["admin-returns"] }); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "requested": return "bg-accent text-accent-foreground";
      case "approved": return "bg-primary/10 text-primary";
      case "received": return "bg-secondary text-secondary-foreground";
      case "refunded": return "bg-primary/20 text-primary";
      case "rejected": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <RotateCcw size={20} className="text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">Returns & Refunds</h2>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="font-body text-sm border border-border bg-background text-foreground px-3 py-2">
          <option value="all">All Statuses</option>
          {RETURN_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground text-center py-12">No returns found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="border border-border">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-body text-xs text-muted-foreground">#{r.id.slice(0, 8)}</span>
                  <span className="font-body text-sm text-foreground">Order #{r.order_id.slice(0, 8)}</span>
                  <span className={`font-body text-xs px-2 py-0.5 capitalize ${statusColor(r.status)}`}>{r.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  {expanded === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expanded === r.id && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Customer Reason</p>
                      <p className="font-body text-sm text-foreground">{r.reason || "No reason provided"}</p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Refund Amount</p>
                      <input type="number" value={refundAmounts[r.id] ?? r.refund_amount.toString()}
                        onChange={e => setRefundAmounts(prev => ({ ...prev, [r.id]: e.target.value }))}
                        className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm" />
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Admin Notes</p>
                    <textarea value={notes[r.id] ?? r.admin_notes}
                      onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                      className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm min-h-[60px]" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {RETURN_STATUSES.filter(s => s !== r.status).map(s => (
                      <button key={s} onClick={() => updateReturn(r.id, s)}
                        className="font-body text-xs border border-border px-3 py-1.5 hover:bg-secondary transition-colors capitalize">
                        {s === "refunded" ? "Issue Refund" : s === "approved" ? "Approve" : s === "rejected" ? "Reject" : s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnsManager;
