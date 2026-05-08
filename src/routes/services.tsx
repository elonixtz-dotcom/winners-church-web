import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Winners Chapel Dar es Salaam" },
      { name: "description", content: "Join Winners Chapel Dar es Salaam for Sunday services at 6:30 AM, 8:15 AM & 10:05 AM. Midweek services on Wednesdays and Fridays." },
      { property: "og:title", content: "Service Times — Winners Chapel Dar es Salaam" },
      { property: "og:description", content: "Sunday services at 6:30 AM, 8:15 AM & 10:05 AM. Midweek Bible Study and Friday services." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Our Services</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of God's Word in every service. All are welcome.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Sunday Worship Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { time: "6:30 AM", name: "First Service", icon: "🌅", desc: "An early morning encounter with the Holy Spirit. Perfect for those who love starting their Sundays in God's presence." },
              { time: "8:15 AM", name: "Second Service", icon: "☀️", desc: "A vibrant mid-morning worship experience featuring powerful praise, worship, and the Word of God." },
              { time: "10:05 AM", name: "Third Service", icon: "✨", desc: "Our late morning celebration service. Come experience dynamic worship and life-transforming messages." },
            ].map((s) => (
              <div key={s.time} className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-2xl font-heading font-bold text-primary">{s.time}</div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Midweek &amp; Special Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { day: "Wednesday", time: "5:30 PM", name: "Bible Study", desc: "In-depth study of God's Word for spiritual growth and understanding." },
              { day: "Friday", time: "5:30 PM", name: "Night Service", desc: "Prophetic and breakthrough service for victory in every area of life." },
              { day: "Monthly", time: "Various", name: "Communion Service", desc: "A sacred time of remembrance and fellowship at the Lord's Table." },
              { day: "Quarterly", time: "Various", name: "Special Programs", desc: "Shiloh, Covenant Day of Exemption, and other powerful church-wide events." },
            ].map((s) => (
              <div key={s.name} className="bg-card rounded-xl p-6 border border-border/50 flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{s.day.slice(0, 3)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="text-sm text-primary font-medium">{s.day} — {s.time}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Ministries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Children's Ministry", desc: "Nurturing young hearts in the Word of God through fun and engaging programs." },
              { name: "Youth Ministry", desc: "Empowering the next generation to live out their faith boldly." },
              { name: "Women's Fellowship", desc: "Building godly women through fellowship, prayer, and mentorship." },
              { name: "Men's Fellowship", desc: "Raising men of integrity and purpose in the kingdom." },
              { name: "Choir & Worship", desc: "Leading the congregation into God's presence through anointed music." },
              { name: "Prayer Ministry", desc: "Interceding for the church, community, and nations." },
            ].map((m) => (
              <div key={m.name} className="bg-card rounded-xl p-6 border border-border/50 text-center">
                <h3 className="font-heading font-semibold text-foreground">{m.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
