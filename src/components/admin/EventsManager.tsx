import { useState } from "react";
import { useAdminEvents, useSaveEvent, useDeleteEvent, useEventRsvps } from "@/hooks/useEvents";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Users, ChevronDown, ChevronUp } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import TicketTiersManager from "@/components/admin/TicketTiersManager";
import { format } from "date-fns";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  poster_image: "",
  location: "",
  venue: "",
  event_date: "",
  end_date: "",
  max_capacity: "" as string,
  published: false,
};

const EventsManager = () => {
  const { data: events = [], isLoading } = useAdminEvents();
  const saveMutation = useSaveEvent();
  const deleteMutation = useDeleteEvent();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const startEdit = (event?: typeof events[0]) => {
    if (event) {
      setEditing(event.id);
      setForm({
        title: event.title,
        slug: event.slug,
        description: event.description,
        poster_image: event.poster_image,
        location: event.location,
        venue: event.venue,
        event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
        max_capacity: event.max_capacity?.toString() || "",
        published: event.published,
      });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.event_date) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    const slug = form.slug || generateSlug(form.title);
    try {
      await saveMutation.mutateAsync({
        ...(editing !== "new" ? { id: editing! } : {}),
        title: form.title,
        slug,
        description: form.description,
        poster_image: form.poster_image,
        location: form.location,
        venue: form.venue,
        event_date: new Date(form.event_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
        published: form.published,
      });
      toast({ title: editing === "new" ? "Event created" : "Event updated" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Event deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">Events ({events.length})</h2>
        <button onClick={() => startEdit()} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">
          <Plus size={16} /> New Event
        </button>
      </div>

      {editing && (
        <div className="border border-border p-6 mb-8 space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {editing === "new" ? "New Event" : "Edit Event"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Slug" value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Venue" value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Location / Address" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Start Date & Time</label>
              <input type="datetime-local" value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">End Date & Time (optional)</label>
              <input type="datetime-local" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            </div>
            <input placeholder="Max Capacity (optional)" value={form.max_capacity} type="number"
              onChange={(e) => setForm({ ...form, max_capacity: e.target.value })}
              className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Poster Image</label>
            <ImageUpload currentUrl={form.poster_image} onUploaded={(url) => setForm({ ...form, poster_image: url })} />
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4" />
            Published
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} className="bg-foreground text-background px-6 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">Save</button>
            <button onClick={() => setEditing(null)} className="border border-border px-6 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="border border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 min-w-0">
                {event.poster_image && (
                  <img src={event.poster_image} alt="" className="w-12 h-16 object-cover bg-secondary flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-body text-sm font-medium text-foreground truncate">{event.title}</h3>
                    {event.published ? <Eye size={14} className="text-foreground flex-shrink-0" /> : <EyeOff size={14} className="text-muted-foreground flex-shrink-0" />}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    {format(new Date(event.event_date), "MMM d, yyyy h:mm a")} · {event.venue || "No venue"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)} className="p-2 hover:bg-secondary transition-colors text-foreground">
                  {expandedEvent === event.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button onClick={() => startEdit(event)} className="p-2 hover:bg-secondary transition-colors text-foreground">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-secondary transition-colors text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {expandedEvent === event.id && (
              <div className="border-t border-border">
                <RsvpList eventId={event.id} />
                <div className="p-4 border-t border-border">
                  <TicketTiersManager eventId={event.id} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function RsvpList({ eventId }: { eventId: string }) {
  const { data: rsvps = [], isLoading } = useEventRsvps(eventId);

  if (isLoading) return <div className="p-4 border-t border-border"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="p-4 border-t border-border bg-secondary/30">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-muted-foreground" />
        <span className="font-body text-xs font-medium text-foreground">{rsvps.length} RSVPs</span>
      </div>
      {rsvps.length === 0 ? (
        <p className="font-body text-xs text-muted-foreground">No RSVPs yet.</p>
      ) : (
        <div className="space-y-2">
          {rsvps.map((rsvp) => (
            <div key={rsvp.id} className="flex items-center justify-between font-body text-xs">
              <span className="text-foreground">{rsvp.name}</span>
              <span className="text-muted-foreground">{rsvp.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsManager;
