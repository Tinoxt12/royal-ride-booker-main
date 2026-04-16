import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { uploadVehiclePhoto } from "@/integrations/supabase/vehicle-photo-storage";
import { useCreateVehicle, useUpdateVehicle, useVehicles } from "@/hooks/use-app-data";
import { Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";

const statusBadge: Record<string, string> = {
  available: "bg-success text-success-foreground",
  booked: "bg-warning text-warning-foreground",
  maintenance: "bg-muted text-muted-foreground",
};

const emptyVehicle: Omit<Vehicle, "id" | "created_at"> = {
  name: "",
  type: "",
  plate: "",
  year: new Date().getFullYear(),
  colour: "",
  seats: 5,
  daily_rate: 0,
  deposit_amount: 0,
  status: "available",
  photo_url: "",
  notes: "",
};

export default function AdminVehicleManagement() {
  const { data: vehicles = [], isLoading, isError, error } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const isSaving = createVehicle.isPending || updateVehicle.isPending || isUploadingPhoto;

  const openNew = () => {
    setEditing({ ...emptyVehicle, id: "", created_at: "" } as Vehicle);
    setIsNew(true);
    setFormError("");
    setSelectedPhoto(null);
    setOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing({ ...vehicle });
    setIsNew(false);
    setFormError("");
    setSelectedPhoto(null);
    setOpen(true);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setOpen(false);
    setEditing(null);
    setFormError("");
    setSelectedPhoto(null);
  };

  const updateField = (field: keyof Vehicle, value: string | number) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value } as Vehicle);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedPhoto(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setFormError("");

    let photoUrl = editing.photo_url.trim();

    if (selectedPhoto) {
      try {
        setIsUploadingPhoto(true);
        photoUrl = await uploadVehiclePhoto(selectedPhoto);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Photo upload failed.");
        setIsUploadingPhoto(false);
        return;
      } finally {
        setIsUploadingPhoto(false);
      }
    }

    const payload = {
      name: editing.name.trim(),
      type: editing.type.trim(),
      plate: editing.plate.trim(),
      year: editing.year,
      colour: editing.colour.trim(),
      seats: editing.seats,
      daily_rate: editing.daily_rate,
      deposit_amount: editing.deposit_amount,
      status: editing.status,
      photo_url: photoUrl,
      notes: editing.notes?.trim() ?? "",
    };

    if (!payload.name || !payload.type || !payload.plate || !payload.colour || !payload.photo_url) {
      setFormError("Please complete all required fields before saving.");
      return;
    }

    try {
      if (isNew) {
        await createVehicle.mutateAsync(payload);
      } else {
        await updateVehicle.mutateAsync({
          id: editing.id,
          input: payload,
        });
      }

      setOpen(false);
      setEditing(null);
      setSelectedPhoto(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Vehicle could not be saved.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold">Vehicles</h2>
        <Button variant="gold" size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add Vehicle</Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Vehicle photos are now uploaded through the admin form instead of being pasted as external URLs.
      </p>
      {isLoading && <p className="text-sm text-muted-foreground mb-4">Loading vehicles...</p>}
      {isError && (
        <p className="text-sm text-destructive mb-4">
          {error instanceof Error ? error.message : "Vehicle data could not be loaded."}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Year</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.type}</TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.year}</TableCell>
                    <TableCell>${vehicle.daily_rate}/day</TableCell>
                    <TableCell><Badge className={statusBadge[vehicle.status]}>{vehicle.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(vehicle)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? closeDialog() : setOpen(true))}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{isNew ? "Add Vehicle" : "Edit Vehicle"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="vehicle-name">Name</Label>
                <Input id="vehicle-name" required value={editing.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vehicle-type">Type</Label>
                <Input id="vehicle-type" required value={editing.type} onChange={(e) => updateField("type", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vehicle-plate">Plate</Label>
                <Input id="vehicle-plate" required value={editing.plate} onChange={(e) => updateField("plate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vehicle-year">Year</Label>
                <Input id="vehicle-year" type="number" min="2000" required value={editing.year} onChange={(e) => updateField("year", parseInt(e.target.value || "0", 10))} />
              </div>
              <div>
                <Label htmlFor="vehicle-colour">Colour</Label>
                <Input id="vehicle-colour" required value={editing.colour} onChange={(e) => updateField("colour", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vehicle-seats">Seats</Label>
                <Input id="vehicle-seats" type="number" min="1" required value={editing.seats} onChange={(e) => updateField("seats", parseInt(e.target.value || "0", 10))} />
              </div>
              <div>
                <Label htmlFor="vehicle-rate">Daily Rate ($)</Label>
                <Input id="vehicle-rate" type="number" min="0" step="0.01" required value={editing.daily_rate} onChange={(e) => updateField("daily_rate", parseFloat(e.target.value || "0"))} />
              </div>
              <div>
                <Label htmlFor="vehicle-deposit">Deposit ($)</Label>
                <Input id="vehicle-deposit" type="number" min="0" step="0.01" required value={editing.deposit_amount} onChange={(e) => updateField("deposit_amount", parseFloat(e.target.value || "0"))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="vehicle-photo-upload">Vehicle Photo</Label>
                <Input id="vehicle-photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a new image file. If you leave this empty while editing, the current photo stays in place.
                </p>
              </div>
              {(selectedPhoto || editing.photo_url) && (
                <div className="col-span-2">
                  <Label>Current Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden bg-muted aspect-video">
                    <img
                      src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : editing.photo_url}
                      alt={editing.name || "Vehicle preview"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <Label htmlFor="vehicle-notes">Notes</Label>
                <Input id="vehicle-notes" value={editing.notes} onChange={(e) => updateField("notes", e.target.value)} />
              </div>
              {formError && <p className="col-span-2 text-sm text-destructive">{formError}</p>}
              <div className="col-span-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={closeDialog} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" className="flex-1" disabled={isSaving}>
                  {isSaving ? (isUploadingPhoto ? "Uploading photo..." : "Saving...") : isNew ? "Add Vehicle" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
