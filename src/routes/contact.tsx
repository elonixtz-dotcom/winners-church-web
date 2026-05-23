import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Winners Chapel Dar es Salaam" },
      { name: "description", content: "Get in touch with Winners Chapel Dar es Salaam. Located at Banana, Ukonga, Dar es Salaam, Tanzania. Follow us on Instagram @winnersdsm." },
      { property: "og:title", content: "Contact Winners Chapel Dar es Salaam" },
      { property: "og:description", content: "Visit us at Banana, Ukonga, Dar es Salaam. Sunday services at 6:30 AM, 8:15 AM & 10:05 AM." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Reach out or visit us — you're always welcome.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Location</h3>
                    <p className="text-muted-foreground">
                      Ukonga Banana, Op. Minazi Mirefu Primary School,<br />
                      Winners Street No. 02, Dar es Salaam, Tanzania
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone & Email</h3>
                    <p className="text-muted-foreground">+255 22 284 2863</p>
                    <a href="mailto:domifaith2002@yahoo.com" className="text-primary hover:underline text-sm">domifaith2002@yahoo.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Service Times</h3>
                    <p className="text-muted-foreground">
                      Sunday: 6:30 AM, 8:20 AM &amp; 10:15 AM<br />
                      Wednesday: 5:00 PM<br />
                      Covenant Hour of Prayer: Mon-Fri @ 5:50 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Social Media</h3>
                    <div className="flex flex-col gap-1">
                      <a href="https://www.facebook.com/kanisala.washindi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                        Winners Chapel DSM on Facebook
                      </a>
                      <a href="https://www.instagram.com/winnersdsm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                        @winnersdsm on Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8">Send a Message</h2>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-80 md:h-96 w-full">
        <iframe
          title="Winners Chapel Dar es Salaam Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.766324278482!2d39.19150746607978!3d-6.869204320343916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTInMDkuMSJTIDM5wrAxMScyOS40IkU!5e0!3m2!1sen!2stz!4v1684841234567"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
