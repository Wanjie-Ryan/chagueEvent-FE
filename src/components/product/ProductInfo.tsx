import { Heart, Package, Phone, Mail, MessageCircle } from "lucide-react";

type Props = {
  product: any;
  displayPrice: number;
  isFavourited: boolean;
  onToggleWishlist: () => void;
  onWhatsAppContact: () => void;
  onEmailContact: () => void;
  onPhoneContact: () => void;
};

const ProductInfo = ({
  product,
  displayPrice,
  isFavourited,
  onToggleWishlist,
  onWhatsAppContact,
  onEmailContact,
  onPhoneContact,
}: Props) => {
  return (
    <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
      {/* Category badge */}
      <span className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
        {product.category}
      </span>

      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight">
        {product.name}
      </h1>
      <p className="font-body text-sm text-muted-foreground mt-1">{product.subtitle}</p>

      {/* Price */}
      <div className="flex items-baseline gap-3 mt-4">
        <p className="font-display text-2xl font-bold text-foreground">
          KSH {displayPrice.toLocaleString()}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {/* Action Buttons */}
        <button
          onClick={onWhatsAppContact}
          className="w-full py-4 rounded-full font-body text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white shadow-[0_4px_14px_0_hsla(142,70%,45%,0.4)] hover:shadow-[0_6px_20px_0_hsla(142,70%,45%,0.5)]"
        >
          <MessageCircle size={18} fill="currentColor" />
          WhatsApp Provider
        </button>

        <button
            onClick={onPhoneContact}
            className="w-full py-4 rounded-full font-body text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_0_rgba(37,99,235,0.5)]"
        >
            <Phone size={18} fill="currentColor" />
            Call Provider
        </button>

        <button
            onClick={onEmailContact}
            className="w-full py-4 rounded-full font-body text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] bg-primary text-primary-foreground hover:opacity-90 shadow-[0_4px_14px_0_hsla(var(--primary),0.3)] hover:shadow-[0_6px_20px_0_hsla(var(--primary),0.5)]"
        >
            <Mail size={18} />
            Email Provider
        </button>

        <button
          onClick={onToggleWishlist}
          className="w-full border border-border mt-2 py-4 rounded-full font-body text-sm font-medium hover:border-foreground transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Heart
            size={18}
            className={`transition-colors ${isFavourited ? "fill-destructive text-destructive" : "text-foreground"}`}
          />
          {isFavourited ? "Added to Favourites" : "Add to Favourites"}
        </button>
      </div>

      {/* Description */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Service Details</h3>
        <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
