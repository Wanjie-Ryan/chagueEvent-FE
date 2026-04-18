import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, UserCheck, Package } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ProvidersManager from "@/components/admin/ProvidersManager";
import ClientsManager from "@/components/admin/ClientsManager";
import ListingsManager from "@/components/admin/ListingsManager";
import logoImg from "@/assets/logo.png";

type TabKey = "dashboard" | "providers" | "clients" | "listings";

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "providers", label: "Providers", icon: UserCheck },
  { key: "clients", label: "Clients", icon: Users },
  { key: "listings", label: "Listings", icon: Package },
];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) { navigate("/auth"); return null; }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="font-body text-sm text-muted-foreground text-center">You don't have admin privileges.</p>
        <button onClick={() => navigate("/")} className="font-body text-sm underline text-foreground">Go Home</button>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard onNavigate={setActiveTab} />;
      case "providers": return <ProvidersManager />;
      case "clients": return <ClientsManager />;
      case "listings": return <ListingsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Chagua Event" className="h-7 sm:h-8 w-auto filter invert dark:invert-0" />
            <span className="font-display text-sm sm:text-base font-bold text-muted-foreground tracking-widest uppercase">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-muted-foreground hidden sm:block truncate">{user.username || user.userId}</span>
            <button onClick={() => navigate("/")} className="font-body text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Directory</button>
            <button onClick={() => signOut()} className="text-muted-foreground hover:text-foreground transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        <div className="flex gap-1 sm:gap-2 mb-8 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 font-body text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {renderTab()}
      </main>
    </div>
  );
};

export default Admin;
