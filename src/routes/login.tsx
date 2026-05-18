import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import churchLogo from "@/assets/winners-logo.png";
import { db, isSupabaseConfigured, supabase } from "@/lib/db";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"pastor_admin" | "media_team" | "cell_leader" >("pastor_admin");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard immediately
  useEffect(() => {
    const checkSession = async () => {
      const user = await db.getCurrentUser();
      if (user) {
        navigate({ to: "/dashboard" });
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !fullName)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Real Supabase Auth Flow
        if (isRegistering) {
          // User Registration Flow
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: role,
              }
            }
          });

          if (signUpError) {
            throw new Error(signUpError.message);
          }

          if (signUpData.user) {
            const isApproved = role !== "cell_leader";
            // Create user profile record in public.users table
            const { error: profileError } = await supabase
              .from("users")
              .insert([
                {
                  id: signUpData.user.id,
                  full_name: fullName,
                  email: email,
                  role: role,
                  is_approved: isApproved,
                  created_at: new Date().toISOString(),
                }
              ]);

            if (profileError) {
              console.error("Profile creation error", profileError);
            }

            if (!isApproved) {
              await supabase.auth.signOut();
              toast.success("Account request submitted successfully! Pending Pastor approval.");
              setIsRegistering(false);
              setFullName("");
              setEmail("");
              setPassword("");
            } else {
              // Auto sign in for pastor/media
              const { error: signInErr } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (signInErr) throw signInErr;
              toast.success("Registration successful! Logging you in...");
              setTimeout(() => {
                navigate({ to: "/dashboard" });
              }, 800);
            }
          }
        } else {
          // Strict Sign In Flow
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw new Error("Invalid login credentials. Please register your account first!");
          }

          // Fetch user profile
          const { data: profile, error: profileErr } = await supabase
            .from("users")
            .select("role, is_approved")
            .eq("id", signInData.user.id)
            .single();

          if (profileErr || !profile) {
            await supabase.auth.signOut();
            throw new Error("Your user profile was not found. Please register a new account.");
          }

          if (profile.role === "cell_leader" && !profile.is_approved) {
            await supabase.auth.signOut();
            throw new Error("Your cell leader account is pending approval by the Pastor. Please contact the church office.");
          }

          toast.success("Welcome back! Login successful.");
          setTimeout(() => {
            navigate({ to: "/dashboard" });
          }, 800);
        }
      } else {
        // Fallback Local Storage Auth Flow (Explicit DB Behavior with NO auto mock login)
        const mockUsersList = JSON.parse(localStorage.getItem("winners_church_users") || "[]");
        
        if (isRegistering) {
          // Registration Flow
          const existingUser = mockUsersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            throw new Error("An account with this email address already exists! Please Sign In.");
          }

          const isApproved = role !== "cell_leader";
          const newUser = {
            id: crypto.randomUUID(),
            full_name: fullName,
            email: email,
            role: role,
            is_approved: isApproved,
            created_at: new Date().toISOString(),
          };

          mockUsersList.push(newUser);
          localStorage.setItem("winners_church_users", JSON.stringify(mockUsersList));

          if (!isApproved) {
            toast.success("Access requested successfully! Please wait for Pastor's approval.");
            setIsRegistering(false);
            setFullName("");
            setEmail("");
            setPassword("");
          } else {
            db.logout();
            localStorage.setItem("winners_church_session", JSON.stringify(newUser));
            toast.success("Registration successful! Logging you in...");
            setTimeout(() => {
              navigate({ to: "/dashboard" });
            }, 800);
          }
        } else {
          // Strict Login Flow
          const existingUser = mockUsersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (!existingUser) {
            throw new Error("Account not found. Please click 'Register' at the bottom to sign up first!");
          }

          if (existingUser.role === "cell_leader" && !existingUser.is_approved) {
            throw new Error("Your cell leader account is pending approval by the Pastor. Please contact the church office.");
          }

          db.logout(); // Clear previous session
          localStorage.setItem("winners_church_session", JSON.stringify(existingUser));
          toast.success("Welcome back! Login successful.");
          setTimeout(() => {
            navigate({ to: "/dashboard" });
          }, 800);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-warm/25 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border/50 shadow-xl p-8 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img src={churchLogo} alt="Winners Chapel Int." className="h-16 w-16 mx-auto mb-4 object-contain" />
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {isRegistering ? "Create Portal Account" : "Sign In to Portal"}
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
            Winners Chapel International Ukonga Banana Church Management System
          </p>
        </div>

        {/* Credentials Form */}
        <form className="w-full space-y-5" onSubmit={handleLogin}>
          {/* Full name input (Only during registration) */}
          {isRegistering && (
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                placeholder="e.g. Deacon Charles Mushi"
              />
            </div>
          )}

          {/* Email input */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="e.g. pastor@winnersbanana.org"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Role Selector */}
          <div>
            <label htmlFor="role" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Access Role Group</span>
              <span className="text-[9px] text-primary lowercase tracking-normal">select access level</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm cursor-pointer"
            >
              <option value="pastor_admin">Pastor / Admin Dashboard</option>
              <option value="media_team">Media Team Dashboard</option>
              <option value="cell_leader">Home Cell Leader Dashboard</option>
            </select>
          </div>

          {/* Remember me & Forgot (Only during sign-in) */}
          {!isRegistering && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <span className="text-primary hover:underline cursor-pointer font-medium">Forgot password?</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                <span>{isRegistering ? "Registering..." : "Signing In..."}</span>
              </>
            ) : (
              <span>{isRegistering ? "Register & Request Access" : "Sign In to Dashboard"}</span>
            )}
          </button>
        </form>

        {/* Dynamic toggle link */}
        <div className="mt-6 text-center w-full">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setFullName("");
            }}
            className="text-xs text-primary font-bold hover:underline transition-all cursor-pointer"
          >
            {isRegistering
              ? "Already have an authorized account? Sign In"
              : "Need a church dashboard account? Register here"}
          </button>
        </div>

        {/* Security notice */}
        <div className="mt-8 border-t border-border/30 pt-4 text-center w-full">
          <p className="text-[10px] text-muted-foreground leading-normal max-w-xs mx-auto">
            Secured using Supabase authentication. Authorized church leaders and media coordinators only.
          </p>
        </div>
      </div>
    </div>
  );
}
