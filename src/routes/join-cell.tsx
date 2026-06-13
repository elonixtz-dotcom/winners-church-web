import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { db, HomeCell } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/join-cell")({
  head: () => ({
    meta: [
      { title: "Join a Home Cell - Winners Chapel Dar es Salaam" },
      { name: "description", content: "Apply to join a Winners Chapel home cell group." },
    ],
  }),
  component: JoinCellPage,
});

function JoinCellPage() {
  const [cells, setCells] = useState<HomeCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<"Single" | "Married" | "Widowed" | "Divorced">("Single");
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCells = async () => {
      try {
        const data = await db.getHomeCells();
        setCells(data);
        if (data.length > 0) {
          setSelectedCellId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load home cell groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchCells();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCellId) {
      toast.error("Please select a home cell group.");
      return;
    }
    if (!firstName || !lastName || !phoneNumber || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await db.addCellMembershipRequest({
        first_name: firstName,
        last_name: lastName,
        gender,
        phone_number: phoneNumber,
        address,
        occupation: occupation || undefined,
        marital_status: maritalStatus,
        home_cell_id: selectedCellId,
      });
      setSuccess(true);
      toast.success("Your membership request has been submitted successfully! The cell leader will review it shortly.");
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
        <div className="max-w-lg mx-auto text-center bg-card p-8 rounded-2xl border border-border/40 shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Request Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to join our home cell fellowship. Your request is now pending approval from the cell leader.
            They will contact you shortly to confirm your membership.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFirstName("");
              setLastName("");
              setPhoneNumber("");
              setAddress("");
              setOccupation("");
            }}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Home Cell Fellowship
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Join a Home Cell Group</h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Become part of our vibrant cell fellowship! Fill out the form below to apply for membership in a home cell group.
            Your request will be reviewed and approved by the cell leader.
          </p>
          <div className="bg-card border border-border/40 rounded-2xl p-6 text-left shadow-sm">
            <h3 className="font-heading text-sm font-bold text-foreground mb-3">Important Instructions for Cell Membership</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              All other members must join their respective groups in strict accordance with the assignments and instructions issued by the home cell leaders.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Each home cell leader is responsible for verifying that all members under their supervision have successfully joined their designated group, and members must coordinate directly with their assigned home cell leader to confirm their group affiliation and complete any required onboarding procedures.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Home cell leaders must also submit a final attendance confirmation list to the central management team within the specified timeframe to ensure full member participation.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/40 shadow-sm">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Gender & Marital Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              {/* Phone & Occupation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter occupation"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Enter your residential address"
                  rows={3}
                  required
                />
              </div>

              {/* Select Home Cell */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Select Home Cell Group *</label>
                {cells.length > 0 ? (
                  <select
                    value={selectedCellId || ""}
                    onChange={(e) => setSelectedCellId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {cells.map((cell) => (
                      <option key={cell.id} value={cell.id}>
                        {cell.name} - {cell.location} ({cell.meeting_day} at {cell.meeting_time})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/30 text-muted-foreground text-sm">
                    No home cell groups are currently available. Please check back later or contact the church office.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || cells.length === 0}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
