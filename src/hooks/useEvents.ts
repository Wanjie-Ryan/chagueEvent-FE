import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster_image: string;
  location: string;
  venue: string;
  event_date: string;
  end_date: string | null;
  max_capacity: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  rsvp_count?: number;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
};

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;

      // Get RSVP count
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", data.id);

      return { ...data, rsvp_count: count || 0 } as Event;
    },
    enabled: !!slug,
  });
}

export function useMyRsvp(eventId: string) {
  return useQuery({
    queryKey: ["my_rsvp", eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as EventRsvp | null;
    },
    enabled: !!eventId,
  });
}

export function useRsvpToEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, name, email }: { eventId: string; name: string; email: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to RSVP");

      const { error } = await supabase.from("event_rsvps").insert({
        event_id: eventId,
        user_id: user.id,
        name,
        email,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["my_rsvp", vars.eventId] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

export function useCancelRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rsvpId: string) => {
      const { error } = await supabase.from("event_rsvps").delete().eq("id", rsvpId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my_rsvp"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEventRsvps(eventId: string) {
  return useQuery({
    queryKey: ["event_rsvps", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventRsvp[];
    },
    enabled: !!eventId,
  });
}

export function useSaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: {
      id?: string;
      title: string;
      slug: string;
      description: string;
      poster_image: string;
      location: string;
      venue: string;
      event_date: string;
      end_date: string | null;
      max_capacity: number | null;
      published: boolean;
    }) => {
      if (event.id) {
        const { id, ...rest } = event;
        const { error } = await supabase.from("events").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _id, ...rest } = event;
        const { error } = await supabase.from("events").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["admin_events"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["admin_events"] });
    },
  });
}
