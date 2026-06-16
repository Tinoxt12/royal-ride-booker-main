// Database entity types for Royal Ride Car Hire

export type VehicleStatus = "available" | "booked" | "maintenance";

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  plate: string;
  year: number;
  colour: string;
  seats: number;
  daily_rate: number;
  deposit_amount: number;
  status: VehicleStatus;
  photo_url: string;
  notes: string;
  created_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid" | "failed" | "cancelled";

export interface Booking {
  id: string;
  booking_ref: string;
  vehicle_id: string;
  customer_full_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  rental_total: number;
  deposit_amount: number;
  amount_due_now: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  payment_ref: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Joined field for display
  vehicle?: Vehicle;
}
