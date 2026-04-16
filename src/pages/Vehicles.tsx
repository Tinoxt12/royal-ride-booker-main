import PublicLayout from "@/components/layout/PublicLayout";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { useVehicles } from "@/hooks/use-app-data";

export default function VehiclesPage() {
  const { data: vehicles = [], isLoading, isError, error } = useVehicles();

  return (
    <PublicLayout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Our Fleet</h1>
            <p className="text-muted-foreground">Browse and book from our range of self-drive vehicles.</p>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Loading vehicles...</p>
          ) : isError ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-destructive font-medium">We could not load the fleet right now.</p>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Please try again shortly."}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No vehicles available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
