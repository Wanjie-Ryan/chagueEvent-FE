import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", session.user.id);
      if (error) throw error;
      return data.map((w) => w.product_id);
    },
  });
};

export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Please sign in to save favourites");

      const { data: existing } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase.from("wishlists").delete().eq("id", existing.id);
        return { added: false };
      } else {
        await supabase.from("wishlists").insert({ user_id: session.user.id, product_id: productId });
        return { added: true };
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ title: result.added ? "Added to wishlist" : "Removed from wishlist" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};
