import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Star, Users, Bed, Bath, MapPin, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Place {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  price_per_night: number | null;
  max_guests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  image_url: string | null;
  images: string[] | null;
  amenities: string[] | null;
  rating: number | null;
  total_reviews: number | null;
  is_active: boolean;
}

export default function PlacesManager() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    price_per_night: "",
    max_guests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching places:", error);
        toast.error(`Error fetching places: ${error.message}`);
        setPlaces([]);
      } else {
        setPlaces(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to load places");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('place-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('place-images')
          .getPublicUrl(filePath);

        newImageUrls.push(publicUrl);
      }

      setUploadedImages([...uploadedImages, ...newImageUrls]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const placeData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      country: formData.country.trim() || null,
      price_per_night: formData.price_per_night ? parseFloat(formData.price_per_night) : null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      images: uploadedImages.length > 0 ? uploadedImages : null,
      image_url: uploadedImages.length > 0 ? uploadedImages[0] : null,
      amenities: formData.amenities ? formData.amenities.split(",").map((a) => a.trim()) : null,
      is_active: formData.is_active,
    };

    if (editingPlace) {
      const { error } = await supabase
        .from("places")
        .update(placeData)
        .eq("id", editingPlace.id);

      if (error) {
        toast.error("Error updating place");
      } else {
        toast.success("Place updated successfully");
        setDialogOpen(false);
        resetForm();
        fetchPlaces();
      }
    } else {
      const { error } = await supabase.from("places").insert(placeData);

      if (error) {
        toast.error("Error creating place");
      } else {
        toast.success("Place created successfully");
        setDialogOpen(false);
        resetForm();
        fetchPlaces();
      }
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setUploadedImages(place.images || []);
    setFormData({
      name: place.name,
      description: place.description || "",
      address: place.address || "",
      city: place.city || "",
      country: place.country || "",
      price_per_night: place.price_per_night?.toString() || "",
      max_guests: place.max_guests?.toString() || "",
      bedrooms: place.bedrooms?.toString() || "",
      bathrooms: place.bathrooms?.toString() || "",
      amenities: place.amenities?.join(", ") || "",
      is_active: place.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this place?")) return;

    const { error } = await supabase.from("places").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting place");
    } else {
      toast.success("Place deleted successfully");
      fetchPlaces();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      price_per_night: "",
      max_guests: "",
      bedrooms: "",
      bathrooms: "",
      amenities: "",
      is_active: true,
    });
    setUploadedImages([]);
    setEditingPlace(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Places</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingPlace ? "Edit Place" : "Add New Place"}</DialogTitle>
              <DialogDescription>
                {editingPlace ? "Update the place information" : "Fill in the details for the new place"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <Label htmlFor="image-upload" className="cursor-pointer text-primary hover:underline">
                        Click to upload
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB each</p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Main</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Luxury Beachfront Villa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the property, its features, and what makes it special..."
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Beach Road"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Miami"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Property Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_guests" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Max Guests
                    </Label>
                    <Input
                      id="max_guests"
                      type="number"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                      placeholder="6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Bedrooms
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      Bathrooms
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="2"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  rows={2}
                  placeholder="WiFi, Pool, Air Conditioning, Kitchen, Parking, Beach Access"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    {formData.is_active ? "Active - Visible to users" : "Inactive - Hidden from users"}
                  </Label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      {editingPlace ? "Update" : "Create"} Place
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : places.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No places found. Add your first place to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {places.map((place) => (
            <Card key={place.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Gallery */}
                <div className="md:w-1/3 relative">
                  {place.images && place.images.length > 0 ? (
                    <div className="relative h-64 md:h-full">
                      <img 
                        src={place.images[0]} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      {place.images.length > 1 && (
                        <Badge className="absolute bottom-3 right-3 bg-background/80 backdrop-blur">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {place.images.length}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 md:h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl">{place.name}</CardTitle>
                          {!place.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 text-base">
                          <MapPin className="h-4 w-4" />
                          {place.city && place.country ? `${place.city}, ${place.country}` : place.city || place.country || "No location"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(place)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(place.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-4">
                    {/* Price and Stats */}
                    <div className="flex items-center gap-6 flex-wrap">
                      {place.price_per_night && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-primary">${place.price_per_night}</span>
                          <span className="text-muted-foreground">/night</span>
                        </div>
                      )}
                      {place.rating && place.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="font-medium">{place.rating}</span>
                          {place.total_reviews && place.total_reviews > 0 && (
                            <span className="text-muted-foreground text-sm">({place.total_reviews})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex gap-6 text-sm">
                      {place.max_guests && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{place.max_guests} guests</span>
                        </div>
                      )}
                      {place.bedrooms && (
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span>{place.bedrooms} bedrooms</span>
                        </div>
                      )}
                      {place.bathrooms && (
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          <span>{place.bathrooms} bathrooms</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {place.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
                    )}

                    {/* Amenities */}
                    {place.amenities && place.amenities.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {place.amenities.slice(0, 5).map((amenity, index) => (
                          <Badge key={index} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                        {place.amenities.length > 5 && (
                          <Badge variant="outline">+{place.amenities.length - 5} more</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
