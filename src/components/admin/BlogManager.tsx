import { useState } from "react";
import { useAdminBlogPosts, useSaveBlogPost, useDeleteBlogPost, useBlogCategories } from "@/hooks/useBlog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category_id: "" as string,
  author_name: "Style N Tunes",
  published: false,
};

const BlogManager = () => {
  const { data: posts = [], isLoading } = useAdminBlogPosts();
  const { data: categories = [] } = useBlogCategories();
  const saveMutation = useSaveBlogPost();
  const deleteMutation = useDeleteBlogPost();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (post?: typeof posts[0]) => {
    if (post) {
      setEditing(post.id);
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        category_id: post.category_id || "",
        author_name: post.author_name,
        published: post.published,
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const slug = form.slug || generateSlug(form.title);
    try {
      await saveMutation.mutateAsync({
        ...(editing !== "new" ? { id: editing! } : {}),
        title: form.title,
        slug,
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image,
        category_id: form.category_id || null,
        author_name: form.author_name || "Style N Tunes",
        published: form.published,
      });
      toast({ title: editing === "new" ? "Post created" : "Post updated" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Post deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Blog Posts ({posts.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">
          <Plus size={16} /> New Post
        </button>
      </div>

      {editing && (
        <div className="border border-border p-6 mb-8 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {editing === "new" ? "New Post" : "Edit Post"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
            />
            <input
              placeholder="Slug (auto-generated)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
            />
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              placeholder="Author Name"
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
            />
          </div>
          <input
            placeholder="Excerpt (short summary)"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
          />
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Cover Image</label>
            <ImageUpload
              currentUrl={form.cover_image}
              onUploaded={(url) => setForm({ ...form, cover_image: url })}
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Content (HTML)</label>
            <textarea
              placeholder="Write your article content here... (supports HTML)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4"
              />
              Published
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-foreground text-background px-6 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">
              Save
            </button>
            <button onClick={() => setEditing(null)} className="border border-border px-6 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between border border-border p-4">
            <div className="flex items-center gap-4 min-w-0">
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="w-16 h-10 object-cover bg-secondary flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-body text-sm font-medium text-foreground truncate">{post.title}</h3>
                  {post.published ? (
                    <Eye size={14} className="text-foreground flex-shrink-0" />
                  ) : (
                    <EyeOff size={14} className="text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {post.blog_categories?.name || "Uncategorized"} · {post.author_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => startEdit(post)} className="p-2 hover:bg-secondary transition-colors text-foreground">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-secondary transition-colors text-destructive">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;
