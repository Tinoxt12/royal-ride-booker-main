import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import PublicLayout from "@/components/layout/PublicLayout";
import { useCreateBookingFlow, useVehicle } from "@/hooks/use-app-data";
import { generateBookingRef } from "@/lib/booking";
import { countryDialCodeOptions } from "@/lib/country-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function combinePhoneNumber(countryCode: string, localNumber: string) {
  const cleanedLocalNumber = localNumber.replace(/\s+/g, "");
  return `${countryCode}${cleanedLocalNumber}`;
}

const CUSTOM_COUNTRY_CODE = "custom";

export default function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const vehicleId = params.get("vehicle_id") ?? "";
  const startDateStr = params.get("start_date") ?? "";
  const endDateStr = params.get("end_date") ?? "";

  const { data: vehicle, isLoading, isError, error } = useVehicle(vehicleId);
  const createBookingFlow = useCreateBookingFlow();

  const totalDays =
    startDateStr && endDateStr
      ? Math.max(differenceInDays(parseISO(endDateStr), parseISO(startDateStr)), 1)
      : 0;
  const rentalTotal = vehicle ? totalDays * vehicle.daily_rate : 0;
  const depositAmount = vehicle?.deposit_amount ?? 0;

  const [form, setForm] = useState({
    full_name: "",
    phone_country_code: "+44",
    phone_custom_country_code: "",
    phone_local_number: "",
    whatsapp_country_code: "+44",
    whatsapp_custom_country_code: "",
    whatsapp_local_number: "",
    email: "",
  });
  const [submitError, setSubmitError] = useState("");

  const update = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Loading Booking</h1>
          <p className="text-muted-foreground">Please wait while we load your booking details.</p>
        </div>
      </PublicLayout>
    );
  }

  if (isError) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Unable to Load Booking</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Please try again shortly."}
          </p>
          <Button onClick={() => navigate("/vehicles")}>Browse Vehicles</Button>
        </div>
      </PublicLayout>
    );
  }

  if (!vehicle || !totalDays) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Invalid Booking</h1>
          <p className="text-muted-foreground mb-6">Please select a vehicle and dates first.</p>
          <Button onClick={() => navigate("/vehicles")}>Browse Vehicles</Button>
        </div>
      </PublicLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const bookingRef = generateBookingRef();

    try {
      const result = await createBookingFlow.mutateAsync({
        booking_ref: bookingRef,
        vehicle_id: vehicle.id,
        customer_full_name: form.full_name.trim(),
        customer_phone: combinePhoneNumber(
          form.phone_country_code === CUSTOM_COUNTRY_CODE ? form.phone_custom_country_code : form.phone_country_code,
          form.phone_local_number,
        ),
        customer_whatsapp: combinePhoneNumber(
          form.whatsapp_country_code === CUSTOM_COUNTRY_CODE ? form.whatsapp_custom_country_code : form.whatsapp_country_code,
          form.whatsapp_local_number,
        ),
        customer_email: form.email.trim(),
        start_date: startDateStr,
        end_date: endDateStr,
        total_days: totalDays,
        daily_rate: vehicle.daily_rate,
        rental_total: rentalTotal,
        deposit_amount: depositAmount,
        amount_due_now: depositAmount,
        booking_status: "pending",
        payment_status: "pending",
        payment_ref: "",
        notes: "Awaiting deposit payment confirmation via WhatsApp",
      });

      navigate(`/booking/success?ref=${encodeURIComponent(result.booking_ref)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We could not complete your booking.");
    }
  };

  return (
    <PublicLayout>
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-display font-bold mb-8 text-center">Create Your Booking</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display font-semibold text-lg mb-2">Your Details</h2>
              <p className="text-sm text-muted-foreground">
                Submit your booking first, then confirm your deposit with us on WhatsApp.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-local-number">Phone *</Label>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <Select value={form.phone_country_code} onValueChange={(value) => update("phone_country_code", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {countryDialCodeOptions.map((option) => (
                          <SelectItem key={`${option.label}-${option.code}`} value={option.code}>
                            {option.label} ({option.code})
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_COUNTRY_CODE}>Other / enter manually</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone-local-number"
                      required
                      value={form.phone_local_number}
                      onChange={(e) => update("phone_local_number", e.target.value)}
                      placeholder="Phone number"
                      inputMode="tel"
                    />
                  </div>
                  {form.phone_country_code === CUSTOM_COUNTRY_CODE && (
                    <Input
                      required
                      value={form.phone_custom_country_code}
                      onChange={(e) => update("phone_custom_country_code", e.target.value)}
                      placeholder="Country code e.g. +353"
                      inputMode="tel"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-local-number">WhatsApp Number *</Label>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <Select value={form.whatsapp_country_code} onValueChange={(value) => update("whatsapp_country_code", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {countryDialCodeOptions.map((option) => (
                          <SelectItem key={`whatsapp-${option.label}-${option.code}`} value={option.code}>
                            {option.label} ({option.code})
                          </SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_COUNTRY_CODE}>Other / enter manually</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="whatsapp-local-number"
                      required
                      value={form.whatsapp_local_number}
                      onChange={(e) => update("whatsapp_local_number", e.target.value)}
                      placeholder="WhatsApp number"
                      inputMode="tel"
                    />
                  </div>
                  {form.whatsapp_country_code === CUSTOM_COUNTRY_CODE && (
                    <Input
                      required
                      value={form.whatsapp_custom_country_code}
                      onChange={(e) => update("whatsapp_custom_country_code", e.target.value)}
                      placeholder="Country code e.g. +353"
                      inputMode="tel"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-5 space-y-3 sticky top-24">
                <h2 className="font-display font-semibold text-lg">Booking Summary</h2>
                <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                  <img src={vehicle.photo_urls[0]} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-semibold">{vehicle.name}</p>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><span>Dates</span><span>{startDateStr} - {endDateStr}</span></div>
                  <div className="flex justify-between"><span>Total Days</span><span>{totalDays}</span></div>
                  <div className="flex justify-between"><span>Daily Rate</span><span>${vehicle.daily_rate}</span></div>
                  <div className="flex justify-between"><span>Rental Total</span><span>${rentalTotal}</span></div>
                  <div className="flex justify-between"><span>Deposit</span><span>${depositAmount}</span></div>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Due Now</span>
                  <span className="text-gold">${depositAmount}</span>
                </div>

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={createBookingFlow.isPending}>
                  {createBookingFlow.isPending ? "Creating booking..." : "Create Booking"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your booking will be saved now. We will guide payment confirmation over WhatsApp next.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
