import { Heart, ChevronDown, Truck, RotateCcw, Shield, ShoppingBag, Package } from "lucide-react";
import LowStockAlert from "@/components/LowStockAlert";
import type { ProductVariant } from "@/hooks/useProductVariants";

type Props = {
  product: any;
  displayPrice: number;
  originalPrice: number | null;
  selectedVariant: ProductVariant | null;
  colors: { name: string; hex: string }[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
  sizeSource: string[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
  hasVariants: boolean;
  variants: ProductVariant[];
  isInStock: boolean;
  isFavourited: boolean;
  onToggleWishlist: () => void;
  wishlistPending: boolean;
  onAddToBag: () => void;
  onWhatsAppCheckout: () => void;
  onDirectOrder?: () => void;
  isCheckingOut: boolean;
  isDirectOrdering?: boolean;
  showDetails: boolean;
  onToggleDetails: () => void;
  showDelivery: boolean;
  onToggleDelivery: () => void;
};

const ProductInfo = ({
  product,
  displayPrice,
  originalPrice,
  selectedVariant,
  colors,
  selectedColor,
  onColorChange,
  sizeSource,
  selectedSize,
  onSizeChange,
  hasVariants,
  variants,
  isInStock,
  isFavourited,
  onToggleWishlist,
  wishlistPending,
  onAddToBag,
  onWhatsAppCheckout,
  onDirectOrder,
  isCheckingOut,
  isDirectOrdering = false,
  showDetails,
  onToggleDetails,
  showDelivery,
  onToggleDelivery,
}: Props) => {
  const discountPercent = selectedVariant?.discount_type === "percentage" ? selectedVariant.discount_value : null;

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
        {originalPrice && (
          <span className="font-body text-base text-muted-foreground line-through">
            KSH {originalPrice.toLocaleString()}
          </span>
        )}
        {discountPercent && (
          <span className="bg-destructive/10 text-destructive px-2.5 py-0.5 font-body text-xs font-semibold rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="mt-6">
          <p className="font-body text-sm font-medium text-foreground mb-3">
            Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => onColorChange(c.name)}
                title={c.name}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 relative ${
                  selectedColor === c.name
                    ? "border-foreground scale-110 shadow-md"
                    : "border-border hover:border-muted-foreground hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {selectedColor === c.name && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Grid */}
      {sizeSource.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-sm font-medium text-foreground">Select Size</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {sizeSource.map((size) => {
              const variant = hasVariants
                ? variants.find((v) => v.size === size && (!selectedColor || v.color_name === selectedColor))
                : null;
              const outOfStock = variant ? variant.stock <= 0 : false;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && onSizeChange(size)}
                  disabled={outOfStock}
                  className={`py-3 rounded-lg border font-body text-sm transition-all duration-200 ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background font-semibold shadow-sm"
                      : outOfStock
                      ? "border-border bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                      : "border-border bg-background text-foreground hover:border-foreground hover:shadow-sm"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      {hasVariants && selectedVariant && (
        <div className="mt-3">
          <LowStockAlert stock={selectedVariant.stock} />
          {selectedVariant.stock > 5 && (
            <p className="font-body text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {selectedVariant.stock} in stock
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 space-y-3">
        {/* Add to Bag */}
        <button
          onClick={onAddToBag}
          disabled={hasVariants && !isInStock}
          className="w-full bg-foreground text-background py-4 rounded-full font-body text-sm font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <ShoppingBag size={18} />
          {hasVariants && !isInStock ? "Out of Stock" : "Add to Bag"}
        </button>

        {/* WhatsApp Checkout */}
        <button
          onClick={onWhatsAppCheckout}
          disabled={(hasVariants && !isInStock) || isCheckingOut}
          className="w-full py-4 rounded-full font-body text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98] bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white shadow-[0_4px_14px_0_hsla(142,70%,45%,0.4)] hover:shadow-[0_6px_20px_0_hsla(142,70%,45%,0.5)]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {isCheckingOut ? "Processing..." : "Order via WhatsApp"}
        </button>

        {/* Direct Order */}
        {onDirectOrder && (
          <button
            onClick={onDirectOrder}
            disabled={(hasVariants && !isInStock) || isDirectOrdering}
            className="w-full py-4 rounded-full font-body text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.98] bg-primary text-primary-foreground hover:opacity-90"
          >
            <Package size={18} />
            {isDirectOrdering ? "Placing Order..." : "Place Order"}
          </button>
        )}


        <button
          onClick={onToggleWishlist}
          disabled={wishlistPending}
          className="w-full border border-border py-4 rounded-full font-body text-sm font-medium hover:border-foreground transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
        <p className="font-body text-sm text-foreground/80 leading-relaxed">{product.description}</p>
        {selectedColor && (
          <ul className="font-body text-sm text-muted-foreground mt-4 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: colors.find(c => c.name === selectedColor)?.hex }} />
              Colour: {selectedColor}
            </li>
            <li>Category: {product.category}</li>
          </ul>
        )}
      </div>

      {/* Product Details accordion */}
      <button
        onClick={onToggleDetails}
        className="w-full flex items-center justify-between py-4 border-t border-border mt-2 font-body text-sm font-medium text-foreground"
      >
        Product Details
        <ChevronDown size={16} className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
      </button>
      {showDetails && (
        <div className="font-body text-sm text-muted-foreground pb-4 leading-relaxed -mt-1">
          <p>{product.description}</p>
        </div>
      )}

      {/* Delivery & Returns accordion */}
      <button
        onClick={onToggleDelivery}
        className="w-full flex items-center justify-between py-4 border-t border-border font-body text-sm font-medium text-foreground"
      >
        Delivery & Returns
        <ChevronDown size={16} className={`transition-transform duration-200 ${showDelivery ? "rotate-180" : ""}`} />
      </button>
      {showDelivery && (
        <div className="font-body text-sm text-muted-foreground pb-4 leading-relaxed -mt-1 space-y-3">
          <div className="flex items-start gap-3">
            <Truck size={16} className="mt-0.5 flex-shrink-0 text-foreground" />
            <p>Free standard delivery on all orders across Kenya.</p>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw size={16} className="mt-0.5 flex-shrink-0 text-foreground" />
            <p>Returns accepted within 30 days of purchase.</p>
          </div>
          <div className="flex items-start gap-3">
            <Shield size={16} className="mt-0.5 flex-shrink-0 text-foreground" />
            <p>All items are 100% authentic and quality guaranteed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
