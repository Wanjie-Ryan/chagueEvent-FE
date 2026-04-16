import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type AbandonedCart = {
  id: string;
  user_id: string;
  user_email: string;
  cart_data: any[];
  cart_value: number;
  last_activity: string;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
};

const AbandonedCartsManager = () => {
  const queryClient = useQueryClient();

  const { data: carts = [], isLoading } = useQuery({
    queryKey: ["abandoned-carts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("abandoned_carts" as any).select("*").order("last_activity", { ascending: false });
      if (error) throw error;
      return (data as unknown as AbandonedCart[]) || [];
    },
  });

  const markReminderSent = async (id: string) => {
    const { error } = await supabase.from("abandoned_carts" as any)
      .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Marked as reminder sent" }); queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] }); }
  };

  const deleteCart = async (id: string) => {
    const { error } = await supabase.from("abandoned_carts" as any).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Cart removed" }); queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] }); }
  };

  const totalValue = carts.reduce((s, c) => s + Number(c.cart_value), 0);
  const pendingReminders = carts.filter(c => !c.reminder_sent).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart size={20} className="text-muted-foreground" />
        <h2 className="font-display text-2xl font-semibold text-foreground">Abandoned Carts</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Total Carts</p>
          <p className="font-display text-2xl font-bold text-foreground">{carts.length}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Lost Revenue</p>
          <p className="font-display text-2xl font-bold text-foreground">KSH {totalValue.toLocaleString()}</p>
        </div>
        <div className="border border-border p-4">
          <p className="font-body text-xs text-muted-foreground">Pending Reminders</p>
          <p className="font-display text-2xl font-bold text-foreground">{pendingReminders}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
      ) : carts.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground text-center py-12">No abandoned carts.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Customer</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Cart Value</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden sm:table-cell">Items</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Last Active</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Reminder</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carts.map(c => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-body text-sm text-foreground">{c.user_email || "Unknown"}</td>
                  <td className="py-3 pr-4 font-body text-sm font-medium text-foreground">KSH {Number(c.cart_value).toLocaleString()}</td>
                  <td className="py-3 pr-4 hidden sm:table-cell font-body text-sm text-muted-foreground">{Array.isArray(c.cart_data) ? c.cart_data.length : 0}</td>
                  <td className="py-3 pr-4 hidden md:table-cell font-body text-xs text-muted-foreground">
                    {new Date(c.last_activity).toLocaleDateString()} {new Date(c.last_activity).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-body text-xs px-2 py-0.5 ${c.reminder_sent ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
                      {c.reminder_sent ? "Sent" : "Pending"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!c.reminder_sent && (
                        <button onClick={() => markReminderSent(c.id)} className="text-muted-foreground hover:text-foreground p-1" title="Mark reminder sent">
                          <Mail size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteCart(c.id)} className="text-muted-foreground hover:text-destructive p-1 font-body text-xs">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AbandonedCartsManager;
