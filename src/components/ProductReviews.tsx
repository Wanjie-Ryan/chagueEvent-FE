import { useState } from "react";
import { Star } from "lucide-react";
import { useReviews, useCreateReview } from "@/hooks/useReviews";

const StarRating = ({ rating, onChange, interactive = false }: { rating: number; onChange?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={interactive ? 20 : 14}
        className={`${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"} ${interactive ? "cursor-pointer" : ""}`}
        onClick={() => interactive && onChange?.(s)}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { data: reviews = [], isLoading } = useReviews(productId);
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmit = () => {
    if (rating === 0) return;
    createReview.mutate({ productId, rating, comment }, {
      onSuccess: () => { setRating(0); setComment(""); setShowForm(false); },
    });
  };

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="font-body text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length})</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-body text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-4 border border-border bg-secondary/30 space-y-3">
          <StarRating rating={rating} onChange={setRating} interactive />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-border bg-background text-foreground font-body text-sm resize-none h-24 focus:outline-none focus:border-foreground transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
            className="bg-foreground text-background px-6 py-2 font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={r.rating} />
                <span className="font-body text-xs text-muted-foreground">
                  {r.email?.split("@")[0] || "User"} · {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p className="font-body text-sm text-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
