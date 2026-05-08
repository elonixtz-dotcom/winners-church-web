import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Winners Chapel</h3>
            <p className="text-sm text-background/70 leading-relaxed">
              Dar es Salaam, Tanzania<br />
              A member of the Living Faith Church Worldwide<br />
              Founded by Bishop David Oyedepo
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-background/70 hover:text-gold transition-colors">Home</Link>
              <Link to="/about" className="text-sm text-background/70 hover:text-gold transition-colors">About Us</Link>
              <Link to="/services" className="text-sm text-background/70 hover:text-gold transition-colors">Services</Link>
              <Link to="/contact" className="text-sm text-background/70 hover:text-gold transition-colors">Contact</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Service Times</h4>
            <div className="text-sm text-background/70 space-y-1">
              <p>Sunday: 6:30 AM, 8:15 AM &amp; 10:05 AM</p>
              <p>Wednesday Bible Study: 5:30 PM</p>
              <p>Friday Night Service: 5:30 PM</p>
            </div>
            <div className="mt-4 flex gap-3">
              <a href="https://www.instagram.com/winnersdsm" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-gold transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://threads.net/@winnersdsm" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-gold transition-colors" aria-label="Threads">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017C1.5 8.418 2.35 5.564 3.995 3.513 5.845 1.209 8.598.028 12.179.004h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.186.408-2.228 1.33-2.934.812-.621 1.94-1.01 3.275-1.127 1.205-.106 2.312-.044 3.282.182-.087-1.199-.592-2.132-1.51-2.674-.79-.468-1.822-.679-2.987-.614l-.175.012c-1.12.09-2.005.443-2.553 1.006l-1.44-1.44c.915-.932 2.174-1.46 3.716-1.583l.21-.016c1.625-.09 3.088.224 4.224.914 1.31.795 2.118 2.085 2.33 3.716.226-.058.46-.104.702-.133 2.525-.31 4.685.728 5.406 2.6.482 1.25.36 2.834-.344 4.467-.814 1.886-2.29 3.378-4.274 4.318C17.06 23.277 14.752 23.976 12.186 24zm-.09-9.873c-1.052.091-1.876.38-2.397.827-.396.341-.565.737-.538 1.198.035.635.352 1.137.918 1.452.617.343 1.42.51 2.318.464 1.085-.06 1.94-.466 2.542-1.208.432-.532.756-1.252.943-2.137-.594-.192-1.218-.343-1.86-.413-.628-.074-1.27-.11-1.926-.183z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-background/10 text-center text-xs text-background/50">
          © {new Date().getFullYear()} Winners Chapel Dar es Salaam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
