import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";


const REQUIRED_COLUMNS = ["name", "price"];
const ALL_COLUMNS = ["name", "subtitle", "price", "category", "image_url", "description", "sizes"];

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
  return { headers, rows };
}

const BulkProductImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const header = ALL_COLUMNS.join(",");
    const example = 'Nike Air Max 97,Gold Bullet,15000,Sneakers,sneaker-97-gold-1.jpg,"Classic air max with full-length visible air unit","EU 38,EU 39,EU 40,EU 41,EU 42"';
    const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResults(null);

    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);

      const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
      if (missing.length > 0) {
        toast({ title: "Invalid CSV", description: `Missing required columns: ${missing.join(", ")}`, variant: "destructive" });
        setImporting(false);
        return;
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const price = parseFloat(row.price);
        if (!row.name || isNaN(price)) {
          failed++;
          errors.push(`Row ${i + 2}: Missing name or invalid price`);
          setProgress(Math.round(((i + 1) / rows.length) * 100));
          continue;
        }

        let sizes: string[] = [];
        if (row.sizes) {
          sizes = row.sizes.split(/[;|]/).map(s => s.trim()).filter(Boolean);
          if (sizes.length === 0 && row.sizes.includes(",")) {
            // sizes might be comma-separated within quotes
            sizes = row.sizes.split(",").map(s => s.trim()).filter(Boolean);
          }
        }

        const { error } = await supabase.from("products").insert({
          name: row.name,
          subtitle: row.subtitle || "",
          price,
          category: row.category || "Sneakers",
          image_url: row.image_url || "",
          description: row.description || "",
          sizes: sizes as any,
        });

        if (error) {
          failed++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          success++;
        }

        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      setResults({ success, failed, errors });
      if (success > 0) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast({ title: `${success} product${success !== 1 ? "s" : ""} imported` });
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="border border-border p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground">Bulk Import</h3>
        </div>
        <button onClick={downloadTemplate} className="flex items-center gap-2 border border-border text-foreground px-4 py-2 font-body text-sm font-medium hover:bg-secondary transition-colors">
          <Download size={14} /> Template CSV
        </button>
      </div>

      <p className="font-body text-xs text-muted-foreground">
        Upload a CSV with columns: <span className="font-medium text-foreground">name</span>, <span className="font-medium text-foreground">price</span> (required), subtitle, category, image_url, description, sizes (pipe-separated).
      </p>

      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-foreground/40 transition-colors ${importing ? "pointer-events-none opacity-50" : ""}`}>
        <Upload size={24} className="text-muted-foreground" />
        <span className="font-body text-sm text-muted-foreground">Click to upload CSV file</span>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
      </label>

      {importing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="font-body text-xs text-muted-foreground text-center">{progress}% complete</p>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            {results.success > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-body">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-foreground">{results.success} imported</span>
              </div>
            )}
            {results.failed > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-body">
                <AlertCircle size={16} className="text-destructive" />
                <span className="text-foreground">{results.failed} failed</span>
              </div>
            )}
          </div>
          {results.errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3 max-h-32 overflow-y-auto">
              {results.errors.map((err, i) => (
                <p key={i} className="font-body text-xs text-destructive">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkProductImport;
