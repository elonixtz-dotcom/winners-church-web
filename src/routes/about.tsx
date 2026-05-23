import { createFileRoute } from "@tanstack/react-router";
import oyedepo from "@/assets/oyedepo.png";
import bishopOyedepo from "@/assets/Bishop-David-Oyedepo.webp";
import oyedepoPortrait from "@/assets/oyedepo-portrain.jpeg";
import abioyePortrait from "@/assets/bishop-abioye-portrait.jpg";
import oyedepoJrPortrait from "@/assets/oyedepo-jr-portrait.jpg";
import imohiPortrait from "@/assets/imohi-portrait.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Winners Chapel Dar es Salaam" },
      { name: "description", content: "Learn about Winners Chapel Dar es Salaam, a branch of the Living Faith Church Worldwide founded by Bishop David Oyedepo." },
      { property: "og:title", content: "About Winners Chapel Dar es Salaam" },
      { property: "og:description", content: "Part of the Living Faith Church Worldwide, serving the people of Dar es Salaam with the Gospel of Jesus Christ." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const leadership = [
    {
      name: "Bishop David Oyedepo",
      role: "Founder / President",
      image: oyedepoPortrait,
    },
    {
      name: "Bishop David Abioye",
      role: "Vice President",
      image: abioyePortrait,
    },
    {
      name: "Pastor David Oyedepo Jr.",
      role: "Resident Pastor, Faith Tabernacle",
      image: oyedepoJrPortrait,
    },
    {
      name: "Pastor Andrew Imohi",
      role: "National Pastor, Tanzania",
      image: imohiPortrait,
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={bishopOyedepo} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Our Mandate & History</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Raising a new generation of champions through the preaching of the Word of Faith.
          </p>
        </div>
      </section>

      {/* Commission Mandate Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-gold font-bold uppercase tracking-widest text-sm mb-4 block">The Commission</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">COMMISSION MANDATE</h2>
              <blockquote className="border-l-4 border-gold pl-6 py-2 mb-8 italic text-xl text-muted-foreground leading-relaxed">
                "THE HOUR HAS COME TO LIBERATE THE WORLD FROM ALL OPPRESSIONS OF THE DEVIL THROUGH THE PREACHING OF THE WORD OF FAITH, AND I AM SENDING YOU TO UNDERTAKE THIS TASK."
              </blockquote>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our Mandate speaks of liberation in all facets of human existence. We focus mainly on destinies that have been afflicted, battered, beaten, tattered, deformed and subsequently in groaning and agonies, as a result of pains, pangs and crying.
                </p>
                <p>
                  Today, testimonies of liberation through our messages, books, tapes, magazines and other periodicals are most humbling. The word of faith is working like fire for the liberation of mankind across the nations.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gold/20 rounded-2xl blur-xl group-hover:bg-gold/30 transition-all duration-500"></div>
                <img src={oyedepo} alt="Bishop David Oyedepo" className="relative rounded-2xl shadow-2xl max-w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pastoral Mandate Section */}
      <section className="py-16 md:py-24 bg-warm/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img src={bishopOyedepo} alt="Bishop David Oyedepo" className="rounded-2xl shadow-xl max-w-full h-auto" />
            </div>
            <div>
              <span className="text-gold font-bold uppercase tracking-widest text-sm mb-4 block">Global Growth</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">PASTORAL MANDATE</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The understanding of the liberation commission is that, it will basically be an outreach operation. The Presiding Bishop could not imagine any church connection with the commission. Our understanding then was that there was no kind of church that was not in existence and that what was needed was to ignite the fire of the Holy Ghost in existing churches.
                </p>
                <p>
                  However, one glorious day, in November 1982, the Lord spoke to the Presiding Bishop clearly from Luke 1:1-3 that <strong className="text-foreground">“this mandate shall have a church base all that is in existence notwithstanding”</strong>. Today the earth is gradually becoming a Winners World as the commission is represented with churches in almost every continent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">History of Winners Chapel</h2>
            <div className="h-1 w-20 bg-gold mx-auto"></div>
          </div>
          <div className="space-y-12">
            {[
              {
                year: "1981",
                event: "May 2, 1981: David Oyedepo (aged 26) had an 18-hour supernatural encounter with God in Ilesa, Nigeria, receiving the Liberation Mandate.",
              },
              {
                year: "1983",
                event: "December 11, 1983: The church began operating with four members.",
              },
              {
                year: "1998-1999",
                event: "Construction of Faith Tabernacle in Canaanland, Ota. Built in 12 months with 50,400 seats, it became the international headquarters.",
              },
              {
                year: "2013-2015",
                event: "David Oyedepo Jnr ministered for the first time at Shiloh 2013 and became resident pastor of Faith Tabernacle in 2015.",
              },
              {
                year: "2021",
                event: "Groundbreaking of 'The Ark', a 100,000 capacity sanctuary and 20-floor Mission Tower in Canaanland.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 md:gap-10">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">
                    {item.year}
                  </div>
                  {index !== 4 && <div className="w-0.5 h-full bg-border mt-2"></div>}
                </div>
                <div className="pb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed pt-2">
                    {item.event}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Our Leadership</h2>
            <p className="text-muted-foreground">The vessels of God leading this global commission.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader) => (
              <div key={leader.name} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-heading text-lg font-bold text-foreground">{leader.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{leader.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
