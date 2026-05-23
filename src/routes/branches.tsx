import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Tanzania Branches — Winners Chapel International" },
      { name: "description", content: "Find Winners Chapel International branches across Tanzania." },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  const branches = [
    {
      name: "Winners Chapel International - Tanzania HQ (Banana)",
      location: "Ukonga Banana, opposite Minazi Mirefu Primary School, Dar es Salaam",
      contact: {
        email: "domifaith2002@yahoo.com",
        phone: "+255 22 284 2863",
      },
      services: "Covenant Hour of Prayer: Weekdays @ 5:30 AM | Mid-week: Wednesdays @ 5:00 PM | Sundays: 6:30 AM, 8:20 AM & 10:05 AM",
    },
    {
      name: "Winners Chapel International - Salasala",
      location: "Kilima Hewa, Boma Road, Salasala, Dar es Salaam",
      contact: {
        email: "winnerssalasala@gmail.com",
        phone: "+255 676 710 123",
      },
      services: "Covenant Hour of Prayer: Weekdays @ 5:30 AM | Mid-week: Wednesdays @ 5:00 PM | Sundays: 7:00 AM & 9:30 AM",
    },
    {
      name: "Winners Chapel International - Kigamboni",
      location: "Opposite Catholic Church, Maweni Junction, Kigamboni, Dar es Salaam",
      contact: null,
      services: "Contact branch for service times",
    },
    {
      name: "Winners Chapel International - Kawe",
      location: "Kawe Mnarani, Dar es Salaam",
      contact: null,
      services: "Mid-week: Wednesdays @ 5:00 PM | Sundays: 8:00 AM",
    },
    {
      name: "Winners Chapel International - Chanika",
      location: "Chanika, Dar es Salaam",
      contact: null,
      services: "Contact branch for service times",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">Tanzania Branches</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Locate a Winners Chapel International branch near you in Tanzania.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {branches.map((branch) => (
              <div key={branch.name} className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{branch.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-gold font-bold uppercase tracking-widest text-xs mb-2">Location</h3>
                    <p className="text-muted-foreground">{branch.location}</p>
                    
                    {branch.contact && (
                      <div className="mt-4">
                        <h3 className="text-gold font-bold uppercase tracking-widest text-xs mb-2">Contact</h3>
                        <p className="text-sm text-muted-foreground">Email: {branch.contact.email}</p>
                        <p className="text-sm text-muted-foreground">Phone: {branch.contact.phone}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-gold font-bold uppercase tracking-widest text-xs mb-2">Service Times</h3>
                    <p className="text-muted-foreground leading-relaxed">{branch.services}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
