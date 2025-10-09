import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Camera,
  MapPin,
  Utensils,
  Clock,
  Truck,
  Leaf,
  BadgeCheck,
  Phone,
  Mail,
  Globe,
  Building2,
  Tag,
  ImagePlus,
} from "lucide-react";

/*
  AddRestaurantLayout
  ------------------------------------------------------------------
  Uber Eats–inspired modern layout to onboard / add a restaurant.
  - Left: sticky progress sidebar (steps)
  - Right: content panel with sections
  - Top: Back to dashboard button
  - TailwindCSS, Lucide icons, Framer Motion animations

  How to use:
  1) Drop this file as src/pages/AddRestaurantLayout.jsx
  2) Route it, e.g.
     <Route path="/partner/add-restaurant" element={<AddRestaurantLayout />} />
  3) Replace placeholder inputs / handlers with your form logic (react-hook-form, zod, etc.)
*/

const steps = [
  { id: 1, title: "Basics", icon: Utensils },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Hours", icon: Clock },
  { id: 4, title: "Delivery", icon: Truck },
  { id: 5, title: "Branding", icon: ImagePlus },
  { id: 6, title: "Compliance", icon: BadgeCheck },
];

export default function AddRestaurantLayout() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-neutral-100 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Partner Console</span>
            <span className="h-4 w-px bg-neutral-300" />
            <span className="font-semibold">Add Restaurant</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm rounded-full px-4 py-2 bg-black text-white hover:opacity-90"
          >
            Save Draft
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Progress */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-20">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-3">Onboarding steps</h2>
              <ol className="space-y-1">
                {steps.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setActiveStep(s.id)}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition ${
                        activeStep === s.id
                          ? "bg-neutral-900 text-white"
                          : "hover:bg-neutral-100"
                      }`}
                      aria-current={activeStep === s.id ? "step" : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <s.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{s.title}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-xl border border-neutral-200 p-3">
                <p className="text-xs text-neutral-500">
                  Tip: Keep your menu concise, use high‑quality photos, and set
                  realistic prep times to boost ratings.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-8">
          {activeStep === 1 && <SectionBasics />}
          {activeStep === 2 && <SectionLocation />}
          {activeStep === 3 && <SectionHours />}
          {activeStep === 4 && <SectionDelivery />}
          {activeStep === 5 && <SectionBranding />}
          {activeStep === 6 && <SectionCompliance />}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
              className="text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100"
            >
              Previous
            </button>
            <div className="flex items-center gap-3">
              <button className="text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100">
                Preview
              </button>
              <button
                onClick={() => setActiveStep((p) => Math.min(6, p + 1))}
                className="text-sm px-5 py-2 rounded-full bg-black text-white hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= Sections ================= */
function Card({ title, icon: Icon, subtitle, children, right }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5" />}
          <div>
            <h3 className="font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-900"
      />
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </label>
  );
}

function Textarea({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        {...props}
        className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 min-h-[96px] outline-none focus:ring-2 focus:ring-neutral-900"
      />
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </label>
  );
}

function Toggle({ label, desc }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>}
      </div>
      <input type="checkbox" className="h-5 w-10" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-300 px-2.5 py-1 text-xs">
      {children}
    </span>
  );
}

function SectionBasics() {
  return (
    <div className="space-y-8">
      <Card
        title="Restaurant details"
        icon={Building2}
        subtitle="Tell us the essentials."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Restaurant name" placeholder="e.g., Spice Garden" />
          <Input
            label="Legal business name"
            placeholder="e.g., Spice Garden Pvt Ltd"
          />
          <Input
            label="Official email"
            placeholder="info@spicegarden.lk"
            type="email"
          />
          <Input label="Phone number" placeholder="+94 71 234 5678" />
          <Input label="Website (optional)" placeholder="https://…" />
          <Input
            label="Cuisine tags"
            placeholder="Sri Lankan, Indian, Biryani"
          />
          <Textarea
            label="Short description"
            placeholder="Signature dishes, ambience, dietary options…"
            className="md:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>#Halal</Pill>
          <Pill>#VeganFriendly</Pill>
          <Pill>#FamilyPack</Pill>
          <Pill>#Spicy</Pill>
        </div>
      </Card>

      <Card title="Contacts" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Manager name" placeholder="Full name" />
          <Input label="Manager phone" placeholder="+94 …" />
          <Input
            label="Manager email"
            placeholder="name@restaurant.lk"
            type="email"
          />
        </div>
      </Card>
    </div>
  );
}

function SectionLocation() {
  return (
    <div className="space-y-8">
      <Card
        title="Address"
        icon={MapPin}
        subtitle="Customers will discover you here."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Street address" placeholder="No. 123, Galle Road" />
          <Input label="City" placeholder="Colombo" />
          <Input label="District / State" placeholder="Western" />
          <Input label="Postal code" placeholder="00001" />
          <Input
            label="Geocode (lat, lng)"
            placeholder="6.9271, 79.8612"
            hint="Paste from map picker"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-neutral-50">
            <MapPin className="h-4 w-4" /> Open Map Picker
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-neutral-50">
            <Globe className="h-4 w-4" /> Fetch from Website
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-neutral-50">
            <Tag className="h-4 w-4" /> Auto‑fill from Registry
          </button>
        </div>
      </Card>

      <Card title="Dine‑in & facilities" icon={Leaf}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle label="Has dine‑in seating" />
          <Toggle label="Has parking" />
          <Toggle label="Wheelchair accessible" />
        </div>
      </Card>
    </div>
  );
}

function SectionHours() {
  return (
    <div className="space-y-8">
      <Card
        title="Operating hours"
        icon={Clock}
        subtitle="Prep & delivery times affect ETA."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Prep time (mins)" placeholder="20" type="number" />
          <Input label="Opening time" placeholder="10:00" />
          <Input label="Closing time" placeholder="22:00" />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle label="Open on weekends" />
          <Toggle label="Open on public holidays" />
        </div>
      </Card>

      <Card
        title="Special schedules"
        icon={Calendar}
        subtitle="Add different hours for events or seasons."
        right={<button className="text-sm underline">Add schedule</button>}
      >
        <div className="text-sm text-neutral-500">
          No special schedules added.
        </div>
      </Card>
    </div>
  );
}

function SectionDelivery() {
  return (
    <div className="space-y-8">
      <Card
        title="Delivery settings"
        icon={Truck}
        subtitle="Control where and how you deliver."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Delivery radius (km)" placeholder="5" type="number" />
          <Input label="Min order (LKR)" placeholder="1200" type="number" />
          <Input label="Delivery fee (LKR)" placeholder="250" type="number" />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Enable self‑delivery"
            desc="You deliver with your own riders."
          />
          <Toggle
            label="Enable platform delivery"
            desc="Use marketplace riders."
          />
        </div>
      </Card>

      <Card title="Packaging notes" icon={Leaf}>
        <Textarea
          label="Sustainability / packaging"
          placeholder="e.g., Recyclable boxes, sealed beverages, cutlery on request…"
        />
      </Card>
    </div>
  );
}

function SectionBranding() {
  return (
    <div className="space-y-8">
      <Card
        title="Brand visuals"
        icon={Camera}
        subtitle="High‑quality imagery increases conversions."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Logo</span>
            <div className="mt-1 flex items-center justify-center h-36 rounded-xl border border-dashed text-sm">
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Upload PNG/SVG
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Cover photo</span>
            <div className="mt-1 flex items-center justify-center h-36 rounded-xl border border-dashed text-sm">
              <span className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" /> Upload JPG/PNG
              </span>
            </div>
          </label>
        </div>
        <div className="mt-4">
          <Textarea
            label="Brand story"
            placeholder="Tell customers what makes you special…"
          />
        </div>
      </Card>
    </div>
  );
}

function SectionCompliance() {
  return (
    <div className="space-y-8">
      <Card
        title="Documents"
        icon={BadgeCheck}
        subtitle="We keep your data private & secure."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">
              Business Registration (BR)
            </span>
            <div className="mt-1 flex items-center justify-center h-28 rounded-xl border border-dashed text-sm">
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Upload PDF/JPG
              </span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Food Safety Certificate</span>
            <div className="mt-1 flex items-center justify-center h-28 rounded-xl border border-dashed text-sm">
              <span className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Upload PDF/JPG
              </span>
            </div>
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Agree to terms"
            desc="I confirm the info provided is accurate."
          />
          <Toggle
            label="Allow marketing"
            desc="Optional: receive partner tips & updates."
          />
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <button className="text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100">
          Save & Exit
        </button>
        <button className="text-sm px-5 py-2 rounded-full bg-black text-white hover:opacity-90">
          Submit for Review
        </button>
      </div>
    </div>
  );
}

/* Missing imports fix */
function Calendar(props) {
  return <svg {...props} />;
}
