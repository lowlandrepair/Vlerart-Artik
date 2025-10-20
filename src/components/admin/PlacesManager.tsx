import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  amenities: string[] | null;
  is_active: boolean;
}

export default function PlacesManager() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
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
    image_url: "",
    amenities: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching places");
    } else {
      setPlaces(data || []);
    }
    setLoading(false);
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
      image_url: formData.image_url.trim() || null,
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
      image_url: place.image_url || "",
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
      image_url: "",
      amenities: "",
      is_active: true,
    });
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlace ? "Edit Place" : "Add New Place"}</DialogTitle>
              <DialogDescription>
                {editingPlace ? "Update the place information" : "Fill in the details for the new place"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, Pool, Parking"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlace ? "Update" : "Create"} Place
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
        <div className="grid gap-4">
          {places.map((place) => (
            <Card key={place.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {place.name}
                      {!place.is_active && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Inactive</span>
                      )}
                    </CardTitle>
                    <CardDescription>
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
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {place.price_per_night && (
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">${place.price_per_night}/night</p>
                    </div>
                  )}
                  {place.max_guests && (
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium">{place.max_guests}</p>
                    </div>
                  )}
                  {place.bedrooms && (
                    <div>
                      <span className="text-muted-foreground">Bedrooms:</span>
                      <p className="font-medium">{place.bedrooms}</p>
                    </div>
                  )}
                  {place.bathrooms && (
                    <div>
                      <span className="text-muted-foreground">Bathrooms:</span>
                      <p className="font-medium">{place.bathrooms}</p>
                    </div>
                  )}
                </div>
                {place.description && (
                  <p className="mt-4 text-sm text-muted-foreground">{place.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
