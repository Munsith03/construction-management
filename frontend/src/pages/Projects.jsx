import { useContext, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Explicitly import autoTable
import AuthContext from "../context/AuthContext";
import MapPicker from "../ui/MapPicker";
import {
  Building2, MapPin, User, CalendarDays, DollarSign, TrendingUp, Clock, Search, Filter, PlusCircle,
  Edit3, Trash2, Loader2, Layers, CheckCircle2, PauseCircle, Hammer, AlertTriangle, ChevronDown,
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning
} from "lucide-react";


// sdsdsdd
const API_BASE = import.meta.env.VITE_API_URL || "";

const generatePDF = (projects, setError) => {
  if (!Array.isArray(projects) || projects.length === 0) {
    setError("No projects available to generate PDF.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Cover Page
  doc.setFillColor(13, 59, 102); // Navy blue
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(100, 149, 237); // Light blue for gradient effect
  doc.triangle(0, 0, 210, 0, 210, 297, "F"); // Gradient triangle
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text("Construction Projects Report", 105, 90, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 110, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text("Prepared by: [ConstrucEASE]", 105, 125, { align: "center" });
  doc.text("[SLIIT] | [ConstrucEASE@GMAIL.COM]", 105, 135, { align: "center" });

  // Add new page for content
  doc.addPage();

  // Header
  doc.setFillColor(13, 59, 102); // Navy blue
  doc.rect(0, 0, 210, 20, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("[ConstrucEASE]", 10, 12);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("Projects Report", 10, 18);
  doc.setTextColor(180, 180, 180);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 12, { align: "right" });
  doc.text("[Logo Placeholder]", 190, 18, { align: "right" });
  doc.setDrawColor(100, 149, 237); // Light blue accent line
  doc.setLineWidth(0.3);
  doc.line(10, 22, 200, 22); // Header divider

  // Table of Contents
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Table of Contents", 10, 35);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("1. Project List....................2", 10, 42);

  // Projects Table
  autoTable(doc, {
    startY: 50,
    head: [
      [
        "Project Name",
        "Client",
        "Location",
        "Status",
        "Priority",
        "Budget",
        "Deadline",
      ],
    ],
    body: projects.map((p) => [
      p.name || "N/A",
      p.client || "N/A",
      p.location || "N/A",
      p.status || "N/A",
      p.priority || "N/A",
      p.budget ? `${p.currency} ${Number(p.budget).toFixed(2)}` : "N/A",
      p.deadline ? new Date(p.deadline).toLocaleDateString() : "N/A",
    ]),
    margin: { left: 10, right: 10 },
    styles: {
      font: "times",
      fontSize: 9,
      cellPadding: 3,
      textColor: [33, 33, 33],
      lineColor: [180, 180, 180],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [13, 59, 102], // Navy blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9.5,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248], // Very light gray
    },
    columnStyles: {
      0: { cellWidth: 45, halign: "left" }, // Project Name: wider for text
      1: { cellWidth: 30, halign: "left" }, // Client
      2: { cellWidth: 30, halign: "left" }, // Location
      3: { cellWidth: 20, halign: "center" }, // Status: narrower
      4: { cellWidth: 20, halign: "center" }, // Priority
      5: { cellWidth: 25, halign: "right" }, // Budget: right-aligned for numbers
      6: { cellWidth: 20, halign: "center" }, // Deadline
    },
    didDrawPage: (data) => {
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(10, pageHeight - 15, 200, pageHeight - 15); // Divider line
      doc.setFont("times", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("[Your Company Name] - Building the Future", 10, pageHeight - 8);
      doc.setFont("times", "normal");
      doc.text("[Your Company Email] | [Your Company Phone]", 105, pageHeight - 8, { align: "center" });
      doc.text(`Page ${data.pageNumber - 1}`, 200, pageHeight - 8, { align: "right" });
    },
  });

  doc.save("projects-report.pdf");
};

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};

const statusMeta = {
  Planning: { color: "bg-blue-100 text-blue-700 border-blue-200", Icon: Layers },
  "In Progress": { color: "bg-lime-100 text-lime-700 border-lime-200", Icon: Hammer },
  "On Hold": { color: "bg-gray-100 text-gray-700 border-gray-200", Icon: PauseCircle },
  Completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
};

const priorityPill = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const priorityDot = { High: "bg-red-500", Medium: "bg-yellow-500", Low: "bg-blue-500" };

const weatherIcon = (code) => {
  if (code == null) return Cloud;
  if ([0, 1].includes(code)) return Sun;
  if ([2, 3, 45, 48].includes(code)) return Cloud;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
};

/* ---------- Small UI atoms ---------- */
function Label({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5 tracking-tight">{children}</label>;
}

function Select({ className = "", children, ...props }) {
  return (
    <div className="relative group">
      <select
        {...props}
        className={`appearance-none w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 
          focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ease-out 
          hover:border-gray-300 cursor-pointer shadow-sm ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none transition-transform duration-300 group-focus-within:rotate-180" />
    </div>
  );
}

function Button({ variant = "solid", className = "", children, ...props }) {
  const variants = {
    solid:
      "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-sm",
    outline:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
    subtle:
      "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
    danger:
      "bg-red-600 text-white border border-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium 
        transition-all duration-300 ease-out hover:scale-105 focus:outline-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ value }) {
  const meta = statusMeta[value] || statusMeta["Planning"];
  const Icon = meta.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105 ${meta.color}`}>
      <Icon className="h-4 w-4" />
      {value}
    </span>
  );
}

function PriorityBadge({ value }) {
  const pill = priorityPill[value] || priorityPill.Medium;
  const dot = priorityDot[value] || priorityDot.Medium;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105 ${pill}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {value} Priority
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
        <span>Progress</span>
        <span>{v}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-lime-400 transition-all duration-500 ease-out"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* ====================== Main Component ====================== */
export default function Projects() {
  const { token } = useContext(AuthContext) || {};
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState(null); // Added form error state

  const emptyForm = {
    id: null,
    name: "",
    client: "",
    location: "",
    status: "Planning",
    priority: "Medium",
    owner: "",
    description: "",
    currency: "LKR",
    budget: 0,
    startDate: "",
    deadline: "",
    progress: 0,
    lat: null,
    lon: null,
  };

  const [form, setForm] = useState(emptyForm);
  const isEditing = useMemo(() => !!form.id, [form.id]);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const res = await fetch(`${API_BASE}/projects?${params.toString()}`, { headers });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, priority]);

  const resetForm = () => setForm(emptyForm);

  // Form Validation
  const validateForm = () => {
    setFormError(null);
    const requiredFields = ["name", "client", "location", "budget", "startDate", "deadline"];
    for (const field of requiredFields) {
      if (!form[field]) {
        setFormError(`Field ${field} is required!`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails

    setError("");
    try {
      const url = isEditing ? `${API_BASE}/projects/${form.id}` : `${API_BASE}/projects`;
      const method = isEditing ? "PUT" : "POST";
      const { id, ...payload } = form;
      payload.budget = Number(payload.budget);
      payload.progress = Number(payload.progress);
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const saved = await res.json();
      if (isEditing) {
        setProjects((xs) => xs.map((p) => (p._id === saved._id ? saved : p)));
      } else {
        setProjects((xs) => [saved, ...xs]);
      }
      resetForm();
    } catch (e) {
      setError(e.message || "Save failed");
    }
  };

  const startEdit = (p) => {
    setForm({
      id: p._id,
      name: p.name || "",
      client: p.client || "",
      location: p.location || "",
      status: p.status || "Planning",
      priority: p.priority || "Medium",
      owner: p.owner || "",
      description: p.description || "",
      currency: p.currency || "LKR",
      budget: p.budget ?? 0,
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : "",
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "",
      progress: p.progress ?? 0,
      lat: Number.isFinite(p.lat) ? p.lat : null,
      lon: Number.isFinite(p.lon) ? p.lon : null,
    });
    document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setProjects((xs) => xs.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const refreshWeather = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/refresh-weather`, { method: "POST", headers });
      if (!res.ok) throw new Error(`Weather refresh failed (${res.status})`);
      const updated = await res.json();
      setProjects((xs) => xs.map((p) => (p._id === updated._id ? updated : p)));
    } catch (e) {
      alert(e.message || "Unable to refresh weather");
    }
  };

  const mapValue = useMemo(() => {
    return Number.isFinite(form.lat) && Number.isFinite(form.lon)
      ? { lat: form.lat, lon: form.lon }
      : null;
  }, [form.lat, form.lon]);

  /* ====================== UI ====================== */
  return (
    <section className="space-y-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50">
      {/* Decorative header */}
      <div className="relative rounded-xl bg-white p-6 shadow-lg ring-1 ring-blue-100/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-lime-50/50 rounded-xl" />
        <div className="relative grid items-center gap-4 sm:grid-cols-12">
          <div className="flex items-center gap-3 sm:col-span-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Construction Projects</h2>
          </div>
          
          <div className="sm:col-span-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, clients, or locations..."
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 
                  focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 hover:border-gray-300 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
                <option value="">All Status</option>
                <option>Planning</option><option>In Progress</option><option>On Hold</option><option>Completed</option>
              </Select>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-36">
                <option value="">All Priority</option>
                <option>Low</option><option>Medium</option><option>High</option>
              </Select>
            </div>
            <Button onClick={() => document.getElementById("project-form")?.scrollIntoView({ behavior: "smooth" })} className="whitespace-nowrap">
              <PlusCircle className="h-5 w-5" />
              Add New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Generate PDF Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => generatePDF(projects, setError)} variant="solid">
  Generate PDF
</Button>
      </div>

      {/* Form Card */}
      <form
        id="project-form"
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100/50 md:grid-cols-12"
      >
        {/* Validation Error */}
        {formError && (
          <div className="col-span-12 bg-red-100 text-red-700 p-4 rounded-md">
            <AlertTriangle className="h-5 w-5 inline-block mr-2" />
            {formError}
          </div>
        )}
        
        {/* Row 1 */}
        <div className="md:col-span-6">
          <Label>Project Name</Label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Enter project name"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-6">
          <Label>Pbbdfme</Label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Evdjdkame"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option>Planning</option><option>In Progress</option><option>On Hold</option><option>Completed</option>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Label>Priority</Label>
          <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option>Low</option><option>Medium</option><option>High</option>
          </Select>
        </div>

        {/* Row 2 */}
        <div className="md:col-span-6">
          <Label>Client</Label>
          <input
            value={form.client}
            onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
            placeholder="Enter client name"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-6">
          <Label>Owner</Label>
          <input
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
            placeholder="Enter owner name"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Row 3 */}
        <div className="md:col-span-6">
          <Label>Location (text)</Label>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="e.g., Colombo 03"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <Label>Budget</Label>
          <input
            type="number" min={0}
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            placeholder="Enter budget"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <Label>Currency</Label>
          <Select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
            <option>LKR</option><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
          </Select>
        </div>

        {/* Row 4 */}
        <div className="md:col-span-3">
          <Label>Start Date</Label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-3">
          <Label>Deadline</Label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="md:col-span-6">
          <Label>Progress: {form.progress}%</Label>
          <input
            type="range" min={0} max={100} step={1}
            value={form.progress}
            onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
            className="mt-2 w-full h-3 bg-gray-100 rounded-full cursor-pointer accent-blue-400"
          />
        </div>

        {/* Row 5 (Map + Lat/Lon) */}
        <div className="md:col-span-7">
          <Label>Pick coordinates on map</Label>
          <MapPicker
            value={mapValue}
            onChange={(pos) =>
              setForm((f) => {
                const newLat = pos?.lat ?? null;
                const newLon = pos?.lon ?? null;
                if (f.lat === newLat && f.lon === newLon) return f;
                return { ...f, lat: newLat, lon: newLon };
              })
            }
            height={280}
            defaultCenter={{ lat: 6.9271, lon: 79.8612 }}
          />
        </div>
        <div className="md:col-span-5 grid grid-cols-2 gap-6">
          <div>
            <Label>Latitude</Label>
            <input
              type="number" step="any"
              value={form.lat ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value === "" ? null : Number(e.target.value) }))}
              placeholder="lat"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <input
              type="number" step="any"
              value={form.lon ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, lon: e.target.value === "" ? null : Number(e.target.value) }))}
              placeholder="lon"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Enter project scope, phases, or notes..."
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-12 flex items-center justify-end gap-3">
          {isEditing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
          <Button>
            <TrendingUp className="h-5 w-5" />
            {isEditing ? "Update Project" : "Add Project"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="sm:col-span-2 xl:col-span-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="sm:col-span-2 xl:col-span-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            No projects found. Try adding a new project or adjusting the filters.
          </div>
        ) : (
          projects.map((p) => {
            const dleft = daysLeft(p.deadline);
            const urgency =
              dleft == null ? "" :
              dleft < 0 ? "text-red-700 bg-red-50 border-red-200" :
              dleft <= 7 ? "text-yellow-700 bg-yellow-50 border-yellow-200" :
              "text-blue-700 bg-blue-50 border-blue-200";
            const WeatherIcon = weatherIcon(p.weather?.code);

            return (
              <article key={p._id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-lime-400" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                        {p.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        {p.client && <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1"><User className="h-4 w-4" /> {p.client}</span>}
                        {p.location && <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1"><MapPin className="h-4 w-4" /> {p.location}</span>}
                        {p.owner && <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1"><Hammer className="h-4 w-4" /> {p.owner}</span>}
                        {Number.isFinite(p.lat) && Number.isFinite(p.lon) && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1">
                            📍 {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge value={p.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <PriorityBadge value={p.priority} />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1">
                      <DollarSign className="h-4 w-4" />
                      {p.budget ? `${p.currency} ${Number(p.budget).toFixed(2)}` : "N/A"}
                    </span>
                    {p.deadline && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${urgency}`}>
                        <Clock className="h-4 w-4" />
                        {dleft < 0 ? `Overdue by ${Math.abs(dleft)}d` : `${dleft} days left`}
                      </span>
                    )}
                  </div>

                  {p.weather && (
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <WeatherIcon className="h-5 w-5" />
                        <span className="font-medium">{p.weather.description || "Weather"}</span>
                        <span>• {Math.round(p.weather.tempC)}°C</span>
                        {Number.isFinite(p.weather.windKph) && <span>• {Math.round(p.weather.windKph)} km/h wind</span>}
                      </div>
                      <Button variant="subtle" onClick={() => refreshWeather(p._id)}>
                        Refresh
                      </Button>
                    </div>
                  )}

                  <div className="mt-4">
                    <ProgressBar value={p.progress ?? 0} />
                  </div>

                  {p.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{p.description}</p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <Button variant="subtle" onClick={() => startEdit(p)} className="flex-1">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => remove(p._id)} className="flex-1 hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}