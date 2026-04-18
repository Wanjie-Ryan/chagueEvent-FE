import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  LogOut, LayoutDashboard, Plus, List, Star, Trash2, Edit3,
  CheckCircle, EyeOff, X, Save, Settings, Camera, KeyRound, User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

type TabKey = "overview" | "my-listings" | "create" | "reviews" | "settings";

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "my-listings", label: "My Listings", icon: List },
  { key: "create", label: "Create Listing", icon: Plus },
  { key: "reviews", label: "Reviews & Ratings", icon: Star },
  { key: "settings", label: "Settings", icon: Settings },
];

const CATEGORIES = ["photography", "catering", "decor", "entertainment", "venue", "other"];

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
const Overview = ({ onNavigate, username }: { onNavigate: (tab: TabKey) => void; username?: string }) => {
  const { data: listings = [] } = useQuery({
    queryKey: ["provider-listings"],
    queryFn: async () => { const { data } = await api.get("/listings/my-listings"); return data.data || []; },
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["provider-reviews"],
    queryFn: async () => { const { data } = await api.get("/reviews/my-feedback"); return data.data || []; },
  });

  const approved = listings.filter((l: { isApproved?: boolean }) => l.isApproved).length;
  const pending = listings.filter((l: { isApproved?: boolean }) => !l.isApproved).length;
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: { rating?: number }) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-tight">
          Welcome back{username ? `, ${username}` : ""}
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">Here's a snapshot of your services on Style N Tunes directory.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Listings", value: listings.length, sub: "All your services", nav: "my-listings" as TabKey },
          { label: "Approved", value: approved, sub: "Visible to clients", nav: "my-listings" as TabKey },
          { label: "Pending Approval", value: pending, sub: "Awaiting admin review", nav: "my-listings" as TabKey },
          { label: "Avg. Rating", value: avgRating, sub: `From ${reviews.length} reviews`, nav: "reviews" as TabKey },
        ].map(({ label, value, sub, nav }) => (
          <button key={label} onClick={() => onNavigate(nav)}
            className="border border-border p-5 text-left bg-card hover:bg-secondary/50 transition-colors group text-left">
            <p className="font-display text-3xl font-bold text-foreground">{value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
            <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
          </button>
        ))}
      </div>

      <div className="border border-dashed border-border p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-secondary flex items-center justify-center">
          <Plus size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground">List a new service</p>
          <p className="font-body text-sm text-muted-foreground">Reach thousands of event planners across the platform.</p>
        </div>
        <button onClick={() => onNavigate("create")}
          className="bg-foreground text-background px-6 py-2 font-display text-sm uppercase tracking-widest hover:opacity-90">
          Create Listing
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MY LISTINGS TAB
// ─────────────────────────────────────────────
const MyListings = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string | number>>({});

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["provider-listings"],
    queryFn: async () => { const { data } = await api.get("/listings/my-listings"); return data.data || []; },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/listings/delete/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["provider-listings"] }); toast({ title: "Listing deleted" }); },
    onError: () => toast({ title: "Error", description: "Delete failed", variant: "destructive" }),
  });

  const updateListing = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, string | number> }) => {
      await api.put(`/listings/update/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-listings"] });
      toast({ title: "Listing updated" });
      setEditing(null);
    },
    onError: () => toast({ title: "Error", description: "Update failed", variant: "destructive" }),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading your listings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">My Listings</h2>
          <span className="font-body text-xs text-muted-foreground tracking-widest">{listings.length} TOTAL</span>
        </div>
      </div>

      {listings.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="font-body text-muted-foreground">You have no listings yet. Create your first one!</p>
        </div>
      )}

      <div className="space-y-4">
        {listings.map((l: { _id: string; title?: string; description?: string; category?: string; price?: number; location?: string; isApproved?: boolean; images?: string[] }) => {
          const isEditing = editing === l._id;
          const hasImage = l.images && l.images.length > 0;

          return (
            <div key={l._id} className={`border bg-card ${isEditing ? "border-foreground" : "border-border"}`}>
              <div className="p-5 flex items-start gap-4">
                <div className="w-20 h-16 shrink-0 bg-secondary border border-border flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                  {hasImage ? (
                    <img
                      src={l.images![0].startsWith("http") ? l.images![0] : `http://localhost:3005${l.images![0]}`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : l.title?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-foreground">{l.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${l.isApproved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {l.isApproved ? <><CheckCircle size={10} className="inline mr-1" />Public</> : <><EyeOff size={10} className="inline mr-1" />Pending</>}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1 truncate">{l.description}</p>
                  <p className="font-body text-xs text-muted-foreground capitalize mt-0.5">{l.category} · KSH {l.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => {
                    if (isEditing) { setEditing(null); return; }
                    setEditing(l._id);
                    setEditData({ title: l.title || "", description: l.description || "", category: l.category || "", price: l.price || 0, location: l.location || "" });
                  }} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                  </button>
                  <button onClick={() => { if (confirm("Delete this listing?")) deleteListing.mutate(l._id); }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-border p-5 space-y-4 bg-secondary/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-xs text-muted-foreground block mb-1">Title</label>
                      <input type="text" value={editData.title as string}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                        className="w-full p-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-foreground" />
                    </div>
                    <div>
                      <label className="font-body text-xs text-muted-foreground block mb-1">Category</label>
                      <select value={editData.category as string}
                        onChange={e => setEditData({ ...editData, category: e.target.value })}
                        className="w-full p-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-foreground">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-body text-xs text-muted-foreground block mb-1">Price (KSH)</label>
                      <input type="number" value={editData.price as number}
                        onChange={e => setEditData({ ...editData, price: +e.target.value })}
                        className="w-full p-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-foreground" />
                    </div>
                    <div>
                      <label className="font-body text-xs text-muted-foreground block mb-1">Location</label>
                      <input type="text" value={editData.location as string}
                        onChange={e => setEditData({ ...editData, location: e.target.value })}
                        className="w-full p-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
                    <textarea rows={3} value={editData.description as string}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                      className="w-full p-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-foreground resize-none" />
                  </div>
                  <button onClick={() => updateListing.mutate({ id: l._id, data: editData })}
                    disabled={updateListing.isPending}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2 text-sm font-body disabled:opacity-50">
                    <Save size={14} /> {updateListing.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CREATE LISTING TAB
// ─────────────────────────────────────────────
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djgk2k4sw/image/upload";
// const UPLOAD_PRESET = "pq4z6rjr";
const UPLOAD_PRESET = "g1e9sjte";

const CreateListing = ({ onNavigate }: { onNavigate: (tab: TabKey) => void }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", category: "photography", price: "", location: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const create = useMutation({
    mutationFn: async () => {
      let imageUrl: string | null = null;

      // 1. Upload image to Cloudinary first
      if (imageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Image upload failed");
        const imgData = await res.json();
        imageUrl = imgData.secure_url;
        setUploading(false);
      }

      // 2. Create listing with image URL
      const payload = {
        ...form,
        price: +form.price,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      };
      const { data } = await api.post("/listings/create", payload);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["provider-listings"] });
      toast({ title: "Listing created!", description: data.msg });
      setForm({ title: "", description: "", category: "photography", price: "", location: "" });
      setImageFile(null);
      setImagePreview(null);
      onNavigate("my-listings");
    },
    onError: (err: { message?: string; response?: { data?: { msg?: string } } }) => {
      setUploading(false);
      toast({ title: "Error", description: err.response?.data?.msg || err.message || "Failed", variant: "destructive" });
    },
  });

  const isSubmitting = create.isPending || uploading;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Create New Listing</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">Fill in the details below. Your listing will be reviewed by admin before going live.</p>
      </div>

      <div className="bg-card border border-border p-6 space-y-5">
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Service Title *</label>
          <input type="text" placeholder="e.g. Premium Wedding Photography"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1.5">Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1.5">Starting Price (KSH) *</label>
            <input type="number" placeholder="e.g. 25000"
              value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground" />
          </div>
        </div>

        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Location / Service Area *</label>
          <input type="text" placeholder="e.g. Nairobi, Westlands"
            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground" />
        </div>

        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Description *</label>
          <textarea rows={5} placeholder="Describe your service in detail — what's included, your experience, packages, etc."
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground resize-none" />
        </div>

        {/* Image Upload */}
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">Service Image</label>
          <label htmlFor="listing-image-upload"
            className="flex flex-col items-center justify-center gap-2 border border-dashed border-border p-6 cursor-pointer hover:border-foreground transition-colors bg-secondary/20 group">
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover border border-border" />
                <button type="button"
                  onClick={e => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-background border border-border p-1 text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                  <Plus size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className="font-body text-xs text-muted-foreground text-center">
                  Click to upload a photo of your service<br />
                  <span className="text-[10px]">JPG, PNG, WEBP · Max 5MB</span>
                </p>
              </>
            )}
            <input id="listing-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20">
          <p className="font-body text-xs text-amber-600">📋 Your listing will go live after admin approval. You'll see it as "Pending" in your listings until then.</p>
        </div>

        <button onClick={() => create.mutate()}
          disabled={isSubmitting || !form.title || !form.description || !form.price || !form.location}
          className="w-full bg-foreground text-background py-3 font-display uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          {uploading ? "Uploading image..." : create.isPending ? "Submitting..." : "Submit for Approval"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// REVIEWS TAB
