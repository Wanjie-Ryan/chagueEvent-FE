import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const vibes = [
  {
    name: "Photography",
    emoji: "📸",
    description: "Capture the perfect moments, from candid to portraits",
    gradient: "from-foreground/5 to-secondary",
    query: "?category=photography",
  },
  {
    name: "Catering",
    emoji: "🍽️",
    description: "Delightful menus, stunning presentations, exquisite taste",
    gradient: "from-foreground/10 to-secondary",
    query: "?category=catering",
  },
  {
    name: "Decor",
    emoji: "✨",
    description: "Transforming venues into magical, unforgettable spaces",
    gradient: "from-foreground/15 to-secondary",
    query: "?category=decor",
  },
  {
    name: "Entertainment",
    emoji: "🎶",
    description: "DJs, bands, artists to keep the energy high",
    gradient: "from-foreground/8 to-secondary",
    query: "?category=entertainment",
  },
];

const ShopByVibe = () => {
  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Browse by</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight">
          Category
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Find exactly what you need for your event.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {vibes.map((vibe, i) => (
          <motion.div
            key={vibe.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link
              to={`/products${vibe.query}`}
              className={`group block aspect-square bg-gradient-to-br ${vibe.gradient} border border-border hover:border-foreground transition-all p-6 flex flex-col justify-between relative overflow-hidden`}
            >
              <span className="text-4xl md:text-5xl">{vibe.emoji}</span>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight group-hover:underline">
                  {vibe.name}
                </h3>
                <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">
                  {vibe.description}
                </p>
              </div>
              <div className="absolute top-4 right-4 w-6 h-6 border border-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-body text-foreground text-xs">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ShopByVibe;
