import { Link } from "react-router-dom";

const MerchandiseSection = () => {
  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Style n Tunes Merch
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Exclusive in-house apparel & lifestyle drops
          </p>
        </div>
        <Link
          to="/products"
          className="font-body text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "T-Shirts", desc: "Premium cotton tees with bold graphics", soon: true },
          { title: "Hoodies & Sweats", desc: "Heavyweight fleece for every season", soon: true },
          { title: "Caps & Beanies", desc: "Headwear to complete your fit", soon: true },
        ].map((item) => (
          <div
            key={item.title}
            className="aspect-[4/3] bg-secondary flex flex-col items-center justify-center text-center p-8"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
            <p className="font-body text-sm text-muted-foreground mb-4">{item.desc}</p>
            {item.soon && (
              <span className="font-body text-xs font-semibold text-muted-foreground border border-border px-3 py-1">
                COMING SOON
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MerchandiseSection;
