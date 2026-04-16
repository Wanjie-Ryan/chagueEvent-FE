import { useState } from "react";
import {
  useAdminLookbooks, useSaveLookbook, useDeleteLookbook,
  useLookbookImages, useAddLookbookImage, useDeleteLookbookImage
} from "@/hooks/useLookbooks";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  cover_image: "",
  season: "",
  published: false,
};

const LookbooksManager = () => {
  const { data: lookbooks = [], isLoading } = useAdminLookbooks();
  const saveMutation = useSaveLookbook();
  const deleteMutation = useDeleteLookbook();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedLb, setExpandedLb] = useState<string | null>(null);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const startEdit = (lb?: typeof lookbooks[0]) => {
    if (lb) {
      setEditing(lb.id);
      setForm({ title: lb.title, slug: lb.slug, description: lb.description, cover_image: lb.cover_image, season: lb.season, published: lb.published });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const slug = form.slug || generateSlug(form.title);
    try {
      await saveMutation.mutateAsync({ ...(editing !== "new" ? { id: editing! } : {}), ...form, slug });
      toast({ title: editing === "new" ? "Lookbook created" : "Lookbook updated" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lookbook and all its images?")) return;
    try { await deleteMutation.mutateAsync(id); toast({ title: "Deleted" }); } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Lookbooks ({lookbooks.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">
          <Plus size={16} /> New Lookbook
        </button>
      </div>

      {editing && (
        <div className="border border-border p-6 mb-8 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">{editing === "new" ? "New Lookbook" : "Edit Lookbook"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Season (e.g. Spring/Summer 2026)" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Cover Image</label>
            <ImageUpload currentUrl={form.cover_image} onUploaded={(url) => setForm({ ...form, cover_image: url })} />
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" /> Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-foreground text-background px-6 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">Save</button>
            <button onClick={() => setEditing(null)} className="border border-border px-6 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {lookbooks.map((lb) => (
          <div key={lb.id} className="border border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 min-w-0">
                {lb.cover_image && <img src={lb.cover_image} alt="" className="w-16 h-10 object-cover bg-secondary flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-body text-sm font-medium text-foreground truncate">{lb.title}</h3>
                    {lb.published ? <Eye size={14} className="text-foreground flex-shrink-0" /> : <EyeOff size={14} className="text-muted-foreground flex-shrink-0" />}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{lb.season || "No season"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setExpandedLb(expandedLb === lb.id ? null : lb.id)} className="p-2 hover:bg-secondary transition-colors text-foreground">
                  {expandedLb === lb.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button onClick={() => startEdit(lb)} className="p-2 hover:bg-secondary transition-colors text-foreground"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(lb.id)} className="p-2 hover:bg-secondary transition-colors text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
            {expandedLb === lb.id && <LookbookImagesPanel lookbookId={lb.id} />}
          </div>
        ))}
      </div>
    </div>
  );
};

function LookbookImagesPanel({ lookbookId }: { lookbookId: string }) {
  const { data: images = [], isLoading } = useLookbookImages(lookbookId);
  const addMutation = useAddLookbookImage();
  const deleteMutation = useDeleteLookbookImage();
  const [newCaption, setNewCaption] = useState("");
  const [newSize, setNewSize] = useState("medium");

  const handleImageUploaded = async (url: string) => {
    try {
      await addMutation.mutateAsync({
        lookbook_id: lookbookId,
        image_url: url,
        caption: newCaption,
        display_order: images.length,
        layout_size: newSize,
      });
      setNewCaption("");
      toast({ title: "Image added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-4 border-t border-border"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="p-4 border-t border-border bg-secondary/30 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon size={14} className="text-muted-foreground" />
        <span className="font-body text-xs font-medium text-foreground">{images.length} Images</span>
      </div>

      {/* Add image */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="flex-1">
          <ImageUpload currentUrl="" onUploaded={handleImageUploaded} />
        </div>
        <input placeholder="Caption (optional)" value={newCaption} onChange={(e) => setNewCaption(e.target.value)} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
        <select value={newSize} onChange={(e) => setNewSize(e.target.value)} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground">
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="wide">Wide</option>
          <option value="tall">Tall</option>
        </select>
      </div>

      {/* Existing images */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img src={img.image_url} alt={img.caption} className="w-full aspect-square object-cover bg-secondary" />
            <button
              onClick={() => deleteMutation.mutate({ id: img.id, lookbookId })}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            <span className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background font-body text-[10px] px-1 truncate">{img.layout_size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LookbooksManager;
