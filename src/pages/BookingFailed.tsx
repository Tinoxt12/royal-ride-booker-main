import { Link } from "react-router-dom";
import { XCircle, MessageCircle } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { BUSINESS_WHATSAPP_NUMBER } from "@/config/contact";

export default function BookingFailedPage() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Booking Could Not Be Completed</h1>
          <p className="text-muted-foreground mb-8">
            We could not finish saving your booking details. Please try again, or message us on WhatsApp and we will help you complete it manually.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/vehicles">
              <Button variant="outline" size="lg">Back to Vehicles</Button>
            </Link>
            <a href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" /> Contact Support
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
