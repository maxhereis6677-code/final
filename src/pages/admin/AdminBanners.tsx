import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon, Eye, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  button_text: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const emptyBanner = {
  image_url: "",
  title: "",
  subtitle: "",
  button_text: "Shop Now",
  button_link: "/products",
  is_active: true,
  sort_order: 0,
};

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyBanner);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
    } else {
      setBanners(data as Banner[]);
    }
    setLoading(false);
  };

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setForm({
        image_url: banner.image_url,
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        button_text: banner.button_text || "Shop Now",
        button_link: banner.button_link || "/products",
        is_active: banner.is_active,
        sort_order: banner.sort_order,
      });
      setImagePreview(banner.image_url);
    } else {
      setEditingBanner(null);
      setForm({ ...emptyBanner, sort_order: banners.length });
      setImagePreview(null);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(data.path);

      setForm({ ...form, image_url: urlData.publicUrl });
      setImagePreview(urlData.publicUrl);
      toast.success("Banner image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    }

    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.image_url) {
      toast.error("Please upload a banner image");
      return;
    }

    setSaving(true);

    try {
      if (editingBanner?.id) {
        const { error } = await supabase
          .from("banners")
          .update(form)
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast.success("Banner updated successfully");
      } else {
        const { error } = await supabase.from("banners").insert(form);
        if (error) throw error;
        toast.success("Banner added successfully");
      }

      setDialogOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Failed to save banner");
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner deleted");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchBanners();
      toast.success(isActive ? "Banner deactivated" : "Banner activated");
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner");
    }
  };

  const activeBanners = banners.filter(b => b.is_active);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-foreground">Banners</h1>
            <p className="text-muted-foreground">Manage homepage carousel banners</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={activeBanners.length === 0}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview ({activeBanners.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Banner Preview</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  {activeBanners.length > 0 && (
                    <img
                      src={activeBanners[0].image_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <h2 className="font-serif text-3xl mb-2">{activeBanners[0]?.title || "Banner Title"}</h2>
                    <p className="text-white/70 mb-4">{activeBanners[0]?.subtitle}</p>
                    <Button className="btn-gold">
                      {activeBanners[0]?.button_text || "Shop Now"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Showing preview of first active banner. All {activeBanners.length} banners will auto-slide on homepage.
                </p>
              </DialogContent>
            </Dialog>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="btn-gold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">
                    {editingBanner ? "Edit Banner" : "Add New Banner"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Banner Image *</Label>
                    <div className="flex flex-col gap-3">
                      {imagePreview ? (
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImagePreview(null);
                              setForm({ ...form, image_url: "" });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-[16/9] w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Click to upload (16:9 recommended)</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-fit"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., New Collection"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="e.g., Discover our latest fragrances"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="button_text">Button Text</Label>
                      <Input
                        id="button_text"
                        value={form.button_text}
                        onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="button_link">Button Link</Label>
                      <Input
                        id="button_link"
                        value={form.button_link}
                        onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                  </div>

                  <Button type="submit" disabled={saving || uploading} className="w-full btn-gold">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingBanner ? "Update Banner" : "Add Banner"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Banners Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No banners yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first banner to display on the homepage</p>
            <Button onClick={() => handleOpenDialog()} className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-lg overflow-hidden border ${
                  banner.is_active ? "border-primary/50" : "border-border opacity-60"
                }`}
              >
                <div className="aspect-[16/9] relative">
                  <img
                    src={banner.image_url}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      banner.is_active 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDialog(banner)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Banner Info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    {banner.title && (
                      <h3 className="font-serif text-lg font-medium truncate">{banner.title}</h3>
                    )}
                    <p className="text-white/70 text-sm truncate">{banner.button_text} → {banner.button_link}</p>
                  </div>
                </div>

                {/* Toggle Active */}
                <div className="p-3 bg-card flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Show on homepage</span>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => toggleActive(banner.id, banner.is_active)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
