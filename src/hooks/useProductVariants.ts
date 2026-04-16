import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  color_hex: string;
  price: number;
  stock: number;
  discount_type: "none" | "percentage" | "fixed";
  discount_value: number;
  created_at: string;
};

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("color_name", { ascending: true })
        .order("size", { ascending: true });
      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
};

export const getDiscountedPrice = (variant: ProductVariant): number => {
  if (variant.discount_type === "percentage") {
    return variant.price * (1 - variant.discount_value / 100);
  }
  if (variant.discount_type === "fixed") {
    return Math.max(0, variant.price - variant.discount_value);
  }
  return variant.price;
};

export const useAddVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, "id" | "created_at">) => {
      const { error } = await supabase.from("product_variants").insert(variant as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["product-variants", v.product_id] }),
  });
};

export const useUpdateVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId, ...updates }: { id: string; productId: string } & Partial<ProductVariant>) => {
      const { error } = await supabase.from("product_variants").update(updates as any).eq("id", id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => qc.invalidateQueries({ queryKey: ["product-variants", productId] }),
  });
};

export const useDeleteVariant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from("product_variants").delete().eq("id", id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => qc.invalidateQueries({ queryKey: ["product-variants", productId] }),
  });
};
