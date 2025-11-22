import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Shield, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const navLinks = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.apartments, path: "/apartments" },
    { name: t.nav.amenities, path: "/amenities" },
    { name: t.nav.gallery, path: "/gallery" },
    { name: t.nav.contact, path: "/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };
  
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-white/80 dark:bg-card/80 backdrop-blur-lg py-3 shadow-md" : "bg-transparent py-5")}>
      <nav className="container flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <LanguageSelector />
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-8">
          {navLinks.map(link => <li key={link.name} className="relative">
              <Link to={link.path} className="font-medium transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                {link.name}
              </Link>
            </li>)}
        </ul>

        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t.nav.logout}
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                {t.nav.login}
              </Link>
            </Button>
          )}
          <Button asChild className="btn-primary">
            <Link to="/booking">{t.nav.bookNow}</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300", mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className={cn("fixed inset-y-0 right-0 w-3/4 max-w-sm bg-card shadow-xl p-6 transition-transform duration-300 ease-in-out", mobileMenuOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between mb-8">
                <LanguageSelector />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <ul className="space-y-6">
                {navLinks.map(link => <li key={link.name}>
                    <Link to={link.path} className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                      {link.name}
                    </Link>
                  </li>)}
                {isAdmin && (
                  <li>
                    <Link to="/admin" className="text-lg font-medium transition-colors hover:text-primary flex items-center" onClick={() => setMobileMenuOpen(false)}>
                      <Shield className="mr-2 h-5 w-5" />
                      Admin
                    </Link>
                  </li>
                )}
                {user ? (
                  <li>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-lg font-medium transition-colors hover:text-primary flex items-center w-full text-left">
                      <LogOut className="mr-2 h-5 w-5" />
                      {t.nav.logout}
                    </button>
                  </li>
                ) : (
                  <li>
                    <Link to="/auth" className="text-lg font-medium transition-colors hover:text-primary flex items-center" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="mr-2 h-5 w-5" />
                      {t.nav.login}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            <Button asChild className="w-full btn-primary mt-6">
              <Link to="/booking" onClick={() => setMobileMenuOpen(false)}>
                {t.nav.bookNow}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>;
}
