import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import congregationPrayer from "@/assets/congregation-prayer.jpg";
import choirWorship from "@/assets/choir-worship.jpg";
import vengeanceService from "@/assets/vengeance-service.jpg";
import liberationService from "@/assets/liberation-service.jpg";
import covenantFamily from "@/assets/covenant-family.jpg";
import covenantFamilyDay from "@/assets/covenant-family-day.jpg";
import { db, ChurchEvent, Announcement } from "@/lib/db";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const heroPhotos = [
  congregationPrayer,
  choirWorship,
  vengeanceService,
  liberationService,
  covenantFamily,
  covenantFamilyDay,
];

const serviceTimes = [
  { time: "6:30", period: "AM", label: "First Service", desc: "A fresh early morning encounter in God's presence" },
  { time: "8:15", period: "AM", label: "Second Service", desc: "A glorious mid-morning praise and teaching service" },
  { time: "10:05", period: "AM", label: "Third Service", desc: "A late-morning breakthrough celebration service" },
];

const midweekServices = [
  { index: "01", title: "Wednesday Communion Service", detail: "5:00 PM — In-depth teaching of the Word and Communion" },
  { index: "02", title: "Friday Night Breakthrough", detail: "5:30 PM — Anointed prophetic prayer and breakthrough service" },
];

