// server/controllers/projectController.js
import Project from "../models/Project.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const coerceProjectPayload = (body) => {
  const out = { ...body };

  // Coerce numbers
  if (out.budget != null) out.budget = Number(out.budget);
  if (out.progress != null) {
    out.progress = Math.max(0, Math.min(100, Number(out.progress)));
  }

  // Coerce dates
  if (out.startDate) out.startDate = new Date(out.startDate);
  if (out.deadline) out.deadline = new Date(out.deadline);

  // Trim strings
  ["name", "client", "location", "owner", "currency", "description"].forEach((k) => {
    if (typeof out[k] === "string") out[k] = out[k].trim();
  });

  return out;
};

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
  const payload = coerceProjectPayload(req.body);
  if (!payload.name) return res.status(400).json({ message: "Name is required" });
  const created = await Project.create(payload);
  res.status(201).json(created);
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = coerceProjectPayload(req.body);
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
