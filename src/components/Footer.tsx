import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 text-primary-foreground">Winners Chapel Int.</h3>
            <p className="text-sm text-background/70 leading-relaxed">
              Ukonga Banana, Dar es Salaam, Tanzania
              <br />
              A branch of the Living Faith Church Worldwide
              <br />
              Founded by Bishop David Oyedepo
            </p>
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
              <p className="pl-2">6:30 AM, 8:15 AM &amp; 10:05 AM</p>
              <p className="font-semibold text-gold">Midweek Services:</p>
              <p className="pl-2">Wednesday Bible Study: 5:30 PM</p>
              <p className="pl-2">Friday Night Service: 5:30 PM</p>
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
