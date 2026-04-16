import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProduct } from "@/hooks/useProducts";
import { useProductImages } from "@/hooks/useProductImages";
import { useProductVariants, getDiscountedPrice } from "@/hooks/useProductVariants";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { resolveImage } from "@/lib/imageMap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";
import useSEO from "@/hooks/useSEO";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || "");
  const { addProduct: trackViewed } = useRecentlyViewed();

  useEffect(() => {
    if (id) trackViewed(id);
  }, [id, trackViewed]);

  useSEO({
    title: product ? `${product.name} — KSH ${product.price.toLocaleString()}` : "Loading...",
    description: product ? `${product.description?.slice(0, 150)}. Buy at Style n Tunes with free delivery in Kenya.` : "",
    canonical: product ? `https://stylentunes.com/product/${product.id}` : undefined,
    type: "product",
  });
  const { data: extraImages = [] } = useProductImages(id || "");
  const { data: variants = [] } = useProductVariants(id || "");
  const { addItem } = useCart();
  const createOrder = useCreateOrder();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { data: wishlist = [] } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const isFavourited = wishlist.includes(id || "");
  const [showDetails, setShowDetails] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isDirectOrdering, setIsDirectOrdering] = useState(false);

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    variants.forEach((v) => { if (v.color_name) map.set(v.color_name, v.color_hex); });
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [variants]);

  const sizes = useMemo(() => {
    if (!selectedColor) return [...new Set(variants.map((v) => v.size).filter(Boolean))];
    return [...new Set(variants.filter((v) => v.color_name === selectedColor).map((v) => v.size).filter(Boolean))];
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor && !selectedSize) return null;
    return variants.find(
      (v) => (!selectedColor || v.color_name === selectedColor) && (!selectedSize || v.size === selectedSize)
    ) || null;
  }, [variants, selectedColor, selectedSize]);

  useMemo(() => {
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0].name);
  }, [colors]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="font-body text-muted-foreground">Product not found.</p>
          <Link to="/products" className="font-body text-sm underline text-foreground">Back to Products</Link>
        </div>
      </div>
    );
  }

  const allImages = [
    resolveImage(product.image_url),
    ...extraImages.map((img) => resolveImage(img.image_url)),
  ];

  const hasVariants = variants.length > 0;
  const displayPrice = selectedVariant ? getDiscountedPrice(selectedVariant) : product.price;
  const originalPrice = selectedVariant && selectedVariant.discount_type !== "none" ? selectedVariant.price : null;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const sizeSource = hasVariants ? sizes : (product.sizes as string[] || []);

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      name: product.name,
      subtitle: [selectedColor, selectedSize].filter(Boolean).join(" / ") || product.subtitle,
      price: displayPrice,
      image: allImages[0],
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      variantId: selectedVariant?.id,
    });
  };

  const handleWhatsAppCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const orderItems = [{
        product_id: product.id,
        variant_id: selectedVariant?.id || undefined,
        product_name: product.name,
        variant_info: [selectedColor, selectedSize].filter(Boolean).join(" / "),
        quantity: 1,
        unit_price: displayPrice,
      }];
      if (session?.user) {
        await createOrder.mutateAsync({
          customer_name: session.user.email || "",
          customer_phone: "",
          customer_email: session.user.email,
          total: displayPrice,
          user_id: session.user.id,
          items: orderItems,
        });
      }
    } catch {
      // Don't block WhatsApp if order save fails
    }
    const baseUrl = window.location.origin;
    const details = [selectedColor, selectedSize].filter(Boolean).join("/");
    const detailStr = details ? ` (${details})` : "";
    const link = `${baseUrl}/product/${product.id}`;
    const message = `Hi! I'd like to order:\n\n• *${product.name}*${detailStr} x1 — KSH ${displayPrice.toLocaleString()}\n  📎 ${link}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/254791010693?text=${encoded}`, "_blank");
    toast({ title: "Order placed!", description: "Redirecting to WhatsApp..." });
    setIsCheckingOut(false);
  };

  const handleDirectOrder = async () => {
    setIsDirectOrdering(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ title: "Please sign in first", description: "You need an account to place an order.", variant: "destructive" });
        setIsDirectOrdering(false);
        return;
      }
      const orderItems = [{
        product_id: product.id,
        variant_id: selectedVariant?.id || undefined,
        product_name: product.name,
        variant_info: [selectedColor, selectedSize].filter(Boolean).join(" / "),
        quantity: 1,
        unit_price: displayPrice,
      }];
      const order = await createOrder.mutateAsync({
        customer_name: session.user.email || "",
        customer_phone: "",
        customer_email: session.user.email,
        total: displayPrice,
        user_id: session.user.id,
        items: orderItems,
      });

      // Send confirmation + admin notification email
      try {
        await supabase.functions.invoke("send-order-confirmation", {
          body: {
            order_id: order.id,
            customer_email: session.user.email,
            customer_name: session.user.email,
            items: orderItems,
            total: displayPrice,
            discount_amount: 0,
            promo_code: null,
          },
        });
      } catch {
        // Email failure shouldn't block order
      }

      toast({ title: "Order placed!", description: "Your order has been saved. We'll reach out to confirm delivery details." });
    } catch {
      toast({ title: "Error placing order", variant: "destructive" });
    }
    setIsDirectOrdering(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Left: Image Gallery */}
          <ProductImageGallery
            images={allImages}
            productName={product.name}
            activeIndex={activeImageIndex}
            onIndexChange={setActiveImageIndex}
          />

          {/* Right: Product Info */}
          <ProductInfo
            product={product}
            displayPrice={displayPrice}
            originalPrice={originalPrice}
            selectedVariant={selectedVariant}
            colors={colors}
            selectedColor={selectedColor}
            onColorChange={(color) => { setSelectedColor(color); setSelectedSize(null); }}
            sizeSource={sizeSource}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            hasVariants={hasVariants}
            variants={variants}
            isInStock={isInStock}
            isFavourited={isFavourited}
            onToggleWishlist={() => toggleWishlist.mutate(product.id)}
            wishlistPending={toggleWishlist.isPending}
            onAddToBag={handleAddToBag}
            onWhatsAppCheckout={handleWhatsAppCheckout}
            onDirectOrder={handleDirectOrder}
            isCheckingOut={isCheckingOut}
            isDirectOrdering={isDirectOrdering}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(!showDetails)}
            showDelivery={showDelivery}
            onToggleDelivery={() => setShowDelivery(!showDelivery)}
          />
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts productId={product.id} category={product.category} />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
