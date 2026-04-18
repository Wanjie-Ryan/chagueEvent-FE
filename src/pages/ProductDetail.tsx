import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProduct } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { resolveImage } from "@/lib/imageMap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";
import useSEO from "@/hooks/useSEO";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id || "");
  const { addProduct: trackViewed } = useRecentlyViewed();

  useEffect(() => {
    if (id) trackViewed(id);
  }, [id, trackViewed]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavourited, setIsFavourited] = useState(false);

  useEffect(() => {
    if (id) {
        trackViewed(id);
        const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsFavourited(saved.includes(id));
    }
  }, [id, trackViewed]);

  const toggleWishlist = () => {
    if (!user) {
        toast({ title: "Please login to add to favorites" });
        navigate("/auth");
        return;
    }
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (saved.includes(id)) {
      const next = saved.filter((item: string) => item !== id);
      localStorage.setItem("wishlist", JSON.stringify(next));
      setIsFavourited(false);
      toast({ title: "Removed from Favorites" });
    } else {
      saved.push(id);
      localStorage.setItem("wishlist", JSON.stringify(saved));
      setIsFavourited(true);
      toast({ title: "Added to Favorites" });
    }
  };

  useSEO({
    title: product ? `${product.name} — KSH ${product.price?.toLocaleString()}` : "Loading...",
    description: product ? `${product.description?.slice(0, 150)}. Book top services on Chagua Event.` : "",
    canonical: product ? `http://localhost:8080/product/${product.id}` : undefined,
    type: "product",
  });

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
          <Link to="/products" className="font-body text-sm underline text-foreground">Back to Directory</Link>
        </div>
      </div>
    );
  }

  // Handle fallback images
  let primaryImage = resolveImage(product.image_url);
  if (!primaryImage || primaryImage === "default-avatar.png") {
     primaryImage = ""; 
  }
  const allImages = primaryImage ? [primaryImage] : [];
  const displayPrice = product.price || 0;
  
  const handleWhatsAppContact = () => {
    if (!user) {
        toast({ title: "Please login to contact the provider" });
        navigate("/auth");
        return;
    }
    const phone = product.providerPhone || "254791010693";
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/product/${product.id}`;
    const message = `Hi! I found your service on Chagua Event and I'd like to inquire about: *${product.name}*\n\n📎 ${link}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  const handleEmailContact = () => {
    if (!user) {
        toast({ title: "Please login to email the provider" });
        navigate("/auth");
        return;
    }
    const email = product.providerEmail || "media@info.co.ke";
    window.location.href = `mailto:${email}?subject=Inquiry from Chagua Event&body=Hi there, I am interested in your services for my event!`;
  };

  const handlePhoneContact = () => {
    if (!user) {
        toast({ title: "Please login to call the provider" });
        navigate("/auth");
        return;
    }
    const phone = product.providerPhone || "254791010693";
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Directory</Link>
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
            isFavourited={isFavourited}
            onToggleWishlist={toggleWishlist}
            onWhatsAppContact={handleWhatsAppContact}
            onEmailContact={handleEmailContact}
            onPhoneContact={handlePhoneContact}
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