// ─────────────────────────────────────────────
const ReviewsTab = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["provider-reviews"],
    queryFn: async () => { const { data } = await api.get("/reviews/my-feedback"); return data.data || []; },
  });

  const avgRating = reviews.length ? (reviews.reduce((s: number, r: { rating?: number }) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Reviews & Ratings</h2>
          <span className="font-body text-xs text-muted-foreground tracking-widest">{reviews.length} REVIEWS</span>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <span className="font-display text-2xl font-bold text-foreground">{avgRating}</span>
            <span className="font-body text-xs text-muted-foreground">Avg Rating</span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center">
          <Star size={32} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-body text-muted-foreground">No reviews yet. Once clients leave reviews on your listings, they'll show up here.</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r: { _id: string; rating?: number; comment?: string; createdAt?: string; listingId?: { title?: string }; clientId?: { username?: string } }) => (
          <div key={r._id} className="bg-card border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= (r.rating || 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
                  ))}
                  <span className="font-body text-xs text-muted-foreground ml-2">for {r.listingId?.title || "a listing"}</span>
                </div>
                <p className="font-body text-sm text-foreground">{r.comment || "No comment"}</p>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  By {r.clientId?.username || "Anonymous"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
              <span className="font-display text-2xl font-bold text-foreground shrink-0">{r.rating}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
const SettingsTab = ({ currentUsername }: { currentUsername?: string }) => {
  // --- Photo upload ---
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // --- Username ---
  const [newUsername, setNewUsername] = useState(currentUsername || "");

  // --- Password ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = useMutation({
    mutationFn: async () => {
      if (!photoFile) throw new Error("No photo selected");
      setPhotoUploading(true);
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("upload_preset", "g1e9sjte");
      const res = await fetch("https://api.cloudinary.com/v1_1/djgk2k4sw/image/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Image upload failed");
      const imgData = await res.json();
      setPhotoUploading(false);
      // Save the Cloudinary URL to the profile
      const { data } = await api.put("/auth/profile", { photo: imgData.secure_url });
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Profile photo updated!", description: data.msg });
      setPhotoFile(null);
      setPhotoPreview(null);
    },
    onError: (err: { message?: string; response?: { data?: { msg?: string } } }) => {
      setPhotoUploading(false);
      toast({ title: "Error", description: err.response?.data?.msg || err.message || "Upload failed", variant: "destructive" });
    },
  });

  const updateUsername = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/auth/update-username", { newUsername });
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Username updated!", description: `New username: ${data.username}` });
    },
    onError: (err: { response?: { data?: { msg?: string } } }) => {
      toast({ title: "Error", description: err.response?.data?.msg || "Update failed", variant: "destructive" });
    },
  });

  const updatePassword = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
      const { data } = await api.put("/auth/update-password", { oldPassword, newPassword });
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Password updated!", description: data.msg });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    },
    onError: (err: { message?: string; response?: { data?: { msg?: string } } }) => {
      toast({ title: "Error", description: err.response?.data?.msg || err.message || "Update failed", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">Account Settings</h2>
        <p className="font-body text-sm text-muted-foreground mt-1">Manage your profile, username and password.</p>
      </div>

      {/* ── PROFILE PHOTO ── */}
      <div className="bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Camera size={16} className="text-muted-foreground" />
          <h3 className="font-display text-base font-semibold text-foreground">Profile Photo</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground">This photo appears on your provider card in the top-rated section.</p>

        <label htmlFor="provider-photo-upload"
          className="flex flex-col items-center justify-center gap-3 border border-dashed border-border p-6 cursor-pointer hover:border-foreground transition-colors bg-secondary/20 group">
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-full border-2 border-border" />
              <button type="button"
                onClick={e => { e.preventDefault(); setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-1 text-muted-foreground hover:text-destructive">
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border border-border">
                <Camera size={24} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="font-body text-xs text-muted-foreground text-center">
                Click to select your profile photo<br />
                <span className="text-[10px]">JPG, PNG, WEBP recommended</span>
              </p>
            </>
          )}
          <input id="provider-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>

        <button
          onClick={() => uploadPhoto.mutate()}
          disabled={!photoFile || uploadPhoto.isPending || photoUploading}
          className="w-full bg-foreground text-background py-2.5 font-display uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={14} />
          {photoUploading ? "Uploading to Cloudinary..." : uploadPhoto.isPending ? "Saving..." : "Save Profile Photo"}
        </button>
      </div>

      {/* ── USERNAME ── */}
      <div className="bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-muted-foreground" />
          <h3 className="font-display text-base font-semibold text-foreground">Change Username</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground">This is your display name visible to clients. Choose something professional.</p>

        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1.5">New Username</label>
          <input type="text"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="e.g. Nairobi Photography Studio"
            className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <button
          onClick={() => updateUsername.mutate()}
          disabled={updateUsername.isPending || !newUsername || newUsername === currentUsername}
          className="w-full bg-foreground text-background py-2.5 font-display uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={14} />
          {updateUsername.isPending ? "Saving..." : "Update Username"}
        </button>
      </div>

      {/* ── PASSWORD ── */}
      <div className="bg-card border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-muted-foreground" />
          <h3 className="font-display text-base font-semibold text-foreground">Change Password</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground">Use your current password (set by admin) to authorize the change.</p>

        <div className="space-y-3">
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1.5">Current Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Your current password"
              className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters"
              className="w-full p-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1.5">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
              className={`w-full p-3 border bg-background font-body text-sm focus:outline-none focus:border-foreground ${confirmPassword && confirmPassword !== newPassword ? "border-destructive" : "border-border"}`} />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="font-body text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>
        </div>
        <button
          onClick={() => updatePassword.mutate()}
          disabled={updatePassword.isPending || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          className="w-full bg-foreground text-background py-2.5 font-display uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={14} />
          {updatePassword.isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const ProviderDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) { navigate("/auth"); return null; }

  if (user.role !== "provider") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="font-body text-sm text-muted-foreground">This dashboard is for service providers only.</p>
        <button onClick={() => navigate("/")} className="font-body text-sm underline text-foreground">Go Home</button>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <Overview onNavigate={setActiveTab} username={user.username} />;
      case "my-listings": return <MyListings />;
      case "create": return <CreateListing onNavigate={setActiveTab} />;
      case "reviews": return <ReviewsTab />;
      case "settings": return <SettingsTab currentUsername={user.username} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Style N Tunes" className="h-7 sm:h-8 w-auto" />
            <span className="font-display text-sm font-bold text-muted-foreground tracking-widest uppercase">Provider</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-muted-foreground hidden sm:block">{user.username}</span>
            <button onClick={() => navigate("/")} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">Directory</button>
            <button onClick={() => signOut()} className="text-muted-foreground hover:text-foreground transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 sm:gap-2 mb-8 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 font-body text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
              <Icon size={15} /> <span>{label}</span>
            </button>
          ))}
        </div>

        {renderTab()}
      </main>
    </div>
  );
};

export default ProviderDashboard;
