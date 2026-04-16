import React, { useState } from "react";
import {
  useArtists, useCreateArtist, useUpdateArtist, useDeleteArtist,
  useArtistTracks, useCreateTrack, useDeleteTrack,
  useArtistProducts, useAddArtistProduct, useRemoveArtistProduct,
  type Artist,
} from "@/hooks/useArtists";
import { useProducts } from "@/hooks/useProducts";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X, Upload, Music } from "lucide-react";

const emptyArtist = {
  name: "", slug: "", bio: "", image_url: "", cover_url: "", genre: "",
  social_instagram: "", social_twitter: "", social_spotify: "",
};

const ArtistsManager = () => {
  const { data: artists = [], isLoading } = useArtists();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyArtist);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  const startEdit = (artist?: Artist) => {
    if (artist) {
      setEditing(artist.id);
      setForm({
        name: artist.name, slug: artist.slug, bio: artist.bio,
        image_url: artist.image_url, cover_url: artist.cover_url, genre: artist.genre,
        social_instagram: artist.social_instagram, social_twitter: artist.social_twitter, social_spotify: artist.social_spotify,
      });
    } else {
      setEditing("new");
      setForm(emptyArtist);
    }
  };

  const handleSave = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const payload = { ...form, slug };
    if (editing === "new") {
      await createArtist.mutateAsync(payload);
    } else {
      await updateArtist.mutateAsync({ id: editing!, ...payload });
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Artists ({artists.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Artist
        </button>
      </div>

      {editing && (
        <div className="border border-border p-6 mb-8 space-y-4 bg-secondary/30">
          <h3 className="font-display text-lg font-semibold text-foreground">{editing === "new" ? "New Artist" : "Edit Artist"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Slug (auto-generated)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Instagram URL" value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Twitter URL" value={form.social_twitter} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <input placeholder="Spotify URL" value={form.social_spotify} onChange={(e) => setForm({ ...form, social_spotify: e.target.value })} className="border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Profile Image</label>
              <ImageUpload currentUrl={form.image_url} onUploaded={(url) => setForm({ ...form, image_url: url })} />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Cover Image</label>
              <ImageUpload currentUrl={form.cover_url} onUploaded={(url) => setForm({ ...form, cover_url: url })} />
            </div>
          </div>
          <textarea placeholder="Biography" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={createArtist.isPending || updateArtist.isPending} className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {createArtist.isPending || updateArtist.isPending ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Artist</th>
              <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Genre</th>
              <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
            </tr></thead>
            <tbody>
              {artists.map((a) => (
                <React.Fragment key={a.id}>
                  <tr className="border-b border-border/50">
                    <td className="py-4 pr-4"><p className="font-body text-sm font-medium text-foreground">{a.name}</p></td>
                    <td className="py-4 pr-4 hidden md:table-cell"><span className="font-body text-xs text-muted-foreground">{a.genre}</span></td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setExpandedArtist(expandedArtist === a.id ? null : a.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                          {expandedArtist === a.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button onClick={() => startEdit(a)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><Pencil size={16} /></button>
                        <button onClick={() => { if (confirm("Delete this artist?")) deleteArtist.mutate(a.id); }} className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedArtist === a.id && (
                    <tr><td colSpan={3} className="px-4 pb-4 space-y-6">
                      <TracksPanel artistId={a.id} />
                      <ArtistMerchPanel artistId={a.id} />
                    </td></tr>
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

const TracksPanel = ({ artistId }: { artistId: string }) => {
  const { data: tracks = [] } = useArtistTracks(artistId);
  const createTrack = useCreateTrack();
  const deleteTrack = useDeleteTrack();
  const [form, setForm] = useState({ title: "", genre: "", duration_seconds: 0, is_featured: false, audio_url: "", cover_url: "" });
  const [uploading, setUploading] = useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${artistId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("music").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("music").getPublicUrl(path);
      setForm((f) => ({ ...f, audio_url: urlData.publicUrl }));
      toast({ title: "Audio uploaded" });
    } catch (err: any) {
      toast({ title: "Upload error", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!form.title || !form.audio_url) return;
    await createTrack.mutateAsync({ ...form, artist_id: artistId });
    setForm({ title: "", genre: "", duration_seconds: 0, is_featured: false, audio_url: "", cover_url: "" });
  };

  return (
    <div>
      <h4 className="font-body text-sm font-semibold text-foreground mb-3">Tracks</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input placeholder="Track Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
        <input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
        <input type="number" placeholder="Duration (sec)" value={form.duration_seconds || ""} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} className="border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <label className="flex items-center gap-2 cursor-pointer border border-border px-3 py-2 font-body text-sm hover:bg-secondary transition-colors">
          <Upload size={14} /> {uploading ? "Uploading..." : "Upload Audio"}
          <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
        </label>
        {form.audio_url && <span className="font-body text-xs text-muted-foreground truncate max-w-[200px]">✓ Audio ready</span>}
        <label className="flex items-center gap-2 font-body text-xs text-foreground">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Featured
        </label>
        <button onClick={handleAdd} disabled={!form.title || !form.audio_url || createTrack.isPending} className="bg-primary text-primary-foreground px-4 py-2 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50">Add Track</button>
      </div>
      <div className="space-y-1">
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center justify-between border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Music size={12} className="text-muted-foreground" />
              <span className="font-body text-sm text-foreground">{t.title}</span>
              {t.is_featured && <span className="font-body text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5">Featured</span>}
            </div>
            <button onClick={() => deleteTrack.mutate({ id: t.id, artistId })} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
          </div>
        ))}
        {tracks.length === 0 && <p className="font-body text-xs text-muted-foreground">No tracks yet.</p>}
      </div>
    </div>
  );
};

const ArtistMerchPanel = ({ artistId }: { artistId: string }) => {
  const { data: artistProducts = [] } = useArtistProducts(artistId);
  const { data: allProducts = [] } = useProducts();
  const addProduct = useAddArtistProduct();
  const removeProduct = useRemoveArtistProduct();
  const [selectedProductId, setSelectedProductId] = useState("");

  const linkedIds = artistProducts.map((ap) => ap.product_id);
  const available = allProducts.filter((p) => !linkedIds.includes(p.id));

  return (
    <div>
      <h4 className="font-body text-sm font-semibold text-foreground mb-3">Collaboration Merch</h4>
      <div className="flex gap-2 mb-3">
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex-1 border border-border bg-background text-foreground px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground">
          <option value="">Select product...</option>
          {available.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={() => { if (selectedProductId) { addProduct.mutate({ artist_id: artistId, product_id: selectedProductId }); setSelectedProductId(""); }}} disabled={!selectedProductId} className="bg-primary text-primary-foreground px-4 py-2 font-body text-sm font-medium hover:opacity-90 disabled:opacity-50">Link</button>
      </div>
      <div className="space-y-1">
        {artistProducts.map((ap) => {
          const product = allProducts.find((p) => p.id === ap.product_id);
          return (
            <div key={ap.id} className="flex items-center justify-between border border-border px-3 py-2">
              <span className="font-body text-sm text-foreground">{product?.name || ap.product_id}</span>
              <button onClick={() => removeProduct.mutate({ id: ap.id, artistId })} className="text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
            </div>
          );
        })}
        {artistProducts.length === 0 && <p className="font-body text-xs text-muted-foreground">No merch linked yet.</p>}
      </div>
    </div>
  );
};

export default ArtistsManager;
