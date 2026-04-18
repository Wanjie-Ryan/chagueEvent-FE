import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const FeaturedGrid = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const { data } = await api.get("/reviews/top-providers");
        if (data && data.data) {
          setProviders(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch top providers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProviders();
  }, []);

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
        Top Providers by Rating
      </h2>
      {loading ? (
        <p className="text-muted-foreground font-body text-sm">Loading top providers...</p>
      ) : providers.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm">
          No top providers available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider: any, i: number) => {
            const hasImage = provider.photo && provider.photo !== "default-avatar.png";

            return (
              <div key={provider._id || i} className="group relative overflow-hidden aspect-[4/5] bg-secondary/50">
                {hasImage ? (
                  <img
                    src={provider.photo}
                    alt={provider.username}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                    <span className="text-6xl text-muted-foreground/30 font-display font-bold uppercase">
                      {provider.username?.charAt(0) || "P"}
                    </span>
                  </div>
                )}

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-body text-xs text-primary-foreground/90 mb-1 flex items-center gap-1 font-semibold tracking-wider">
                        ⭐ {provider.averageRating?.toFixed(1) || 0} / 5.0
                        <span className="opacity-70 ml-1">({provider.reviewCount} reviews)</span>
                      </p>
                      <p className="font-display text-3xl text-primary-foreground font-bold mb-2">
                        {provider.username}
                      </p>
                      {provider.bio && (
                        <p className="font-body text-sm text-primary-foreground/80 mb-4 line-clamp-2 max-w-md">
                          {provider.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/products?provider=${provider._id}`} // Adjust to your actual filtering route when ready
                    className="inline-block border-2 border-primary-foreground text-primary-foreground px-6 py-2.5 font-body text-xs font-bold hover:bg-primary-foreground hover:text-primary transition-all uppercase tracking-widest mt-2"
                  >
                    View Services
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FeaturedGrid;
