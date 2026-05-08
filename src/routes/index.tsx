import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-worship.jpg";
import churchLogo from "@/assets/winners-logo.png";
import spiritualEmphasis from "@/assets/spiritual-emphasis.jpg";
import liberationService from "@/assets/liberation-service.jpg";
import liberationMandate from "@/assets/liberation-mandate.jpg";
import covenantFamily from "@/assets/covenant-family.jpg";
import covenantFamilyDay from "@/assets/covenant-family-day.jpg";
import choirWorship from "@/assets/choir-worship.jpg";
import vengeanceService from "@/assets/vengeance-service.jpg";
import congregationPrayer from "@/assets/congregation-prayer.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={congregationPrayer}
          alt="Worship at Winners Chapel Dar es Salaam"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1024}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <img src={churchLogo} alt="" className="h-20 w-20 mx-auto mb-6 animate-fade-in-up" />
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight animate-fade-in-up">
            Welcome to the<br />Winners Family
          </h1>
          <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 animate-fade-in-up-delay">
            Winners Chapel Dar es Salaam — Living Faith Church
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            >
              Join a Service
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10 hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="bg-warm py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Sunday Services</h2>
          <p className="mt-3 text-muted-foreground">Join us every Sunday for powerful worship and the Word</p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { time: "6:30 AM", label: "First Service", desc: "Start your day in God's presence" },
              { time: "8:15 AM", label: "Second Service", desc: "Mid-morning worship experience" },
              { time: "10:05 AM", label: "Third Service", desc: "Late morning celebration" },
            ].map((service) => (
              <div key={service.time} className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="text-3xl font-heading font-bold text-primary">{service.time}</div>
                <div className="mt-2 font-semibold text-foreground">{service.label}</div>
                <p className="mt-1 text-sm text-muted-foreground">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Event Banner */}
      <section className="bg-primary py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={spiritualEmphasis}
                alt="Week of Spiritual Emphasis — May 2026"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="text-primary-foreground">
              <span className="inline-block bg-primary-foreground/20 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Upcoming Event</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">Week of Spiritual Emphasis</h2>
              <p className="mt-4 text-primary-foreground/80 text-lg">May 6th – 8th, 2026 · 5:00 PM</p>
              <p className="mt-2 text-primary-foreground/70">Ministering: Pst. Leba Daniel and other ministers</p>
              <p className="mt-1 text-primary-foreground/70">Winners Chapel International, Banana, Ukonga</p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/90 hover:scale-105"
              >
                Get Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* From Our Community */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">From Our Community</h2>
            <p className="mt-3 text-muted-foreground">Life at Winners Chapel Dar es Salaam</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { src: choirWorship, alt: "Choir leading worship at Winners Chapel", label: "Worship" },
              { src: vengeanceService, alt: "Covenant of Vengeance — Pastor ministering", label: "Anointing Service" },
              { src: congregationPrayer, alt: "Congregation in prayer at Winners Chapel", label: "Prayer" },
              { src: liberationMandate, alt: "45 Years of the Liberation Mandate", label: "Liberation Mandate" },
              { src: liberationService, alt: "Liberation Anniversary Thanksgiving Service", label: "Thanksgiving" },
              { src: covenantFamily, alt: "Covenant Family Day — Church members", label: "Family Day" },
              { src: covenantFamilyDay, alt: "Covenant Family Day — Pastor ministering", label: "Covenant Day" },
            ].map((item) => (
              <a
                key={item.label}
                href="https://www.instagram.com/winnersdsm"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-end p-3">
                  <span className="text-primary-foreground text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="https://www.instagram.com/winnersdsm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Follow @winnersdsm on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Midweek */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Midweek Services</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Stay connected throughout the week with our midweek gatherings. 
                Deepen your faith through Bible Study on Wednesdays and experience 
                breakthrough at our Friday night services.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Wednesday Bible Study</h3>
                    <p className="text-sm text-muted-foreground">5:30 PM — Deep dive into the Word</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Friday Night Service</h3>
                    <p className="text-sm text-muted-foreground">5:30 PM — Prophetic &amp; breakthrough service</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 text-center border border-border/50">
              <blockquote className="font-heading text-xl md:text-2xl font-semibold text-foreground italic leading-relaxed">
                "The entrance of thy words giveth light; it giveth understanding unto the simple."
              </blockquote>
              <cite className="mt-4 block text-sm text-muted-foreground not-italic">— Psalm 119:130</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground">Visit Us Today</h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Banana, Ukonga — Dar es Salaam, Tanzania
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/90 hover:scale-105"
          >
            Get Directions
          </Link>
        </div>
      </section>
    </>
  );
}
