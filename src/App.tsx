import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { RedirectAuthenticatedAdmin, RequireAdminAuth } from "@/components/auth/AdminRouteGuard";

// Public pages
import Index from "./pages/Index";
import VehiclesPage from "./pages/Vehicles";
import VehicleDetailsPage from "./pages/VehicleDetails";
import BookingPage from "./pages/BookingPage";
import BookingSuccessPage from "./pages/BookingSuccess";
import BookingFailedPage from "./pages/BookingFailed";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPayments from "./pages/admin/AdminPayments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/booking/success" element={<BookingSuccessPage />} />
            <Route path="/booking/failed" element={<BookingFailedPage />} />

            {/* Admin login route */}
            <Route element={<RedirectAuthenticatedAdmin />}>
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Protected admin routes */}
            <Route element={<RequireAdminAuth />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
