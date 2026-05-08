import { Link } from "@tanstack/react-router";
import { useState } from "react";
import churchLogo from "@/assets/winners-logo.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={churchLogo} alt="Winners Chapel Logo" className="h-10 w-10 md:h-12 md:w-12" />
            <div>
              <span className="font-heading text-lg md:text-xl font-bold text-foreground leading-tight block">Winners Chapel</span>
              <span className="text-xs text-muted-foreground">Dar es Salaam</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Home</Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>About</Link>
            <Link to="/services" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Services</Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>Contact</Link>
          </nav>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col px-4 py-4 gap-3">
            <Link to="/" className="text-sm font-medium py-2 text-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" className="text-sm font-medium py-2 text-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/services" className="text-sm font-medium py-2 text-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link to="/contact" className="text-sm font-medium py-2 text-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
