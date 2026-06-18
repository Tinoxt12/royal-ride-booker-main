import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { CalendarIcon, ArrowRight, Users, Car } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import { useVehicle } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const vehicleStatusBadgeClass: Record<string, string> = {
  available: "bg-success text-success-foreground",
  booked: "bg-warning text-warning-foreground",
  maintenance: "bg-muted text-muted-foreground",
};

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vehicle, isLoading, isError, error } = useVehicle(id ?? "");

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Loading Vehicle</h1>
          <p className="text-muted-foreground">Please wait while we fetch the latest vehicle details.</p>
        </div>
      </PublicLayout>
    );
  }

  if (isError) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Unable to Load Vehicle</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Please try again shortly."}
          </p>
          <Button onClick={() => navigate("/vehicles")}>Back to Vehicles</Button>
        </div>
      </PublicLayout>
    );
  }

  if (!vehicle) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Vehicle Not Found</h1>
          <Button onClick={() => navigate("/vehicles")}>Back to Vehicles</Button>
        </div>
      </PublicLayout>
    );
  }

  const totalDays = startDate && endDate ? Math.max(differenceInDays(endDate, startDate), 1) : 0;
  const rentalTotal = totalDays * vehicle.daily_rate;
  const canBook = vehicle.status === "available" && startDate && endDate && totalDays > 0;

  const handleProceed = () => {
    if (!canBook) return;
    const params = new URLSearchParams({
      vehicle_id: vehicle.id,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <PublicLayout>
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VehicleGallery photos={vehicle.photo_urls} alt={vehicle.name} />

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold">{vehicle.name}</h1>
                  <Badge className={vehicleStatusBadgeClass[vehicle.status] ?? "bg-muted text-muted-foreground"}>
                    {vehicle.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{vehicle.type} · {vehicle.year} · {vehicle.colour}</p>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-gold" />{vehicle.seats} seats</div>
                <div className="flex items-center gap-2 text-sm"><Car className="h-4 w-4 text-gold" />{vehicle.plate}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                  <p className="text-2xl font-bold text-gold">${vehicle.daily_rate}</p>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Deposit</p>
                  <p className="text-2xl font-bold text-foreground">${vehicle.deposit_amount}</p>
                </div>
              </div>

              {vehicle.status === "available" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left", !startDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              setStartDate(date);
                              if (endDate && date && date >= endDate) {
                                setEndDate(undefined);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left", !endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => date < (startDate ?? new Date())}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
                      <h3 className="font-display font-semibold text-lg mb-2">Booking Summary</h3>
                      <div className="flex justify-between"><span className="text-muted-foreground">Total Days</span><span className="font-medium">{totalDays}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Daily Rate</span><span>${vehicle.daily_rate}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Rental Total</span><span>${rentalTotal}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span>${vehicle.deposit_amount}</span></div>
                      <div className="flex justify-between border-t border-border pt-2 font-bold">
                        <span>Amount Due Now</span>
                        <span className="text-gold">${vehicle.deposit_amount}</span>
                      </div>
                    </div>
                  )}

                  <Button variant="gold" size="lg" className="w-full" disabled={!canBook} onClick={handleProceed}>
                    Proceed to Booking <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
