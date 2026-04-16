import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { Address } from "@/pages/Checkout";

type Props = {
  addresses: Address[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
  userId: string;
  refetchAddresses: () => Promise<any>;
  onContinue: () => void;
};

const CheckoutAddress = ({ addresses, selectedAddressId, setSelectedAddressId, userId, refetchAddresses, onContinue }: Props) => {
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", full_name: "", address_line1: "", address_line2: "", city: "", state: "", zip_code: "", country: "Kenya" });

  const handleSaveNewAddress = async () => {
    if (!newAddr.full_name || !newAddr.address_line1 || !newAddr.city) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("user_addresses")
      .insert({ ...newAddr, user_id: userId, is_default: addresses.length === 0 })
      .select()
      .single();
    if (error) { toast({ title: "Error saving address", variant: "destructive" }); return; }
    await refetchAddresses();
    setSelectedAddressId((data as Address).id);
    setShowNewAddress(false);
    toast({ title: "Address saved" });
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">Delivery Address</h1>

      {addresses.length > 0 && (
        <div className="space-y-3 mb-6">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className={`w-full text-left border p-4 transition-colors ${
                selectedAddressId === addr.id ? "border-foreground bg-secondary/50" : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? "border-foreground" : "border-muted-foreground"}`}>
                  {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-foreground" />}
                </div>
                <span className="font-body text-sm font-medium text-foreground">{addr.label}</span>
                {addr.is_default && <span className="font-body text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">Default</span>}
              </div>
              <p className="font-body text-sm text-foreground ml-6">{addr.full_name}</p>
              <p className="font-body text-xs text-muted-foreground ml-6">
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city}, {addr.state} {addr.zip_code}
              </p>
            </button>
          ))}
        </div>
      )}

      {!showNewAddress ? (
        <button
          onClick={() => setShowNewAddress(true)}
          className="flex items-center gap-2 border border-dashed border-border p-4 w-full hover:border-muted-foreground transition-colors font-body text-sm text-muted-foreground"
        >
          <Plus size={16} /> Add New Address
        </button>
      ) : (
        <div className="border border-border p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground uppercase">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Label (Home, Work...)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Full Name *" value={newAddr.full_name} onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <input placeholder="Address Line 1 *" value={newAddr.address_line1} onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <input placeholder="Address Line 2 (optional)" value={newAddr.address_line2} onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })} className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="City *" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="ZIP" value={newAddr.zip_code} onChange={(e) => setNewAddr({ ...newAddr, zip_code: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
            <input placeholder="Country" value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} className="font-body text-sm border border-border px-3 py-2 bg-background text-foreground" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveNewAddress} className="bg-foreground text-background px-5 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity">Save</button>
            <button onClick={() => setShowNewAddress(false)} className="border border-border px-5 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <button onClick={onContinue} className="mt-8 w-full bg-foreground text-background py-3 font-body text-sm font-medium hover:opacity-90 transition-opacity">
        Continue to Order Summary
      </button>
    </div>
  );
};

export default CheckoutAddress;
