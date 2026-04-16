import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { resolveImage } from "@/lib/imageMap";

const RelatedProducts = ({ productId, category }: { productId: string; category: string }) => {
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();

  const related = allProducts
    .filter((p) => p.category === category && p.id !== productId)
    .slice(0, 8);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {related.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-square bg-secondary overflow-hidden mb-3">
                <img
                  src={resolveImage(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="font-body text-sm font-medium text-foreground">{product.name}</h3>
              <p className="font-body text-xs text-muted-foreground">{product.subtitle}</p>
              <p className="font-body text-sm font-semibold text-foreground mt-1">KSH {product.price.toLocaleString()}</p>
            </Link>
            <button
              onClick={() => addItem({ id: product.id, name: product.name, subtitle: product.subtitle, price: product.price, image: resolveImage(product.image_url) })}
              className="mt-2 border border-foreground text-foreground px-4 py-1.5 font-body text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Add to Bag
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
