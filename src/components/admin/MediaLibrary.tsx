import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Image, FolderOpen, Search } from "lucide-react";

type MediaFile = {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
};

const MediaLibrary = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("product-images");

  const buckets = ["product-images", "music"];

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media-files", selectedBucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(selectedBucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter(f => f.name !== ".emptyFolderPlaceholder") as MediaFile[];
    },
  });

  const filtered = search ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files;

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from(selectedBucket).getPublicUrl(name);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;
    setUploading(true);

    let uploaded = 0;
    for (const file of Array.from(uploadFiles)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(selectedBucket).upload(path, file);
      if (error) toast({ title: "Upload failed", description: `${file.name}: ${error.message}`, variant: "destructive" });
      else uploaded++;
    }

    if (uploaded > 0) {
      toast({ title: `${uploaded} file${uploaded !== 1 ? "s" : ""} uploaded` });
      queryClient.invalidateQueries({ queryKey: ["media-files", selectedBucket] });
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from(selectedBucket).remove([name]);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "File deleted" }); queryClient.invalidateQueries({ queryKey: ["media-files", selectedBucket] }); }
  };

  const copyUrl = (name: string) => {
    navigator.clipboard.writeText(getPublicUrl(name));
    toast({ title: "URL copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Image size={20} className="text-muted-foreground" />
          <h2 className="font-display text-2xl font-semibold text-foreground">Media Library</h2>
          <span className="font-body text-xs text-muted-foreground">({filtered.length} files)</span>
        </div>
        <label className={`flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload size={16} /> {uploading ? "Uploading…" : "Upload Files"}
          <input type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,audio/*,video/*" />
        </label>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {buckets.map(b => (
            <button key={b} onClick={() => setSelectedBucket(b)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-body text-xs border transition-colors ${selectedBucket === b ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <FolderOpen size={12} /> {b}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
            className="w-full pl-8 pr-3 py-2 border border-border bg-background text-foreground font-body text-sm" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground text-center py-12">No files found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(f => {
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
            const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(f.name);
            return (
              <div key={f.id || f.name} className="border border-border group relative">
                <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={getPublicUrl(f.name)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : isAudio ? (
                    <div className="text-center p-2">
                      <span className="text-2xl">🎵</span>
                      <p className="font-body text-[10px] text-muted-foreground mt-1 truncate">{f.name}</p>
                    </div>
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl">📄</span>
                      <p className="font-body text-[10px] text-muted-foreground mt-1 truncate">{f.name}</p>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyUrl(f.name)} className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors" title="Copy URL">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleDelete(f.name)} className="p-2 bg-destructive/10 rounded-full hover:bg-destructive/20 transition-colors text-destructive" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="font-body text-[10px] text-muted-foreground p-1.5 truncate">{f.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
