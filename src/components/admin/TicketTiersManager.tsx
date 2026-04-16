import { useState } from "react";
import {
  useTicketTiers,
  useSaveTicketTier,
  useDeleteTicketTier,
  useEventTickets,
  useCheckInTicket,
} from "@/hooks/useTickets";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Check, X, QrCode, Search } from "lucide-react";

type Props = { eventId: string };

const emptyTier = {
  name: "",
  description: "",
  price: "",
  max_quantity: "100",
  max_per_user: "5",
  sort_order: "0",
};

const TicketTiersManager = ({ eventId }: Props) => {
  const { data: tiers = [], isLoading } = useTicketTiers(eventId);
  const { data: tickets = [] } = useEventTickets(eventId);
  const saveMutation = useSaveTicketTier();
  const deleteMutation = useDeleteTicketTier();
  const checkInMutation = useCheckInTicket();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTier);
  const [showCheckin, setShowCheckin] = useState(false);
  const [searchCode, setSearchCode] = useState("");

  const startEdit = (tier?: typeof tiers[0]) => {
    if (tier) {
      setEditing(tier.id);
      setForm({
        name: tier.name,
        description: tier.description,
        price: tier.price.toString(),
        max_quantity: tier.max_quantity.toString(),
        max_per_user: tier.max_per_user.toString(),
        sort_order: tier.sort_order.toString(),
      });
    } else {
      setEditing("new");
      setForm(emptyTier);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Tier name is required", variant: "destructive" });
      return;
    }
    try {
      await saveMutation.mutateAsync({
        ...(editing !== "new" ? { id: editing! } : {}),
        event_id: eventId,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        max_quantity: parseInt(form.max_quantity) || 100,
        max_per_user: parseInt(form.max_per_user) || 5,
        sort_order: parseInt(form.sort_order) || 0,
      });
      toast({ title: editing === "new" ? "Tier created" : "Tier updated" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm("Delete this ticket tier?")) return;
    try {
      await deleteMutation.mutateAsync({ tierId, eventId });
      toast({ title: "Tier deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleCheckIn = async (ticketId: string) => {
    try {
      await checkInMutation.mutateAsync(ticketId);
      toast({ title: "Checked in ✓" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filteredTickets = searchCode
    ? tickets.filter(
        (t) =>
          t.ticket_code.toLowerCase().includes(searchCode.toLowerCase()) ||
          t.buyer_name.toLowerCase().includes(searchCode.toLowerCase()) ||
          t.buyer_email.toLowerCase().includes(searchCode.toLowerCase())
      )
    : tickets;

  const checkedInCount = tickets.filter((t) => t.checked_in).length;

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      {/* Ticket Tiers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
            Ticket Tiers ({tiers.length})
          </h4>
          <button
            onClick={() => startEdit()}
            className="flex items-center gap-1 font-body text-xs text-foreground hover:opacity-70"
          >
            <Plus size={12} /> Add Tier
          </button>
        </div>

        {editing && (
          <div className="border border-border p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Tier name (e.g. Regular, VIP)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground col-span-2"
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground col-span-2"
              />
              <div>
                <label className="font-body text-[10px] text-muted-foreground">Price (KSH)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
              <div>
                <label className="font-body text-[10px] text-muted-foreground">Max Quantity</label>
                <input
                  type="number"
                  value={form.max_quantity}
                  onChange={(e) => setForm({ ...form, max_quantity: e.target.value })}
                  className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
              <div>
                <label className="font-body text-[10px] text-muted-foreground">Max Per User</label>
                <input
                  type="number"
                  value={form.max_per_user}
                  onChange={(e) => setForm({ ...form, max_per_user: e.target.value })}
                  className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
              <div>
                <label className="font-body text-[10px] text-muted-foreground">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-foreground text-background px-4 py-1.5 font-body text-xs font-medium hover:opacity-80">
                Save
              </button>
              <button onClick={() => setEditing(null)} className="border border-border px-4 py-1.5 font-body text-xs text-foreground hover:bg-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {tiers.length === 0 ? (
          <p className="font-body text-xs text-muted-foreground">No ticket tiers. Add tiers to enable ticketing.</p>
        ) : (
          <div className="space-y-2">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-3 border border-border">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{tier.name}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {tier.price === 0 ? "Free" : `KSH ${tier.price.toLocaleString()}`} · {tier.sold_count}/{tier.max_quantity} sold · Max {tier.max_per_user}/person
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(tier)} className="p-1.5 hover:bg-secondary transition-colors text-foreground">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(tier.id)} className="p-1.5 hover:bg-secondary transition-colors text-destructive">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-in / Tickets */}
      {tickets.length > 0 && (
        <div>
          <button
            onClick={() => setShowCheckin(!showCheckin)}
            className="flex items-center gap-2 font-display text-sm font-bold text-foreground uppercase tracking-wider mb-3"
          >
            <QrCode size={14} />
            Ticket Check-In ({checkedInCount}/{tickets.length})
          </button>

          {showCheckin && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search by code, name, or email..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 font-body text-sm border border-border bg-background text-foreground"
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`flex items-center justify-between p-3 border transition-colors ${
                      ticket.checked_in ? "border-accent/50 bg-accent/5" : "border-border"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body text-sm font-medium text-foreground truncate">{ticket.buyer_name}</p>
                        <span className="font-body text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5">
                          {ticket.tier?.name}
                        </span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {ticket.ticket_code} · {ticket.buyer_email}
                      </p>
                    </div>
                    {ticket.checked_in ? (
                      <span className="flex items-center gap-1 font-body text-xs text-accent-foreground bg-accent px-2 py-1">
                        <Check size={12} /> In
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(ticket.id)}
                        disabled={checkInMutation.isPending}
                        className="flex items-center gap-1 font-body text-xs bg-foreground text-background px-3 py-1.5 hover:opacity-80 disabled:opacity-50"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketTiersManager;
