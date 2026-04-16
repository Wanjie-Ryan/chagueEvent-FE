import React, { useState } from "react";
import { useProducts, type Product } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/imageMap";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, CheckSquare, Square, X } from "lucide-react";
import ProductImagesManager from "@/components/admin/ProductImagesManager";
import VariantsManager from "@/components/admin/VariantsManager";
import ProductForm from "@/components/admin/ProductForm";
import BulkProductImport from "@/components/admin/BulkProductImport";

const CATEGORIES = ["Sneakers", "Boots", "Slides", "Clogs", "Sandals", "Loafers", "Apparel", "T-Shirts", "Hoodies", "Jerseys", "Accessories", "Watches", "Glasses", "Belts"];

const ProductsManager = () => {
  const { data: products = [], isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");

  const allSelected = products.length > 0 && selected.size === products.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map(p => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => { setSelected(new Set()); setBulkCategory(""); };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Product deleted" }); queryClient.invalidateQueries({ queryKey: ["products"] }); }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} product${selected.size !== 1 ? "s" : ""}?`)) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `${ids.length} product${ids.length !== 1 ? "s" : ""} deleted` });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearSelection();
    }
  };

  const handleBulkCategory = async () => {
    if (selected.size === 0 || !bulkCategory) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("products").update({ category: bulkCategory }).in("id", ids);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `${ids.length} product${ids.length !== 1 ? "s" : ""} updated to ${bulkCategory}` });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearSelection();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Products ({products.length})</h2>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <BulkProductImport />

      <div className="mt-6">
        {editing && (
          <div className="mb-8" ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            <ProductForm
              key={editing === "new" ? "new" : editing.id}
              product={editing === "new" ? undefined : editing}
              onClose={() => setEditing(null)}
            />
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-4 p-3 border border-border bg-secondary/50">
            <span className="font-body text-sm font-medium text-foreground">{selected.size} selected</span>

            <select
              value={bulkCategory}
              onChange={e => setBulkCategory(e.target.value)}
              className="font-body text-sm border border-border bg-background text-foreground px-3 py-1.5 rounded-md"
            >
              <option value="">Change category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {bulkCategory && (
              <button onClick={handleBulkCategory} className="font-body text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity">
                Apply
              </button>
            )}

            <button onClick={handleBulkDelete} className="font-body text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </button>

            <button onClick={clearSelection} className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-2 w-8">
                    <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground transition-colors">
                      {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Product</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Category</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Price</th>
                  <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className={`border-b border-border/50 ${selected.has(p.id) ? "bg-secondary/30" : ""}`}>
                      <td className="py-4 pr-2">
                        <button onClick={() => toggleOne(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {selected.has(p.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {p.image_url && (
                            <img src={resolveImage(p.image_url)} alt={p.name} className="w-10 h-10 object-cover border border-border hidden sm:block" />
                          )}
                          <div>
                            <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                            <p className="font-body text-xs text-muted-foreground">{p.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 hidden md:table-cell">
                        <span className="font-body text-xs text-muted-foreground">{p.category}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-body text-sm font-medium text-foreground">KSH {p.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Variants & Images">
                            {expandedProduct === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button onClick={() => setEditing(p)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedProduct === p.id && (
                      <tr>
                        <td colSpan={5} className="px-4 pb-4 space-y-4">
                          <VariantsManager productId={p.id} />
                          <ProductImagesManager productId={p.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsManager;
