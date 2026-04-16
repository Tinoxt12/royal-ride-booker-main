import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_WHATSAPP_NUMBER } from "@/config/contact";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const whatsappDisplayNumber = "+44 7552 146927";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-royal sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Car className="h-7 w-7 text-gold" />
            <div>
              <span className="text-lg font-bold font-display text-primary-foreground tracking-wide">
                ROYAL RIDE
              </span>
              <span className="hidden sm:inline text-xs text-gold ml-2 font-body">CAR HIRE</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-gold"
                    : "text-primary-foreground/80 hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/vehicles">
              <Button variant="gold" size="sm">
                Book Now
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gradient-royal text-primary-foreground">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-6 w-6 text-gold" />
                <span className="font-display font-bold text-lg">ROYAL RIDE CAR HIRE</span>
              </div>
              <p className="text-sm text-primary-foreground/70">Drive in Comfort. Ride Like Royalty.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-gold">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <Link to="/vehicles" className="hover:text-gold transition-colors">Vehicles</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-gold">Contact</h4>
              <a
                href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
              >
                <Phone className="h-4 w-4" />
                WhatsApp: {whatsappDisplayNumber}
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/50">
            (c) {new Date().getFullYear()} Royal Ride Car Hire. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
