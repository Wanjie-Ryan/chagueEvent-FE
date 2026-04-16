import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  meta_description: string;
  created_at: string;
  updated_at: string;
};

export const usePages = () => {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as Page[];
    },
  });
};

export const usePage = (slug: string) => {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as unknown as Page;
    },
    enabled: !!slug,
  });
};
