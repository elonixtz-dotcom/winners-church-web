import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <>
      <section className="py-16 md:py-24 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">About Our Church</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Winners Chapel Dar es Salaam is a vibrant community of believers committed to raising champions through the Word of God.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Our Story</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Winners Chapel, also known as Living Faith Church Worldwide, was founded by Bishop David Oyedepo. 
                Our Dar es Salaam branch is part of this global ministry that spans over 300 cities in more than 
                60 nations. We are committed to raising a new generation of leaders who are empowered by the Word 
                and the Spirit to take territories for God's kingdom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl p-8 border border-border/50">
                <h3 className="font-heading text-xl font-bold text-primary">Our Mission</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To liberate mankind from all forms of bondage — spiritual, mental, physical, and financial — 
                  through the preaching of the Word of Faith, thereby raising a new generation of champions.
                </p>
              </div>
              <div className="bg-card rounded-xl p-8 border border-border/50">
                <h3 className="font-heading text-xl font-bold text-primary">Our Vision</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To build a world-class church that operates by the principles of the Word, reaches out to the 
                  lost, and raises men and women of influence who impact their communities for Christ.
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Our Beliefs</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "The Bible is the inspired Word of God",
                  "Salvation through Jesus Christ alone",
                  "The power of the Holy Spirit",
                  "Divine healing and deliverance",
                  "The principles of prosperity and success",
                  "The Great Commission to all believers",
                ].map((belief) => (
                  <div key={belief} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-foreground">{belief}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
