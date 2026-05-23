import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 text-primary-foreground">Winners Chapel Int.</h3>
            <p className="text-sm text-background/70 leading-relaxed">
              Ukonga Banana, Op. Minazi Mirefu Primary School,<br />
              Winners Street No. 02, Dar es Salaam, Tanzania
            </p>
            <div className="mt-4 text-sm text-background/70 space-y-1">
              <p>Email: <a href="mailto:domifaith2002@yahoo.com" className="hover:text-gold transition-colors">domifaith2002@yahoo.com</a></p>
              <p>Phone: +255 22 284 2863</p>
            </div>
            <div className="mt-4 flex gap-4">
              <a href="https://www.facebook.com/kanisala.washindi" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/winnersdsm/" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-primary-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-background/70 hover:text-gold transition-colors">
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/services"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                Services
              </Link>
              <Link
                to="/events"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                Events
              </Link>
              <Link
                to="/sermons"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                Sermons
              </Link>
              <Link
                to="/contact"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                Contact
              </Link>
              <a
                href="https://imc.faithtabernacle.org.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/70 hover:text-gold transition-colors"
              >
                Main Church
              </a>
            </nav>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-primary-foreground">Service Times</h4>
            <div className="text-sm text-background/70 space-y-2">
              <p className="font-semibold text-gold">Sunday Services:</p>
              <p className="pl-2">6:30 AM, 8:20 AM &amp; 10:15 AM</p>
              <p className="font-semibold text-gold">Midweek Service:</p>
              <p className="pl-2">Wednesday: 5:00 PM</p>
              <p className="font-semibold text-gold">Covenant Hour of Prayer:</p>
              <p className="pl-2">Mon-Fri: 5:50 AM</p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-background/10 text-center text-xs text-background/50">
          © {new Date().getFullYear()} Winners Chapel International, Ukonga Banana, Dar es Salaam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
