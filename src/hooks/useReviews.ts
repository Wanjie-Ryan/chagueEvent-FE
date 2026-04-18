import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  email?: string;
  username?: string;
};

export const useReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/listing/${productId}`);
      
      return (data.data || []).map((r: any) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.createdAt,
        email: r.clientId?.username || "Anonymous", // fallback
        username: r.clientId?.username || "Anonymous"
      })) as Review[];
    },
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      // API interceptor will attach the token if the user is authenticated.
      // If the backend refuses, it will throw a 401 which goes to OnError.
      const { data } = await api.post("/reviews/create", {
        listingId: productId,
        rating,
        comment,
      });
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.productId] });
      toast({ title: "Review submitted!" });
    },
    onError: (err: any) => {
      const message = err.response?.data?.msg || err.message || "Failed to submit review. Are you logged in?";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });
};
