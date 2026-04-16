import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Shield, Clock, MapPin, Phone, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { useVehicles } from "@/hooks/use-app-data";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { BUSINESS_WHATSAPP_NUMBER } from "@/config/contact";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const rentalRules = [
  "Valid ID required (National ID or Passport)",
  "Valid driver's licence required",
  "Deposit required before vehicle collection",
  "Late return may affect deposit",
  "Vehicle must be returned with same fuel level",
  "Excessive dirt may attract cleaning charges",
  "Minor scratches or missing items may affect deposit",
  "Traffic tickets and toll fees are customer responsibility",
  "WhatsApp is used for booking follow-up and coordination",
];

const howItWorks = [
  { icon: Car, title: "Choose Your Vehicle", desc: "Browse our fleet and pick the car that suits your needs." },
  { icon: Clock, title: "Select Your Dates", desc: "Pick your rental start and end dates." },
  { icon: Shield, title: "Confirm Deposit on WhatsApp", desc: "Create your booking online, then message us to receive deposit payment details." },
  { icon: MapPin, title: "Collect & Drive", desc: "Pick up your vehicle and enjoy your trip!" },
];

export default function Index() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const featured = availableVehicles.slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-royal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(42_92%_50%/0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight mb-4">
              Drive in Comfort.{" "}
              <span className="text-gradient-gold">Ride Like Royalty.</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 font-body mb-8 max-w-lg">
              Premium self-drive car hire in Zimbabwe. Browse our fleet, book online, and confirm your deposit over WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/vehicles">
                <Button variant="gold" size="lg" className="text-base">
                  Book Now <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <a href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <Button variant="gold-outline" size="lg" className="text-base">
                  <MessageCircle className="mr-1 h-5 w-5" /> WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "100+", label: "Happy Customers" },
              { val: vehiclesLoading ? "..." : `${availableVehicles.length}+`, label: "Vehicles Available" },
              { val: "24/7", label: "WhatsApp Support" },
              { val: "Safe", label: "& Reliable" },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <p className="text-2xl md:text-3xl font-display font-bold text-gold">{item.val}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Our Fleet</h2>
            <p className="text-muted-foreground">Choose from our range of well-maintained vehicles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((v, i) => (
              <motion.div key={v.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <VehicleCard vehicle={v} />
              </motion.div>
            ))}
          </div>
          {!vehiclesLoading && featured.length === 0 && (
            <p className="text-center text-muted-foreground mt-6">No featured vehicles are available yet.</p>
          )}
          <div className="text-center mt-8">
            <Link to="/vehicles">
              <Button variant="outline" size="lg">
                View All Vehicles <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="text-center border-none shadow-sm h-full">
                    <CardContent className="pt-8 pb-6 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7 text-gold" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rental Rules */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-display font-bold text-center mb-8">Rental Rules</h2>
          <div className="space-y-3">
            {rentalRules.map((rule, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <span className="text-foreground/80 text-sm">{rule}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 bg-gradient-royal">
        <div className="container mx-auto px-4 text-center">
          <Phone className="h-10 w-10 text-gold mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-3">
            Ready to Book?
          </h2>
          <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">
            Have questions or want to confirm your deposit? Reach out on WhatsApp and we will guide you through the next step.
          </p>
          <a href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <Button variant="gold" size="lg" className="text-base">
              <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
