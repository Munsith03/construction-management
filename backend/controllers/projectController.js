// server/controllers/projectController.js
import Project from "../models/Project.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ---------- Helpers ---------- */
const weatherCodeText = (code) => {
  const map = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
    56: "Freezing drizzle", 57: "Freezing drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    66: "Freezing rain", 67: "Freezing rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers", 81: "Rain showers", 82: "Heavy rain showers",
    85: "Snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm hail", 99: "Severe thunderstorm",
  };
  return map[code] || "Weather";
};

const geocode = async (location) => {
  const ua = process.env.NOMINATIM_UA || "construction-dashboard (mailto:contact@example.com)";
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
};

const reverseGeocode = async (lat, lon) => {
  const ua = process.env.NOMINATIM_UA || "construction-dashboard (mailto:contact@example.com)";
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`);
  const data = await res.json();
  return data?.display_name || "";
};

const fetchWeather = async (lat, lon) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather failed (${res.status})`);
  const data = await res.json();
  const cur = data.current || {};
  const code = Number(cur.weather_code);
  return {
    tempC: Number(cur.temperature_2m),
    windKph: Number(cur.wind_speed_10m),
    code,
    description: weatherCodeText(code),
    fetchedAt: new Date(),
  };
};

// Decide how to enrich based on what's provided
const enrichProject = async (payload) => {
  const loc = payload.location?.trim();
  const hasCoords = Number.isFinite(payload.lat) && Number.isFinite(payload.lon);

  // 1) If coords provided: use them, optionally fill location via reverse geocode
  if (hasCoords) {
    try {
      if (!loc) {
        const name = await reverseGeocode(payload.lat, payload.lon);
        if (name) payload.location = name;
      }
      try {
        payload.weather = await fetchWeather(payload.lat, payload.lon);
      } catch {
        payload.weather = null;
      }
    } catch {
      // keep as-is if reverse or weather fails
    }
    return payload;
  }

  // 2) If only location provided: geocode -> coords -> weather
  if (loc) {
    try {
      const geo = await geocode(loc);
      if (geo) {
        payload.lat = geo.lat;
        payload.lon = geo.lon;
        try {
          payload.weather = await fetchWeather(geo.lat, geo.lon);
        } catch {
          payload.weather = null;
        }
      } else {
        payload.lat = undefined;
        payload.lon = undefined;
        payload.weather = null;
      }
    } catch {
      payload.lat = undefined;
      payload.lon = undefined;
      payload.weather = null;
    }
    return payload;
  }

  // 3) Neither location nor coords: clear weather/coords
  payload.lat = undefined;
  payload.lon = undefined;
  payload.weather = null;
  return payload;
};

const coerceProjectPayload = (body) => {
  const out = { ...body };
  if (out.budget != null) out.budget = Number(out.budget);
  if (out.progress != null) out.progress = Math.max(0, Math.min(100, Number(out.progress)));
  if (out.startDate) out.startDate = new Date(out.startDate);
  if (out.deadline) out.deadline = new Date(out.deadline);
  if (out.lat != null) out.lat = Number(out.lat);
  if (out.lon != null) out.lon = Number(out.lon);
  ["name","client","location","owner","currency","description","status","priority"].forEach((k)=>{
    if (typeof out[k] === "string") out[k] = out[k].trim();
  });
  return out;
};

/* ---------- Controllers ---------- */
export const getProjects = asyncHandler(async (req, res) => {
  const { q, status, priority } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { client: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const projects = await Project.find(filter).sort({ updatedAt: -1 });
  res.json(projects);
});

export const getProject = asyncHandler(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Project not found" });
  res.json(p);
});

export const createProject = asyncHandler(async (req, res) => {
  const base = coerceProjectPayload(req.body);
  if (!base.name) return res.status(400).json({ message: "Name is required" });
  const payload = await enrichProject(base);
  const created = await Project.create(payload);
  res.status(201).json(created);
});

export const updateProject = asyncHandler(async (req, res) => {
  const base = coerceProjectPayload(req.body);
  let payload = base;

  // If location or coords provided in update, re-enrich
  if (
    Object.prototype.hasOwnProperty.call(base, "location") ||
    Object.prototype.hasOwnProperty.call(base, "lat") ||
    Object.prototype.hasOwnProperty.call(base, "lon")
  ) {
    payload = await enrichProject(base);
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) return res.status(404).json({ message: "Project not found" });
  res.json(updated);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Project not found" });
  res.json({ ok: true });
});

export const refreshWeather = asyncHandler(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Project not found" });
  if (p.lat == null || p.lon == null) {
    return res.status(400).json({ message: "Project has no coordinates to fetch weather" });
  }
  const weather = await fetchWeather(p.lat, p.lon);
  p.weather = weather;
  await p.save();
  res.json(p);
});
