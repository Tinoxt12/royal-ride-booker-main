import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/use-admin-auth";

function FullScreenMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-display font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function RequireAdminAuth() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAdminAuth();

  if (isLoading) {
    return (
      <FullScreenMessage
        title="Checking Session"
        description="Please wait while we verify your admin access."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectAuthenticatedAdmin() {
  const { isLoading, isAuthenticated } = useAdminAuth();

  if (isLoading) {
    return (
      <FullScreenMessage
        title="Loading"
        description="Please wait while we check your existing session."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
