import { X, Minus, Plus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-foreground/40" onClick={() => setIsOpen(false)} />

      {/* Sidebar */}
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Bag ({totalItems})
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-foreground hover:text-muted-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 && (
            <p className="font-body text-sm text-muted-foreground text-center py-12">Your bag is empty.</p>
          )}
          {items.map((item) => {
            const cartKey = item.variantId ? `${item.id}_${item.variantId}` : item.id;
            return (
            <div key={cartKey} className="flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover bg-secondary" />
              <div className="flex-1">
                <h3 className="font-body text-sm font-medium text-foreground">{item.name}</h3>
                <p className="font-body text-xs text-muted-foreground">{item.subtitle}</p>
                {(item.color || item.size) && (
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </p>
                )}
                <p className="font-body text-sm font-semibold text-foreground mt-1">KSH {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(cartKey, item.quantity - 1)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-sm text-foreground">{item.quantity}</span>
                  <button onClick={() => updateQuantity(cartKey, item.quantity + 1)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeItem(cartKey)} className="ml-auto text-xs text-muted-foreground hover:text-foreground font-body transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border space-y-4">
            <div className="flex justify-between">
              <span className="font-body text-sm text-foreground">Total</span>
              <span className="font-display text-lg font-semibold text-foreground">KSH {totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/checkout");
              }}
              className="w-full bg-foreground text-background py-3 font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
