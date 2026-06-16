import type { Booking, Vehicle } from "@/types";

export type VehicleWriteInput = Omit<Vehicle, "id" | "created_at">;
export type BookingWriteInput = Omit<
  Booking,
  "id" | "created_at" | "updated_at" | "vehicle"
>;

export interface AppRepository {
  listVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  createBooking(input: BookingWriteInput): Promise<Booking>;
  getBookingByRef(bookingRef: string): Promise<Booking | undefined>;
}
