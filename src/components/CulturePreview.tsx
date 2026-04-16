import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlog";
import { useEvents } from "@/hooks/useEvents";
import { useArtists } from "@/hooks/useArtists";
import { isPast, format } from "date-fns";
import { resolveImage } from "@/lib/imageMap";

const CulturePreview = () => {
  const { data: posts = [] } = useBlogPosts();
  const { data: events = [] } = useEvents();
  const { data: artists = [] } = useArtists();

  const latestPost = posts.filter((p) => p.published)[0];
  const nextEvent = events.filter((e) => e.published && !isPast(new Date(e.event_date)))[0];
  const featuredArtist = artists[0];

  const cards = [
    latestPost && {
      type: "Culture",
      title: latestPost.title,
      image: latestPost.cover_image,
      link: `/blog/${latestPost.slug}`,
      sub: latestPost.excerpt,
    },
    nextEvent && {
      type: "Event",
      title: nextEvent.title,
      image: nextEvent.poster_image,
      link: `/events/${nextEvent.slug}`,
      sub: `${format(new Date(nextEvent.event_date), "MMM d")} · ${nextEvent.venue}`,
    },
    featuredArtist && {
      type: "Artist",
      title: featuredArtist.name,
      image: featuredArtist.image_url,
      link: `/artists/${featuredArtist.slug}`,
      sub: featuredArtist.genre,
    },
  ].filter(Boolean) as { type: string; title: string; image: string; link: string; sub: string }[];

  if (cards.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">From the</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight">
            Culture
          </h2>
        </div>
        <Link to="/community" className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          Explore All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.link} className="group block">
            <div className="relative aspect-[4/3] bg-secondary overflow-hidden mb-3">
              {card.image ? (
                <img src={resolveImage(card.image)} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-xl">STYLE N TUNES</div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-foreground text-background font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
                  {card.type}
                </span>
              </div>
            </div>
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-1">
              {card.title}
            </h3>
            <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-1">{card.sub}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CulturePreview;
