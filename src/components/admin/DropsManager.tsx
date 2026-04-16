import React, { useState } from "react";
import { useDrops, useCreateDrop, useUpdateDrop, useDeleteDrop, useDropProducts, useAddDropProduct, useRemoveDropProduct, type Drop } from "@/hooks/useDrops";
import { useProducts } from "@/hooks/useProducts";
import ImageUpload from "./ImageUpload";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";

const emptyDrop = {
  name: "",
  description: "",
  image_url: "",
  drop_date: "",
  status: "coming_soon",
  max_quantity: null as number | null,
};

const DropsManager = () => {
  const { data: drops = [], isLoading } = useDrops();
  const createDrop = useCreateDrop();
  const updateDrop = useUpdateDrop();
  const deleteDrop = useDeleteDrop();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDrop);
  const [expandedDrop, setExpandedDrop] = useState<string | null>(null);

  const startEdit = (drop?: Drop) => {
    if (drop) {
      setEditing(drop.id);
      setForm({
        name: drop.name,
        description: drop.description,
        image_url: drop.image_url,
        drop_date: drop.drop_date.slice(0, 16),
        status: drop.status,
        max_quantity: drop.max_quantity,
      });
    } else {
      setEditing("new");
      setForm(emptyDrop);
    }
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      image_url: form.image_url,
      drop_date: new Date(form.drop_date).toISOString(),
      status: form.status,
      max_quantity: form.max_quantity || null,
    };

    if (editing === "new") {
      await createDrop.mutateAsync(payload);
    } else {
      await updateDrop.mutateAsync({ id: editing!, ...payload });
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Drops ({drops.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Drop
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="border border-border p-6 mb-8 space-y-4 bg-secondary/30">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {editing === "new" ? "New Drop" : "Edit Drop"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Drop Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input type="datetime-local" value={form.drop_date} onChange={(e) => setForm({ ...form, drop_date: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground">
              <option value="coming_soon">Coming Soon</option>
              <option value="live">Live</option>
              <option value="sold_out">Sold Out</option>
              <option value="ended">Ended</option>
            </select>
            <input type="number" placeholder="Max Quantity (optional)" value={form.max_quantity ?? ""}
              onChange={(e) => setForm({ ...form, max_quantity: e.target.value ? Number(e.target.value) : null })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <ImageUpload currentUrl={form.image_url} onUploaded={(url) => setForm({ ...form, image_url: url })} />
            <input placeholder="Or paste Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={createDrop.isPending || updateDrop.isPending}
              className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {createDrop.isPending || updateDrop.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drops Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Drop</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Date</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drops.map((drop) => (
                <React.Fragment key={drop.id}>
                  <tr className="border-b border-border/50">
                    <td className="py-4 pr-4">
                      <p className="font-body text-sm font-medium text-foreground">{drop.name}</p>
                      {drop.max_quantity && <p className="font-body text-xs text-muted-foreground">Limited to {drop.max_quantity} pcs</p>}
                    </td>
                    <td className="py-4 pr-4 hidden md:table-cell">
                      <span className="font-body text-xs text-muted-foreground">
                        {new Date(drop.drop_date).toLocaleDateString()} {new Date(drop.drop_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-4 pr-4 hidden md:table-cell">
                      <span className={`font-body text-xs font-medium px-2 py-0.5 ${
                        drop.status === "coming_soon" ? "bg-accent text-accent-foreground" :
                        drop.status === "live" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {drop.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setExpandedDrop(expandedDrop === drop.id ? null : drop.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                          {expandedDrop === drop.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button onClick={() => startEdit(drop)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => { if (confirm("Delete this drop?")) deleteDrop.mutate(drop.id); }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedDrop === drop.id && (
                    <tr>
                      <td colSpan={4} className="px-4 pb-4">
                        <DropProductsPanel dropId={drop.id} />
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
  );
};

const DropProductsPanel = ({ dropId }: { dropId: string }) => {
  const { data: dropProducts = [] } = useDropProducts(dropId);
  const { data: allProducts = [] } = useProducts();
  const addProduct = useAddDropProduct();
  const removeProduct = useRemoveDropProduct();
  const [selectedProductId, setSelectedProductId] = useState("");

  const linkedIds = dropProducts.map((dp) => dp.product_id);
  const availableProducts = allProducts.filter((p) => !linkedIds.includes(p.id));

  return (
    <div className="space-y-4">
      <h4 className="font-body text-sm font-semibold text-foreground">Products in this Drop</h4>
      
      {/* Add product */}
      <div className="flex gap-2">
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
          className="flex-1 border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground">
          <option value="">Select product to add...</option>
          {availableProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={() => { if (selectedProductId) { addProduct.mutate({ drop_id: dropId, product_id: selectedProductId }); setSelectedProductId(""); }}}
          disabled={!selectedProductId || addProduct.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50">
          Add
        </button>
      </div>

      {/* Listed products */}
      <div className="space-y-2">
        {dropProducts.map((dp) => {
          const product = allProducts.find((p) => p.id === dp.product_id);
          return (
            <div key={dp.id} className="flex items-center justify-between border border-border px-3 py-2">
              <span className="font-body text-sm text-foreground">{product?.name || dp.product_id}</span>
              <button onClick={() => removeProduct.mutate({ id: dp.id, drop_id: dropId })}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <X size={14} />
              </button>
            </div>
          );
        })}
        {dropProducts.length === 0 && (
          <p className="font-body text-xs text-muted-foreground">No products added yet.</p>
        )}
      </div>
    </div>
  );
};

export default DropsManager;
