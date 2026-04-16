import { useNavigate } from "react-router-dom";
import { Check, ShoppingBag } from "lucide-react";

const CheckoutConfirmation = ({ orderId }: { orderId: string | null }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-[hsl(142,70%,40%)] rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={32} className="text-white" />
      </div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
      <p className="font-body text-sm text-muted-foreground mb-1">Your order has been saved and sent via WhatsApp.</p>
      <p className="font-body text-sm text-muted-foreground mb-1">A confirmation email has been sent to your inbox.</p>
      {orderId && <p className="font-body text-xs text-muted-foreground mb-8">Order ID: #{orderId.slice(0, 8)}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate("/profile")} className="bg-foreground text-background px-6 py-3 font-body text-sm font-medium hover:opacity-80 transition-opacity">
          View My Orders
        </button>
        <button onClick={() => navigate("/products")} className="border border-border px-6 py-3 font-body text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
          <ShoppingBag size={16} /> Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CheckoutConfirmation;
