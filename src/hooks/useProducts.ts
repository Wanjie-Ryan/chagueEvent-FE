import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image_url: string;
  category: string;
  sizes: string[];
  description: string;
  created_at: string;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((p) => ({
        ...p,
        sizes: Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes || "[]"),
      })) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      const p = data as any;
      return {
        ...p,
        sizes: Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes || "[]"),
      } as Product;
    },
    enabled: !!id,
  });
};
