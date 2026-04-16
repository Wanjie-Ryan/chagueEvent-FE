import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string | null;
  author_name: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  blog_categories?: BlogCategory | null;
};

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

export function useBlogPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ["blog_posts", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: cat } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin_blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useSaveBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: {
      id?: string;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      cover_image: string;
      category_id: string | null;
      author_name: string;
      published: boolean;
    }) => {
      if (post.id) {
        const { id, ...rest } = post;
        const { error } = await supabase.from("blog_posts").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _id, ...rest } = post;
        const { error } = await supabase.from("blog_posts").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      qc.invalidateQueries({ queryKey: ["admin_blog_posts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      qc.invalidateQueries({ queryKey: ["admin_blog_posts"] });
    },
  });
}
