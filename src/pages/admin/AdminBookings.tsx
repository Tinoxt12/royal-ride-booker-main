import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-app-data";
import { Booking, BookingStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const bookingStatusColor: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  confirmed: "bg-primary text-primary-foreground",
  active: "bg-success text-success-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const paymentStatusColor: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  partial: "bg-gold text-gold-foreground",
  paid: "bg-success text-success-foreground",
  failed: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminBookings() {
  const { data: allBookings = [], isLoading, isError, error } = useBookings();
  const updateBookingStatus = useUpdateBookingStatus();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editedStatus, setEditedStatus] = useState<BookingStatus>("pending");
  const [editedNotes, setEditedNotes] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!selected) return;
    setEditedStatus(selected.booking_status);
    setEditedNotes(selected.notes ?? "");
    setSaveError("");
  }, [selected]);

  const filtered = allBookings.filter((booking) => {
    if (statusFilter !== "all" && booking.booking_status !== statusFilter) return false;

    if (search) {
      const query = search.toLowerCase();
      return (
        booking.booking_ref.toLowerCase().includes(query) ||
        booking.customer?.full_name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleStatusSave = async () => {
    if (!selected) return;

    setSaveError("");

    try {
      const updatedBooking = await updateBookingStatus.mutateAsync({
        id: selected.id,
        input: {
          booking_status: editedStatus,
          notes: editedNotes,
        },
      });

      setSelected(updatedBooking);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Booking status could not be updated.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by ref or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground mb-4">Loading live bookings...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive mb-4">
          {error instanceof Error ? error.message : "Bookings could not be loaded."}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.booking_ref}</TableCell>
                    <TableCell className="hidden md:table-cell">{booking.customer?.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{booking.vehicle?.name}</TableCell>
                    <TableCell><Badge className={bookingStatusColor[booking.booking_status]}>{booking.booking_status}</Badge></TableCell>
                    <TableCell><Badge className={paymentStatusColor[booking.payment_status]}>{booking.payment_status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Booking {selected?.booking_ref}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Customer:</span> {selected.customer?.full_name}</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {selected.vehicle?.name}</div>
                <div><span className="text-muted-foreground">Dates:</span> {selected.start_date} - {selected.end_date}</div>
                <div><span className="text-muted-foreground">Days:</span> {selected.total_days}</div>
                <div><span className="text-muted-foreground">Rate:</span> ${selected.daily_rate}/day</div>
                <div><span className="text-muted-foreground">Rental Total:</span> ${selected.rental_total}</div>
                <div><span className="text-muted-foreground">Deposit:</span> ${selected.deposit_amount}</div>
                <div><span className="text-muted-foreground">Due Now:</span> ${selected.amount_due_now}</div>
                <div><span className="text-muted-foreground">Payment Ref:</span> {selected.payment_ref || "-"}</div>
                <div><span className="text-muted-foreground">Payment Status:</span> <span className="capitalize">{selected.payment_status}</span></div>
              </div>
              <div className="flex gap-2">
                <Badge className={bookingStatusColor[selected.booking_status]}>{selected.booking_status}</Badge>
                <Badge className={paymentStatusColor[selected.payment_status]}>{selected.payment_status}</Badge>
              </div>
              {selected.customer && (
                <div className="bg-secondary rounded-lg p-3 space-y-1">
                  <p className="font-semibold">Customer Details</p>
                  <p>Phone: {selected.customer.phone}</p>
                  <p>WhatsApp: {selected.customer.whatsapp}</p>
                  <p>Email: {selected.customer.email}</p>
                  <p>ID: {selected.customer.id_type} - {selected.customer.id_number}</p>
                </div>
              )}

              <div className="rounded-lg bg-secondary p-3 text-muted-foreground">
                Payment confirmation is managed from the payments screen. Once the deposit is marked as paid there, this booking will stay aligned automatically.
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="font-semibold">Update Booking Status</p>
                <div>
                  <Label>Status</Label>
                  <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as BookingStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="booking-notes">Notes</Label>
                  <Input
                    id="booking-notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Optional internal note"
                  />
                </div>
                {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelected(null)}
                    disabled={updateBookingStatus.isPending}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="gold"
                    className="flex-1"
                    onClick={handleStatusSave}
                    disabled={updateBookingStatus.isPending}
                  >
                    {updateBookingStatus.isPending ? "Saving..." : "Save Status"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
