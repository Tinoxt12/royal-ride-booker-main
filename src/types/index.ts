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

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  id_number: string;
  id_type: string;
  drivers_licence_number: string;
  address: string;
  notes: string;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_ref: string;
  customer_id: string;
  vehicle_id: string;
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
  // Joined fields for display
  customer?: Customer;
  vehicle?: Vehicle;
}

export type PaymentType = "deposit" | "balance" | "full_rental";
export type PaymentProvider = "manual";

export interface Payment {
  id: string;
  booking_id: string;
  payment_type: PaymentType;
  provider: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  reference: string;
  poll_url: string;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  // Joined
  booking?: Booking;
}
