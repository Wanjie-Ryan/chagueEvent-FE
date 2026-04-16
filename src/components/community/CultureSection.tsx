import { useState } from "react";
import { Link } from "react-router-dom";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlog";
import { format } from "date-fns";

const CultureSection = () => {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const { data: posts = [], isLoading } = useBlogPosts(activeCategory);
  const { data: categories = [] } = useBlogCategories();
  const publishedPosts = posts.filter((p) => p.published);

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button onClick={() => setActiveCategory(undefined)}
          className={`font-body text-sm px-5 py-2 border transition-colors ${!activeCategory ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"}`}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.slug === activeCategory ? undefined : cat.slug)}
            className={`font-body text-sm px-5 py-2 border transition-colors ${activeCategory === cat.slug ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : publishedPosts.length === 0 ? (
        <p className="text-center text-muted-foreground font-body py-20">No articles yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedPosts.map((post, i) => (
            <Link key={post.id} to={`/blog/${post.slug}`}
              className={`group block ${i === 0 && publishedPosts.length > 2 ? "md:col-span-2 lg:col-span-2" : ""}`}>
              <div className="overflow-hidden bg-secondary aspect-[16/10] mb-4">
                {post.cover_image ? (
                  <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-2xl">STYLE N TUNES</div>
                )}
              </div>
              <div className="space-y-2">
                {post.blog_categories && <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">{post.blog_categories.name}</span>}
                <h2 className={`font-display font-bold text-foreground uppercase tracking-tight group-hover:underline ${i === 0 && publishedPosts.length > 2 ? "text-2xl md:text-3xl" : "text-lg"}`}>{post.title}</h2>
                <p className="font-body text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <p className="font-body text-xs text-muted-foreground">{post.author_name} · {format(new Date(post.created_at), "MMM d, yyyy")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CultureSection;
