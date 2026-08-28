import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import { db, ChurchEvent } from "@/lib/db";
import { Calendar, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Church Events & Archive — Winners Chapel International Ukonga" },
      { name: "description", content: "Stay updated on powerful upcoming services, special events, and spiritual conferences at Winners Chapel International, Ukonga Banana, Dar es Salaam." },
      { property: "og:title", content: "Church Events — Winners Chapel International" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "past">("upcoming");
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await db.getEvents();
        // Sort by date (upcoming nearest first, past most recent first)
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.event_date) >= now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const pastEvents = events
    .filter((e) => new Date(e.event_date) < now)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const displayedEvents = activeFilter === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 md:py-28 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-3">Fellowship &amp; Power</span>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-foreground">Church Events</h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Participate in our transformative services, divine encounters, home cell fellowships, and global programs.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="inline-flex p-1 border border-border/50 rounded-lg">
            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`py-2 px-5 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer ${
                activeFilter === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveFilter("past")}
              className={`py-2 px-5 text-xs font-semibold rounded-md transition-colors duration-150 cursor-pointer ${
                activeFilter === "past" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past ({pastEvents.length})
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {displayedEvents.length} {activeFilter === "upcoming" ? "upcoming" : "completed"} church program{displayedEvents.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="border border-border/40 rounded-xl p-12 text-center max-w-2xl mx-auto">
              <Calendar className="w-7 h-7 text-primary mx-auto mb-5" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                {activeFilter === "upcoming" ? "No Upcoming Events Scheduled" : "No Past Events Found"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                {activeFilter === "upcoming"
                  ? "We are currently preparing an anointed schedule of events. Check back soon or contact the church administration office for updates."
                  : "No completed event archives found. Historical church records are maintained by the Media team."}
              </p>
              {activeFilter === "upcoming" && (
                <a
                  href="/contact"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-xs font-semibold text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/95 active:translate-y-0 active:scale-[0.98]"
                >
                  Contact Church Office
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event) => {
                const eventDate = new Date(event.event_date);
                const isPast = eventDate < now;

                return (
                  <div
                    key={event.id}
                    className="group rounded-xl overflow-hidden border border-border/40 bg-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_28px_-18px_oklch(0.18_0.03_30_/_22%)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {event.image_url && !brokenImages.has(event.id) ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            onError={() => setBrokenImages((prev) => new Set(prev).add(event.id))}
                            className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                            <img src={churchLogo} alt="" className="h-12 w-12 opacity-35 object-contain" />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 bg-card rounded-md px-2.5 py-1.5 text-center leading-none">
                          <span className="block text-[9.5px] uppercase font-bold text-primary tracking-wide">
                            {eventDate.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="block text-sm font-bold text-foreground mt-0.5">
                            {eventDate.toLocaleDateString("en-US", { day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <span className="text-[10px] font-semibold uppercase tracking-widest block mb-1.5 text-primary">
                          {isPast ? "Completed" : "Special Worship Service"}
                        </span>
                        <h3 className="font-heading text-base font-bold text-foreground line-clamp-2 leading-snug">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-border/30 flex flex-col gap-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-medium">
                          {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} EAT
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="line-clamp-1 font-medium">Winners Chapel, Ukonga Banana</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
