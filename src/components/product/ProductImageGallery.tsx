import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  productName: string;
  activeIndex: number;
  onIndexChange: (i: number) => void;
};

const ProductImageGallery = ({ images, productName, activeIndex, onIndexChange }: Props) => {
  const hasMultiple = images.length > 1;
  const goNext = () => onIndexChange((activeIndex + 1) % images.length);
  const goPrev = () => onIndexChange((activeIndex - 1 + images.length) % images.length);

  return (
    <div className="flex gap-3">
      {/* Vertical Thumbnails – desktop only */}
      {hasMultiple && (
        <div className="hidden lg:flex flex-col gap-2 w-[72px] flex-shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`w-[72px] h-[72px] overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                activeIndex === i
                  ? "border-foreground shadow-sm"
                  : "border-transparent hover:border-muted-foreground/40 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 aspect-[4/5] bg-secondary overflow-hidden rounded-xl group border border-border">
        {images.length > 0 && images[activeIndex] ? (
          <img
            src={images[activeIndex]}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
            <span className="text-8xl text-muted-foreground/30 font-display font-bold uppercase">
             {productName.charAt(0)}
            </span>
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-105 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-105 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        {/* Image counter badge */}
        {hasMultiple && (
          <div className="absolute bottom-4 right-4 bg-foreground/70 backdrop-blur-sm text-background text-xs font-body px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        )}
        {/* Mobile dots */}
        {hasMultiple && (
          <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  activeIndex === i ? "bg-foreground w-5" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
