import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  email?: string;
};

export const useReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch emails from profiles
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      let emailMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        (profiles || []).forEach((p: any) => { emailMap[p.id] = p.email; });
      }

      return (data || []).map((r: any) => ({ ...r, email: emailMap[r.user_id] || "Anonymous" })) as Review[];
    },
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Please sign in to leave a review");
      const { error } = await supabase.from("reviews").insert({
        user_id: session.user.id,
        product_id: productId,
        rating,
        comment,
      });
      if (error) {
        if (error.code === "23505") throw new Error("You've already reviewed this product");
        throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.productId] });
      toast({ title: "Review submitted!" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};
