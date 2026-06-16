import type { Booking, Vehicle } from "@/types";
import { getSupabaseClient } from "@/integrations/supabase/client";
import type { AppRepository, BookingWriteInput } from "./types";

type SupabaseBookingRow = Booking & {
  vehicle: Vehicle | null;
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
    async createBooking(input: BookingWriteInput) {
      const { data, error } = await supabase
        .from("bookings")
        .insert(input)
        .select("*, vehicle:vehicles(*)")
        .single();

      if (error) throw error;

      const booking = data as SupabaseBookingRow;

      return {
        ...booking,
        vehicle: booking.vehicle ?? undefined,
      };
    },
    async getBookingByRef(bookingRef) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicle:vehicles(*)")
        .eq("booking_ref", bookingRef)
        .maybeSingle();

      if (error) throw error;
      if (!data) return undefined;

      const booking = data as SupabaseBookingRow;

      return {
        ...booking,
        vehicle: booking.vehicle ?? undefined,
      };
    },
  };
}
