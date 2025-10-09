import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Tag, 
  Users, 
  CheckCircle2, 
  MessageSquare,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  CheckSquare
} from "lucide-react";

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [showActions, setShowActions] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Animations
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Task priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          icon: 'text-red-600'
        };
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: 'text-orange-600'
        };
      case 'medium':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: 'text-blue-600'
        };
      case 'low':
        return {
          badge: 'bg-green-100 text-green-800 border-green-300',
          icon: 'text-green-600'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: 'text-slate-600'
        };
    }
  };
  
  // Task category styling
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'construction':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: 'text-amber-600'
        };
      case 'inspection':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: 'text-purple-600'
        };
      case 'procurement':
        return {
          badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
          icon: 'text-cyan-600'
        };
      case 'planning':
        return {
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: 'text-indigo-600'
        };
      case 'safety':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          icon: 'text-red-600'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: 'text-slate-600'
        };
    }
  };

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', color: 'bg-slate-200' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-200' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-200' },
    { value: 'completed', label: 'Completed', color: 'bg-green-200' }
  ];

  // Progress calculation for progress bar
  const progress = task.percentageComplete || 0;

  // Calculate if task is overdue
  const isOverdue = task.status !== 'completed' && new Date() > new Date(task.endDate);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      style={{ 
        borderLeft: task.priority === 'critical' ? '4px solid #ef4444' : 
                    task.priority === 'high' ? '4px solid #f97316' :
                    task.priority === 'medium' ? '4px solid #3b82f6' : 
                    '4px solid #22c55e' 
      }}
    >
      {/* Card Header */}
      <div className="p-4 relative">
        <div className="flex justify-between">
          {/* Status Badge */}
          <div className="flex gap-2 mb-2">
            <div className="relative">
              <button
                onClick={() => onStatusChange && onStatusChange(task._id)}
                className="text-xs font-medium px-2 py-1 rounded-md border cursor-pointer"
                style={{ 
                  backgroundColor: statusOptions.find(s => s.value === task.status)?.color || 'bg-slate-200'
                }}
              >
                {task.status?.replace('_', ' ').charAt(0).toUpperCase() + task.status?.replace('_', ' ').slice(1) || 'Not Started'}
              </button>
              {isOverdue && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-slate-100"
            >
              <MoreVertical size={16} className="text-slate-600" />
            </button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-1 z-10 min-w-[160px] border border-slate-200"
              >
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit(task);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                >
                  <Edit3 size={14} className="text-indigo-600" />
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    // Implement duplicate functionality
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm"
                >
                  <Copy size={14} className="text-slate-600" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete(task._id);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-red-600"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h3 className="text-base font-semibold text-slate-800 line-clamp-2 mb-1 mt-1">
          {task.name}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Meta information */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {/* Priority */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getPriorityStyle(task.priority).badge}`}>
            <AlertCircle size={12} className={getPriorityStyle(task.priority).icon} />
            <span className="capitalize">{task.priority}</span>
          </div>
          
          {/* Category */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getCategoryStyle(task.category).badge}`}>
            <Tag size={12} className={getCategoryStyle(task.category).icon} />
            <span className="capitalize">{task.category}</span>
          </div>
        </div>

        {/* Date and time */}
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
          </div>
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignee, index) => (
                  <div 
                    key={index} 
                    className="h-6 w-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-xs font-medium text-indigo-700 uppercase"
                    title={assignee.user?.name || "Assigned user"}
                  >
                    {(assignee.user?.name || "U").charAt(0)}
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-xs font-medium text-slate-600">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checklist summary */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mt-3">
            <button 
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors"
              onClick={() => setShowChecklist(!showChecklist)}
            >
              <CheckSquare size={14} />
              <span>{task.checklist.filter(item => item.completed).length}/{task.checklist.length} completed</span>
              <svg 
                className={`h-4 w-4 transition-transform ${showChecklist ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showChecklist && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 bg-slate-50 p-2 rounded-md text-xs"
              >
                {task.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`h-3.5 w-3.5 rounded-sm flex items-center justify-center ${item.completed ? 'bg-green-500' : 'border border-slate-300'}`}>
                      {item.completed && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className={item.completed ? 'line-through text-slate-400' : ''}>{item.item}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Comments count */}
        {task.comments && task.comments.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <MessageSquare size={14} />
            <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}