import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Search } from "lucide-react";

type UserRole = {
  id: string;
  user_id: string;
  role: string;
};

type Profile = {
  id: string;
  email: string | null;
  created_at: string;
};

const ALL_ROLES = ["admin", "super_admin", "store_manager", "inventory_manager", "content_manager", "support_agent", "user"];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access to all admin features",
  super_admin: "Super admin with highest privileges",
  store_manager: "Manages products, orders, and inventory",
  inventory_manager: "Manages inventory and stock levels",
  content_manager: "Manages blog, events, lookbooks, and pages",
  support_agent: "Views orders and customer information",
  user: "Regular customer account",
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["All modules"],
  admin: ["All modules"],
  store_manager: ["Products", "Orders", "Inventory", "Customers", "Promos", "Shipping"],
  inventory_manager: ["Inventory", "Products (view only)"],
  content_manager: ["Blog", "Events", "Lookbooks", "Pages", "Artists", "Media"],
  support_agent: ["Orders (view)", "Customers (view)", "Returns"],
};

const RolesManager = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addingRole, setAddingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("store_manager");

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles" as any).select("*");
      if (error) throw error;
      return (data as unknown as UserRole[]) || [];
    },
  });

  const getUserRoles = (userId: string) => allRoles.filter(r => r.user_id === userId);

  const addRole = async (userId: string, role: string) => {
    const adminRoles = ["super_admin", "store_manager", "inventory_manager", "content_manager", "support_agent"];

    const { error } = await (supabase.from("user_roles" as any).insert({ user_id: userId, role }) as unknown as Promise<{ error: any }>);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setAddingRole(null); return; }

    if (adminRoles.includes(role)) {
      const hasAdmin = allRoles.some(r => r.user_id === userId && r.role === "admin");
      if (!hasAdmin) {
        await (supabase.from("user_roles" as any).insert({ user_id: userId, role: "admin" }) as unknown as Promise<any>);
      }
    }

    toast({ title: `Role "${role}" added` });
    queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    setAddingRole(null);
    setAddingRole(null);
  };

  const removeRole = async (roleId: string, role: string) => {
    if (role === "user") { toast({ title: "Cannot remove base user role", variant: "destructive" }); return; }
    if (!confirm(`Remove this role?`)) return;
    const { error } = await supabase.from("user_roles" as any).delete().eq("id", roleId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Role removed" }); queryClient.invalidateQueries({ queryKey: ["all-user-roles"] }); }
  };

  const filtered = search
    ? profiles.filter(p => p.email?.toLowerCase().includes(search.toLowerCase()))
    : profiles;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Shield size={20} className="text-muted-foreground" />
        <h2 className="font-display text-2xl font-semibold text-foreground">User Roles & Permissions</h2>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
          <div key={role} className="border border-border p-3">
            <p className="font-body text-sm font-medium text-foreground capitalize">{role.replace(/_/g, " ")}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{ROLE_DESCRIPTIONS[role]}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {perms.map(p => (
                <span key={p} className="font-body text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by email…"
          className="w-full pl-8 pr-3 py-2 border border-border bg-background text-foreground font-body text-sm" />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">User</th>
              <th className="text-left font-body text-xs font-medium text-muted-foreground py-3 pr-4">Roles</th>
              <th className="text-right font-body text-xs font-medium text-muted-foreground py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const roles = getUserRoles(p.id);
              return (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <p className="font-body text-sm text-foreground">{p.email || "No email"}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center flex-wrap gap-1">
                      {roles.map(r => (
                        <span key={r.id} className="inline-flex items-center gap-1 font-body text-xs bg-secondary text-secondary-foreground px-2 py-0.5 capitalize">
                          {r.role.replace(/_/g, " ")}
                          {r.role !== "user" && (
                            <button onClick={() => removeRole(r.id, r.role)} className="text-muted-foreground hover:text-destructive ml-0.5">
                              <Trash2 size={10} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {addingRole === p.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                          className="font-body text-xs border border-border bg-background text-foreground px-2 py-1">
                          {ALL_ROLES.filter(r => !roles.some(ur => ur.role === r)).map(r => (
                            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <button onClick={() => addRole(p.id, selectedRole)}
                          className="font-body text-xs bg-primary text-primary-foreground px-3 py-1 hover:opacity-90">Add</button>
                        <button onClick={() => setAddingRole(null)} className="font-body text-xs text-muted-foreground">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingRole(p.id)}
                        className="text-muted-foreground hover:text-foreground p-1" title="Add role">
                        <Plus size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesManager;
