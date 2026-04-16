import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Artist = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  image_url: string;
  cover_url: string;
  genre: string;
  social_instagram: string;
  social_twitter: string;
  social_spotify: string;
  created_at: string;
  updated_at: string;
};

export type Track = {
  id: string;
  title: string;
  artist_id: string;
  audio_url: string;
  cover_url: string;
  duration_seconds: number;
  genre: string;
  is_featured: boolean;
  play_count: number;
  created_at: string;
};

export type ArtistProduct = {
  id: string;
  artist_id: string;
  product_id: string;
  created_at: string;
};

export const useArtists = () =>
  useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists" as any)
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as unknown as Artist[];
    },
  });

export const useArtist = (slug: string) =>
  useQuery({
    queryKey: ["artist", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as unknown as Artist;
    },
    enabled: !!slug,
  });

export const useArtistTracks = (artistId: string) =>
  useQuery({
    queryKey: ["artist-tracks", artistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks" as any)
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Track[];
    },
    enabled: !!artistId,
  });

export const useFeaturedTracks = () =>
  useQuery({
    queryKey: ["featured-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks" as any)
        .select("*")
        .eq("is_featured", true)
        .order("play_count", { ascending: false });
      if (error) throw error;
      return data as unknown as Track[];
    },
  });

export const useAllTracks = () =>
  useQuery({
    queryKey: ["all-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Track[];
    },
  });

export const useArtistProducts = (artistId: string) =>
  useQuery({
    queryKey: ["artist-products", artistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artist_products" as any)
        .select("*")
        .eq("artist_id", artistId);
      if (error) throw error;
      return data as unknown as ArtistProduct[];
    },
    enabled: !!artistId,
  });

// Mutations
export const useCreateArtist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (artist: Omit<Artist, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("artists" as any).insert(artist as any).select().single();
      if (error) throw error;
      return data as unknown as Artist;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["artists"] }); toast({ title: "Artist created" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useUpdateArtist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Artist>) => {
      const { error } = await supabase.from("artists" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["artists"] }); toast({ title: "Artist updated" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useDeleteArtist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("artists" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["artists"] }); toast({ title: "Artist deleted" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useCreateTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (track: Omit<Track, "id" | "created_at" | "play_count">) => {
      const { error } = await supabase.from("tracks" as any).insert(track as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["artist-tracks", v.artist_id] }); qc.invalidateQueries({ queryKey: ["all-tracks"] }); toast({ title: "Track added" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useDeleteTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, artistId }: { id: string; artistId: string }) => {
      const { error } = await supabase.from("tracks" as any).delete().eq("id", id);
      if (error) throw error;
      return artistId;
    },
    onSuccess: (artistId) => { qc.invalidateQueries({ queryKey: ["artist-tracks", artistId] }); qc.invalidateQueries({ queryKey: ["all-tracks"] }); toast({ title: "Track deleted" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useAddArtistProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ artist_id, product_id }: { artist_id: string; product_id: string }) => {
      const { error } = await supabase.from("artist_products" as any).insert({ artist_id, product_id } as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["artist-products", v.artist_id] }); toast({ title: "Merch linked" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};

export const useRemoveArtistProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, artistId }: { id: string; artistId: string }) => {
      const { error } = await supabase.from("artist_products" as any).delete().eq("id", id);
      if (error) throw error;
      return artistId;
    },
    onSuccess: (artistId) => { qc.invalidateQueries({ queryKey: ["artist-products", artistId] }); toast({ title: "Merch unlinked" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });
};
