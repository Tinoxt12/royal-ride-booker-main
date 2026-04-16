import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { usePayments, useUpdatePaymentStatus } from "@/hooks/use-app-data";
import { Payment, PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  partial: "bg-gold text-gold-foreground",
  paid: "bg-success text-success-foreground",
  failed: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AdminPayments() {
  const { data: payments = [], isLoading, isError, error } = usePayments();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const [selected, setSelected] = useState<Payment | null>(null);
  const [editedStatus, setEditedStatus] = useState<PaymentStatus>("pending");
  const [editedReference, setEditedReference] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!selected) return;
    setEditedStatus(selected.status);
    setEditedReference(selected.reference ?? "");
    setSaveError("");
  }, [selected]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.trim().toLowerCase();
      return (
        (payment.booking?.booking_ref ?? "").toLowerCase().includes(query) ||
        (payment.booking?.customer?.full_name ?? "").toLowerCase().includes(query) ||
        (payment.reference ?? "").toLowerCase().includes(query)
      );
    });
  }, [payments, search, statusFilter]);

  const pendingCount = payments.filter((payment) => payment.status === "pending").length;

  const handleStatusSave = async () => {
    if (!selected) return;

    setSaveError("");

    try {
      const updatedPayment = await updatePaymentStatus.mutateAsync({
        id: selected.id,
        input: {
          status: editedStatus,
          reference: editedReference.trim() || undefined,
        },
      });

      setSelected(updatedPayment);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Payment status could not be updated.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-display font-bold">Payments</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending deposit{pendingCount === 1 ? "" : "s"} awaiting review.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by ref, customer, or payment reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-72"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground mb-4">Loading live payments...</p>
      )}
      {isError && (
        <p className="text-sm text-destructive mb-4">
          {error instanceof Error ? error.message : "Payments could not be loaded."}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Provider</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No payments match the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.booking?.booking_ref ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{payment.booking?.customer?.full_name ?? "-"}</TableCell>
                    <TableCell className="font-medium">${payment.amount}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{payment.payment_type}</TableCell>
                    <TableCell><Badge className={statusColor[payment.status]}>{payment.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{payment.provider}</TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs">{payment.reference || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(payment)}>
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
            <DialogTitle className="font-display">
              Payment {selected?.booking?.booking_ref ?? selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Customer:</span> {selected.booking?.customer?.full_name ?? "-"}</div>
                <div><span className="text-muted-foreground">Booking Ref:</span> {selected.booking?.booking_ref ?? "-"}</div>
                <div><span className="text-muted-foreground">Amount:</span> ${selected.amount}</div>
                <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selected.payment_type}</span></div>
                <div><span className="text-muted-foreground">Booking Status:</span> <span className="capitalize">{selected.booking?.booking_status ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Current Payment Status:</span> <span className="capitalize">{selected.status}</span></div>
                <div><span className="text-muted-foreground">Payment Reference:</span> {selected.reference || "-"}</div>
                <div><span className="text-muted-foreground">Booking Payment Ref:</span> {selected.booking?.payment_ref || "-"}</div>
              </div>

              <div className="flex gap-2">
                <Badge className={statusColor[selected.status]}>{selected.status}</Badge>
                {selected.booking?.payment_status && (
                  <Badge className={statusColor[selected.booking.payment_status]}>
                    booking {selected.booking.payment_status}
                  </Badge>
                )}
              </div>

              <div className="rounded-lg bg-secondary p-3 text-muted-foreground">
                Marking a payment as <span className="font-medium text-foreground">paid</span> will also update the linked booking payment status. If the booking is still pending, it will be moved to <span className="font-medium text-foreground">confirmed</span>.
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="font-semibold">Update Payment Status</p>
                <div>
                  <Label>Status</Label>
                  <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as PaymentStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-reference">Payment Reference</Label>
                  <Input
                    id="payment-reference"
                    value={editedReference}
                    onChange={(e) => setEditedReference(e.target.value)}
                    placeholder="Transaction ID or proof reference"
                  />
                </div>
                {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelected(null)}
                    disabled={updatePaymentStatus.isPending}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="gold"
                    className="flex-1"
                    onClick={handleStatusSave}
                    disabled={updatePaymentStatus.isPending}
                  >
                    {updatePaymentStatus.isPending ? "Saving..." : "Save Payment"}
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