function HomePage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedEvents, fetchedAnnouncements] = await Promise.all([
          db.getEvents(),
          db.getAnnouncements(),
        ]);
        // Only show actual upcoming events (max 3)
        const nowTime = new Date();
        const futureEvents = fetchedEvents.filter(
          (e) => new Date(e.event_date) >= nowTime
        );
        setEvents(futureEvents.slice(0, 3));
        setAnnouncements(fetchedAnnouncements.slice(0, 3));
      } catch (err) {
        console.error("Error loading home page data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[88vh] min-h-[560px] flex items-end overflow-hidden">
        {heroPhotos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Worship at Winners Chapel Dar es Salaam"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
              i === heroIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <img src={churchLogo} alt="Winners Church" className="h-12 w-12 object-contain mb-6 animate-fade-in-up" />
          <span className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-3 animate-fade-in-up">
            Ukonga Banana &middot; Dar es Salaam
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-[3.6rem] font-semibold text-primary-foreground leading-[1.05] tracking-tight max-w-2xl animate-fade-in-up">
            Welcome to Winners Chapel International
          </h1>
          <p className="mt-5 text-base md:text-lg text-primary-foreground/85 max-w-md leading-relaxed animate-fade-in-up-delay">
            Living Faith Church Worldwide. Raising champions through the preaching of the Word of Faith.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-2">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-3.5 text-sm font-semibold text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-foreground/95 active:translate-y-0 active:scale-[0.98] shadow-lg"
            >
              Our Service Times
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-foreground/10 hover:border-primary-foreground/50 active:translate-y-0 active:scale-[0.98]"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Foundation + Announcements */}
      <section className="py-24 md:py-28 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12 lg:gap-20">
          <div>
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-5">
              Our Foundation
            </span>
            <blockquote className="font-heading text-2xl md:text-[1.7rem] font-medium italic leading-[1.45] text-foreground max-w-xl">
              "The hour has come to liberate the world from all oppressions of the devil through the preaching of the word of faith, and I am sending you to undertake this task."
            </blockquote>
            <div className="w-10 h-0.5 bg-primary my-6" />
            <p className="text-sm leading-relaxed text-muted-foreground max-w-lg">
              These prophetic words, spoken to Bishop David Oyedepo on May 1-2, 1981, form the bedrock of our ministry. Since then, we have witnessed countless testimonies of spiritual freedom, physical healing, academic success, and financial breakthrough in the lives of believers globally.
            </p>
            <div className="mt-8 text-xs font-semibold text-foreground">
              Living Faith Church Worldwide
              <span className="block mt-0.5 text-[11px] font-normal text-muted-foreground">Winners Chapel International</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between border-b border-border/40 pb-3.5 mb-1">
              <h3 className="font-heading text-lg font-bold text-foreground">Announcements</h3>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>

            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs font-semibold text-foreground">Stay Tuned!</p>
                <p className="text-[11px] text-muted-foreground mt-1">There are no announcements posted at the moment.</p>
              </div>
            ) : (
              <div className="flex flex-col max-h-[300px] overflow-auto">
                {announcements.map((ann, i) => (
                  <div key={ann.id} className={`py-4 ${i < announcements.length - 1 ? "border-b border-border/40" : ""}`}>
                    <h4 className="text-[13.5px] font-semibold text-foreground mb-1">{ann.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-3">
            <div>
              <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Stay Connected</span>
              <h2 className="font-heading text-3xl font-semibold text-foreground">Upcoming Events</h2>
            </div>
            <Link to="/events" className="group text-xs font-semibold text-primary flex items-center gap-1.5">
              View All Events
              <svg className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="border border-border/40 rounded-xl p-10 text-center max-w-2xl mx-auto">
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">No Scheduled Events</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We are currently planning upcoming services and special programs. Keep visiting our site or join us in our Sunday services to stay informed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="group rounded-xl overflow-hidden border border-border/40 bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_28px_-18px_oklch(0.18_0.03_30_/_22%)]">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {evt.image_url && !brokenImages.has(evt.id) ? (
                      <img
                        src={evt.image_url}
                        alt={evt.title}
                        onError={() => setBrokenImages((prev) => new Set(prev).add(evt.id))}
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                        <img src={churchLogo} alt="" className="h-12 w-12 opacity-35 object-contain" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-card rounded-md px-2.5 py-1.5 text-center leading-none">
                      <span className="block text-[9.5px] uppercase font-bold text-primary tracking-wide">
                        {new Date(evt.event_date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="block text-sm font-bold text-foreground mt-0.5">
                        {new Date(evt.event_date).toLocaleDateString("en-US", { day: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-base font-bold text-foreground line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(evt.event_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="font-semibold text-primary">Details</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sunday Service Times */}
      <section className="bg-warm/30 py-24 md:py-28 border-y border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Our Weekly Encounters</span>
            <h2 className="font-heading text-3xl font-semibold text-foreground">Sunday Service Times</h2>
            <p className="mt-2.5 text-sm text-muted-foreground">Join us in Ukonga Banana for any of our three glorious Sunday services</p>
          </div>

          <div className="border-t border-border/40">
            {serviceTimes.map((service) => (
              <div
                key={service.time}
                className="grid grid-cols-1 sm:grid-cols-[140px_1fr_2fr] items-center gap-2 sm:gap-6 py-6 border-b border-border/40 transition-colors duration-150 hover:bg-warm/40"
              >
                <div className="font-heading text-3xl font-semibold text-primary">
                  {service.time}<span className="text-sm ml-1">{service.period}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">{service.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Winners Community</span>
            <h2 className="font-heading text-3xl font-semibold text-foreground">Fellowship at Winners</h2>
            <p className="mt-2 text-sm text-muted-foreground">Life and worship moments at Winners Chapel Ukonga Banana</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[
              { src: choirWorship, alt: "Choir leading worship", label: "Worship" },
              { src: vengeanceService, alt: "Anointing service", label: "Anointing" },
              { src: congregationPrayer, alt: "Congregation in prayer", label: "Prayer" },
              { src: liberationService, alt: "Thanksgiving service", label: "Thanksgiving" },
              { src: covenantFamily, alt: "Family Day fellowship", label: "Family Day" },
              { src: covenantFamilyDay, alt: "Pastors ministering", label: "Ministries" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-foreground/80 to-transparent opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-1.5 transition-all duration-300 ease-out sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                  <span className="text-primary-foreground text-xs font-semibold">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Midweek Services & Bible Quote */}
      <section className="bg-warm/30 border-t border-border/30 py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-heading text-2xl md:text-[1.7rem] font-semibold text-foreground">Midweek Breakthroughs</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              Stay spiritually refreshed during the week. Join us for our interactive Bible Study every Wednesday or our breakthrough services on Friday nights. Come expectant!
            </p>
            <div className="mt-9 flex flex-col gap-6">
              {midweekServices.map((service) => (
                <div key={service.index} className="flex items-start gap-4">
                  <span className="font-heading text-base font-semibold text-primary w-7 text-right shrink-0">{service.index}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{service.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{service.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-border/40 pt-9 md:pt-0 md:pl-9">
            <blockquote className="font-heading text-xl md:text-2xl font-medium italic leading-relaxed text-foreground">
              "But upon mount Zion shall be deliverance, and there shall be holiness; and the house of Jacob shall possess their possessions."
            </blockquote>
            <cite className="mt-5 block text-[11px] not-italic font-semibold text-muted-foreground">— Obadiah 1:17</cite>
          </div>
        </div>
      </section>

      {/* Visit Us Map CTA */}
      <section className="bg-primary py-24 md:py-28 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-semibold text-primary-foreground">Join Our Community Today</h2>
          <p className="mt-4 text-sm text-primary-foreground/80 max-w-md mx-auto leading-relaxed">
            Located conveniently along the highway in Banana, Ukonga, Dar es Salaam, Tanzania. We look forward to receiving you!
          </p>
          <Link
            to="/contact"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-3.5 text-sm font-semibold text-primary transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary-foreground/95 active:translate-y-0 active:scale-[0.98] shadow-md"
          >
            Find Location &amp; Map
          </Link>
        </div>
      </section>
    </>
  );
}
