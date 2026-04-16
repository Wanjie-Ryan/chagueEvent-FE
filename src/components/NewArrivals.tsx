import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const products = [
  { id: "p1", name: "ST Retro Racer", subtitle: "Men's Shoes", price: 11500, image: product1 },
  { id: "p2", name: "ST Classic Low", subtitle: "Unisex Shoes", price: 10200, image: product2 },
  { id: "p3", name: "ST Vapor Fly 4", subtitle: "Women's Running Shoes", price: 17400, image: product3 },
  { id: "p4", name: "ST Platform Rise", subtitle: "Women's Shoes", price: 14000, image: product4 },
];

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground">New Arrivals</h2>
        <div className="flex items-center gap-3">
          <a href="/products" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mr-2">
            View All
          </a>
          <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {products.map((product) => (
          <div key={product.id} className="min-w-[260px] md:min-w-[300px] flex-shrink-0 group cursor-pointer">
            <div className="aspect-square bg-secondary overflow-hidden mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <h3 className="font-body text-sm font-medium text-foreground">{product.name}</h3>
            <p className="font-body text-xs text-muted-foreground">{product.subtitle}</p>
            <p className="font-body text-sm font-semibold text-foreground mt-1">KSH {product.price.toLocaleString()}</p>
            <button
              onClick={() => addItem(product)}
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

export default NewArrivals;
