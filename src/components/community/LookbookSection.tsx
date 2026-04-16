import { Link } from "react-router-dom";
import { useLookbooks } from "@/hooks/useLookbooks";
import { motion } from "framer-motion";

const LookbookSection = () => {
  const { data: lookbooks = [], isLoading } = useLookbooks();
  const published = lookbooks.filter((lb) => lb.published);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (published.length === 0) return <p className="text-center text-muted-foreground font-body py-20">No lookbooks yet. Check back soon.</p>;

  return (
    <div className="-mx-6 lg:-mx-12">
      {published.map((lb, i) => (
        <Link key={lb.id} to={`/lookbook/${lb.slug}`} className="group block">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`relative overflow-hidden ${i % 3 === 0 ? "h-[70vh]" : "h-[50vh]"}`}
          >
            {lb.cover_image ? (
              <img src={lb.cover_image} alt={lb.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-accent" />
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-foreground/60 to-transparent">
              {lb.season && <span className="font-body text-xs uppercase tracking-[0.3em] text-background/80 mb-2 block">{lb.season}</span>}
              <h2 className="font-display text-2xl md:text-4xl font-bold text-background uppercase tracking-tight">{lb.title}</h2>
              {lb.description && <p className="font-body text-sm text-background/80 mt-2 max-w-lg">{lb.description}</p>}
              <span className="inline-block mt-4 font-body text-xs uppercase tracking-[0.2em] text-background border-b border-background/50 pb-1 group-hover:border-background transition-colors">
                View Collection
              </span>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default LookbookSection;
