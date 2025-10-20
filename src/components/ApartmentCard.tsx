
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Maximize, MapPin, Bath, Coffee, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ApartmentProps {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  image: string;
  location: string;
  features: string[];
}

export default function ApartmentCard({ apartment }: { apartment: ApartmentProps }) {
  const { t, language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  // Use translated name and description if available
  const translatedName = language !== 'en' && t.apartmentDescriptions[apartment.id]?.name 
    ? t.apartmentDescriptions[apartment.id].name 
    : apartment.name;
    
  const translatedDescription = language !== 'en' && t.apartmentDescriptions[apartment.id]?.description 
    ? t.apartmentDescriptions[apartment.id].description 
    : apartment.description;
  
  return (
    <div 
      className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl bg-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-64">
        <img 
          src={apartment.image} 
          alt={translatedName}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex items-end p-6">
          <div>
            <h3 className="text-white text-xl font-bold mb-1">{translatedName}</h3>
            <div className="flex items-center text-white/80 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{apartment.location}</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{apartment.capacity} {apartment.capacity === 1 ? 
                  t.apartments.filters.guests : t.apartments.filters.guests}</span>
              </div>
              <div className="flex items-center">
                <Maximize className="h-4 w-4 mr-1" />
                <span>{apartment.size} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground line-clamp-2">{translatedDescription}</p>
        
        <div className="flex flex-wrap gap-2">
          {apartment.features.slice(0, 3).map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full"
            >
              {feature === "Bathroom" && <Bath className="h-3.5 w-3.5 mr-1" />}
              {feature === "Kitchen" && <Coffee className="h-3.5 w-3.5 mr-1" />}
              {feature === "Wi-Fi" && <Wifi className="h-3.5 w-3.5 mr-1" />}
              <span>{feature}</span>
            </div>
          ))}
          {apartment.features.length > 3 && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              +{apartment.features.length - 3} {t.apartments.filters.more}
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between pt-2">
          <div>
            <span className="text-xl font-bold">${apartment.price}</span>
            <span className="text-muted-foreground text-sm"> / {t.booking.summary.night}</span>
          </div>
          <Button asChild className="btn-primary">
            <Link to={`/apartments/${apartment.id}`}>{t.apartments.filters.viewDetails}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
