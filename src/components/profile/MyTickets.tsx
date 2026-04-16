import { useAllMyTickets } from "@/hooks/useTickets";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function MyTickets() {
  const { data: tickets = [], isLoading } = useAllMyTickets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (tickets.length === 0) return (
    <div className="text-center py-16">
      <Ticket size={40} className="text-muted-foreground mx-auto mb-4" />
      <p className="font-display text-lg text-muted-foreground">No tickets yet</p>
      <Link to="/community?tab=events" className="font-body text-sm underline text-foreground mt-2 inline-block">Browse Events</Link>
    </div>
  );

  // Group tickets by event
  const grouped = tickets.reduce((acc: Record<string, any[]>, t: any) => {
    const eventId = t.event_id;
    if (!acc[eventId]) acc[eventId] = [];
    acc[eventId].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} across {Object.keys(grouped).length} event{Object.keys(grouped).length !== 1 ? "s" : ""}</p>

      {Object.entries(grouped).map(([eventId, eventTickets]: [string, any[]]) => {
        const event = eventTickets[0]?.events;
        const isExpired = event?.event_date ? isPast(new Date(event.event_date)) : false;
        const isExpanded = expandedId === eventId;

        return (
          <div key={eventId} className={`border border-border ${isExpired ? "opacity-60" : ""}`}>
            {/* Event header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : eventId)}
              className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-base font-bold text-foreground uppercase tracking-tight">
                    {event?.title || "Event"}
                  </h3>
                  {isExpired && (
                    <span className="font-body text-[10px] uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5">Past</span>
                  )}
                  <span className="font-body text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">
                    {eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                  {event?.event_date && (
                    <span className="flex items-center gap-1 font-body text-xs">
                      <Calendar size={12} /> {format(new Date(event.event_date), "MMM d, yyyy · h:mm a")}
                    </span>
                  )}
                  {event?.venue && (
                    <span className="flex items-center gap-1 font-body text-xs">
                      <MapPin size={12} /> {event.venue}
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {/* Tickets */}
            {isExpanded && (
              <div className="border-t border-border divide-y divide-border/50">
                {eventTickets.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    {/* QR Code */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="bg-background p-2 border border-border">
                        <QRCodeSVG value={ticket.qr_data} size={100} />
                      </div>
                    </div>

                    {/* Ticket details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-sm font-bold text-foreground tracking-wider">{ticket.ticket_code}</span>
                        <span className={`font-body text-[10px] uppercase tracking-widest px-2 py-0.5 ${
                          ticket.checked_in
                            ? "bg-foreground/10 text-muted-foreground"
                            : ticket.status === "active"
                            ? "bg-foreground text-background"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {ticket.checked_in ? "Checked In" : ticket.status}
                        </span>
                      </div>
                      <div className="font-body text-sm text-foreground">
                        <span className="text-muted-foreground text-xs">Tier: </span>
                        {ticket.ticket_tiers?.name || "—"}
                        {ticket.ticket_tiers?.price > 0 && (
                          <span className="ml-2 font-semibold">KSH {Number(ticket.ticket_tiers.price).toLocaleString()}</span>
                        )}
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        Purchased {format(new Date(ticket.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                      {ticket.checked_in_at && (
                        <p className="font-body text-xs text-muted-foreground">
                          Checked in {format(new Date(ticket.checked_in_at), "MMM d · h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MyTickets;
