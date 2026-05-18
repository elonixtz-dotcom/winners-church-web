import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import churchLogo from "@/assets/winners-logo.png";
import { db, UserProfile } from "@/lib/db";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"signin" | "signup">("signup");

  // Check login state to toggle Login button to Dashboard link dynamically
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await db.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error fetching current user in header", err);
      }
    };
    checkUser();
    
    // Periodically sync user status (or on focus) to keep navbar accurate
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={churchLogo} alt="Winners Chapel Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            <div>
              <span className="font-heading text-base md:text-lg font-bold text-foreground leading-tight block">
                Winners Chapel Int.
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground block font-medium uppercase tracking-wider">
                Ukonga Banana, DSM
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              Services
            </Link>
            <Link
              to="/events"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              Events
            </Link>
            <Link
              to="/sermons"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              Sermons
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
              activeProps={{ className: "text-primary font-semibold border-b-2 border-primary" }}
            >
              Contact
            </Link>
            <a
              href="https://imc.faithtabernacle.org.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-1.5"
            >
              Main Church
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthDefaultTab("signup");
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
              >
                Join Now
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            {/* Show Quick Icon Dashboard if logged in on mobile */}
            {user && (
              <Link
                to="/dashboard"
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
              </Link>
            )}

            <button
              className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in-up">
          <nav className="flex flex-col px-4 py-4 gap-2">
            <Link
              to="/"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/events"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/sermons"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sermons
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            <a
              href="https://imc.faithtabernacle.org.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted text-foreground transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Main Church
            </a>
            <div className="h-px bg-border my-2" />
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-primary/10 text-primary text-center transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAuthDefaultTab("signup");
                  setIsAuthModalOpen(true);
                }}
                className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-primary text-primary-foreground text-center shadow-md transition-colors cursor-pointer w-full"
              >
                Join Now
              </button>
            )}
          </nav>
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        defaultTab={authDefaultTab}
      />
    </header>
  );
}
