import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, UserProfile } from "@/lib/db";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

// Auth gate for the whole /dashboard/* tree. The actual dashboard shell
// (sidebar, header, role-based content) lives in the child route so it has
// access to the loaded user/role - this layout route only verifies the
// session before rendering the Outlet.
function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await db.getCurrentUser();
        if (!currentUser) {
          toast.error("Access Denied. Please sign in first.");
          navigate({ to: "/login" });
          return;
        }
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check failed", err);
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm/15 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-semibold">Verifying secure portal credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}
