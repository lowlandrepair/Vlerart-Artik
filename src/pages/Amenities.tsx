
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spa, Dumbbell, Pool, Yoga, Utensils, Wine, Coffee, Clock, Car, Plane, Car as CarIcon, MapPin, Waves, Users, Music, BookOpen } from "lucide-react";

export default function Amenities() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  // Helper function to get the appropriate icon for each amenity
  const getIcon = (categoryName: string, index: number) => {
    const icons = {
      wellness: [<Spa key={0} />, <Dumbbell key={1} />, <Pool key={2} />, <Yoga key={3} />],
      dining: [<Utensils key={0} />, <Coffee key={1} />, <Wine key={2} />, <Clock key={3} />],
      services: [<Clock key={0} />, <Plane key={1} />, <CarIcon key={2} />, <MapPin key={3} />],
      entertainment: [<Waves key={0} />, <Users key={1} />, <Music key={2} />, <BookOpen key={3} />]
    };
    
    return icons[categoryName as keyof typeof icons]?.[index] || <Coffee />;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-sea-light to-white dark:from-sea-dark dark:to-background">
          <div className="container relative z-10 pt-20">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                MareSereno
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                {t.amenitiesPage.title}
              </h1>
              <p className="text-muted-foreground">
                {t.amenitiesPage.subtitle}
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-sea-light blur-3xl" />
          </div>
        </section>
        
        {/* Description Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground">
                {t.amenitiesPage.description}
              </p>
            </div>
          </div>
        </section>
        
        {/* Categories Sections */}
        {Object.keys(t.amenitiesPage.categories).map((category, categoryIndex) => {
          const categoryData = t.amenitiesPage.categories[category as keyof typeof t.amenitiesPage.categories];
          const isEven = categoryIndex % 2 === 0;
          
          return (
            <section key={category} className={`py-16 ${isEven ? 'bg-card' : ''}`}>
              <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    {categoryData.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {categoryData.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryData.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="glass-card p-6 rounded-xl flex flex-col items-center text-center animate-fade-in"
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">
                        {getIcon(category, index)}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        
        {/* Gallery Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t.gallery.title}
              </h2>
              <p className="text-muted-foreground">
                {t.gallery.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div 
                  key={index} 
                  className="aspect-square rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105"
                >
                  <img 
                    src={`https://images.unsplash.com/photo-${1550000000000 + index * 100000}?w=400&h=400&fit=crop`}
                    alt={`Amenity ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
