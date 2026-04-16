import type { Booking, Customer, Payment, Vehicle } from "@/types";

export type VehicleWriteInput = Omit<Vehicle, "id" | "created_at">;
export type CustomerWriteInput = Omit<Customer, "id" | "created_at" | "notes"> & {
  notes?: string;
};
export type BookingWriteInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at" | "customer" | "vehicle"
>;
export type BookingStatusUpdateInput = Pick<Booking, "booking_status" | "notes">;
export type PaymentWriteInput = Omit<Payment, "id" | "created_at" | "booking">;
export type PaymentStatusUpdateInput = Pick<Payment, "status"> & {
  reference?: string;
};

export interface AppRepository {
  listVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  createVehicle(input: VehicleWriteInput): Promise<Vehicle>;
  updateVehicle(id: string, input: VehicleWriteInput): Promise<Vehicle>;
  listCustomers(): Promise<Customer[]>;
  upsertCustomer(input: CustomerWriteInput): Promise<Customer>;
  listBookings(): Promise<Booking[]>;
  getBookingByRef(bookingRef: string): Promise<Booking | undefined>;
  createBooking(input: BookingWriteInput): Promise<Booking>;
  updateBookingStatus(id: string, input: BookingStatusUpdateInput): Promise<Booking>;
  listPayments(): Promise<Payment[]>;
  createPayment(input: PaymentWriteInput): Promise<Payment>;
  updatePaymentStatus(id: string, input: PaymentStatusUpdateInput): Promise<Payment>;
}
