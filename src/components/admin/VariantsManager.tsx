import { useState } from "react";
import { useProductVariants, useAddVariant, useUpdateVariant, useDeleteVariant, getDiscountedPrice, type ProductVariant } from "@/hooks/useProductVariants";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";

type VariantForm = {
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  stock: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
};

const emptyForm: VariantForm = {
  size: "",
  color_name: "",
  color_hex: "#000000",
  price: 0,
  stock: 0,
  discount_type: "none",
  discount_value: 0,
};

const VariantsManager = ({ productId }: { productId: string }) => {
  const { data: variants = [], isLoading } = useProductVariants(productId);
  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id);
    setForm({
      size: v.size,
      color_name: v.color_name,
      color_hex: v.color_hex,
      price: v.price,
      stock: v.stock,
      discount_type: v.discount_type,
      discount_value: v.discount_value,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateVariant.mutateAsync({ id: editingId, productId, ...form });
        toast({ title: "Variant updated" });
      } else {
        await addVariant.mutateAsync({ product_id: productId, ...form });
        toast({ title: "Variant added" });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await deleteVariant.mutateAsync({ id, productId });
      toast({ title: "Variant deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="py-4 text-muted-foreground font-body text-sm">Loading variants...</div>;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h4 className="font-body text-sm font-semibold text-foreground">
          Variants ({variants.length})
        </h4>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-1 text-xs font-body font-medium text-primary hover:opacity-80"
          >
            <Plus size={14} /> Add Variant
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-border p-4 space-y-3 bg-secondary/20">
          <p className="font-body text-xs font-semibold text-foreground">
            {editingId ? "Edit Variant" : "New Variant"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Size (e.g. 42)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Color name" value={form.color_name} onChange={(e) => setForm({ ...form, color_name: e.target.value })}
              className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            <div className="flex items-center gap-2">
              <input type="color" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                className="w-8 h-8 border border-border cursor-pointer" />
              <input value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                className="flex-1 border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <input type="number" placeholder="Price (KSH)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            <input type="number" placeholder="Stock" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
              className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground">
              <option value="none">No Discount</option>
              <option value="percentage">% Off</option>
              <option value="fixed">Fixed Off (KSH)</option>
            </select>
            {form.discount_type !== "none" && (
              <input type="number" placeholder={form.discount_type === "percentage" ? "% value" : "KSH off"}
                value={form.discount_value || ""} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={addVariant.isPending || updateVariant.isPending}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 font-body text-xs font-medium hover:opacity-90 disabled:opacity-50">
              <Save size={14} /> {editingId ? "Update" : "Save"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="flex items-center gap-1 border border-border text-foreground px-4 py-2 font-body text-xs font-medium hover:bg-secondary">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Color</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Size</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Price</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Discount</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Final</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2 pr-3">Stock</th>
                <th className="font-body text-xs font-medium text-muted-foreground py-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => {
                const finalPrice = getDiscountedPrice(v);
                return (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-border inline-block" style={{ backgroundColor: v.color_hex }} />
                        <span className="font-body text-xs text-foreground">{v.color_name}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 font-body text-xs text-foreground">{v.size}</td>
                    <td className="py-2 pr-3 font-body text-xs text-foreground">KSH {v.price.toLocaleString()}</td>
                    <td className="py-2 pr-3 font-body text-xs text-muted-foreground">
                      {v.discount_type === "none" ? "—" : v.discount_type === "percentage" ? `${v.discount_value}%` : `KSH ${v.discount_value}`}
                    </td>
                    <td className="py-2 pr-3 font-body text-xs font-semibold text-foreground">
                      KSH {finalPrice.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`font-body text-xs font-medium ${v.stock > 0 ? "text-green-600" : "text-destructive"}`}>
                        {v.stock > 0 ? v.stock : "Out of stock"}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(v)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantsManager;
