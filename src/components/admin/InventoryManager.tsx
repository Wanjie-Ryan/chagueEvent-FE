import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, History, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { downloadCSV } from "@/lib/csvExport";

type VariantWithProduct = {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  stock: number;
  product_name: string;
};

type RestockEntry = {
  id: string;
  variant_id: string;
  previous_stock: number;
  new_stock: number;
  quantity_added: number;
  note: string;
  created_at: string;
};

const LOW_THRESHOLD = 5;

const InventoryManager = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, number>>({});
  const [restockNote, setRestockNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data: variantsData, error } = await supabase
        .from("product_variants")
        .select("id, product_id, size, color_name, color_hex, price, stock")
        .order("stock", { ascending: true });
      if (error) throw error;

      const productIds = [...new Set((variantsData as any[]).map(v => v.product_id))];
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      const nameMap = new Map((products || []).map((p: any) => [p.id, p.name]));
      return (variantsData as any[]).map(v => ({
        ...v,
        product_name: nameMap.get(v.product_id) || "Unknown",
      })) as VariantWithProduct[];
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["admin-restock-history"],
    enabled: showHistory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restock_history" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as RestockEntry[];
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(bulkUpdates).filter(([_, qty]) => qty > 0);
      if (entries.length === 0) throw new Error("No updates to apply");

      for (const [variantId, addQty] of entries) {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) continue;

        const newStock = variant.stock + addQty;
        await supabase
          .from("product_variants")
          .update({ stock: newStock } as any)
          .eq("id", variantId);

        await supabase
          .from("restock_history" as any)
          .insert({
            variant_id: variantId,
            previous_stock: variant.stock,
            new_stock: newStock,
            quantity_added: addQty,
            note: restockNote || "Bulk restock",
          } as any);
      }
    },
    onSuccess: () => {
      toast({ title: `${Object.keys(bulkUpdates).filter(k => bulkUpdates[k] > 0).length} variants restocked` });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-restock-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
      setBulkUpdates({});
      setRestockNote("");
      setBulkMode(false);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const singleRestock = useMutation({
    mutationFn: async ({ variantId, addQty }: { variantId: string; addQty: number }) => {
      const variant = variants.find(v => v.id === variantId);
      if (!variant) throw new Error("Variant not found");
      const newStock = variant.stock + addQty;
      await supabase
        .from("product_variants")
        .update({ stock: newStock } as any)
        .eq("id", variantId);
      await supabase
        .from("restock_history" as any)
        .insert({
          variant_id: variantId,
          previous_stock: variant.stock,
          new_stock: newStock,
          quantity_added: addQty,
          note: "Quick restock",
        } as any);
    },
    onSuccess: () => {
      toast({ title: "Stock updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-restock-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
    },
  });

  const filtered = variants.filter(v => {
    const matchesSearch = !search ||
      v.product_name.toLowerCase().includes(search.toLowerCase()) ||
      v.color_name.toLowerCase().includes(search.toLowerCase()) ||
      v.size.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ? true :
      filter === "out" ? v.stock <= 0 :
      v.stock > 0 && v.stock <= LOW_THRESHOLD;
    return matchesSearch && matchesFilter;
  });

  const outCount = variants.filter(v => v.stock <= 0).length;
  const lowCount = variants.filter(v => v.stock > 0 && v.stock <= LOW_THRESHOLD).length;
  const totalUnits = variants.reduce((s, v) => s + v.stock, 0);

  if (isLoading) return <div className="py-8 text-center font-body text-sm text-muted-foreground">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">Inventory ({variants.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 border border-border text-foreground px-3 py-2 font-body text-sm hover:bg-secondary transition-colors">
            <History size={14} /> {showHistory ? "Hide" : "Show"} History
          </button>
          <button onClick={() => {
            downloadCSV(variants.map(v => ({
              product: v.product_name, color: v.color_name, size: v.size,
              price: v.price, stock: v.stock,
              status: v.stock <= 0 ? "Out of Stock" : v.stock <= LOW_THRESHOLD ? "Low" : "In Stock",
            })), "inventory");
            toast({ title: "Inventory exported" });
          }} className="flex items-center gap-2 border border-border text-foreground px-3 py-2 font-body text-sm hover:bg-secondary transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setBulkMode(!bulkMode); setBulkUpdates({}); }}
            className={`flex items-center gap-2 px-4 py-2 font-body text-sm font-medium transition-colors ${
              bulkMode ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:opacity-90"
            }`}>
            <Plus size={14} /> {bulkMode ? "Cancel Bulk" : "Bulk Restock"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Total Variants</p>
          <p className="font-display text-2xl font-bold text-foreground">{variants.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Total Units</p>
          <p className="font-display text-2xl font-bold text-foreground">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Low Stock</p>
          <p className="font-display text-2xl font-bold text-[hsl(25,95%,53%)]">{lowCount}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Out of Stock</p>
          <p className="font-display text-2xl font-bold text-destructive">{outCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, color, size..."
            className="w-full border border-border bg-background text-foreground pl-9 pr-4 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "out"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-body text-xs font-medium border transition-colors ${
                filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}>
              {f === "all" ? "All" : f === "low" ? `Low (${lowCount})` : `Out (${outCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Restock Note */}
      {bulkMode && (
        <div className="border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="font-body text-sm text-foreground font-medium">
            Bulk Restock Mode — Enter quantities to add for each variant below
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={restockNote} onChange={(e) => setRestockNote(e.target.value)}
              placeholder="Restock note (e.g. Supplier delivery #123)"
              className="flex-1 border border-border bg-background text-foreground px-4 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            <button onClick={() => bulkUpdateMutation.mutate()}
              disabled={bulkUpdateMutation.isPending || Object.values(bulkUpdates).every(v => !v || v <= 0)}
              className="bg-primary text-primary-foreground px-6 py-2 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0">
              <Save size={14} /> {bulkUpdateMutation.isPending ? "Saving..." : `Apply (${Object.values(bulkUpdates).filter(v => v > 0).length})`}
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 font-body text-sm text-muted-foreground">No variants found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Product</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden sm:table-cell">Color</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Size</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Stock</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">
                  {bulkMode ? "Add Qty" : "Quick Restock"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <InventoryRow
                  key={v.id}
                  variant={v}
                  bulkMode={bulkMode}
                  bulkQty={bulkUpdates[v.id] || 0}
                  onBulkChange={(qty) => setBulkUpdates(prev => ({ ...prev, [v.id]: qty }))}
                  onQuickRestock={(qty) => singleRestock.mutate({ variantId: v.id, addQty: qty })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Restock History */}
      {showHistory && (
        <div className="border border-border p-4 sm:p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <History size={16} /> Restock History
          </h3>
          {history.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No restock history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-body text-xs font-medium text-muted-foreground py-2 pr-4">Date</th>
                    <th className="text-left font-body text-xs font-medium text-muted-foreground py-2 pr-4">Variant</th>
                    <th className="text-left font-body text-xs font-medium text-muted-foreground py-2 pr-4">Change</th>
                    <th className="text-left font-body text-xs font-medium text-muted-foreground py-2 pr-4 hidden sm:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const variant = variants.find(v => v.id === h.variant_id);
                    return (
                      <tr key={h.id} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-body text-xs text-muted-foreground">
                          {format(new Date(h.created_at), "MMM dd, HH:mm")}
                        </td>
                        <td className="py-2 pr-4 font-body text-xs text-foreground">
                          {variant ? `${variant.product_name} — ${variant.color_name}/${variant.size}` : h.variant_id.slice(0, 8)}
                        </td>
                        <td className="py-2 pr-4 font-body text-xs">
                          <span className="text-muted-foreground">{h.previous_stock}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <span className="text-foreground font-medium">{h.new_stock}</span>
                          <span className="text-[hsl(142,70%,40%)] ml-1">(+{h.quantity_added})</span>
                        </td>
                        <td className="py-2 pr-4 font-body text-xs text-muted-foreground hidden sm:table-cell">{h.note || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InventoryRow = ({ variant, bulkMode, bulkQty, onBulkChange, onQuickRestock }: {
  variant: VariantWithProduct;
  bulkMode: boolean;
  bulkQty: number;
  onBulkChange: (qty: number) => void;
  onQuickRestock: (qty: number) => void;
}) => {
  const [quickQty, setQuickQty] = useState(10);
  const status = variant.stock <= 0 ? "out" : variant.stock <= LOW_THRESHOLD ? "low" : "ok";

  return (
    <tr className="border-b border-border/50">
      <td className="py-3 pr-4">
        <p className="font-body text-sm font-medium text-foreground">{variant.product_name}</p>
      </td>
      <td className="py-3 pr-4 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: variant.color_hex }} />
          <span className="font-body text-xs text-foreground">{variant.color_name}</span>
        </div>
      </td>
      <td className="py-3 pr-4 font-body text-xs text-foreground">{variant.size}</td>
      <td className="py-3 pr-4 font-body text-sm font-semibold text-foreground">{variant.stock}</td>
      <td className="py-3 pr-4">
        <span className={`font-body text-xs font-medium px-2 py-0.5 border ${
          status === "out" ? "border-destructive/30 text-destructive bg-destructive/10" :
          status === "low" ? "border-[hsl(25,95%,53%)]/30 text-[hsl(25,95%,53%)] bg-[hsl(25,95%,53%)]/10" :
          "border-[hsl(142,70%,40%)]/30 text-[hsl(142,70%,40%)] bg-[hsl(142,70%,40%)]/10"
        }`}>
          {status === "out" ? "Out" : status === "low" ? "Low" : "In Stock"}
        </span>
      </td>
      <td className="py-3 text-right">
        {bulkMode ? (
          <input type="number" min={0} value={bulkQty || ""} onChange={(e) => onBulkChange(Number(e.target.value))}
            placeholder="0" className="w-20 border border-border bg-background text-foreground px-2 py-1 font-body text-sm text-right focus:outline-none focus:border-foreground" />
        ) : (
          <div className="flex items-center justify-end gap-1">
            <input type="number" min={1} value={quickQty} onChange={(e) => setQuickQty(Number(e.target.value))}
              className="w-16 border border-border bg-background text-foreground px-2 py-1 font-body text-xs text-right focus:outline-none focus:border-foreground" />
            <button onClick={() => onQuickRestock(quickQty)}
              className="bg-primary text-primary-foreground px-2 py-1 font-body text-xs hover:opacity-90">
              <Plus size={12} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default InventoryManager;
