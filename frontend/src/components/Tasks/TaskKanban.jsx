import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  PlusCircle, 
  Filter, 
  ChevronDown, 
  Search,
  AlertCircle,
  Tag,
  Users
} from "lucide-react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import AuthContext from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TaskKanban({ projectId }) {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    priority: [],
    category: [],
    assignee: []
  });
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]); // Add staff state

  const columns = [
    { id: "not_started", title: "Not Started", color: "bg-slate-100" },
    { id: "in_progress", title: "In Progress", color: "bg-blue-100" },
    { id: "on_hold", title: "On Hold", color: "bg-yellow-100" },
    { id: "completed", title: "Completed", color: "bg-green-100" }
  ];

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/tasks${projectId ? `?project=${projectId}` : ''}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        
        const data = await response.json();
        setTasks(data.tasks || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch projects for task form
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/projects`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    // Fetch users for filters
    const fetchUsers = async () => {
      try {
        // Use the correct endpoint - same as in TaskForm
        const response = await fetch(`${API_BASE}/api/admin/users`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.users || []); // Adjust based on your API response structure
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    // Fetch staff for assignees
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/staff/assignees`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch staff: ${response.status}`);
        }
        
        const data = await response.json();
        setStaff(data);
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };

    if (token) {
      fetchTasks();
      fetchProjects();
      fetchUsers();
      fetchStaff();
    }
  }, [token, projectId]);

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex(task => task._id === draggableId);
      
      if (taskIndex !== -1) {
        const [movedTask] = updatedTasks.splice(taskIndex, 1);
        const destinationIndex = updatedTasks.findIndex(task => task.status === destination.droppableId);
        updatedTasks.splice(destinationIndex + destination.index, 0, movedTask);
        
        setTasks(updatedTasks);
      }
    } else {
      // Moving to a different column (status change)
      try {
        const newStatus = destination.droppableId;
        
        // Optimistic UI update
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === draggableId 
              ? { ...task, status: newStatus } 
              : task
          )
        );
        
        // API call to update the task status
        const response = await fetch(`${API_BASE}/tasks/${draggableId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update task status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error updating task status:", err);
        // Rollback on error
        fetchTasks();
      }
    }
  };

  // Create task
  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks([...tasks, data.task]);
      setShowForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
      throw err;
    }
  };

  // Update task
  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(tasks.map(task => (task._id === taskId ? data.task : task)));
      setEditTask(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
      
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Handle form submission
  const handleSubmit = async (taskId, formData) => {
    if (taskId) {
      await handleUpdateTask(taskId, formData);
    } else {
      await handleCreateTask(formData);
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  // Handle status change from dropdown
  const handleStatusChange = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    
    // Show status change dropdown or modal here
    // For simplicity, we'll just cycle through statuses
    const statusOrder = ["not_started", "in_progress", "on_hold", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];
    
    fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to update task status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTasks(tasks.map(t => (t._id === taskId ? data.task : t)));
      })
      .catch(err => {
        console.error("Error updating task status:", err);
      });
  };

  // Filter tasks
  const filterTasks = () => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search && !task.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee.length > 0) {
        const assigneeIds = task.assignees.map(a => a.user?._id || a.user);
        const hasMatchingAssignee = assigneeIds.some(id => filters.assignee.includes(id));
        if (!hasMatchingAssignee) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Group tasks by status
  const groupedTasks = {};
  columns.forEach(column => {
    groupedTasks[column.id] = filterTasks().filter(task => task.status === column.id);
  });

  // Toggle filter selection
  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }
      
      return { ...prev, [type]: current };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      category: [],
      assignee: []
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start text-red-700 max-w-md">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error loading tasks</h3>
            <p className="mt-1 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-800">Task Board</h1>
          {projectId && (
            <div className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-sm">
              {projects.find(p => p._id === projectId)?.name || 'Project'}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="h-4 w-4 text-slate-600" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-72"
              >
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-700">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Status filter */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</h4>
                    <div className="flex flex-wrap gap-1">
                      {columns.map(column => (
                        <label key={column.id} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(column.id)}
                            onChange={() => toggleFilter('status', column.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span>{column.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority filter */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Priority</h4>
                    <div className="flex flex-wrap gap-1">
                      {['low', 'medium', 'high', 'critical'].map(priority => (
                        <label key={priority} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes(priority)}
                            onChange={() => toggleFilter('priority', priority)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="capitalize">{priority}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category filter */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Category</h4>
                    <div className="flex flex-wrap gap-1">
                      {['construction', 'inspection', 'procurement', 'planning', 'safety', 'other'].map(category => (
                        <label key={category} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category)}
                            onChange={() => toggleFilter('category', category)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assignee filter */}
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Assignee</h4>
                    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                      {users.map(user => (
                        <label key={user._id} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={filters.assignee.includes(user._id)}
                            onChange={() => toggleFilter('assignee', user._id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span>{user.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Add task button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Add Task</span>
          </button>
        </div>
      </div>

      {/* Task columns */}
      <div className="flex-1 overflow-y-auto p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(column => (
              <div key={column.id} className="bg-white rounded-lg shadow-sm">
                <div className={`p-4 rounded-t-lg ${column.color} flex items-center justify-between`}>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {column.title}
                  </h2>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-1 font-medium">
                    {groupedTasks[column.id].length}
                  </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-4 space-y-2"
                    >
                      {groupedTasks[column.id].map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task form */}
      {showForm && (
        <TaskForm
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          task={editTask}
          projects={projects}
          users={staff} // Pass staff as users
        />
      )}
    </div>
  );
}