import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
}

const ImageUpload = ({ currentUrl, onUploaded }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onUploaded(publicUrl);
    } catch (err: any) {
      console.error("Upload failed:", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-body text-xs text-muted-foreground">Product Image</label>
      <div className="flex items-center gap-3">
        {preview && (
          <div className="relative w-16 h-16 bg-secondary overflow-hidden shrink-0">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(""); onUploaded(""); }}
              className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-border px-4 py-2.5 font-body text-sm hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>
    </div>
  );
};

export default ImageUpload;
