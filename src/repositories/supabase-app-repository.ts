import type { Booking, Customer, Payment, Vehicle } from "@/types";
import { getSupabaseClient } from "@/integrations/supabase/client";
import type {
  AppRepository,
  BookingStatusUpdateInput,
  BookingWriteInput,
  CustomerWriteInput,
  PaymentStatusUpdateInput,
  PaymentWriteInput,
  VehicleWriteInput,
} from "./types";

type SupabaseBookingRow = Booking & {
  customer: Customer | null;
  vehicle: Vehicle | null;
};

type SupabasePaymentRow = Payment & {
  booking: (Booking & { customer: Customer | null }) | null;
};

export function createSupabaseAppRepository(): AppRepository {
  const supabase = getSupabaseClient();

  return {
    async listVehicles() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data satisfies Vehicle[];
    },
    async getVehicleById(id) {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data ?? undefined;
    },
    async createVehicle(input) {
      const payload: VehicleWriteInput = {
        ...input,
        notes: input.notes ?? "",
      };

      const { data, error } = await supabase
        .from("vehicles")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;
      return data satisfies Vehicle;
    },
    async updateVehicle(id, input) {
      const payload: VehicleWriteInput = {
        ...input,
        notes: input.notes ?? "",
      };

      const { data, error } = await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data satisfies Vehicle;
    },
    async listCustomers() {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data satisfies Customer[];
    },
    async upsertCustomer(input) {
      const { data: existingCustomer, error: lookupError } = await supabase
        .from("customers")
        .select("*")
        .or(`email.eq.${input.email},id_number.eq.${input.id_number}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingCustomer) {
        const { data, error } = await supabase
          .from("customers")
          .update({
            ...input,
            notes: input.notes ?? existingCustomer.notes ?? "",
          })
          .eq("id", existingCustomer.id)
          .select("*")
          .single();

        if (error) throw error;
        return data satisfies Customer;
      }

      const { data, error } = await supabase
        .from("customers")
        .insert({
          ...input,
          notes: input.notes ?? "",
        })
        .select("*")
        .single();

      if (error) throw error;
      return data satisfies Customer;
    },
    async listBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, customer:customers(*), vehicle:vehicles(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as SupabaseBookingRow[]).map((booking) => ({
        ...booking,
        customer: booking.customer ?? undefined,
        vehicle: booking.vehicle ?? undefined,
      }));
    },
    async getBookingByRef(bookingRef) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, customer:customers(*), vehicle:vehicles(*)")
        .eq("booking_ref", bookingRef)
        .maybeSingle();

      if (error) throw error;
      if (!data) return undefined;

      const booking = data as SupabaseBookingRow;

      return {
        ...booking,
        customer: booking.customer ?? undefined,
        vehicle: booking.vehicle ?? undefined,
      };
    },
    async createBooking(input) {
      const { data, error } = await supabase
        .from("bookings")
        .insert(input)
        .select("*, customer:customers(*), vehicle:vehicles(*)")
        .single();

      if (error) throw error;

      const booking = data as SupabaseBookingRow;

      return {
        ...booking,
        customer: booking.customer ?? undefined,
        vehicle: booking.vehicle ?? undefined,
      };
    },
    async updateBookingStatus(id, input) {
      const { data, error } = await supabase
        .from("bookings")
        .update({
          booking_status: input.booking_status,
          notes: input.notes ?? "",
        })
        .eq("id", id)
        .select("*, customer:customers(*), vehicle:vehicles(*)")
        .single();

      if (error) throw error;

      const booking = data as SupabaseBookingRow;

      return {
        ...booking,
        customer: booking.customer ?? undefined,
        vehicle: booking.vehicle ?? undefined,
      };
    },
    async listPayments() {
      const { data, error } = await supabase
        .from("payments")
        .select("*, booking:bookings(*, customer:customers(*))")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as SupabasePaymentRow[]).map((payment) => ({
        ...payment,
        booking: payment.booking ?? undefined,
      }));
    },
    async createPayment(input) {
      const { data, error } = await supabase
        .from("payments")
        .insert(input)
        .select("*, booking:bookings(*, customer:customers(*))")
        .single();

      if (error) throw error;

      const payment = data as SupabasePaymentRow;

      return {
        ...payment,
        booking: payment.booking ?? undefined,
      };
    },
    async updatePaymentStatus(id, input) {
      const { data: existingPayment, error: existingPaymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", id)
        .single();

      if (existingPaymentError) throw existingPaymentError;

      const paymentUpdate = {
        status: input.status,
        reference: input.reference ?? existingPayment.reference,
        paid_at: input.status === "paid" ? new Date().toISOString() : existingPayment.paid_at,
      };

      const { data, error } = await supabase
        .from("payments")
        .update(paymentUpdate)
        .eq("id", id)
        .select("*, booking:bookings(*, customer:customers(*))")
        .single();

      if (error) throw error;

      const existingBooking = data.booking;
      if (existingBooking) {
        const nextBookingStatus =
          input.status === "paid" && existingBooking.booking_status === "pending"
            ? "confirmed"
            : existingBooking.booking_status;

        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            payment_status: input.status,
            payment_ref: input.reference ?? existingBooking.payment_ref,
            booking_status: nextBookingStatus,
          })
          .eq("id", existingBooking.id);

        if (bookingError) throw bookingError;
      }

      const { data: refreshedPaymentData, error: refreshedPaymentError } = await supabase
        .from("payments")
        .select("*, booking:bookings(*, customer:customers(*))")
        .eq("id", id)
        .single();

      if (refreshedPaymentError) throw refreshedPaymentError;

      const payment = refreshedPaymentData as SupabasePaymentRow;

      return {
        ...payment,
        booking: payment.booking ?? undefined,
      };
    },
  };
}
