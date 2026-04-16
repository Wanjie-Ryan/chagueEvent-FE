import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import cateringImg from "@/assets/events/cateringcategory.jpg";
import cleanerImg from "@/assets/events/cleaner.jpg";
import decorImg from "@/assets/events/decor.jpg";
import entImg from "@/assets/events/entercategory.jpg";
import photoImg from "@/assets/events/photocategory.jpg";
import secImg from "@/assets/events/security.jpg";
import techImg from "@/assets/events/tech.jpg";
import venueImg from "@/assets/events/venue.jpg";

const categories = [
  { name: "Catering", image: cateringImg, count: "120+", to: "/products?category=catering" },
  { name: "Cleaner", image: cleanerImg, count: "45+", to: "/products?category=cleaner" },
  { name: "Decor", image: decorImg, count: "30+", to: "/products?category=decor" },
  { name: "Entertainment", image: entImg, count: "30+", to: "/products?category=entertainment" },
  { name: "Photography", image: photoImg, count: "15+", to: "/products?category=photo" },
  { name: "Security", image: secImg, count: "10+", to: "/products?category=security" },
  { name: "Venue", image: venueImg, count: "10+", to: "/products?category=venue" },
  { name: "Technicians", image: techImg, count: "20+", to: "/products?category=technicians" },
];

const CategoryTiles = () => {
  return (
    <section className="px-4 md:px-8 py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase mb-2">
          View Events By Category
        </h2>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Find your perfect event organizer.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={cat.to}
                className="group relative block aspect-[3/4] overflow-hidden bg-secondary"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="font-display text-lg md:text-xl font-bold text-primary-foreground uppercase">
                    {cat.name}
                  </p>
                  <p className="font-body text-xs text-primary-foreground/70 mt-0.5">
                    {cat.count} available
                  </p>
                </div>
                <div className="absolute top-3 right-3 w-7 h-7 border border-primary-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-body text-primary-foreground text-xs">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryTiles;
