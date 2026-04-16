import { Link } from "react-router-dom";
import { useEvents, type Event } from "@/hooks/useEvents";
import { format, isPast } from "date-fns";
import { MapPin, Calendar } from "lucide-react";

const EventsSection = () => {
  const { data: events = [], isLoading } = useEvents();
  const publishedEvents = events.filter((e) => e.published);
  const upcoming = publishedEvents.filter((e) => !isPast(new Date(e.event_date)));
  const past = publishedEvents.filter((e) => isPast(new Date(e.event_date)));

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (publishedEvents.length === 0) return <p className="text-center text-muted-foreground font-body py-20">No events scheduled. Check back soon.</p>;

  return (
    <>
      {upcoming.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight mb-8">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight mb-8">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-70">
            {past.map((event) => <EventCard key={event.id} event={event} eventIsPast />)}
          </div>
        </section>
      )}
    </>
  );
};

function EventCard({ event, eventIsPast }: { event: Event; eventIsPast?: boolean }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block">
      <div className="overflow-hidden bg-secondary aspect-[3/4] mb-4 relative">
        {event.poster_image ? (
          <img src={event.poster_image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent"><Calendar size={48} className="text-muted-foreground" /></div>
        )}
        {eventIsPast && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <span className="font-display text-lg font-bold text-foreground uppercase tracking-widest">Past</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-background/90 px-3 py-2">
          <p className="font-display text-2xl font-bold text-foreground leading-none">{format(new Date(event.event_date), "dd")}</p>
          <p className="font-body text-xs text-muted-foreground uppercase">{format(new Date(event.event_date), "MMM yyyy")}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-lg font-bold text-foreground uppercase tracking-tight group-hover:underline">{event.title}</h3>
        <div className="flex items-center gap-4 text-muted-foreground">
          {event.venue && <span className="flex items-center gap-1 font-body text-xs"><MapPin size={12} /> {event.venue}</span>}
          <span className="flex items-center gap-1 font-body text-xs"><Calendar size={12} /> {format(new Date(event.event_date), "h:mm a")}</span>
        </div>
        {event.location && <p className="font-body text-xs text-muted-foreground">{event.location}</p>}
      </div>
    </Link>
  );
}

export default EventsSection;
