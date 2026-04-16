import { Flame } from "lucide-react";

type Props = {
  stock: number;
  threshold?: number;
};

const LowStockAlert = ({ stock, threshold = 5 }: Props) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 font-body text-xs font-medium text-destructive">
        Out of Stock
      </span>
    );
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1 font-body text-xs font-medium text-[hsl(25,95%,53%)]">
        <Flame size={12} className="animate-pulse" />
        Only {stock} left — selling fast!
      </span>
    );
  }

  return null;
};

export default LowStockAlert;
