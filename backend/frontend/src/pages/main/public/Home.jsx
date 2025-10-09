import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import {
  Search,
  Utensils,
  Truck,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import InfiniteTicker from "../../../components/InfiniteTicker";

export default function Home() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="min-h-lvh bg-gradient-to-b from-lime-50 via-white to-white text-neutral-900">
      {/* Hero */}
      {/* Hero (minimal / neutral) */}
      <section className="relative overflow-hidden">
        {/* Subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-20%,rgba(0,0,0,0.06),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-12 lg:pt-20 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-neutral-900">
                Your favorites, delivered fast with{" "}
                <span className="underline decoration-2 underline-offset-4">
                  PickMyFood
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-xl">
                Discover local restaurants and top-rated kitchens. Order in
                seconds, track in real time.
              </p>

              {/* Search / CTA row */}
              <div className="mt-6 flex w-full max-w-xl rounded-xl border border-neutral-300 bg-white  focus-within:ring-2 focus-within:ring-neutral-900/10">
                <div className="flex items-center pl-3">
                  <Search className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your address to see what’s nearby"
                  className="h-12 flex-1 bg-transparent px-3 outline-none text-[15px] placeholder:text-neutral-400"
                />
                <Link
                  to="/restaurants"
                  className="m-1 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-black/90"
                >
                  Browse <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Auth-aware quick CTA */}
              <div className="mt-4 text-sm text-neutral-600">
                {isAuthenticated ? (
                  userRole === "customer" ? (
                    <>
                      Hello, <span className="font-semibold">{userRole}</span> —{" "}
                      <Link
                        to="/restaurants"
                        className="underline hover:text-neutral-800"
                      >
                        See restaurants near you
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Hello, <span className="font-semibold">{userRole}</span> —{" "}
                      <Link
                        to="/dashboard"
                        className="underline hover:text-neutral-800"
                      >
                        manage your store
                      </Link>
                      .
                    </>
                  )
                ) : (
                  <>
                    New here?{" "}
                    <Link
                      to="/register"
                      className="underline hover:text-neutral-800"
                    >
                      Create an account
                    </Link>{" "}
                    to start ordering.
                  </>
                )}
              </div>
            </div>

            {/* Right media grid (monochrome, subtle) */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-40 rounded-xl bg-neutral-100" />
                <div className="h-56 rounded-xl bg-neutral-200" />
                <div className="h-32 rounded-xl bg-neutral-50" />
                <div className="h-28 rounded-xl bg-neutral-50" />
                <div className="h-40 rounded-xl bg-neutral-100" />
                <div className="h-52 rounded-xl bg-neutral-200" />
              </div>
              <p className="sr-only">Food mosaic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand / Ticker (kept minimal) */}
      <section className="py-4  border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <InfiniteTicker />
        </div>
      </section>

      {/* Categories (clean cards, no color fills) */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-neutral-900">
              Popular categories
            </h2>
            <Link
              to="/restaurants"
              className="text-sm text-neutral-600 hover:text-neutral-800 underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Burgers",
              "Rice & Curry",
              "Pizza",
              "Desserts",
              "Healthy",
              "Breakfast",
            ].map((c) => (
              <Link
                key={c}
                to={`/restaurants?category=${encodeURIComponent(c)}`}
                className="group rounded-xl border border-neutral-200 bg-white p-4  hover:-translate-y-0.5 transition"
              >
                <div className="h-20 rounded-lg bg-neutral-100 border border-neutral-200" />
                <div className="mt-3 text-sm font-semibold group-hover:underline">
                  {c}
                </div>
                <div className="text-xs text-neutral-500">Near you</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features (icon chips, monochrome) */}
      <section className="py-12 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-neutral-900">Why PickMyFood</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Utensils className="h-5 w-5" />}
              title="Local favorites"
              desc="From iconic Sri Lankan fare to hidden gems, all in one app."
            />
            <Feature
              icon={<Truck className="h-5 w-5" />}
              title="Live tracking"
              desc="Track every step from the kitchen to your door."
            />
            <Feature
              icon={<Clock className="h-5 w-5" />}
              title="Fast delivery"
              desc="Smart routing ensures hot food, on time."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Secure payments"
              desc="Trusted checkout with multiple options."
            />
          </div>
        </div>
      </section>

      {/* How it works (numbered, minimal) */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-neutral-900">How it works</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Find",
                desc: "Enter your address and browse nearby restaurants.",
              },
              {
                title: "Order",
                desc: "Pick dishes you love and check out securely.",
              },
              {
                title: "Enjoy",
                desc: "Track delivery and dig in when it arrives.",
              },
            ].map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-neutral-200 bg-white p-5  transition"
              >
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3"></div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 ">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{desc}</p>
    </div>
  );
}
