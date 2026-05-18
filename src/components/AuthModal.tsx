import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, User, ShieldAlert, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import churchLogo from "@/assets/winners-logo.png";
import { db, isSupabaseConfigured, supabase } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AuthFormProps {
  defaultTab?: "signin" | "signup";
  onSuccess?: () => void;
  isModalContext?: boolean;
}

export function AuthForm({ defaultTab = "signup", onSuccess, isModalContext = false }: AuthFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"pastor_admin" | "media_team" | "cell_leader">("cell_leader");
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sync activeTab if defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (activeTab === "signup" && !fullName)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Real Supabase Auth Flow
        if (activeTab === "signup") {
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

            // Note: The public.users profile is automatically created via the AFTER INSERT PostgreSQL database trigger
            // but we add a brief delay and check, and if they are a cell_leader, we sign them out since they need manual approval.
            if (!isApproved) {
              await supabase.auth.signOut();
              toast.success("Registration request submitted successfully! Access is pending Pastor approval.");
              if (onSuccess) onSuccess();
              navigate({ to: "/" });
              setActiveTab("signin");
              setFullName("");
              setEmail("");
              setPassword("");
            } else {
              // Pastor/Media gets auto-logged in, verify their session is established
              toast.success("Welcome to the Winners Family! Logging you in...");
              setTimeout(() => {
                if (onSuccess) onSuccess();
                navigate({ to: "/dashboard" });
              }, 1000);
            }
          }
        } else {
          // Strict Sign In Flow
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw new Error(signInError.message);
          }

          // Fetch user profile from public.users
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
            if (onSuccess) onSuccess();
            navigate({ to: "/dashboard" });
          }, 1000);
        }
      } else {
        // Fallback Local Storage Auth Flow (Explicit DB Behavior with NO auto mock login)
        const mockUsersList = JSON.parse(localStorage.getItem("winners_church_users") || "[]");
        
        if (activeTab === "signup") {
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
            if (onSuccess) onSuccess();
            navigate({ to: "/" });
            setActiveTab("signin");
            setFullName("");
            setEmail("");
            setPassword("");
          } else {
            db.logout();
            localStorage.setItem("winners_church_session", JSON.stringify(newUser));
            toast.success("Registration successful! Logging you in...");
            setTimeout(() => {
              if (onSuccess) onSuccess();
              navigate({ to: "/dashboard" });
            }, 1000);
          }
        } else {
          // Strict Login Flow
          const existingUser = mockUsersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (!existingUser) {
            throw new Error("Account not found. Please click 'Register / Create Account' to sign up first!");
          }

          if (existingUser.role === "cell_leader" && !existingUser.is_approved) {
            throw new Error("Your cell leader account is pending approval by the Pastor. Please contact the church office.");
          }

          db.logout(); // Clear previous session
          localStorage.setItem("winners_church_session", JSON.stringify(existingUser));
          toast.success("Welcome back! Login successful.");
          setTimeout(() => {
            if (onSuccess) onSuccess();
            navigate({ to: "/dashboard" });
          }, 1000);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <img src={churchLogo} alt="Winners Chapel Int." className="h-14 w-14 mx-auto mb-3 object-contain" />
        <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">
          {activeTab === "signup" ? "Join the Winners Family" : "Sign In to Church Portal"}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed mx-auto">
          Winners Chapel International Ukonga Banana Church Portal
        </p>
      </div>

      {/* Dual Tab Toggle Switch */}
      <div className="w-full grid grid-cols-2 p-1 bg-muted rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("signup");
            setShowPassword(false);
          }}
          className={`py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
            activeTab === "signup"
              ? "bg-card text-foreground shadow-sm font-bold animate-fade-in"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Join Now (Register)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("signin");
            setShowPassword(false);
          }}
          className={`py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
            activeTab === "signin"
              ? "bg-card text-foreground shadow-sm font-bold animate-fade-in"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In (Already Member)
        </button>
      </div>

      {/* Credentials Form */}
      <form className="w-full space-y-4 md:space-y-4.5" onSubmit={handleSubmit}>
        
        {/* Full Name Field (Only on Sign Up) */}
        {activeTab === "signup" && (
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-[10px] md:text-xs font-bold text-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                placeholder="e.g. Deacon Charles Mushi"
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-[10px] md:text-xs font-bold text-foreground uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="e.g. user@winnersbanana.org"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-[10px] md:text-xs font-bold text-foreground uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-10 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Role Selector & Info Notice (Only on Sign Up) */}
        {activeTab === "signup" && (
          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-[10px] md:text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Access Role Group</span>
              <span className="text-[9px] text-primary font-medium tracking-normal lowercase">select account type</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm cursor-pointer"
            >
              <option value="pastor_admin">Pastor / Admin Account</option>
              <option value="media_team">Media Coordinator Account</option>
              <option value="cell_leader">WSF Home Cell Leader Account</option>
            </select>

            {role === "cell_leader" && (
              <div className="flex gap-2 p-2.5 rounded-lg bg-warm/30 border border-primary/10 text-primary text-[10px] md:text-xs font-semibold items-start leading-tight animate-fade-in-up">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Notice: Cell leader accounts require manual approval by the Pastor before you can access the cell reports portal.</span>
              </div>
            )}
          </div>
        )}

        {/* Remember me (Only on Sign In) */}
        {activeTab === "signin" && (
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <span className="text-primary hover:underline cursor-pointer font-bold">Forgot password?</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 rounded-lg bg-primary py-3 text-xs md:text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{activeTab === "signup" ? "Creating Account..." : "Signing In..."}</span>
            </>
          ) : (
            <span>
              {activeTab === "signup" ? "Register & Request Access" : "Sign In to Dashboard"}
            </span>
          )}
        </button>
      </form>

      {/* Security disclaimer */}
      <div className="mt-5 border-t border-border/30 pt-3.5 text-center w-full">
        <p className="text-[9px] md:text-[10px] text-muted-foreground leading-normal max-w-xs mx-auto">
          Secured with enterprise Supabase Authentication. Official church administrators, media coordinators, and cell leaders only.
        </p>
      </div>
    </div>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onOpenChange, defaultTab = "signup" }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-6 md:p-8 bg-card border border-border/50 shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <DialogHeader className="w-full hidden">
          <DialogTitle>winners chapel authentication portal</DialogTitle>
          <DialogDescription>sign in or join winners chapel dashboard portal</DialogDescription>
        </DialogHeader>
        <AuthForm
          defaultTab={defaultTab}
          isModalContext={true}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
