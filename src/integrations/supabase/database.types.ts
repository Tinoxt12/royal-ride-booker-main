export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          amount_due_now: number;
          booking_ref: string;
          booking_status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
          created_at: string;
          customer_id: string;
          daily_rate: number;
          deposit_amount: number;
          end_date: string;
          id: string;
          notes: string | null;
          payment_ref: string | null;
          payment_status: "pending" | "partial" | "paid" | "failed" | "cancelled";
          rental_total: number;
          start_date: string;
          total_days: number;
          updated_at: string;
          vehicle_id: string;
        };
        Insert: {
          amount_due_now: number;
          booking_ref: string;
          booking_status?: "pending" | "confirmed" | "active" | "completed" | "cancelled";
          created_at?: string;
          customer_id: string;
          daily_rate: number;
          deposit_amount: number;
          end_date: string;
          id?: string;
          notes?: string | null;
          payment_ref?: string | null;
          payment_status?: "pending" | "partial" | "paid" | "failed" | "cancelled";
          rental_total: number;
          start_date: string;
          total_days: number;
          updated_at?: string;
          vehicle_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      customers: {
        Row: {
          address: string;
          created_at: string;
          drivers_licence_number: string;
          email: string;
          full_name: string;
          id: string;
          id_number: string;
          id_type: string;
          notes: string | null;
          phone: string;
          whatsapp: string;
        };
        Insert: {
          address: string;
          created_at?: string;
          drivers_licence_number: string;
          email: string;
          full_name: string;
          id?: string;
          id_number: string;
          id_type: string;
          notes?: string | null;
          phone: string;
          whatsapp: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      payments: {
        Row: {
          amount: number;
          booking_id: string;
          created_at: string;
          gateway_response: string | null;
          id: string;
          paid_at: string | null;
          payment_type: "deposit" | "balance" | "full_rental";
          poll_url: string | null;
          provider: "manual";
          reference: string | null;
          status: "pending" | "partial" | "paid" | "failed" | "cancelled";
        };
        Insert: {
          amount: number;
          booking_id: string;
          created_at?: string;
          gateway_response?: string | null;
          id?: string;
          paid_at?: string | null;
          payment_type: "deposit" | "balance" | "full_rental";
          poll_url?: string | null;
          provider?: "manual";
          reference?: string | null;
          status?: "pending" | "partial" | "paid" | "failed" | "cancelled";
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      vehicles: {
        Row: {
          colour: string;
          created_at: string;
          daily_rate: number;
          deposit_amount: number;
          id: string;
          name: string;
          notes: string | null;
          photo_url: string;
          plate: string;
          seats: number;
          status: "available" | "booked" | "maintenance";
          type: string;
          year: number;
        };
        Insert: {
          colour: string;
          created_at?: string;
          daily_rate: number;
          deposit_amount: number;
          id?: string;
          name: string;
          notes?: string | null;
          photo_url: string;
          plate: string;
          seats: number;
          status?: "available" | "booked" | "maintenance";
          type: string;
          year: number;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
