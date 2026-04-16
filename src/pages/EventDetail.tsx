import { useParams, Link, useNavigate } from "react-router-dom";
import { useEvent, useMyRsvp, useRsvpToEvent, useCancelRsvp } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import TicketPurchase from "@/components/TicketPurchase";
import { format, isPast } from "date-fns";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading } = useEvent(slug || "");
  const { user } = useAuth();
  const { data: myRsvp } = useMyRsvp(event?.id || "");
  const rsvpMutation = useRsvpToEvent();
  const cancelMutation = useCancelRsvp();
  const navigate = useNavigate();

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");

  const eventPast = event ? isPast(new Date(event.event_date)) : false;
  const atCapacity = event?.max_capacity ? (event.rsvp_count || 0) >= event.max_capacity : false;

  const handleRsvp = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!rsvpName.trim() || !rsvpEmail.trim()) {
      toast({ title: "Please enter your name and email", variant: "destructive" });
      return;
    }
    try {
      await rsvpMutation.mutateAsync({ eventId: event!.id, name: rsvpName, email: rsvpEmail });
      toast({ title: "You're in! RSVP confirmed 🎉" });
      setRsvpName("");
      setRsvpEmail("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    if (!myRsvp) return;
    try {
      await cancelMutation.mutateAsync(myRsvp.id);
      toast({ title: "RSVP cancelled" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !event ? (
          <p className="text-center text-muted-foreground font-body py-20">Event not found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Poster */}
            <div className="lg:col-span-3">
              {event.poster_image ? (
                <div className="overflow-hidden bg-secondary aspect-[3/4]">
                  <img src={event.poster_image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-accent aspect-[3/4] flex items-center justify-center">
                  <Calendar size={64} className="text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              {eventPast && (
                <span className="inline-block bg-muted text-muted-foreground px-3 py-1 font-body text-xs uppercase tracking-widest">
                  Past Event
                </span>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight">
                {event.title}
              </h1>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-foreground">
                  <Calendar size={18} className="text-muted-foreground flex-shrink-0" />
                  <span className="font-body text-sm">
                    {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                  <span className="font-body text-sm">
                    {format(new Date(event.event_date), "h:mm a")}
                    {event.end_date && ` – ${format(new Date(event.end_date), "h:mm a")}`}
                  </span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin size={18} className="text-muted-foreground flex-shrink-0" />
                    <span className="font-body text-sm">{event.venue}</span>
                  </div>
                )}
                {event.location && (
                  <p className="font-body text-xs text-muted-foreground pl-[30px]">{event.location}</p>
                )}
                {event.max_capacity && (
                  <div className="flex items-center gap-3 text-foreground">
                    <Users size={18} className="text-muted-foreground flex-shrink-0" />
                    <span className="font-body text-sm">
                      {event.rsvp_count || 0} / {event.max_capacity} spots taken
                    </span>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="border-t border-border pt-6">
                  <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Ticketing Section */}
              <div className="border-t border-border pt-6">
                <TicketPurchase
                  eventId={event.id}
                  eventPast={eventPast}
                  eventTitle={event.title}
                  eventDate={format(new Date(event.event_date), "EEEE, MMMM d, yyyy · h:mm a")}
                  eventVenue={event.venue || event.location || ""}
                />
              </div>

              {/* Legacy RSVP Section (only show if no ticket tiers exist) */}
              {!eventPast && (
                <div className="border-t border-border pt-6">
                  {myRsvp ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Check size={18} />
                        <span className="font-body text-sm font-medium">You're going!</span>
                      </div>
                      <button
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                        className="font-body text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  ) : atCapacity ? (
                    <p className="font-body text-sm text-muted-foreground">
                      This event is at full capacity.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-bold text-foreground uppercase">RSVP</h3>
                      <input
                        placeholder="Your name"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                      />
                      <input
                        placeholder="Your email"
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                      />
                      <button
                        onClick={handleRsvp}
                        disabled={rsvpMutation.isPending}
                        className="w-full bg-foreground text-background py-3 font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        {rsvpMutation.isPending ? "Submitting..." : "RSVP Now"}
                      </button>
                      {!user && (
                        <p className="font-body text-xs text-muted-foreground">
                          You'll need to sign in to RSVP.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
