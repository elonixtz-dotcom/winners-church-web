import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import churchLogo from "@/assets/winners-logo.png";
import { db, UserProfile } from "@/lib/db";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

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

  const handleLogout = async () => {
    try {
      await db.logout();
      toast.success("Signed out successfully.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

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

  // Render role friendly labels
  const getRoleLabel = (role: UserProfile["role"]) => {
    switch (role) {
      case "pastor_admin":
        return "Pastor / Admin";
      case "media_team":
        return "Media Coordinator";
      case "cell_leader":
        return "Home Cell Leader";
      default:
        return "Church Member";
    }
  };

  return (
    <div className="min-h-screen bg-warm/10 flex flex-col">
      {/* Dashboard Custom Top Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <img src={churchLogo} alt="Winners Chapel Logo" className="h-9 w-9 object-contain" />
              <div className="hidden sm:block">
                <span className="font-heading text-sm font-bold text-foreground block">
                  Church Portal
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">
                  Winners Chapel Intl. Ukonga Banana
                </span>
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-foreground block leading-tight">
                  {user.full_name}
                </span>
                <span className="inline-block mt-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors text-xs font-bold flex items-center gap-1.5 focus:outline-none"
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
