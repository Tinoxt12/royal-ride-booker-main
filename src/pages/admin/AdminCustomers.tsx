import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useBookings, useCustomers } from "@/hooks/use-app-data";
import { Customer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";

export default function AdminCustomers() {
  const { data: customers = [], isLoading: customersLoading, isError: customersError, error: customersLoadError } = useCustomers();
  const { data: bookings = [] } = useBookings();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = customers.filter((customer) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  });

  const customerBookings = selected
    ? bookings.filter((booking) => booking.customer_id === selected.id)
    : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {customersLoading && (
        <p className="text-sm text-muted-foreground mb-4">Loading live customers...</p>
      )}
      {customersError && (
        <p className="text-sm text-destructive mb-4">
          {customersLoadError instanceof Error ? customersLoadError.message : "Customers could not be loaded."}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(customer)}>
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
            <DialogTitle className="font-display">{selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Phone:</span> {selected.phone}</div>
                <div><span className="text-muted-foreground">WhatsApp:</span> {selected.whatsapp}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">ID:</span> {selected.id_type} - {selected.id_number}</div>
                <div><span className="text-muted-foreground">Licence:</span> {selected.drivers_licence_number}</div>
                <div><span className="text-muted-foreground">Address:</span> {selected.address}</div>
              </div>
              {customerBookings.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Booking History</p>
                  <div className="space-y-2">
                    {customerBookings.map((booking) => (
                      <div key={booking.id} className="bg-secondary rounded-lg p-3 flex justify-between items-center text-xs">
                        <span className="font-mono">{booking.booking_ref}</span>
                        <span>{booking.start_date} → {booking.end_date}</span>
                        <span className="capitalize">{booking.booking_status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
