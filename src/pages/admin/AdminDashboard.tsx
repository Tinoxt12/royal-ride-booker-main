import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CarFront, CalendarCheck, Users, CheckCircle, Clock, Play, Ban } from "lucide-react";
import { useBookings, useVehicles } from "@/hooks/use-app-data";

export default function AdminDashboard() {
  const { data: vehicles = [], isLoading: vehiclesLoading, isError: vehiclesError } = useVehicles();
  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useBookings();

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const bookedVehicles = vehicles.filter((v) => v.status === "booked").length;

  const pending = bookings.filter((b) => b.booking_status === "pending").length;
  const confirmed = bookings.filter((b) => b.booking_status === "confirmed").length;
  const active = bookings.filter((b) => b.booking_status === "active").length;
  const completed = bookings.filter((b) => b.booking_status === "completed").length;

  const stats = [
    { label: "Total Vehicles", value: totalVehicles, icon: CarFront, color: "text-gold" },
    { label: "Available", value: availableVehicles, icon: CheckCircle, color: "text-success" },
    { label: "Booked", value: bookedVehicles, icon: Ban, color: "text-warning" },
    { label: "Pending Bookings", value: pending, icon: Clock, color: "text-warning" },
    { label: "Confirmed", value: confirmed, icon: CalendarCheck, color: "text-primary" },
    { label: "Active", value: active, icon: Play, color: "text-success" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-muted-foreground" },
  ];

  return (
    <AdminLayout>
      {(vehiclesLoading || bookingsLoading) && (
        <p className="text-sm text-muted-foreground mb-4">Loading live dashboard data...</p>
      )}
      {(vehiclesError || bookingsError) && (
        <p className="text-sm text-destructive mb-4">
          Some dashboard data could not be loaded. Check the datasource connection and try again.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
}
