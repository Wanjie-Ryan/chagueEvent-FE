import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Lookbook = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  season: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type LookbookImage = {
  id: string;
  lookbook_id: string;
  image_url: string;
  caption: string;
  display_order: number;
  layout_size: string;
  created_at: string;
};

export function useLookbooks() {
  return useQuery({
    queryKey: ["lookbooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lookbook[];
    },
  });
}

export function useLookbook(slug: string) {
  return useQuery({
    queryKey: ["lookbook", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbooks")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Lookbook;
    },
    enabled: !!slug,
  });
}

export function useLookbookImages(lookbookId: string) {
  return useQuery({
    queryKey: ["lookbook_images", lookbookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbook_images")
        .select("*")
        .eq("lookbook_id", lookbookId)
        .order("display_order");
      if (error) throw error;
      return data as LookbookImage[];
    },
    enabled: !!lookbookId,
  });
}

export function useAdminLookbooks() {
  return useQuery({
    queryKey: ["admin_lookbooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lookbook[];
    },
  });
}

export function useSaveLookbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lb: {
      id?: string;
      title: string;
      slug: string;
      description: string;
      cover_image: string;
      season: string;
      published: boolean;
    }) => {
      if (lb.id) {
        const { id, ...rest } = lb;
        const { error } = await supabase.from("lookbooks").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _id, ...rest } = lb;
        const { error } = await supabase.from("lookbooks").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lookbooks"] });
      qc.invalidateQueries({ queryKey: ["admin_lookbooks"] });
    },
  });
}

export function useDeleteLookbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lookbooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lookbooks"] });
      qc.invalidateQueries({ queryKey: ["admin_lookbooks"] });
    },
  });
}

export function useAddLookbookImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: { lookbook_id: string; image_url: string; caption: string; display_order: number; layout_size: string }) => {
      const { error } = await supabase.from("lookbook_images").insert(img);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["lookbook_images", vars.lookbook_id] });
    },
  });
}

export function useDeleteLookbookImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lookbookId }: { id: string; lookbookId: string }) => {
      const { error } = await supabase.from("lookbook_images").delete().eq("id", id);
      if (error) throw error;
      return lookbookId;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["lookbook_images", vars.lookbookId] });
    },
  });
}
