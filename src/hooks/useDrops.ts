import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Drop = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  drop_date: string;
  status: string;
  max_quantity: number | null;
  created_at: string;
  updated_at: string;
};

export type DropProduct = {
  id: string;
  drop_id: string;
  product_id: string;
  created_at: string;
};

export const useDrops = () => {
  return useQuery({
    queryKey: ["drops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drops" as any)
        .select("*")
        .order("drop_date", { ascending: true });
      if (error) throw error;
      return data as unknown as Drop[];
    },
  });
};

export const useDrop = (id: string) => {
  return useQuery({
    queryKey: ["drop", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drops" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as Drop;
    },
    enabled: !!id,
  });
};

export const useDropProducts = (dropId: string) => {
  return useQuery({
    queryKey: ["drop-products", dropId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drop_products" as any)
        .select("*")
        .eq("drop_id", dropId);
      if (error) throw error;
      return data as unknown as DropProduct[];
    },
    enabled: !!dropId,
  });
};

export const useCreateDrop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (drop: Omit<Drop, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("drops" as any)
        .insert(drop as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Drop;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drops"] });
      toast({ title: "Drop created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useUpdateDrop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Drop>) => {
      const { error } = await supabase
        .from("drops" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drops"] });
      toast({ title: "Drop updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useDeleteDrop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("drops" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drops"] });
      toast({ title: "Drop deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useAddDropProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ drop_id, product_id }: { drop_id: string; product_id: string }) => {
      const { error } = await supabase
        .from("drop_products" as any)
        .insert({ drop_id, product_id } as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["drop-products", v.drop_id] });
      toast({ title: "Product added to drop" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useRemoveDropProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, drop_id }: { id: string; drop_id: string }) => {
      const { error } = await supabase
        .from("drop_products" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return drop_id;
    },
    onSuccess: (dropId) => {
      qc.invalidateQueries({ queryKey: ["drop-products", dropId] });
      toast({ title: "Product removed from drop" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};

export const useNotifyDrop = () => {
  return useMutation({
    mutationFn: async ({ drop_id, email }: { drop_id: string; email: string }) => {
      const { error } = await supabase
        .from("drop_notifications" as any)
        .insert({ drop_id, email } as any);
      if (error) {
        if (error.code === "23505") throw new Error("You're already subscribed!");
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "You're on the list!", description: "We'll notify you when this drop goes live." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
};
