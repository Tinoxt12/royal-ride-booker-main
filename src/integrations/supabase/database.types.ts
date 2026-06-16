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
          customer_email: string;
          customer_full_name: string;
          customer_phone: string;
          customer_whatsapp: string;
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
          customer_email: string;
          customer_full_name: string;
          customer_phone: string;
          customer_whatsapp: string;
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
