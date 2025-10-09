import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Clipboard,
  ClipboardCheck,
  Filter,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Loader2,
  TrendingUp,
  FileText, // Add this import
} from "lucide-react";
import TaskForm from "../components/Tasks/TaskForm";
import TaskCard from "../components/Tasks/TaskCard";
import TasksTable from "../components/Tasks/TasksTable";
import TaskFilters from "../components/Tasks/TaskFilters.jsx"; // Add .jsx extension
import TaskKanban from "../components/Tasks/TaskKanban";
import TaskStatistics from "../components/Tasks/TaskStatistics";
import {
  generateTaskReport,
  downloadTaskReport,
  forceDownloadTaskReport,
} from "../utils/taskReportGenerator";

// Required fields for task creation
const requiredFields = [
  "name",
  "description",
  "startDate",
  "endDate",
  "category",
  "priority",
  "project",
];

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Tasks() {
  const { token } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("board"); // board, table, kanban
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [projects, setProjects] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    project: "",
    status: "",
    priority: "",
    category: "",
    assignee: "",
    startDate: "",
    endDate: "",
    sortBy: "startDate",
    sortOrder: "asc",
  });

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.project) queryParams.append("project", filters.project);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.assignee) queryParams.append("assignee", filters.assignee);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      queryParams.append("sortBy", filters.sortBy);
      queryParams.append("sortOrder", filters.sortOrder);

      const response = await fetch(
        `${API_BASE}/tasks?${queryParams.toString()}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchAnalytics function to properly handle error cases
  const fetchAnalytics = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.project) queryParams.append("project", filters.project);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(
        `${API_BASE}/tasks/analytics?${queryParams.toString()}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      console.log("Analytics data received:", data); // Add this to debug

      // Make sure data has all the required fields with proper defaults
      setAnalytics({
        totalTasks: data.totalTasks || 0,
        completedTasks: data.completedTasks || 0,
        inProgressTasks: data.inProgressTasks || 0,
        notStartedTasks: data.notStartedTasks || 0,
        onHoldTasks: data.onHoldTasks || 0,
        cancelledTasks: data.cancelledTasks || 0,
        overdueTasks: data.overdueTasks || 0,
        completionRate: data.completionRate || 0,
        averageCompletionTime: data.averageCompletionTime || 0,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      // Set default analytics to prevent errors in the statistics component
      setAnalytics({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        onHoldTasks: 0,
        cancelledTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        averageCompletionTime: 0,
      });
    }
  };

  // Fix the fetchProjects function to properly handle the API response
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();

      // Depending on your API response structure, use the correct format
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchAnalytics();
      fetchProjects();
    }
  }, [token, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Improve the handleCreateTask function

  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      setError("");

      // Validate required fields
      const missingFields = requiredFields.filter((field) => !taskData[field]);
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      console.log(
        "Creating task with data:",
        JSON.stringify(taskData, null, 2)
      );

      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify(taskData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if (responseData.message?.includes("assignees not found")) {
            throw new Error(
              "One or more team members could not be assigned. Please verify that the staff members exist."
            );
          } else {
            throw new Error(responseData.message || "Invalid task data");
          }
        } else {
          throw new Error(
            responseData.message || `Failed to create task: ${response.status}`
          );
        }
      }

      // Success case
      setTasks((prev) => [responseData.task, ...prev]);
      setIsFormOpen(false);
      fetchAnalytics();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const data = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? data.task : task))
      );
      setIsFormOpen(false);
      setCurrentTask(null);
      fetchAnalytics();
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task");
    }
  };

  const handleUpdateStatus = async (id, status, percentageComplete) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, percentageComplete }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      const data = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? data.task : task))
      );
      fetchAnalytics();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Failed to update status");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      setTasks((prev) => prev.filter((task) => task._id !== id));
      fetchAnalytics();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.message || "Failed to delete task");
    }
  };

  const openCreateForm = () => {
    setCurrentTask(null);
    setIsFormOpen(true);
  };

  const openEditForm = (task) => {
    setCurrentTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentTask(null);
  };

  // Update the generateReport function to ensure Edge-like behavior
  const generateReport = () => {
    try {
      setLoading(true);
      setError("");

      if (tasks.length === 0) {
        setError("No tasks available to include in the report");
        setLoading(false);
        return;
      }

      const reportTitle = `Task Report ${
        filters.project ? `- ${filters.project}` : ""
      }`;
      const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      // Show user a notification
      alert("Your report will open in a new browser tab.");

      // Create the PDF document
      const pdfDoc = generateTaskReport({
        title: reportTitle,
        tasks,
        filters,
        analytics,
        generatedBy: "User",
      });

      // Call the updated download method which prioritizes the Edge-like behavior
      downloadTaskReport(pdfDoc, fileName);

      setLoading(false);
    } catch (error) {
      console.error("Report generation error:", error);
      setError(`Failed to generate report: ${error.message}`);
      setLoading(false);

      // Offer text report as fallback
      const confirmed = window.confirm(
        "PDF generation failed. Would you like to download a simple text report instead?"
      );
      if (confirmed) {
        generateSimpleReport();
      }
    }
  };

  // Add a simple text report generator fallback
  const generateSimpleReport = () => {
    try {
      const reportTitle = `Task Report ${
        filters.project ? `- ${filters.project}` : ""
      }`;
      let report = `${reportTitle.toUpperCase()}\n`;
      report += `Generated on: ${new Date().toLocaleString()}\n\n`;

      if (analytics) {
        report += `TASK STATISTICS\n`;
        report += `--------------\n`;
        report += `Total Tasks: ${analytics.totalTasks}\n`;
        report += `Completed: ${analytics.completedTasks} (${Math.round(
          analytics.completionRate
        )}%)\n`;
        report += `In Progress: ${analytics.inProgressTasks}\n`;
        report += `Not Started: ${analytics.notStartedTasks}\n`;
        report += `On Hold: ${analytics.onHoldTasks}\n`;
        report += `Cancelled: ${analytics.cancelledTasks}\n`;
        report += `Overdue: ${analytics.overdueTasks}\n\n`;
      }

      report += `TASKS\n`;
      report += `-----\n\n`;

      tasks.forEach((task, i) => {
        report += `${i + 1}. ${task.name}\n`;
        report += `   Status: ${task.status?.replace("_", " ")}\n`;
        report += `   Priority: ${task.priority}\n`;
        report += `   Start Date: ${
          task.startDate ? new Date(task.startDate).toLocaleDateString() : "N/A"
        }\n`;
        report += `   Due Date: ${
          task.endDate ? new Date(task.endDate).toLocaleDateString() : "N/A"
        }\n\n`;
      });

      const blob = new Blob([report], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportTitle.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error generating simple report:", error);
      setError(`Failed to generate simple report: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with title, filters and action buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clipboard className="h-6 w-6 text-indigo-600" />
            Task Management
          </h1>
          <p className="text-slate-500 mt-1">
            Create, assign and track project tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>

          <button
            onClick={generateReport}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-sm"
            title="Generate Task Report"
          >
            <FileText className="h-5 w-5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          <div className="flex">
            <button
              className={`px-4 py-2 border-t border-b border-l rounded-l-lg ${
                view === "board"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                  : "bg-white text-slate-600"
              } hover:bg-indigo-50 transition-colors duration-200`}
              onClick={() => setView("board")}
            >
              <div className="flex items-center gap-1">
                <Clipboard className="h-4 w-4" />
                <span className="hidden sm:inline">Board</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 border ${
                view === "table"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                  : "bg-white text-slate-600"
              } hover:bg-indigo-50 transition-colors duration-200`}
              onClick={() => setView("table")}
            >
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 border-t border-b border-r rounded-r-lg ${
                view === "kanban"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                  : "bg-white text-slate-600"
              } hover:bg-indigo-50 transition-colors duration-200`}
              onClick={() => setView("kanban")}
            >
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </div>
            </button>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow animate-pulse-subtle"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </p>
        </div>
      )}

      {/* Task dashboard overview */}
      {analytics ? (
        <TaskStatistics analytics={analytics} />
      ) : (
        <div className="bg-white rounded-xl border shadow p-4 animate-fade">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Task Overview
            </h2>
          </div>
          <p className="text-slate-500 text-center py-4">
            Loading analytics...
          </p>
        </div>
      )}

      {/* Task filters */}
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        projects={projects}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Task views */}
      {!loading && (
        <>
          {view === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade">
              {tasks.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500">
                    No tasks found matching your filters
                  </p>
                  <button
                    onClick={openCreateForm}
                    className="mt-2 text-indigo-600 hover:text-indigo-800"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => openEditForm(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                    onStatusChange={handleUpdateStatus}
                  />
                ))
              )}
            </div>
          )}

          {view === "table" && (
            <TasksTable
              tasks={tasks}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
              onStatusChange={handleUpdateStatus}
            />
          )}

          {view === "kanban" && (
            <TaskKanban
              tasks={tasks}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
              onStatusChange={handleUpdateStatus}
            />
          )}
        </>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <TaskForm
              task={currentTask}
              projects={projects} // Make sure this is actually the projects array
              onSubmit={currentTask ? handleUpdateTask : handleCreateTask}
              onClose={closeForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
