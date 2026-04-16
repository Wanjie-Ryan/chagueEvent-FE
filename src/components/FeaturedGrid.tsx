import { Link } from "react-router-dom";
import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";
import featured3 from "@/assets/featured-3.jpg";
import featured4 from "@/assets/featured-4.jpg";

const cards = [
  { image: featured1, title: "Street Essentials", subtitle: "Level up your kicks", label: "Shop" },
  { image: featured2, title: "ACG Outerwear", subtitle: "Where style meets the outdoors", label: "Shop" },
  { image: featured3, title: "Flex Fleece", subtitle: "Fine-tuned for movement", label: "Shop" },
  { image: featured4, title: "Denim, Denim, Denim", subtitle: "Classic cuts, modern edge", label: "Shop" },
];

const FeaturedGrid = () => {
  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
        Top Providers by Rating
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="group relative overflow-hidden aspect-[4/5]">
            <img
              src={card.image}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="font-body text-xs text-primary-foreground/70 mb-1">
                {card.title}
              </p>
              <p className="font-display text-lg text-primary-foreground font-semibold mb-3">
                {card.subtitle}
              </p>
              <Link
                to="/products"
                className="inline-block border border-primary-foreground text-primary-foreground px-5 py-2 font-body text-xs font-medium hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                {card.label}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedGrid;
