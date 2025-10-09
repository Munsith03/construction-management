import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function TasksTable({ tasks, onEdit, onDelete, onStatusChange }) {
  const [sortField, setSortField] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("asc");
  
  const statusIcons = {
    not_started: <Clock className="h-4 w-4" />,
    in_progress: <PlayCircle className="h-4 w-4" />,
    on_hold: <PauseCircle className="h-4 w-4" />,
    completed: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />
  };
  
  const priorityClasses = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200"
  };

  const statusClasses = {
    not_started: "bg-slate-50 text-slate-700 border-slate-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    on_hold: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200"
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "-";
    }
  };
  
  const isOverdue = (task) => {
    if (!task.endDate) return false;
    if (task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date() > new Date(task.endDate);
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleStatusChange = (taskId, newStatus) => {
    onStatusChange(taskId, newStatus);
  };
  
  const getAssigneeDisplay = (assignees) => {
    if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
      return '-';
    }
    
    try {
      if (assignees.length > 2) {
        // Safely access the first assignee's name or email
        const firstAssignee = assignees[0];
        const displayName = firstAssignee.user?.name || 
                           firstAssignee.user?.email || 
                           (typeof firstAssignee.user === 'string' ? 'User ' + firstAssignee.user.substring(0, 6) : 'User');
        return `${displayName} +${assignees.length - 1} others`;
      } else {
        // Map all assignees, safely accessing their names or emails
        return assignees.map(a => {
          if (!a || !a.user) return 'Unknown';
          return a.user.name || a.user.email || 
                (typeof a.user === 'string' ? 'User ' + a.user.substring(0, 6) : 'User');
        }).join(', ');
      }
    } catch (e) {
      console.error("Error displaying assignees:", e);
      return '-';
    }
  };
  
  // Safely handle tasks sorting
  const sortedTasks = [...(Array.isArray(tasks) ? tasks : [])].sort((a, b) => {
    let comparison = 0;
    
    try {
      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = priorityOrder[a.priority || "low"] - priorityOrder[b.priority || "low"];
          break;
        case "status":
          const statusOrder = { 
            not_started: 1, 
            in_progress: 2, 
            on_hold: 3, 
            completed: 4, 
            cancelled: 5 
          };
          comparison = statusOrder[a.status || "not_started"] - statusOrder[b.status || "not_started"];
          break;
        case "startDate":
          const aStart = a.startDate ? new Date(a.startDate) : new Date(0);
          const bStart = b.startDate ? new Date(b.startDate) : new Date(0);
          comparison = aStart - bStart;
          break;
        case "endDate":
          const aEnd = a.endDate ? new Date(a.endDate) : new Date(0);
          const bEnd = b.endDate ? new Date(b.endDate) : new Date(0);
          comparison = aEnd - bEnd;
          break;
        case "progress":
          comparison = (a.percentageComplete || 0) - (b.percentageComplete || 0);
          break;
        default:
          comparison = 0;
      }
    } catch (e) {
      console.error("Error sorting tasks:", e);
      return 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto rounded-xl border shadow bg-white animate-fade">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Task Name
                {sortField === "name" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("priority")}
            >
              <div className="flex items-center">
                Priority
                {sortField === "priority" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortField === "status" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("startDate")}
            >
              <div className="flex items-center">
                Start Date
                {sortField === "startDate" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("endDate")}
            >
              <div className="flex items-center">
                End Date
                {sortField === "endDate" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("progress")}
            >
              <div className="flex items-center">
                Progress
                {sortField === "progress" && (
                  sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                No tasks found matching your filters
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr key={task._id} 
                className={`hover:bg-slate-50 ${isOverdue(task) ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{task.name || "Unnamed Task"}</div>
                  <div className="text-sm text-slate-500 truncate max-w-xs">
                    {task.description?.substring(0, 60) || "No description"}{task.description?.length > 60 ? '...' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-md border ${priorityClasses[task.priority || "medium"]}`}>
                    {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-md border ${statusClasses[task.status || "not_started"]}`}>
                    <div className="flex items-center gap-1">
                      {statusIcons[task.status || "not_started"]}
                      <span>
                        {task.status === 'not_started' ? 'Not Started' :
                         task.status === 'in_progress' ? 'In Progress' :
                         task.status === 'on_hold' ? 'On Hold' :
                         task.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{task.project?.name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500">{formatDate(task.startDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-slate-500">{formatDate(task.endDate)}</div>
                    {isOverdue(task) && (
                      <AlertTriangle className="h-4 w-4 ml-1 text-red-500" title="Overdue" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' : 
                        task.status === 'cancelled' ? 'bg-red-500' :
                        isOverdue(task) ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${task.percentageComplete || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 text-right">{task.percentageComplete || 0}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500">
                    {getAssigneeDisplay(task.assignees)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={task.status || "not_started"}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}