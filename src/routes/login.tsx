import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthForm } from "@/components/AuthModal";
import { db } from "@/lib/db";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Portal Sign In — Winners Chapel International" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // If already logged in, redirect to dashboard immediately
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await db.getCurrentUser();
        if (user) {
          navigate({ to: "/dashboard" });
        }
      } catch (err) {
        console.error("Error checking session on login page", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-warm/25">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-semibold">Verifying secure portal session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-warm/25 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border/50 shadow-xl p-6 md:p-8 flex flex-col items-center animate-fade-in-up">
        <AuthForm defaultTab="signin" />
      </div>
    </div>
  );
}
