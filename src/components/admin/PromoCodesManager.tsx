import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X, Tag, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";

type PromoCode = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

const emptyForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  max_uses: null as number | null,
  active: true,
  expires_at: "",
};

const PromoCodesManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        active: form.active,
        expires_at: form.expires_at || null,
      };
      if (editing === "new") {
        const { error } = await supabase.from("promo_codes").insert(payload as any);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_codes").update(payload as any).eq("id", editing!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editing === "new" ? "Promo code created" : "Promo code updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setEditing(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Promo code deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("promo_codes").update({ active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const startEdit = (code?: PromoCode) => {
    if (code) {
      setEditing(code.id);
      setForm({
        code: code.code,
        discount_type: code.discount_type,
        discount_value: code.discount_value,
        min_order_amount: code.min_order_amount,
        max_uses: code.max_uses,
        active: code.active,
        expires_at: code.expires_at ? code.expires_at.split("T")[0] : "",
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  if (isLoading) return <div className="py-8 text-center font-body text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">Promo Codes ({codes.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Code
        </button>
      </div>

      {editing && (
        <div className="border border-border p-6 space-y-4 bg-secondary/30">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {editing === "new" ? "New Promo Code" : "Edit Promo Code"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. SUMMER20" className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm font-mono uppercase focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Discount Type</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (KSH)</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">
                Discount Value {form.discount_type === "percentage" ? "(%)" : "(KSH)"}
              </label>
              <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Min Order Amount (KSH)</label>
              <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Max Uses (blank = unlimited)</label>
              <input type="number" value={form.max_uses ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
                placeholder="Unlimited" className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Expires At (optional)</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 accent-primary" />
            <span className="font-body text-sm text-foreground">Active</span>
          </label>
          <div className="flex gap-3">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.code.trim()}
              className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
              <Save size={14} /> {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-muted-foreground">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Code</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden sm:table-cell">Discount</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Min Order</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden lg:table-cell">Usage</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden lg:table-cell">Expires</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <span className="font-body text-sm font-mono font-medium text-foreground">{c.code}</span>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="font-body text-sm text-foreground flex items-center gap-1">
                      {c.discount_type === "percentage" ? <Percent size={12} /> : <Tag size={12} />}
                      {c.discount_value}{c.discount_type === "percentage" ? "%" : " KSH"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="font-body text-xs text-muted-foreground">KSH {c.min_order_amount.toLocaleString()}</span>
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell">
                    <span className="font-body text-xs text-muted-foreground">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell">
                    <span className="font-body text-xs text-muted-foreground">
                      {c.expires_at ? format(new Date(c.expires_at), "MMM dd, yyyy") : "Never"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button onClick={() => toggleActive.mutate({ id: c.id, active: !c.active })}
                      className={`font-body text-xs font-medium px-2 py-0.5 border ${c.active ? "border-green-500/30 text-green-600 bg-green-500/10" : "border-border text-muted-foreground"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm("Delete this promo code?")) deleteMutation.mutate(c.id); }}
                        className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromoCodesManager;
