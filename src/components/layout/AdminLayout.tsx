import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Car, LayoutDashboard, CarFront, CalendarCheck, Users, CreditCard,
  LogOut, Menu,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      navigate("/admin/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <Car className="h-6 w-6 text-gold" />
        <span className="font-display font-bold text-sm text-sidebar-foreground">ROYAL RIDE</span>
        <span className="text-xs text-gold font-body">Admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-gold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        {session?.user?.email && (
          <p className="px-3 pb-2 text-xs text-sidebar-foreground/50 truncate">
            {session.user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-gradient-royal fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 bg-gradient-royal shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold text-foreground">
            {adminLinks.find((l) => l.href === location.pathname)?.label ?? "Admin"}
          </h1>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
