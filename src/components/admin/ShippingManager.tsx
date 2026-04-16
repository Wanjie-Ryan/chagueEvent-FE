import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Truck, Plus, Pencil, Trash2, X } from "lucide-react";

type ShippingZone = {
  id: string;
  name: string;
  regions: string[];
  shipping_cost: number;
  free_shipping_threshold: number | null;
  active: boolean;
  created_at: string;
};

type Shipment = {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

const _CARRIERS = ["DHL", "FedEx", "UPS", "USPS", "G4S", "Fargo Courier", "Wells Fargo", "PostaPay", "Other"];
const SHIPMENT_STATUSES = ["preparing", "shipped", "in_transit", "out_for_delivery", "delivered"];

const ShippingManager = () => {
  const queryClient = useQueryClient();
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneRegions, setZoneRegions] = useState("");
  const [zoneCost, setZoneCost] = useState("");
  const [zoneThreshold, setZoneThreshold] = useState("");
  const [zoneActive, setZoneActive] = useState(true);

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["shipping-zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shipping_zones" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return ((data as unknown as any[]) || []).map(z => ({ ...z, regions: Array.isArray(z.regions) ? z.regions : [] })) as ShippingZone[];
    },
  });

  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery({
    queryKey: ["order-shipments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_shipments" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Shipment[]) || [];
    },
  });

  const resetForm = () => {
    setZoneName(""); setZoneRegions(""); setZoneCost(""); setZoneThreshold(""); setZoneActive(true);
    setEditingZone(null); setShowZoneForm(false);
  };

  const openEditZone = (z: ShippingZone) => {
    setEditingZone(z);
    setZoneName(z.name);
    setZoneRegions(z.regions.join(", "));
    setZoneCost(z.shipping_cost.toString());
    setZoneThreshold(z.free_shipping_threshold?.toString() || "");
    setZoneActive(z.active);
    setShowZoneForm(true);
  };

  const saveZone = async () => {
    if (!zoneName || !zoneCost) return;
    const regions = zoneRegions.split(",").map(r => r.trim()).filter(Boolean);
    const payload = {
      name: zoneName,
      regions,
      shipping_cost: parseFloat(zoneCost),
      free_shipping_threshold: zoneThreshold ? parseFloat(zoneThreshold) : null,
      active: zoneActive,
    };

    if (editingZone) {
      const { error } = await supabase.from("shipping_zones" as any).update(payload).eq("id", editingZone.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Shipping zone updated" });
    } else {
      const { error } = await supabase.from("shipping_zones" as any).insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Shipping zone created" });
    }
    queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
    resetForm();
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete this shipping zone?")) return;
    const { error } = await supabase.from("shipping_zones" as any).delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Zone deleted" }); queryClient.invalidateQueries({ queryKey: ["shipping-zones"] }); }
  };

  const updateShipmentStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "shipped") updates.shipped_at = new Date().toISOString();
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    const { error } = await supabase.from("order_shipments" as any).update(updates).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Shipment updated" }); queryClient.invalidateQueries({ queryKey: ["order-shipments"] }); }
  };

  return (
    <div className="space-y-8">
      {/* Shipping Zones */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-muted-foreground" />
            <h2 className="font-display text-2xl font-semibold text-foreground">Shipping Zones</h2>
          </div>
          <button onClick={() => { resetForm(); setShowZoneForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Add Zone
          </button>
        </div>

        {showZoneForm && (
          <div className="border border-border p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">{editingZone ? "Edit Zone" : "New Zone"}</h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Zone Name *</label>
                <input value={zoneName} onChange={e => setZoneName(e.target.value)} className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm" placeholder="e.g. Nairobi Metro" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Regions (comma-separated)</label>
                <input value={zoneRegions} onChange={e => setZoneRegions(e.target.value)} className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm" placeholder="e.g. Nairobi, Kiambu, Machakos" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Shipping Cost (KSH) *</label>
                <input type="number" value={zoneCost} onChange={e => setZoneCost(e.target.value)} className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm" />
              </div>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Free Shipping Threshold (KSH)</label>
                <input type="number" value={zoneThreshold} onChange={e => setZoneThreshold(e.target.value)} className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-sm" placeholder="Leave empty for no threshold" />
              </div>
            </div>
            <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={zoneActive} onChange={e => setZoneActive(e.target.checked)} />
              Active
            </label>
            <button onClick={saveZone} className="bg-primary text-primary-foreground px-6 py-2 font-body text-sm font-medium hover:opacity-90 transition-opacity">
              {editingZone ? "Update" : "Create"} Zone
            </button>
          </div>
        )}

        {zonesLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : zones.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground text-center py-8">No shipping zones configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Zone</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden md:table-cell">Regions</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Cost</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4 hidden sm:table-cell">Free Threshold</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Status</th>
                  <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map(z => (
                  <tr key={z.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-body text-sm text-foreground font-medium">{z.name}</td>
                    <td className="py-3 pr-4 hidden md:table-cell"><span className="font-body text-xs text-muted-foreground">{z.regions.join(", ") || "—"}</span></td>
                    <td className="py-3 pr-4 font-body text-sm text-foreground">KSH {z.shipping_cost.toLocaleString()}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell font-body text-sm text-muted-foreground">{z.free_shipping_threshold ? `KSH ${z.free_shipping_threshold.toLocaleString()}` : "—"}</td>
                    <td className="py-3 pr-4"><span className={`font-body text-xs px-2 py-0.5 ${z.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{z.active ? "Active" : "Inactive"}</span></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditZone(z)} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={14} /></button>
                        <button onClick={() => deleteZone(z.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shipments */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Shipments</h2>
        {shipmentsLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : shipments.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground text-center py-8">No shipments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Order</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Tracking #</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Carrier</th>
                  <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Status</th>
                  <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-body text-xs text-muted-foreground">#{s.order_id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 font-body text-sm text-foreground">{s.tracking_number || "—"}</td>
                    <td className="py-3 pr-4 font-body text-sm text-foreground">{s.carrier || "—"}</td>
                    <td className="py-3 pr-4"><span className="font-body text-xs px-2 py-0.5 bg-secondary text-secondary-foreground capitalize">{s.status}</span></td>
                    <td className="py-3 text-right">
                      <select value={s.status} onChange={e => updateShipmentStatus(s.id, e.target.value)}
                        className="font-body text-xs border border-border bg-background text-foreground px-2 py-1">
                        {SHIPMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingManager;
