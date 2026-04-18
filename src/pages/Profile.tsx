import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings, LogOut, Heart } from "lucide-react";
import { format } from "date-fns";

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"favorites" | "settings">("favorites");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">My Account</h1>
            <p className="font-body text-sm text-muted-foreground mt-1 truncate max-w-[250px] sm:max-w-none">{user.username}</p>
          </div>
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "favorites" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Heart size={16} /> Saved Providers
          </button>
          <button onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-body text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Settings size={16} /> Settings
          </button>
        </div>

        {activeTab === "favorites" && <FavoritesHistory />}
        {activeTab === "settings" && <AccountSettings user={user} signOut={signOut} />}
      </main>

      <Footer />
    </div>
  );
};

function FavoritesHistory() {
  const { data: allProducts = [], isLoading } = useProducts();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setFavorites(saved);
  }, []);

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  if (favoriteProducts.length === 0) return (
    <div className="text-center py-16">
      <Heart size={40} className="text-muted-foreground mx-auto mb-4" />
      <p className="font-display text-lg text-muted-foreground">No saved providers yet</p>
      <Link to="/products" className="font-body text-sm underline text-foreground mt-2 inline-block">Explore Directory</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {favoriteProducts.map((product) => {
        const productImg = product.image_url
          ? (product.image_url.startsWith("http") ? product.image_url : `http://localhost:3005${product.image_url}`)
          : null;
        
        return (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="group relative overflow-hidden aspect-[4/5] bg-secondary/50 border border-border block"
          >
             {productImg ? (
               <img src={productImg} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
                <div className="h-full w-full bg-muted flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-105 p-6 text-center">
                    <span className="text-6xl text-muted-foreground/30 font-display font-bold uppercase mb-2">
                      {product.name.charAt(0)}
                    </span>
                    <span className="text-sm font-body text-muted-foreground/50 tracking-widest break-words">{product.category}</span>
                </div>
             )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full">
                <span className="font-body text-[10px] uppercase tracking-widest text-primary-foreground/70 mb-1 block">{product.category}</span>
                <h3 className="font-display text-xl font-bold text-primary-foreground line-clamp-1">{product.name}</h3>
                <p className="font-body text-sm text-primary-foreground/80 line-clamp-1 mt-1">{product.subtitle}</p>
            </div>
          </Link>
        )
      })}
    </div>
  );
}

import api from "@/lib/api";

function AccountSettings({ user, signOut }: { user: any; signOut: () => void }) {
  const [username, setUsername] = useState(user.username || "");
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async () => {
    if (!username.trim()) {
      toast({ title: "Username cannot be empty", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
        await api.put("/auth/profile", { username });
        toast({ title: "Profile updated successfully!" });
        
        // Update local storage so useAuth picks it up on refresh
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        stored.username = username;
        localStorage.setItem("user", JSON.stringify(stored));

    } catch (err: any) {
        toast({ title: "Update failed", description: err.response?.data?.msg || err.message, variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground uppercase mb-4">Account Details</h3>
        <div className="space-y-4">
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-2">User ID / Role</label>
            <p className="font-body text-sm text-muted-foreground font-mono">{user.userId} • {user.role}</p>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full font-body text-sm border border-border px-3 py-2 bg-background text-foreground focus:outline-foreground transition-colors"
            />
          </div>
          <button
            onClick={handleProfileUpdate}
            disabled={saving}
            className="bg-foreground text-background px-5 py-2 font-body text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 mt-2 block"
          >
            {saving ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
