import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppRepository } from "@/repositories";
import type { BookingWriteInput } from "@/repositories/types";

const repository = getAppRepository();

export const appQueryKeys = {
  vehicles: ["vehicles"] as const,
  vehicle: (id: string) => ["vehicles", id] as const,
  bookingByRef: (bookingRef: string) => ["bookings", "ref", bookingRef] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: appQueryKeys.vehicles,
    queryFn: () => repository.listVehicles(),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: appQueryKeys.vehicle(id),
    queryFn: () => repository.getVehicleById(id),
    enabled: Boolean(id),
  });
}

export function useBookingByRef(bookingRef: string) {
  return useQuery({
    queryKey: appQueryKeys.bookingByRef(bookingRef),
    queryFn: () => repository.getBookingByRef(bookingRef),
    enabled: Boolean(bookingRef),
  });
}

export function useCreateBookingFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (booking: BookingWriteInput) => repository.createBooking(booking),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: appQueryKeys.bookingByRef(result.booking_ref) });
    },
  });
}
