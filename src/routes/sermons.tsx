import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import churchLogo from "@/assets/winners-logo.png";
import { db, Sermon } from "@/lib/db";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons Library — Winners Chapel International Dar es Salaam" },
      { name: "description", content: "Access life-transforming sermons, scripture teachings, and breakthrough worship recordings from Winners Chapel International, Ukonga Banana." },
      { property: "og:title", content: "Sermons Library — Winners Chapel International" },
    ],
  }),
  component: SermonsPage,
});

function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await db.getSermons();
        setSermons(data);
      } catch (err) {
        console.error("Error fetching sermons", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, []);

  const filteredSermons = sermons.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.preacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scripture.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Banner */}
      <section className="py-16 md:py-20 bg-warm/50 border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest block mb-2">Word of Faith</span>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Sermons &amp; Teachings</h1>
          <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
            "Faith cometh by hearing, and hearing by the word of God." Feed your spirit with anointed messages of victory, prosperity, healing, and spiritual growth.
          </p>
        </div>
      </section>

      {/* Sermons Library */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Bar - only show if there are sermons to search */}
          {!loading && sermons.length > 0 && (
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, preacher, or scripture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                />
                <svg
                  className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
            </div>
          ) : sermons.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">Sermons Archive Empty</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                Sermons library is currently being updated. Come back soon for powerful, life-liberating messages of faith, breakthrough, and signs &amp; wonders from our pastoral team.
              </p>
              <div className="mt-8">
                <a
                  href="/services"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                >
                  View Weekly Services
                </a>
              </div>
            </div>
          ) : filteredSermons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">No sermons match your search query: "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="bg-card rounded-2xl border border-border/40 p-6 flex flex-col justify-between hover:shadow-lg transition-all group hover:-translate-y-0.5"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4 border-b border-border/20 pb-3">
                      <span>{new Date(sermon.date).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Audio / Video</span>
                    </div>

                    {/* Preacher and Title */}
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                      Min: {sermon.preacher}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>

                    {/* Scripture anchor */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-foreground text-[11px] font-bold rounded-lg border border-gold/20">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      <span>{sermon.scripture}</span>
                    </div>
                  </div>

                  {/* Play Trigger */}
                  <div className="mt-8 border-t border-border/20 pt-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground">Winners Chapel Intl.</span>
                    {sermon.video_url ? (
                      <a
                        href={sermon.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground text-[11px] font-bold px-4 py-1.5 rounded-full transition-all shadow-sm"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        Watch Sermon
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[11px] font-bold px-4 py-1.5 rounded-full cursor-not-allowed">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Listen Now
                      </div>
                    )}
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
