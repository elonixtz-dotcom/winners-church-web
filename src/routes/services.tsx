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

const sundayServices = [
  { time: "6:30", period: "AM", name: "First Service", desc: "An early morning encounter with the Holy Spirit. Perfect for those who love starting their Sundays in God's presence." },
  { time: "8:15", period: "AM", name: "Second Service", desc: "A vibrant mid-morning worship experience featuring powerful praise, worship, and the Word of God." },
  { time: "10:05", period: "AM", name: "Third Service", desc: "Our late morning celebration service. Come experience dynamic worship and life-transforming messages." },
];

const midweekServices = [
  { index: "01", day: "Wednesday", time: "5:30 PM", name: "Bible Study", desc: "In-depth study of God's Word for spiritual growth and understanding." },
  { index: "02", day: "Friday", time: "5:30 PM", name: "Night Service", desc: "Prophetic and breakthrough service for victory in every area of life." },
  { index: "03", day: "Monthly", time: "Various", name: "Communion Service", desc: "A sacred time of remembrance and fellowship at the Lord's Table." },
  { index: "04", day: "Quarterly", time: "Various", name: "Special Programs", desc: "Shiloh, Covenant Day of Exemption, and other powerful church-wide events." },
];

const ministries = [
  { name: "Children's Ministry", desc: "Nurturing young hearts in the Word of God through fun and engaging programs." },
  { name: "Youth Ministry", desc: "Empowering the next generation to live out their faith boldly." },
  { name: "Women's Fellowship", desc: "Building godly women through fellowship, prayer, and mentorship." },
  { name: "Men's Fellowship", desc: "Raising men of integrity and purpose in the kingdom." },
  { name: "Choir & Worship", desc: "Leading the congregation into God's presence through anointed music." },
  { name: "Prayer Ministry", desc: "Interceding for the church, community, and nations." },
];

function ServicesPage() {
  return (
    <>
      <section className="py-24 md:py-28 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-foreground">Our Services</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of God's Word in every service. All are welcome.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Every Sunday</span>
            <h2 className="font-heading text-3xl font-semibold text-foreground">Sunday Worship Services</h2>
          </div>
          <div className="border-t border-border/40">
            {sundayServices.map((s) => (
              <div
                key={s.time}
                className="grid grid-cols-1 sm:grid-cols-[140px_1fr_2fr] items-center gap-2 sm:gap-6 py-6 border-b border-border/40 transition-colors duration-150 hover:bg-warm/40"
              >
                <div className="font-heading text-3xl font-semibold text-primary">
                  {s.time}<span className="text-sm ml-1">{s.period}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28 bg-warm/30 border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Throughout the Week</span>
            <h2 className="font-heading text-3xl font-semibold text-foreground">Midweek &amp; Special Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {midweekServices.map((s) => (
              <div key={s.name} className="flex items-start gap-4">
                <span className="font-heading text-base font-semibold text-primary w-7 text-right shrink-0">{s.index}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                  <p className="text-xs text-primary font-medium mt-1">{s.day} &mdash; {s.time}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-2">Get Involved</span>
            <h2 className="font-heading text-3xl font-semibold text-foreground">Ministries</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {ministries.map((m) => (
              <div key={m.name} className="rounded-xl p-6 border border-border/40 text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border">
                <h3 className="font-heading text-sm font-semibold text-foreground">{m.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
