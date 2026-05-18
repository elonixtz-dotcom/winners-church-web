import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import congregationPrayer from "@/assets/congregation-prayer.jpg";
import spiritualEmphasis from "@/assets/spiritual-emphasis.jpg";
import choirWorship from "@/assets/choir-worship.jpg";
import vengeanceService from "@/assets/vengeance-service.jpg";
import liberationMandate from "@/assets/liberation-mandate.jpg";
import liberationService from "@/assets/liberation-service.jpg";
import covenantFamily from "@/assets/covenant-family.jpg";
import covenantFamilyDay from "@/assets/covenant-family-day.jpg";
import { db, ChurchEvent, Announcement } from "@/lib/db";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedEvents, fetchedAnnouncements] = await Promise.all([
          db.getEvents(),
          db.getAnnouncements(),
        ]);
        // Only show upcoming events (max 3)
        setEvents(fetchedEvents.slice(0, 3));
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
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src={congregationPrayer}
          alt="Worship at Winners Chapel Dar es Salaam"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <img src={churchLogo} alt="Winners Church" className="h-24 w-24 mx-auto mb-6 animate-fade-in-up" />
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight animate-fade-in-up">
            Welcome to <br />
            <span className="text-gold">Winners Chapel International</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up-delay">
            Ukonga Banana, Dar es Salaam — Living Faith Church Worldwide. Raising champions through the preaching of the Word of Faith.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 hover:scale-105 shadow-lg"
            >
              Our Service Times
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10 hover:scale-105 backdrop-blur-sm"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Announcements & Welcome Mandate */}
      <section className="py-16 md:py-20 bg-warm/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* The Liberation Mandate */}
            <div className="lg:col-span-2 bg-card rounded-2xl p-8 shadow-sm border border-border/40 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Our Foundation
                </span>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                  The Liberation Mandate
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  "The hour has come to liberate the world from all oppressions of the devil through the preaching of the word of faith, and I am sending you to undertake this task."
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These prophetic words, spoken to Bishop David Oyedepo on May 1-2, 1981, form the bedrock of our ministry. Since then, we have witnessed countless testimonies of spiritual freedom, physical healing, academic success, and financial breakthrough in the lives of believers globally.
                </p>
              </div>
              <div className="mt-6 border-t border-border/40 pt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gold/25 flex items-center justify-center text-primary font-bold text-xs">LF</div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Living Faith Church Worldwide</p>
                  <p className="text-[10px] text-muted-foreground">Winners Chapel International</p>
                </div>
              </div>
            </div>

            {/* Announcements Board (Dynamic) */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                <h3 className="font-heading text-lg font-bold text-foreground">Announcements</h3>
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 bg-muted/20 rounded-xl">
                  <svg className="w-8 h-8 text-muted-foreground/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-xs font-semibold text-foreground">Stay Tuned!</p>
                  <p className="text-[10px] text-muted-foreground mt-1">There are no announcements posted at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-auto max-h-[300px] pr-1">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3.5 bg-muted/10 hover:bg-muted/30 rounded-xl transition-all border border-border/20">
                      <h4 className="font-semibold text-sm text-foreground mb-1">{ann.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Events Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-1">Stay Connected</span>
              <h2 className="font-heading text-3xl font-bold text-foreground">Upcoming Events</h2>
            </div>
            <Link to="/events" className="mt-2 sm:mt-0 text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All Events
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-10 text-center max-w-2xl mx-auto">
              <svg className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">No Scheduled Events</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We are currently planning upcoming services and special programs. Keep visiting our site or join us in our Sunday services to stay informed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="bg-card rounded-2xl overflow-hidden border border-border/40 hover:shadow-lg transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {evt.image_url ? (
                        <img
                          src={evt.image_url}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                          <img src={churchLogo} alt="" className="h-12 w-12 opacity-35 object-contain" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-bold text-primary">
                          {new Date(evt.event_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="block text-sm font-bold text-foreground leading-none">
                          {new Date(evt.event_date).toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-2 border-t border-border/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(evt.event_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                    <span className="font-semibold text-primary hover:underline cursor-pointer">Details</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Grid (Sunday Times) */}
      <section className="bg-warm/20 py-16 md:py-20 border-y border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-1">Our Weekly Encounters</span>
          <h2 className="font-heading text-3xl font-bold text-foreground">Sunday Service Times</h2>
          <p className="mt-3 text-sm text-muted-foreground">Join us in Ukonga Banana for any of our three glorious Sunday services</p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { time: "6:30 AM", label: "First Service", desc: "A fresh early morning encounter in God's presence" },
              { time: "8:15 AM", label: "Second Service", desc: "A glorious mid-morning praise and teaching service" },
              { time: "10:05 AM", label: "Third Service", desc: "A late-morning breakthrough celebration service" },
            ].map((service) => (
              <div key={service.time} className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="text-3xl font-heading font-bold text-primary">{service.time}</div>
                <div className="mt-2 font-bold text-foreground text-sm">{service.label}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Gallery Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-1">Winners Community</span>
            <h2 className="font-heading text-3xl font-bold text-foreground">Fellowship at Winners</h2>
            <p className="mt-2 text-sm text-muted-foreground">Life and worship moments at Winners Chapel Ukonga Banana</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { src: choirWorship, alt: "Choir leading worship", label: "Worship" },
              { src: vengeanceService, alt: "Anointing service", label: "Anointing" },
              { src: congregationPrayer, alt: "Congregation in prayer", label: "Prayer" },
              { src: liberationMandate, alt: "Liberation Mandate", label: "Liberation Mandate" },
              { src: liberationService, alt: "Thanksgiving service", label: "Thanksgiving" },
              { src: covenantFamily, alt: "Family Day fellowship", label: "Family Day" },
              { src: covenantFamilyDay, alt: "Pastors ministering", label: "Ministries" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-border/20 bg-muted"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/45 transition-all flex items-end p-3">
                  <span className="text-primary-foreground text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Midweek Services & Bible Quote */}
      <section className="py-16 md:py-20 bg-secondary border-t border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Midweek Breakthroughs</h2>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Stay spiritually refreshed during the week. Join us for our interactive Bible Study every Wednesday or our breakthrough services on Friday nights. Come expectant!
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Wednesday Communion Service</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">5:30 PM — In-depth teaching of the Word and Communion</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Friday Night Breakthrough</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">5:30 PM — Anointed prophetic prayer and breakthrough service</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 text-center border border-border/40 shadow-sm">
              <blockquote className="font-heading text-lg md:text-xl font-semibold text-foreground italic leading-relaxed">
                "But upon mount Zion shall be deliverance, and there shall be holiness; and the house of Jacob shall possess their possessions."
              </blockquote>
              <cite className="mt-4 block text-xs text-muted-foreground not-italic font-semibold">— Obadiah 1:17</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us Map CTA */}
      <section className="bg-primary py-16 md:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">Join Our Community Today</h2>
          <p className="mt-4 text-xs sm:text-sm text-primary-foreground/80 max-w-md mx-auto">
            Located conveniently along the highway in Banana, Ukonga, Dar es Salaam, Tanzania. We look forward to receiving you!
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/95 hover:scale-105 shadow-md"
          >
            Find Location &amp; Map
          </Link>
        </div>
      </section>
    </>
  );
}
