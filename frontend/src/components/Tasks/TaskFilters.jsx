import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  ChevronDown, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Users, 
  Building, 
  SortAsc, 
  SortDesc, 
  X
} from "lucide-react";

export default function TaskFilters({ filters, onFilterChange, projects }) {
  const [showFilters, setShowFilters] = useState(false);
  
  const statusOptions = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];
  
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  
  const categoryOptions = [
    { value: "construction", label: "Construction" },
    { value: "inspection", label: "Inspection" },
    { value: "procurement", label: "Procurement" },
    { value: "planning", label: "Planning" },
    { value: "safety", label: "Safety" },
    { value: "other", label: "Other" }
  ];
  
  const sortOptions = [
    { value: "startDate", label: "Start Date" },
    { value: "endDate", label: "End Date" },
    { value: "priority", label: "Priority" },
    { value: "createdAt", label: "Created Date" },
    { value: "name", label: "Name" },
    { value: "percentageComplete", label: "Progress" }
  ];

  const clearAllFilters = () => {
    onFilterChange("project", "");
    onFilterChange("status", "");
    onFilterChange("priority", "");
    onFilterChange("category", "");
    onFilterChange("assignee", "");
    onFilterChange("startDate", "");
    onFilterChange("endDate", "");
  };
  
  const handleSortOrderToggle = () => {
    onFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-indigo-500" />
          <h3 className="font-medium text-slate-800">Filters & Sort</h3>
          {Object.values(filters).filter(val => val && val !== "startDate" && val !== "asc").length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
              {Object.values(filters).filter(val => val && val !== "startDate" && val !== "asc").length}
            </span>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? "transform rotate-180" : ""}`} />
      </div>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Project filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="h-4 w-4" /> Project
                </label>
                <select
                  value={filters.project}
                  onChange={(e) => onFilterChange("project", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange("status", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Priority filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => onFilterChange("priority", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange("category", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date range filters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Start Date From
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange("startDate", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> End Date To
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange("endDate", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Sort options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  {filters.sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange("sortBy", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSortOrderToggle}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    title={filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    {filters.sortOrder === "asc" ? (
                      <SortAsc className="h-5 w-5" />
                    ) : (
                      <SortDesc className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Clear filters button */}
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}