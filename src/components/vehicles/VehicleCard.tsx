import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import { Vehicle } from "@/types";

const statusColor: Record<string, string> = {
  available: "bg-success text-success-foreground",
  booked: "bg-warning text-warning-foreground",
  maintenance: "bg-muted text-muted-foreground",
};

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={vehicle.photo_urls[0]}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.type} · {vehicle.year} · {vehicle.colour}</p>
          </div>
          <Badge className={statusColor[vehicle.status] ?? "bg-muted"}>
            {vehicle.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{vehicle.seats} seats</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />${vehicle.daily_rate}/day</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Deposit</p>
            <p className="font-semibold text-foreground">${vehicle.deposit_amount}</p>
          </div>
          <Link to={`/vehicles/${vehicle.id}`}>
            <Button variant={vehicle.status === "available" ? "gold" : "outline"} size="sm">
              {vehicle.status === "available" ? "View & Book" : "View Details"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
