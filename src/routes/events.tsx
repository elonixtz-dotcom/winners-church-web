import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import { db, ChurchEvent } from "@/lib/db";
import { Calendar, Clock, MapPin, Sparkles, Trophy } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-warm/20 via-background to-background">
      {/* Premium Hero Banner */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-card border-b border-border/20 shadow-sm">
        {/* Abstract gold and red blurred light shapes in background for high-end feel */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> Fellowship &amp; Power
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-none">
            Church <span className="bg-gradient-to-r from-primary via-amber-500 to-amber-600 bg-clip-text text-transparent">Events Registry</span>
          </h1>
          <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Participate in our transformative services, divine encounters, home cell fellowships, and global programs. Keep the fire of faith burning brightly!
          </p>
        </div>
      </section>

      {/* Dynamic Tab Filter Switch */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/30 pb-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl w-full sm:w-auto max-w-md shadow-inner">
            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`py-3 px-6 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeFilter === "upcoming"
                  ? "bg-card text-emerald-600 shadow-sm border border-border/20 scale-[1.01]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeFilter === "upcoming" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              Upcoming Scheduled ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveFilter("past")}
              className={`py-3 px-6 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeFilter === "past"
                  ? "bg-card text-amber-600 shadow-sm border border-border/20 scale-[1.01]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              Past &amp; Fulfilled ({pastEvents.length})
            </button>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            Showing {displayedEvents.length} {activeFilter === "upcoming" ? "upcoming" : "completed"} church program{displayedEvents.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {/* Events Grid Directory */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground font-semibold">Loading events archive...</span>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/40 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-extrabold text-foreground mb-3">
                {activeFilter === "upcoming" ? "No Upcoming Events Scheduled" : "No Past Events Found"}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                {activeFilter === "upcoming"
                  ? "We are currently preparing an anointed schedule of events. Check back soon or contact the church administration office for updates."
                  : "No completed event archives found in the database. Historical church records are maintained by the Media team."}
              </p>
              {activeFilter === "upcoming" && (
                <div className="mt-8">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer hover:scale-[1.01]"
                  >
                    Contact Church Office
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => {
                const eventDate = new Date(event.event_date);
                const isPast = eventDate < now;
                
                return (
                  <div 
                    key={event.id} 
                    className={`bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between ${
                      isPast ? "opacity-90 hover:opacity-100" : ""
                    }`}
                  >
                    <div>
                      {/* Dynamic Poster Flyer Visual Banner */}
                      <div className="relative aspect-video bg-muted overflow-hidden border-b border-border/20 shadow-inner">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${
                              isPast ? "grayscale-[30%]" : ""
                            }`}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent flex items-center justify-center">
                            <img src={churchLogo} alt="" className="h-16 w-16 opacity-30 object-contain" />
                          </div>
                        )}
                        
                        {/* Dynamic Poster Glowing Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          {isPast ? (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold bg-amber-500/90 text-white px-2 py-0.5 rounded-full shadow-sm">
                              Glorious Archive 🕊️
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live / Upcoming
                            </span>
                          )}
                        </div>

                        {/* Beautiful Calendar Date Visual Badge (Colored Accent) */}
                        <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center shadow-md border border-border/10">
                          <span className="block text-[10px] uppercase font-extrabold text-primary tracking-wider leading-none">
                            {eventDate.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="block text-xl font-black text-foreground mt-0.5 leading-none">
                            {eventDate.toLocaleDateString("en-US", { day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1.5 ${
                          isPast ? "text-amber-500/80" : "text-primary"
                        }`}>
                          {isPast ? "Completed Fellowship" : "Special Worship Service"}
                        </span>
                        <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {event.title}
                        </h3>
                        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-6 pt-4 border-t border-border/20 flex flex-col gap-2.5 bg-muted/10">
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                        <span className="font-medium text-foreground/80">
                          Time: {eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} EAT
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary/80 flex-shrink-0" />
                        <span className="line-clamp-1 font-medium text-foreground/80">
                          Location: Winners Chapel, Ukonga Banana
                        </span>
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
