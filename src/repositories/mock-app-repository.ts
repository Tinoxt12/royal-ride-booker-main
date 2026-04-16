import {
  getBookingById,
  getCustomerById,
  getBookingsWithDetails,
  getPaymentsWithBookings,
  getVehicleById as getMockVehicleById,
  mockBookings,
  mockCustomers,
  mockPayments,
  mockVehicles,
} from "@/data/mock-data";
import { generateBookingRef } from "@/lib/booking";
import type {
  AppRepository,
  BookingStatusUpdateInput,
  BookingWriteInput,
  CustomerWriteInput,
  PaymentStatusUpdateInput,
  PaymentWriteInput,
  VehicleWriteInput,
} from "./types";

function buildVehicle(input: VehicleWriteInput) {
  return {
    ...input,
    id: `mock-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
}

export function createMockAppRepository(): AppRepository {
  return {
    async listVehicles() {
      return mockVehicles;
    },
    async getVehicleById(id) {
      return getMockVehicleById(id);
    },
    async createVehicle(input) {
      const vehicle = buildVehicle(input);
      mockVehicles.unshift(vehicle);
      return vehicle;
    },
    async updateVehicle(id, input) {
      const index = mockVehicles.findIndex((vehicle) => vehicle.id === id);
      if (index === -1) {
        throw new Error("Vehicle not found.");
      }

      const updatedVehicle = {
        ...mockVehicles[index],
        ...input,
      };

      mockVehicles[index] = updatedVehicle;
      return updatedVehicle;
    },
    async listCustomers() {
      return mockCustomers;
    },
    async upsertCustomer(input) {
      const existingCustomer = mockCustomers.find(
        (customer) =>
          customer.email.toLowerCase() === input.email.toLowerCase() ||
          customer.id_number.toLowerCase() === input.id_number.toLowerCase(),
      );

      if (existingCustomer) {
        Object.assign(existingCustomer, {
          ...existingCustomer,
          ...input,
          notes: input.notes ?? existingCustomer.notes,
        });

        return existingCustomer;
      }

      const customer = {
        ...input,
        id: `c${Date.now()}`,
        notes: input.notes ?? "",
        created_at: new Date().toISOString(),
      };

      mockCustomers.unshift(customer);
      return customer;
    },
    async listBookings() {
      return getBookingsWithDetails();
    },
    async getBookingByRef(bookingRef) {
      const booking = mockBookings.find((entry) => entry.booking_ref === bookingRef);

      if (!booking) return undefined;

      return {
        ...booking,
        customer: getCustomerById(booking.customer_id),
        vehicle: getMockVehicleById(booking.vehicle_id),
      };
    },
    async createBooking(input) {
      const booking = {
        ...input,
        id: `b${Date.now()}`,
        payment_ref: input.payment_ref ?? "",
        notes: input.notes ?? "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockBookings.unshift(booking);

      return {
        ...booking,
        customer: getCustomerById(booking.customer_id),
        vehicle: getMockVehicleById(booking.vehicle_id),
      };
    },
    async updateBookingStatus(id, input) {
      const index = mockBookings.findIndex((booking) => booking.id === id);
      if (index === -1) {
        throw new Error("Booking not found.");
      }

      const updatedBooking = {
        ...mockBookings[index],
        booking_status: input.booking_status,
        notes: input.notes ?? mockBookings[index].notes,
        updated_at: new Date().toISOString(),
      };

      mockBookings[index] = updatedBooking;

      return {
        ...updatedBooking,
        customer: getCustomerById(updatedBooking.customer_id),
        vehicle: getMockVehicleById(updatedBooking.vehicle_id),
      };
    },
    async listPayments() {
      return getPaymentsWithBookings();
    },
    async createPayment(input) {
      const payment = {
        ...input,
        id: `p${Date.now()}`,
        reference: input.reference || generateBookingRef(),
        poll_url: input.poll_url ?? "",
        gateway_response: input.gateway_response ?? "",
        created_at: new Date().toISOString(),
      };

      mockPayments.unshift(payment);

      return {
        ...payment,
        booking: getBookingById(payment.booking_id),
      };
    },
    async updatePaymentStatus(id, input) {
      const paymentIndex = mockPayments.findIndex((payment) => payment.id === id);
      if (paymentIndex === -1) {
        throw new Error("Payment not found.");
      }

      const existingPayment = mockPayments[paymentIndex];
      const updatedPayment = {
        ...existingPayment,
        status: input.status,
        reference: input.reference ?? existingPayment.reference,
        paid_at: input.status === "paid" ? new Date().toISOString() : existingPayment.paid_at,
      };

      mockPayments[paymentIndex] = updatedPayment;

      const bookingIndex = mockBookings.findIndex((booking) => booking.id === updatedPayment.booking_id);
      if (bookingIndex !== -1) {
        const existingBooking = mockBookings[bookingIndex];
        const nextBookingStatus =
          input.status === "paid" && existingBooking.booking_status === "pending"
            ? "confirmed"
            : existingBooking.booking_status;

        mockBookings[bookingIndex] = {
          ...existingBooking,
          payment_status: input.status,
          payment_ref: input.reference ?? existingBooking.payment_ref,
          booking_status: nextBookingStatus,
          updated_at: new Date().toISOString(),
        };
      }

      return {
        ...updatedPayment,
        booking: getBookingById(updatedPayment.booking_id),
      };
    },
  };
}
