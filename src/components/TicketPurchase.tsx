import { useState } from "react";
import { useTicketTiers, useMyTickets, usePurchaseTicket } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Ticket, Minus, Plus, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Props = { eventId: string; eventPast: boolean; eventTitle?: string; eventDate?: string; eventVenue?: string };

const TicketPurchase = ({ eventId, eventPast, eventTitle = "", eventDate = "", eventVenue = "" }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: tiers = [], isLoading: tiersLoading } = useTicketTiers(eventId);
  const { data: myTickets = [] } = useMyTickets(eventId);
  const purchaseMutation = usePurchaseTicket();

  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [showTickets, setShowTickets] = useState(false);

  if (tiersLoading) return null;
  if (tiers.length === 0) return null;

  const activeTier = tiers.find((t) => t.id === selectedTier);
  const remaining = activeTier ? activeTier.max_quantity - activeTier.sold_count : 0;

  const handlePurchase = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (!selectedTier) return;

    try {
      await purchaseMutation.mutateAsync({
        tierId: selectedTier,
        eventId,
        buyerName,
        buyerEmail,
        buyerPhone,
        quantity,
        eventTitle,
        eventDate,
        eventVenue,
        tierName: activeTier?.name || "",
        tierPrice: activeTier?.price || 0,
      });
      toast({ title: `${quantity} ticket${quantity > 1 ? "s" : ""} purchased! 🎉` });
      setSelectedTier(null);
      setQuantity(1);
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setShowTickets(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Ticket Tiers */}
      {!eventPast && (
        <div>
          <h3 className="font-display text-lg font-bold text-foreground uppercase mb-4 flex items-center gap-2">
            <Ticket size={18} /> Get Tickets
          </h3>

          <div className="space-y-3">
            {tiers.map((tier) => {
              const soldOut = tier.sold_count >= tier.max_quantity;
              const isSelected = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    if (!soldOut) {
                      setSelectedTier(isSelected ? null : tier.id);
                      setQuantity(1);
                    }
                  }}
                  disabled={soldOut}
                  className={`w-full text-left p-4 border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : soldOut
                      ? "border-border bg-muted opacity-60 cursor-not-allowed"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground uppercase">{tier.name}</p>
                      {tier.description && (
                        <p className="font-body text-xs text-muted-foreground mt-1">{tier.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-foreground">
                        {tier.price === 0 ? "FREE" : `KSH ${tier.price.toLocaleString()}`}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {soldOut
                          ? "SOLD OUT"
                          : `${tier.max_quantity - tier.sold_count} remaining`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Purchase form */}
          {selectedTier && activeTier && (
            <div className="mt-4 p-4 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-sm font-medium text-foreground w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(Math.min(remaining, activeTier.max_per_user), quantity + 1))}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <input
                placeholder="Full name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
              />
              <input
                placeholder="Email"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
              />
              <input
                placeholder="Phone number"
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground"
              />

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-body text-sm text-muted-foreground">Total</span>
                <span className="font-display text-lg font-bold text-foreground">
                  {activeTier.price === 0
                    ? "FREE"
                    : `KSH ${(activeTier.price * quantity).toLocaleString()}`}
                </span>
              </div>

              <button
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
                className="w-full bg-foreground text-background py-3 font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {purchaseMutation.isPending
                  ? "Processing..."
                  : activeTier.price === 0
                  ? "Claim Ticket"
                  : "Purchase Ticket"}
              </button>

              {!user && (
                <p className="font-body text-xs text-muted-foreground">
                  You'll need to sign in to purchase tickets.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <div className="border-t border-border pt-6">
          <button
            onClick={() => setShowTickets(!showTickets)}
            className="flex items-center gap-2 font-display text-sm font-bold text-foreground uppercase mb-4"
          >
            <Check size={16} />
            My Tickets ({myTickets.length})
          </button>

          {showTickets && (
            <div className="space-y-4">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground uppercase">
                        {ticket.tier?.name || "Ticket"}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Code: {ticket.ticket_code}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 font-body text-[10px] uppercase tracking-wider ${
                        ticket.checked_in
                          ? "bg-accent text-accent-foreground"
                          : ticket.status === "active"
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ticket.checked_in ? "Checked In" : ticket.status}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center bg-white p-4 rounded">
                    <QRCodeSVG
                      value={ticket.qr_data}
                      size={160}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <p className="font-body text-[10px] text-center text-muted-foreground">
                    Show this QR code at the entrance
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketPurchase;
