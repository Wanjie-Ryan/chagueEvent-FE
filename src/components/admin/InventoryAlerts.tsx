import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Package } from "lucide-react";

type LowStockVariant = {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  stock: number;
  product_name?: string;
};

const LOW_STOCK_THRESHOLD = 5;

const InventoryAlerts = () => {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, product_id, size, color_name, stock")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .order("stock", { ascending: true });
      if (error) throw error;
      
      // Get product names
      const productIds = [...new Set((data as LowStockVariant[]).map(v => v.product_id))];
      if (productIds.length === 0) return [];
      
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);
      
      const nameMap = new Map((products || []).map((p: any) => [p.id, p.name]));
      return (data as LowStockVariant[]).map(v => ({
        ...v,
        product_name: nameMap.get(v.product_id) || "Unknown",
      }));
    },
    refetchInterval: 30000,
  });

  if (isLoading || alerts.length === 0) return null;

  const outOfStock = alerts.filter(a => a.stock <= 0);
  const lowStock = alerts.filter(a => a.stock > 0);

  return (
    <div className="border border-destructive/30 bg-destructive/5 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-destructive" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          Inventory Alerts ({alerts.length})
        </h3>
      </div>

      {outOfStock.length > 0 && (
        <div className="space-y-1">
          <p className="font-body text-xs font-semibold text-destructive uppercase tracking-wider">Out of Stock ({outOfStock.length})</p>
          {outOfStock.slice(0, 5).map(a => (
            <div key={a.id} className="flex items-center justify-between py-1">
              <span className="font-body text-xs text-foreground">{a.product_name} — {a.color_name} / {a.size}</span>
              <span className="font-body text-xs font-semibold text-destructive">0 units</span>
            </div>
          ))}
          {outOfStock.length > 5 && <p className="font-body text-xs text-muted-foreground">+{outOfStock.length - 5} more</p>}
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="space-y-1">
          <p className="font-body text-xs font-semibold text-[hsl(25,95%,53%)] uppercase tracking-wider">Low Stock ({lowStock.length})</p>
          {lowStock.slice(0, 5).map(a => (
            <div key={a.id} className="flex items-center justify-between py-1">
              <span className="font-body text-xs text-foreground">{a.product_name} — {a.color_name} / {a.size}</span>
              <span className="font-body text-xs font-semibold text-[hsl(25,95%,53%)]">{a.stock} units</span>
            </div>
          ))}
          {lowStock.length > 5 && <p className="font-body text-xs text-muted-foreground">+{lowStock.length - 5} more</p>}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
