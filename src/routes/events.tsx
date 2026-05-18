import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import { db, ChurchEvent } from "@/lib/db";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming Events — Winners Chapel International Dar es Salaam" },
      { name: "description", content: "Stay updated on upcoming services, special events, and spiritual conferences at Winners Chapel International, Ukonga Banana, Dar es Salaam." },
      { property: "og:title", content: "Upcoming Events — Winners Chapel International" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await db.getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      {/* Banner */}
      <section className="py-16 md:py-20 bg-warm/50 border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-2">Fellowship &amp; Power</span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Upcoming Church Events</h1>
          <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
            Stay connected and participate in our powerful services, monthly seminars, and global church programs. We look forward to fellowshiping with you!
          </p>
        </div>
      </section>

      {/* Events Directory */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">No Scheduled Events</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                No upcoming events scheduled at this time. Please check back later, follow our announcements, or contact the church administration office for inquiries.
              </p>
              <div className="mt-8">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                >
                  Contact Church Office
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-card rounded-2xl overflow-hidden border border-border/40 hover:shadow-lg transition-all group flex flex-col justify-between">
                  <div>
                    {/* Flyer banner */}
                    <div className="relative aspect-video bg-muted overflow-hidden border-b border-border/20">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                          <img src={churchLogo} alt="" className="h-14 w-14 opacity-35 object-contain" />
                        </div>
                      )}
                      
                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-bold text-primary">
                          {new Date(event.event_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="block text-sm font-bold text-foreground leading-none">
                          {new Date(event.event_date).toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Conf / Service</span>
                      <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta Footer */}
                  <div className="p-6 pt-3 border-t border-border/20 flex flex-col gap-2 bg-muted/5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>
                        Time: {new Date(event.event_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} (EAT)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="line-clamp-1">Location: Winners Chapel, Ukonga Banana</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
