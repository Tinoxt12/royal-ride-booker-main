import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { useBookingByRef } from "@/hooks/use-app-data";
import {
  BUSINESS_WHATSAPP_NUMBER,
  bankPaymentDetails,
  manualPaymentInstructions,
} from "@/config/contact";
import { Button } from "@/components/ui/button";

function buildWhatsAppMessage({
  bookingRef,
  vehicleName,
  startDate,
  endDate,
  depositAmount,
}: {
  bookingRef: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
}) {
  return [
    `Hi, I am ready to send the deposit for booking ${bookingRef}.`,
    `Vehicle: ${vehicleName}`,
    `Dates: ${startDate} - ${endDate}`,
    `Deposit: $${depositAmount}`,
  ].join("\n");
}

export default function BookingSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const { data: booking, isLoading, isError, error } = useBookingByRef(ref);
  const [copied, setCopied] = useState(false);

  const handleCopyReference = async (bookingRef: string) => {
    try {
      await navigator.clipboard.writeText(bookingRef);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <h1 className="text-3xl font-display font-bold mb-2">Loading Booking</h1>
            <p className="text-muted-foreground">Please wait while we fetch your booking confirmation.</p>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (isError || !booking) {
    return (
      <PublicLayout>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <h1 className="text-3xl font-display font-bold mb-2">Booking Saved</h1>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : "We could not load the booking details right now."}
            </p>
            {ref && (
              <p className="text-sm text-muted-foreground">
                Reference: <span className="font-mono font-bold">{ref}</span>
              </p>
            )}
          </div>
        </section>
      </PublicLayout>
    );
  }

  const vehicleName = booking.vehicle?.name ?? booking.vehicle_id;
  const whatsappMessage = buildWhatsAppMessage({
    bookingRef: booking.booking_ref,
    vehicleName,
    startDate: booking.start_date,
    endDate: booking.end_date,
    depositAmount: booking.deposit_amount,
  });
  const whatsappLink = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <PublicLayout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Booking Created, Awaiting Deposit</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your booking is saved. Please use the bank details below to send the deposit, then confirm with us on WhatsApp.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Booking Reference</p>
                  <p className="font-mono text-xl md:text-2xl font-bold">{booking.booking_ref}</p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Deposit Due</p>
                  <p className="text-3xl font-display font-bold text-gold">${booking.deposit_amount}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCopyReference(booking.booking_ref)}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy Reference"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-secondary rounded-2xl p-6 text-left">
                <h2 className="font-display font-semibold text-xl mb-4">Booking Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Vehicle</span><span className="text-right">{vehicleName}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Dates</span><span className="text-right">{booking.start_date} - {booking.end_date}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rental Total</span><span className="text-right">${booking.rental_total}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Payment Status</span><span className="text-right font-medium capitalize">{booking.payment_status}</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 text-left">
                <h2 className="font-display font-semibold text-xl mb-4">Next Steps</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {manualPaymentInstructions.map((instruction, index) => (
                    <div key={instruction} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                        {index + 1}
                      </div>
                      <p>{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <h2 className="font-display font-semibold text-xl mb-4">Bank Details</h2>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Beneficiary:</span> {bankPaymentDetails.beneficiary}</p>
                <p><span className="text-muted-foreground">Bank:</span> {bankPaymentDetails.bankName}</p>
                <p><span className="text-muted-foreground">Sort Code:</span> {bankPaymentDetails.sortCode}</p>
                <p><span className="text-muted-foreground">Account Number:</span> {bankPaymentDetails.accountNumber}</p>
                <p className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {bankPaymentDetails.address}</p>
              </div>
            </div>

            <div className="text-center">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="gold" size="lg" className="w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5" /> Confirm Payment on WhatsApp
                </Button>
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                Use WhatsApp after sending the deposit so we can confirm your booking faster.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
