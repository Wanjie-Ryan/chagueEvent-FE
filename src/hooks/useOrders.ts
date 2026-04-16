import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus = "pending" | "paid" | "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: OrderStatus;
  total: number;
  discount_amount: number;
  promo_code: string | null;
  notes: string;
  user_id: string | null;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_info: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

export const useOrderItems = (orderId: string | null) =>
  useQuery({
    queryKey: ["order-items", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (error) throw error;
      return data as OrderItem[];
    },
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      total: number;
      notes?: string;
      user_id?: string;
      promo_code?: string;
      discount_amount?: number;
      payment_method?: string;
      shipping_address?: any;
      items: { product_id?: string; variant_id?: string; product_name: string; variant_info: string; quantity: number; unit_price: number }[];
    }) => {
      const { items, ...orderData } = payload;
      const { data, error } = await supabase
        .from("orders")
        .insert(orderData as any)
        .select()
        .single();
      if (error) throw error;
      const order = data as Order;

      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(items.map((i) => ({ ...i, order_id: order.id })) as any);
        if (itemsError) throw itemsError;

        // Deduct stock for variant items
        for (const item of items) {
          if (item.variant_id) {
            await supabase.rpc("deduct_variant_stock" as any, {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity,
            });
          }
        }
      }

      // Increment promo code usage
      if (payload.promo_code) {
        await supabase.rpc("increment_promo_usage" as any, {
          p_code: payload.promo_code,
        });
      }

      return order;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};
