import { useState, useEffect } from "react";
import { usePages, type Page } from "@/hooks/usePages";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

const TOOLBAR_BTNS = [
  { icon: Bold, wrap: ["**", "**"], label: "Bold" },
  { icon: Italic, wrap: ["*", "*"], label: "Italic" },
  { icon: Heading1, wrap: ["# ", ""], label: "H1" },
  { icon: Heading2, wrap: ["## ", ""], label: "H2" },
  { icon: List, wrap: ["- ", ""], label: "List" },
  { icon: LinkIcon, wrap: ["[text](", ")"], label: "Link" },
  { icon: ImageIcon, wrap: ["![alt](", ")"], label: "Image" },
];

const RichEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById("page-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="border border-border">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-secondary/30">
        {TOOLBAR_BTNS.map(({ icon: Icon, wrap, label }) => (
          <button key={label} onClick={() => insertMarkdown(wrap[0], wrap[1])} title={label}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Icon size={14} />
          </button>
        ))}
      </div>
      <textarea id="page-editor" value={value} onChange={(e) => onChange(e.target.value)}
        rows={20} className="w-full bg-background text-foreground px-4 py-3 font-body text-sm font-mono focus:outline-none resize-none" 
        placeholder="Write your page content using Markdown..." />
    </div>
  );
};

const MarkdownPreview = ({ content }: { content: string }) => {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-bold text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-bold text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold text-foreground mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="w-full max-w-2xl my-4" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="font-body text-sm text-foreground ml-4">• $1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return <div className="prose max-w-none font-body text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};

const PagesManager = () => {
  const { data: pages = [], isLoading } = usePages();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Page | "new" | null>(null);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", content: "", published: false, meta_description: "" });

  useEffect(() => {
    if (editing && editing !== "new") {
      setForm({
        title: editing.title,
        slug: editing.slug,
        content: editing.content,
        published: editing.published,
        meta_description: editing.meta_description,
      });
    } else if (editing === "new") {
      setForm({ title: "", slug: "", content: "", published: false, meta_description: "" });
    }
    setPreview(false);
  }, [editing]);

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        published: form.published,
        meta_description: form.meta_description,
        updated_at: new Date().toISOString(),
      };
      if (editing === "new") {
        const { error } = await supabase.from("pages" as any).insert(payload as any);
        if (error) throw error;
        toast({ title: "Page created" });
      } else {
        const { error } = await supabase.from("pages" as any).update(payload as any).eq("id", (editing as Page).id);
        if (error) throw error;
        toast({ title: "Page updated" });
      }
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("pages" as any).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Page deleted" }); queryClient.invalidateQueries({ queryKey: ["pages"] }); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Pages ({pages.length})</h2>
        <button onClick={() => setEditing("new")} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90">
          <Plus size={16} /> New Page
        </button>
      </div>

      {editing && (
        <div className="mb-8 border border-border p-6 space-y-5 bg-secondary/30">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {editing === "new" ? "New Page" : `Edit: ${(editing as Page).title}`}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreview(!preview)} className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-body text-xs border border-border px-3 py-1.5">
                {preview ? <><Pencil size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
              </button>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Title *</label>
              <input value={form.title} onChange={(e) => {
                const title = e.target.value;
                setForm({ ...form, title, slug: editing === "new" ? autoSlug(title) : form.slug });
              }} className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Slug *</label>
              <div className="flex items-center gap-1">
                <span className="font-body text-xs text-muted-foreground">/page/</span>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Meta Description (SEO)</label>
            <input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              placeholder="Brief description for search engines..." maxLength={160}
              className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
            <span className="font-body text-[10px] text-muted-foreground">{form.meta_description.length}/160</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="font-body text-xs text-muted-foreground">Published</label>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-primary" />
          </div>

          {preview ? (
            <div className="border border-border p-6 bg-background min-h-[300px]">
              <h1 className="font-display text-3xl font-bold text-foreground mb-6">{form.title}</h1>
              <MarkdownPreview content={form.content} />
            </div>
          ) : (
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Content (Markdown)</label>
              <RichEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="bg-primary text-primary-foreground px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
              <Save size={14} /> Save Page
            </button>
            <button onClick={() => setEditing(null)} className="border border-border text-foreground px-6 py-2.5 font-body text-sm font-medium hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-muted-foreground">No pages yet. Create your first page.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Title</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Slug</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-4 pr-4">
                    <p className="font-body text-sm font-medium text-foreground">{p.title}</p>
                  </td>
                  <td className="py-4 pr-4 hidden md:table-cell">
                    <span className="font-body text-xs text-muted-foreground font-mono">/page/{p.slug}</span>
                  </td>
                  <td className="py-4 pr-4">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 font-body text-xs text-green-600"><Eye size={12} /> Published</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground"><EyeOff size={12} /> Draft</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing(p)} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PagesManager;
