import { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  XCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

// Fix the analytics check to handle falsy and incomplete data
export default function TaskStatistics({ analytics }) {
  const [expanded, setExpanded] = useState(true);

  // Early return with empty state if no analytics
  if (!analytics || typeof analytics !== 'object') {
    return (
      <div className="bg-white rounded-xl border shadow p-4 animate-fade">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Task Overview
          </h2>
        </div>
        <p className="text-slate-500 text-center py-4">No analytics data available</p>
      </div>
    );
  }

  // Safely extract values with defaults
  const {
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    notStartedTasks = 0,
    onHoldTasks = 0,
    cancelledTasks = 0,
    overdueTasks = 0,
    completionRate = 0,
    averageCompletionTime = 0
  } = analytics;

  // Format average completion time from minutes to days/hours
  const formatCompletionTime = (minutes) => {
    if (!minutes || isNaN(minutes) || minutes <= 0) return "N/A";
    
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow p-4 animate-fade">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Task Overview
        </h2>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "Hide" : "Show"} details
        </button>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase">Total Tasks</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{totalTasks}</span>
          </div>
          <div className="mt-1 text-2xl font-semibold">{totalTasks}</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-500">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              <span>{Math.round(completionRate)}% completed</span>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              <span>{overdueTasks} overdue</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-medium uppercase">Status Breakdown</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <span className="text-sm font-medium">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3 text-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <span className="text-sm font-medium">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span className="text-sm">Not Started</span>
              </div>
              <span className="text-sm font-medium">{notStartedTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-medium uppercase">Other Status</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <PauseCircle className="h-3 w-3 text-amber-500" />
                <span className="text-sm">On Hold</span>
              </div>
              <span className="text-sm font-medium">{onHoldTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                <span className="text-sm">Cancelled</span>
              </div>
              <span className="text-sm font-medium">{cancelledTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-sm">Overdue</span>
              </div>
              <span className="text-sm font-medium">{overdueTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-medium uppercase">Performance</div>
          <div className="mt-1 text-lg font-semibold flex items-center gap-2">
            <span>{Math.round(completionRate)}%</span>
            <span className="text-sm text-slate-500 font-normal">completion rate</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-slate-500">Average completion time</div>
            </div>
            <div className="text-lg font-medium">
              {formatCompletionTime(averageCompletionTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {expanded && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
          <div className="mb-2 text-xs text-slate-500 font-medium uppercase">Task Completion Progress</div>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-1">
            <div 
              className="h-3 rounded-full bg-indigo-500" 
              style={{ width: `${Math.round(completionRate)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <div>0%</div>
            <div>{Math.round(completionRate)}%</div>
            <div>100%</div>
          </div>
        </div>
      )}
    </div>
  );
}