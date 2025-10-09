import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../../services/restaurentServices";
import { AlertCircle, PlusCircle, Building2 } from "lucide-react";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const data = await getRestaurants();
        setRestaurants(data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            "Unable to load restaurants. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const baseUrl = import.meta.env.VITE_API_RESTAURANT_BASE_URL || "";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Restaurants
          </h1>
          <p className="text-sm text-neutral-600">
            Browse and manage partner locations.
          </p>
        </div>
        <Link
          to="/add-restaurant"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        >
          <PlusCircle className="h-4 w-4" />
          Add Restaurant
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading ? (
        <div
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Loading restaurants"
          role="status"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="aspect-[16/9] w-full rounded-lg bg-neutral-200 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-5 w-3/4 rounded bg-neutral-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-neutral-200 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-neutral-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        // Empty state
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Building2 className="h-6 w-6 text-neutral-500" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-neutral-900">
            No restaurants yet
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Get started by adding your first restaurant.
          </p>
          <Link
            to="/add-restaurant"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            aria-label="Add a new restaurant"
          >
            <PlusCircle className="h-4 w-4" />
            Add Restaurant
          </Link>
        </div>
      ) : (
        // Grid
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {restaurants.map((r) => {
            const imgSrc = r?.image ? `${baseUrl}${r.image}` : "";
            return (
              <Link
                key={r._id}
                to={`/restaurant/${r._id}`}
                className="group block rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                aria-label={`Visit ${r?.storeName || "restaurant"}`}
              >
                {/* Image with proper ratio */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={r.storeName}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/640x360?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                      <span className="text-xs text-neutral-500">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="truncate text-base font-semibold text-neutral-900">
                    {r.storeName}
                  </h3>
                  <p className="truncate text-sm text-neutral-600">
                    {r.brandName}
                  </p>

                  <div className="mt-2 text-xs text-neutral-500">
                    <span className="capitalize">{r.businessType}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {r.city}
                      {r.state ? `, ${r.state}` : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Restaurants;
