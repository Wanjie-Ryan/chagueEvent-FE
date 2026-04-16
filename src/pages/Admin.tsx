import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  LogOut, ShoppingBag, Package, Flame, Music, FileText, CalendarDays,
  Camera, BarChart3, Tag, Users, Warehouse, File, Truck, RotateCcw,
  ShoppingCart, Image, Shield,
} from "lucide-react";
import OrdersManager from "@/components/admin/OrdersManager";
import DropsManager from "@/components/admin/DropsManager";
import ArtistsManager from "@/components/admin/ArtistsManager";
import BlogManager from "@/components/admin/BlogManager";
import EventsManager from "@/components/admin/EventsManager";
import LookbooksManager from "@/components/admin/LookbooksManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import PromoCodesManager from "@/components/admin/PromoCodesManager";
import CustomersManager from "@/components/admin/CustomersManager";
import InventoryManager from "@/components/admin/InventoryManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import PagesManager from "@/components/admin/PagesManager";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ProductsManager from "@/components/admin/ProductsManager";
import ShippingManager from "@/components/admin/ShippingManager";
import ReturnsManager from "@/components/admin/ReturnsManager";
import AbandonedCartsManager from "@/components/admin/AbandonedCartsManager";
import MediaLibrary from "@/components/admin/MediaLibrary";
import RolesManager from "@/components/admin/RolesManager";
import { Settings, LayoutDashboard } from "lucide-react";
import logoImg from "@/assets/logo.png";

type TabKey = "dashboard" | "analytics" | "products" | "inventory" | "orders" | "customers" | "promos" | "drops" | "artists" | "blog" | "events" | "lookbooks" | "pages" | "shipping" | "returns" | "abandoned" | "media" | "roles" | "settings";

const TABS: { key: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "products", label: "Products", icon: Package },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "returns", label: "Returns", icon: RotateCcw },
  { key: "promos", label: "Promos", icon: Tag },
  { key: "drops", label: "Drops", icon: Flame },
  { key: "artists", label: "Artists", icon: Music },
  { key: "blog", label: "Blog", icon: FileText },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "lookbooks", label: "Lookbooks", icon: Camera },
  { key: "pages", label: "Pages", icon: File },
  { key: "abandoned", label: "Abandoned", icon: ShoppingCart },
  { key: "media", label: "Media", icon: Image },
  { key: "roles", label: "Roles", icon: Shield },
  { key: "settings", label: "Settings", icon: Settings },
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
      case "analytics": return <AnalyticsDashboard />;
      case "inventory": return <InventoryManager />;
      case "orders": return <OrdersManager />;
      case "customers": return <CustomersManager />;
      case "promos": return <PromoCodesManager />;
      case "drops": return <DropsManager />;
      case "artists": return <ArtistsManager />;
      case "blog": return <BlogManager />;
      case "events": return <EventsManager />;
      case "lookbooks": return <LookbooksManager />;
      case "pages": return <PagesManager />;
      case "settings": return <SiteSettingsManager />;
      case "products": return <ProductsManager />;
      case "shipping": return <ShippingManager />;
      case "returns": return <ReturnsManager />;
      case "abandoned": return <AbandonedCartsManager />;
      case "media": return <MediaLibrary />;
      case "roles": return <RolesManager />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Style N Tunes" className="h-7 sm:h-8 w-auto" />
            <span className="font-display text-sm sm:text-base font-bold text-muted-foreground">ADMIN</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-body text-xs text-muted-foreground hidden sm:block truncate max-w-[150px]">{user.email}</span>
            <button onClick={() => navigate("/")} className="font-body text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Store</button>
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
