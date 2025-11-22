import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Maximize, 
  MapPin, 
  ArrowLeft,
  Check,
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Place {
  id: string;
  name: string;
  description: string | null;
  price_per_night: number;
  max_guests: number;
  bedrooms: number | null;
  bathrooms: number | null;
  image_url: string | null;
  images: string[] | null;
  city: string | null;
  country: string | null;
  address: string | null;
  amenities: string[] | null;
}

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchPlace();
    }
  }, [id]);

  const fetchPlace = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        navigate('/404');
        return;
      }
      
      setPlace(data);
    } catch (error) {
      console.error('Error fetching place:', error);
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!place) {
    return null;
  }

  const estimatedSize = place.bedrooms ? place.bedrooms * 30 : 45;
  
  // Get all available images
  const allImages = place.images && place.images.length > 0 
    ? place.images 
    : place.image_url 
    ? [place.image_url] 
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        {/* Back Button */}
        <section className="container py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/apartments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apartments
            </Link>
          </Button>
        </section>

        {/* Image Gallery */}
        <section className="container mb-8">
          {allImages.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {allImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${place.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          ) : (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <img 
                src={allImages[0]} 
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </section>

        {/* Content */}
        <section className="container pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{place.name}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{place.city || 'Beachfront'}{place.country ? `, ${place.country}` : ''}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span>{place.max_guests} Guests</span>
                  </div>
                  {place.bedrooms && (
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">{place.bedrooms}</span>
                      <span>Bedrooms</span>
                    </div>
                  )}
                  {place.bathrooms && (
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">{place.bathrooms}</span>
                      <span>Bathrooms</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Maximize className="h-4 w-4 mr-2 text-primary" />
                    <span>~{estimatedSize} m²</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4">About this place</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {place.description || 'A beautiful accommodation waiting for you to explore.'}
                </p>
              </div>

              {place.amenities && place.amenities.length > 0 && (
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {place.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-5 w-5 mr-3 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {place.address && (
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-semibold mb-4">Location</h2>
                  <p className="text-muted-foreground">{place.address}</p>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24 space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">${place.price_per_night}</span>
                    <span className="text-muted-foreground ml-2">/ night</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button asChild className="w-full btn-primary" size="lg">
                    <Link to="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Now
                    </Link>
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    You won't be charged yet
                  </div>
                </div>

                <div className="border-t pt-6 space-y-3">
                  <h3 className="font-semibold mb-3">Need help?</h3>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/contact">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Us
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
