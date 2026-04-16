import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MapPin, MessageCircle, Tag, X, Loader2, Package } from "lucide-react";
import type { Address, PromoResult } from "@/pages/Checkout";
import type { CartItem } from "@/context/CartContext";

type Props = {
  items: CartItem[];
  selectedAddress: Address;
  totalItems: number;
  totalPrice: number;
  finalTotal: number;
  promo: PromoResult | null;
  setPromo: (p: PromoResult | null) => void;
  onChangeAddress: () => void;
  onPlaceOrder: () => void;
  onDirectOrder?: () => void;
  isPending: boolean;
  isDirectPending?: boolean;
};

const CheckoutSummary = ({ items, selectedAddress, totalItems, totalPrice, finalTotal, promo, setPromo, onChangeAddress, onPlaceOrder, onDirectOrder, isPending, isDirectPending = false }: Props) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Invalid promo code", variant: "destructive" });
        setPromoLoading(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "This promo code has expired", variant: "destructive" });
        setPromoLoading(false);
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        toast({ title: "This promo code has reached its usage limit", variant: "destructive" });
        setPromoLoading(false);
        return;
      }

      if (totalPrice < (data.min_order_amount || 0)) {
        toast({ title: `Minimum order KSH ${Number(data.min_order_amount).toLocaleString()} required`, variant: "destructive" });
        setPromoLoading(false);
        return;
      }

      const discountAmount = data.discount_type === "percentage"
        ? Math.round(totalPrice * Number(data.discount_value) / 100)
        : Number(data.discount_value);

      setPromo({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        discount_amount: Math.min(discountAmount, totalPrice),
      });
      toast({ title: `Promo "${data.code}" applied!` });
    } catch {
      toast({ title: "Error applying promo code", variant: "destructive" });
    }
    setPromoLoading(false);
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">Order Summary</h1>

      {/* Delivery info */}
      <div className="border border-border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-body text-sm font-semibold text-foreground flex items-center gap-2"><MapPin size={14} /> Delivering to</h3>
          <button onClick={onChangeAddress} className="font-body text-xs text-muted-foreground hover:text-foreground underline">Change</button>
        </div>
        <p className="font-body text-sm text-foreground">{selectedAddress.full_name}</p>
        <p className="font-body text-xs text-muted-foreground">
          {selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ""}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
        </p>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => {
          const cartKey = item.variantId ? `${item.id}_${item.variantId}` : item.id;
          return (
            <div key={cartKey} className="flex gap-4 border-b border-border pb-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover bg-secondary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-body text-sm font-medium text-foreground truncate">{item.name}</h3>
                <p className="font-body text-xs text-muted-foreground">{item.subtitle}</p>
                {(item.color || item.size) && (
                  <p className="font-body text-xs text-muted-foreground">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
                )}
                <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-body text-sm font-semibold text-foreground whitespace-nowrap">KSH {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Promo Code */}
      <div className="border border-border p-4 mb-6">
        <h3 className="font-body text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><Tag size={14} /> Promo Code</h3>
        {promo ? (
          <div className="flex items-center justify-between bg-secondary/50 px-3 py-2">
            <div>
              <span className="font-body text-sm font-medium text-foreground">{promo.code}</span>
              <span className="font-body text-xs text-muted-foreground ml-2">
                -KSH {promo.discount_amount.toLocaleString()}
              </span>
            </div>
            <button onClick={() => setPromo(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 font-body text-sm border border-border px-3 py-2 bg-background text-foreground uppercase tracking-wider"
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="bg-foreground text-background px-4 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {promoLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border border-border p-4 space-y-2">
        <div className="flex justify-between font-body text-sm">
          <span className="text-muted-foreground">Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
          <span className="text-foreground">KSH {totalPrice.toLocaleString()}</span>
        </div>
        {promo && (
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Discount ({promo.code})</span>
            <span className="text-[hsl(142,70%,40%)]">-KSH {promo.discount_amount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-body text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-foreground">Calculated after</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-display text-lg font-bold text-foreground">Total</span>
          <span className="font-display text-lg font-bold text-foreground">KSH {finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Direct Place Order */}
      <button
        disabled={isPending || isDirectPending}
        onClick={onDirectOrder || onPlaceOrder}
        className="mt-6 w-full bg-primary text-primary-foreground py-3 font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 rounded-full"
      >
        <Package size={18} /> {isDirectPending ? "Placing Order..." : "Place Order"}
      </button>

      {/* WhatsApp Order */}
      <button
        disabled={isPending || isDirectPending}
        onClick={onPlaceOrder}
        className="mt-3 w-full bg-[hsl(142,70%,40%)] text-white py-3 font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 rounded-full"
      >
        <MessageCircle size={18} /> {isPending ? "Placing Order..." : "Place Order via WhatsApp"}
      </button>
    </div>
  );
};

export default CheckoutSummary;
