import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Save, X, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { Product } from "@/hooks/useProducts";

const CATEGORIES = ["Sneakers", "Football Boots", "Boots", "Clogs", "Loafers", "Slides", "Sandals", "Clothing", "Watches", "Accessories", "Glasses"];

type Props = {
  product?: Product;
  onClose: () => void;
};

const ProductForm = ({ product, onClose }: Props) => {
  const queryClient = useQueryClient();
  const isNew = !product;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    subtitle: product?.subtitle ?? "",
    price: product?.price ?? 0,
    image_url: product?.image_url ?? "",
    category: product?.category ?? "Sneakers",
    sizes: product ? JSON.stringify(product.sizes) : '["36","37","38","39","40","41","42","43","44","45"]',
    description: product?.description ?? "",
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let parsedSizes: string[];
      try {
        parsedSizes = JSON.parse(form.sizes);
      } catch {
        parsedSizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const payload = {
        name: form.name,
        subtitle: form.subtitle,
        price: Number(form.price),
        image_url: form.image_url,
        category: form.category,
        sizes: parsedSizes,
        description: form.description,
      };
      if (isNew) {
        const { error } = await supabase.from("products").insert(payload as any);
        if (error) throw error;
        toast({ title: "Product created" });
      } else {
        const { error } = await supabase.from("products").update(payload as any).eq("id", product!.id);
        if (error) throw error;
        toast({ title: "Product updated" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border p-6 space-y-5 bg-secondary/30">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {isNew ? "New Product" : `Edit: ${product!.name}`}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nike Air Max 97" className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Gold Bullet" className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Price (KSH)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Sizes (JSON array or comma-separated)</label>
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder='["S","M","L"] or 36,37,38,39' className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm font-mono focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Product description..." className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground resize-none" />
          </div>
        </div>

        {/* Right: Image */}
        <div className="space-y-3">
          <label className="font-body text-xs text-muted-foreground block">Main Image</label>
          {form.image_url ? (
            <div className="relative aspect-square border border-border overflow-hidden bg-secondary">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => setForm({ ...form, image_url: "" })}
                className="absolute top-2 right-2 bg-background/80 text-foreground p-1 hover:bg-background"><X size={14} /></button>
            </div>
          ) : (
            <div className="aspect-square border border-dashed border-border flex items-center justify-center bg-secondary/30">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
          )}
          <ImageUpload currentUrl={form.image_url} onUploaded={(url) => setForm({ ...form, image_url: url })} />
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="Or paste image URL" className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-xs focus:outline-none focus:border-foreground" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
          <Save size={14} /> {saving ? "Saving..." : "Save Product"}
        </button>
        <button onClick={onClose} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
