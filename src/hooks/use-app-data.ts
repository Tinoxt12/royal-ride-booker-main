import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppRepository } from "@/repositories";
import type {
  BookingStatusUpdateInput,
  BookingWriteInput,
  CustomerWriteInput,
  PaymentStatusUpdateInput,
  PaymentWriteInput,
  VehicleWriteInput,
} from "@/repositories/types";

const repository = getAppRepository();

export const appQueryKeys = {
  vehicles: ["vehicles"] as const,
  vehicle: (id: string) => ["vehicles", id] as const,
  customers: ["customers"] as const,
  bookings: ["bookings"] as const,
  payments: ["payments"] as const,
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

export function useBookings() {
  return useQuery({
    queryKey: appQueryKeys.bookings,
    queryFn: () => repository.listBookings(),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: appQueryKeys.customers,
    queryFn: () => repository.listCustomers(),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: appQueryKeys.payments,
    queryFn: () => repository.listPayments(),
  });
}

export function useBookingByRef(bookingRef: string) {
  return useQuery({
    queryKey: appQueryKeys.bookingByRef(bookingRef),
    queryFn: () => repository.getBookingByRef(bookingRef),
    enabled: Boolean(bookingRef),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleWriteInput) => repository.createVehicle(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appQueryKeys.vehicles });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleWriteInput }) =>
      repository.updateVehicle(id, input),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: appQueryKeys.vehicles }),
        queryClient.invalidateQueries({ queryKey: appQueryKeys.vehicle(variables.id) }),
      ]);
    },
  });
}

export function useCreateBookingFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customer,
      booking,
      payment,
    }: {
      customer: CustomerWriteInput;
      booking: Omit<BookingWriteInput, "customer_id">;
      payment: Omit<PaymentWriteInput, "booking_id">;
    }) => {
      const persistedCustomer = await repository.upsertCustomer(customer);
      const persistedBooking = await repository.createBooking({
        ...booking,
        customer_id: persistedCustomer.id,
      });

      const persistedPayment = await repository.createPayment({
        ...payment,
        booking_id: persistedBooking.id,
      });

      return {
        customer: persistedCustomer,
        booking: persistedBooking,
        payment: persistedPayment,
      };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bookingByRef(result.booking.booking_ref) }),
      ]);
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BookingStatusUpdateInput }) =>
      repository.updateBookingStatus(id, input),
    onSuccess: async (booking) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bookings }),
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bookingByRef(booking.booking_ref) }),
      ]);
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentStatusUpdateInput }) =>
      repository.updatePaymentStatus(id, input),
    onSuccess: async (payment) => {
      const bookingRef = payment.booking?.booking_ref;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: appQueryKeys.payments }),
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bookings }),
        bookingRef
          ? queryClient.invalidateQueries({ queryKey: appQueryKeys.bookingByRef(bookingRef) })
          : Promise.resolve(),
      ]);
    },
  });
}
