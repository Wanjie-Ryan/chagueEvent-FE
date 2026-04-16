import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProductImages } from "@/hooks/useProductImages";
import { useQueryClient } from "@tanstack/react-query";
import { resolveImage } from "@/lib/imageMap";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, X, GripVertical } from "lucide-react";

interface Props {
  productId: string;
}

type PendingImage = {
  file: File;
  preview: string;
};

const ProductImagesManager = ({ productId }: Props) => {
  const { data: images = [], isLoading } = useProductImages(productId);
  const queryClient = useQueryClient();
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPending = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newPending]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePending = (index: number) => {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAndSaveAll = async () => {
    if (pendingImages.length === 0 && !urlInput) return;
    setUploading(true);

    try {
      const urls: string[] = [];

      // Upload files
      for (const pending of pendingImages) {
        const ext = pending.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, pending.file, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        urls.push(publicUrl);
      }

      // Add pasted URL
      if (urlInput.trim()) {
        urls.push(urlInput.trim());
      }

      // Insert all to product_images
      const inserts = urls.map((url, i) => ({
        product_id: productId,
        image_url: url,
        display_order: images.length + i,
      }));

      const { error } = await supabase.from("product_images").insert(inserts as any);
      if (error) throw error;

      // Cleanup
      pendingImages.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingImages([]);
      setUrlInput("");
      queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
      toast({ title: `${urls.length} image(s) added` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (id: string, imageUrl: string) => {
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Try to delete from storage if it's a storage URL
    if (imageUrl.includes("product-images")) {
      const parts = imageUrl.split("/product-images/");
      if (parts[1]) {
        await supabase.storage.from("product-images").remove([parts[1]]);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
    toast({ title: "Image removed" });
  };

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-body text-sm font-medium text-foreground">
          Product Images ({images.length})
        </h4>
      </div>

      {/* Existing images */}
      {isLoading ? (
        <p className="font-body text-xs text-muted-foreground">Loading...</p>
      ) : images.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <div key={img.id} className="relative w-20 h-20 bg-secondary overflow-hidden group border border-border">
              <img src={resolveImage(img.image_url)} alt="Product angle" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(img.id, img.image_url)}
                className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Trash2 size={16} className="text-background" />
              </button>
              <span className="absolute bottom-0.5 left-0.5 bg-background/80 text-[10px] font-body px-1 rounded">
                {img.display_order + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-xs text-muted-foreground">No additional images yet.</p>
      )}

      {/* Add new images */}
      <div className="space-y-3 p-4 bg-secondary/30 border border-border">
        <p className="font-body text-xs font-medium text-foreground">Add Images</p>

        {/* File picker - multiple */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border border-border px-4 py-2 font-body text-xs hover:bg-secondary transition-colors"
          >
            <Upload size={14} /> Select Files
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <span className="font-body text-xs text-muted-foreground">
            Select multiple images at once
          </span>
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            placeholder="Or paste image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 border border-border bg-background text-foreground px-3 py-2 font-body text-xs focus:outline-none focus:border-foreground"
          />
        </div>

        {/* Pending previews */}
        {pendingImages.length > 0 && (
          <div>
            <p className="font-body text-xs text-muted-foreground mb-2">
              Ready to upload ({pendingImages.length} file{pendingImages.length > 1 ? "s" : ""}):
            </p>
            <div className="flex gap-2 flex-wrap">
              {pendingImages.map((p, i) => (
                <div key={i} className="relative w-20 h-20 bg-secondary overflow-hidden border border-border">
                  <img src={p.preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePending(i)}
                    className="absolute top-0.5 right-0.5 bg-background/90 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-0.5 left-0.5 bg-background/80 text-[10px] font-body px-1 rounded truncate max-w-[72px]">
                    {p.file.name.split(".")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        {(pendingImages.length > 0 || urlInput.trim()) && (
          <button
            onClick={uploadAndSaveAll}
            disabled={uploading}
            className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : `Save ${pendingImages.length + (urlInput.trim() ? 1 : 0)} Image(s)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductImagesManager;
