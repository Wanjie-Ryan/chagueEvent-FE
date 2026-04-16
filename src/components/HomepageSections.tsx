import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlog";
import { useEvents } from "@/hooks/useEvents";
import { format, isPast } from "date-fns";
import { ArrowRight, Calendar, MapPin } from "lucide-react";

export const FeaturedBlogSection = () => {
  const { data: posts = [] } = useBlogPosts();
  const published = posts.filter((p) => p.published).slice(0, 3);

  if (published.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
          From the Culture
        </h2>
        <Link to="/community?tab=culture" className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {published.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
            <div className="overflow-hidden bg-secondary aspect-[16/10] mb-3">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-display text-xl">STYLE N TUNES</div>
              )}
            </div>
            <div className="space-y-1">
              {post.blog_categories && (
                <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">{post.blog_categories.name}</span>
              )}
              <h3 className="font-display text-base font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-2">{post.title}</h3>
              <p className="font-body text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const UpcomingEventsSection = () => {
  const { data: events = [] } = useEvents();
  const upcoming = events.filter((e) => e.published && !isPast(new Date(e.event_date))).slice(0, 4);

  if (upcoming.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
          Upcoming Events
        </h2>
        <Link to="/community?tab=events" className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {upcoming.map((event) => (
          <Link key={event.id} to={`/events/${event.slug}`} className="group block border border-border overflow-hidden">
            <div className="bg-secondary aspect-[4/3] relative overflow-hidden">
              {event.poster_image ? (
                <img src={event.poster_image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Calendar size={32} className="text-muted-foreground" /></div>
              )}
              <div className="absolute top-3 left-3 bg-background/90 px-2 py-1">
                <p className="font-display text-lg font-bold text-foreground leading-none">{format(new Date(event.event_date), "dd")}</p>
                <p className="font-body text-[10px] text-muted-foreground uppercase">{format(new Date(event.event_date), "MMM")}</p>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                {event.venue && <span className="flex items-center gap-1 font-body text-[10px]"><MapPin size={10} /> {event.venue}</span>}
                <span className="flex items-center gap-1 font-body text-[10px]"><Calendar size={10} /> {format(new Date(event.event_date), "h:mm a")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
