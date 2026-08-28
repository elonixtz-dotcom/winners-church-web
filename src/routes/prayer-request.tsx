import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { db, PrayerWallRequest } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/prayer-request")({
  head: () => ({
    meta: [
      { title: "Prayer Request — Winners Chapel Dar es Salaam" },
      { name: "description", content: "Submit a prayer request to Winners Chapel Dar es Salaam. Our prayer team stands in agreement with you." },
      { property: "og:title", content: "Submit a Prayer Request — Winners Chapel Dar es Salaam" },
      { property: "og:description", content: "We'd be honored to pray with you. Share your prayer request and our team will stand in agreement with you." },
    ],
  }),
  component: PrayerRequestPage,
});

const CATEGORIES: { value: PrayerWallRequest["category"]; label: string }[] = [
  { value: "general", label: "General" },
  { value: "salvation", label: "Salvation" },
  { value: "healing", label: "Healing" },
  { value: "deliverance", label: "Deliverance" },
  { value: "finances", label: "Finances" },
  { value: "family", label: "Family" },
  { value: "career", label: "Career" },
  { value: "spiritual_growth", label: "Spiritual Growth" },
];

function PrayerRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<PrayerWallRequest["category"]>("general");
  const [request, setRequest] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);

  const resetForm = () => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setCategory("general");
    setRequest("");
    setIsConfidential(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !request) {
      toast.error("Please fill in your name and prayer request.");
      return;
    }

    setSubmitting(true);
    try {
      await db.addPrayerWallRequest({
        full_name: fullName,
        phone_number: phoneNumber || undefined,
        email: email || undefined,
        category,
        request,
        is_confidential: isConfidential,
      });
      setSuccess(true);
      toast.success("Your prayer request has been submitted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center bg-card p-8 rounded-xl border border-border/40">
          <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-3">Request Received!</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Thank you for trusting us with your prayer request. Our prayer team will stand in agreement with you.
            "Again I say to you, that if two of you agree on earth concerning anything they ask, it will be done for them by My Father in heaven." — Matthew 18:19
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              resetForm();
            }}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-primary mb-4">
            Prayer Wall
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">Submit a Prayer Request</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            "Is anyone among you suffering? Let him pray... The prayer of faith will save the one who is sick." We would be honored to pray with you.
            Share what's on your heart below.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 md:p-8 border border-border/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PrayerWallRequest["category"])}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Your Prayer Request *</label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Share what you'd like us to pray with you about"
                rows={5}
                required
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              Keep this request confidential (only shared with the pastoral prayer team)
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                "Submit Prayer Request"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
