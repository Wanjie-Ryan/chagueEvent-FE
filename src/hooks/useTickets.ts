import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TicketTier = {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price: number;
  max_quantity: number;
  sold_count: number;
  max_per_user: number;
  sort_order: number;
  created_at: string;
};

export type Ticket = {
  id: string;
  ticket_tier_id: string;
  event_id: string;
  user_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  ticket_code: string;
  qr_data: string;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  tier?: TicketTier;
};

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SNT-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Fetch tiers for an event
export function useTicketTiers(eventId: string) {
  return useQuery({
    queryKey: ["ticket_tiers", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_tiers")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as TicketTier[];
    },
    enabled: !!eventId,
  });
}

// Fetch user's tickets for an event
export function useMyTickets(eventId: string) {
  return useQuery({
    queryKey: ["my_tickets", eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_tiers(*)")
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        tier: t.ticket_tiers,
      })) as Ticket[];
    },
    enabled: !!eventId,
  });
}

// Fetch all user tickets across events
export function useAllMyTickets() {
  return useQuery({
    queryKey: ["all_my_tickets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_tiers(*), events(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// Purchase ticket
export function usePurchaseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tierId,
      eventId,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantity = 1,
      eventTitle = "",
      eventDate = "",
      eventVenue = "",
      tierName = "",
      tierPrice = 0,
    }: {
      tierId: string;
      eventId: string;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      quantity?: number;
      eventTitle?: string;
      eventDate?: string;
      eventVenue?: string;
      tierName?: string;
      tierPrice?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      // Check how many tickets user already has for this tier
      const { count } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("ticket_tier_id", tierId)
        .eq("user_id", user.id)
        .eq("status", "active");

      const { data: tier } = await supabase
        .from("ticket_tiers")
        .select("max_per_user")
        .eq("id", tierId)
        .single();

      if (tier && (count || 0) + quantity > tier.max_per_user) {
        throw new Error(`Maximum ${tier.max_per_user} tickets per person for this tier`);
      }

      // Increment sold count atomically
      const { error: stockError } = await supabase.rpc("increment_tier_sold", {
        p_tier_id: tierId,
        p_quantity: quantity,
      });
      if (stockError) throw new Error("Tickets sold out or not enough available");

      // Create tickets
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = generateTicketCode();
        const qrData = JSON.stringify({
          code: ticketCode,
          event: eventId,
          tier: tierId,
          user: user.id,
        });
        tickets.push({
          ticket_tier_id: tierId,
          event_id: eventId,
          user_id: user.id,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          ticket_code: ticketCode,
          qr_data: qrData,
          status: "active",
        });
      }

      const { data, error } = await supabase.from("tickets").insert(tickets).select();
      if (error) throw error;

      // Send confirmation email (fire and forget)
      if (data && data.length > 0) {
        supabase.functions.invoke("send-ticket-confirmation", {
          body: {
            to: buyerEmail,
            buyerName,
            eventTitle,
            eventDate,
            eventVenue,
            tierName,
            ticketCode: data[0].ticket_code,
            quantity,
            totalPrice: tierPrice * quantity,
          },
        }).catch(console.error);
      }

      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["my_tickets", vars.eventId] });
      qc.invalidateQueries({ queryKey: ["ticket_tiers", vars.eventId] });
      qc.invalidateQueries({ queryKey: ["all_my_tickets"] });
    },
  });
}

// Admin: fetch all tickets for an event
export function useEventTickets(eventId: string) {
  return useQuery({
    queryKey: ["event_tickets", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_tiers(*)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        tier: t.ticket_tiers,
      })) as Ticket[];
    },
    enabled: !!eventId,
  });
}

// Admin: check in a ticket
export function useCheckInTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("tickets")
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event_tickets"] });
    },
  });
}

// Admin: save tier
export function useSaveTicketTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tier: {
      id?: string;
      event_id: string;
      name: string;
      description: string;
      price: number;
      max_quantity: number;
      max_per_user: number;
      sort_order: number;
    }) => {
      if (tier.id) {
        const { id, ...rest } = tier;
        const { error } = await supabase.from("ticket_tiers").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _id, ...rest } = tier;
        const { error } = await supabase.from("ticket_tiers").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["ticket_tiers", vars.event_id] });
    },
  });
}

// Admin: delete tier
export function useDeleteTicketTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tierId, eventId }: { tierId: string; eventId: string }) => {
      const { error } = await supabase.from("ticket_tiers").delete().eq("id", tierId);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["ticket_tiers", vars.eventId] });
    },
  });
}
