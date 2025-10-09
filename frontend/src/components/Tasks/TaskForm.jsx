import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar,
  MapPin,
  Clock,
  CalendarCheck,
  User,
  ListTodo,
  Tag,
  Building,
  Milestone,
  CheckSquare,
  AlertCircle,
  BadgeAlert
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TaskForm({ task, projects, users = [], onSubmit, onClose }) {
  const { token } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [localUsers, setLocalUsers] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    coordinates: { lat: null, lng: null },
    category: "construction",
    priority: "medium",
    project: "",
    milestone: "",
    assignees: [],
    estimatedHours: 0,
    quantityPlanned: { value: 0, unit: "" },
    checklist: []
  });
  
  // Edit case: fill form with task data
  useEffect(() => {
    if (task) {
      const formattedStartDate = task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "";
      const formattedEndDate = task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "";
      
      setForm({
        name: task.name || "",
        description: task.description || "",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        location: task.location || "",
        coordinates: task.coordinates || { lat: null, lng: null },
        category: task.category || "construction",
        priority: task.priority || "medium",
        project: task.project?._id || task.project || "",
        milestone: task.milestone || "",
        assignees: task.assignees || [],
        estimatedHours: task.estimatedHours || 0,
        quantityPlanned: task.quantityPlanned || { value: 0, unit: "" },
        checklist: task.checklist || []
      });
    }
  }, [task]);
  
  // Fetch staff for assignees
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // If users are already provided through props, use them
        if (users && users.length > 0) {
          setLocalUsers(users);
          return;
        }
        
        // Use the correct staff endpoint
        const res = await fetch(`${API_BASE}/staff/assignees`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch staff: ${res.status}`);
        }
        
        const data = await res.json();
        setLocalUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Could not load team members. Please try again later.");
      }
    };
    
    if (token) {
      fetchStaff();
    }
  }, [token, users]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCoordinatesChange = (lat, lng) => {
    setForm(prev => ({
      ...prev,
      coordinates: { lat, lng }
    }));
  };
  
  const handleQuantityChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      quantityPlanned: {
        ...prev.quantityPlanned,
        [field]: value
      }
    }));
  };
  
  const addAssignee = () => {
    if (localUsers.length === 0) return;
    
    setForm(prev => ({
      ...prev,
      assignees: [...prev.assignees, { user: "", role: "member" }]
    }));
  };
  
  const removeAssignee = (index) => {
    setForm(prev => ({
      ...prev,
      assignees: prev.assignees.filter((_, i) => i !== index)
    }));
  };
  
  const handleAssigneeChange = (index, field, value) => {
    setForm(prev => {
      const newAssignees = [...prev.assignees];
      newAssignees[index] = { ...newAssignees[index], [field]: value };
      return { ...prev, assignees: newAssignees };
    });
  };
  
  const addChecklistItem = () => {
    setForm(prev => ({
      ...prev,
      checklist: [...prev.checklist, { item: "", completed: false }]
    }));
  };
  
  const removeChecklistItem = (index) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };
  
  const handleChecklistChange = (index, value) => {
    setForm(prev => {
      const newChecklist = [...prev.checklist];
      newChecklist[index] = { ...newChecklist[index], item: value };
      return { ...prev, checklist: newChecklist };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      setError("Task name is required");
      return;
    }
    
    if (!form.project) {
      setError("Project is required");
      return;
    }
    
    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Create a clean copy of assignees with valid data only
      const validAssignees = form.assignees
        .filter(assignee => assignee.user && assignee.user !== "") // Remove empty assignees
        .map(assignee => {
          // Extract just the ID to avoid sending unnecessary data
          const userId = typeof assignee.user === 'object' ? 
            assignee.user._id : assignee.user;
            
          return {
            user: userId,
            role: assignee.role || "member"
          };
        });
      
      // Ensure data is properly formatted to match backend expectations
      const formattedData = {
        ...form,
        // Make sure IDs are properly handled
        project: form.project?._id || form.project,
        milestone: form.milestone,
        // Use our validated assignees array
        assignees: validAssignees,
        // Ensure numeric fields are actually numbers
        estimatedHours: Number(form.estimatedHours) || 0,
        // Ensure coordinates are properly formatted
        coordinates: form.coordinates && form.coordinates.lat && form.coordinates.lng ? 
          form.coordinates : { lat: null, lng: null },
        // Ensure quantityPlanned is properly formatted
        quantityPlanned: {
          value: Number(form.quantityPlanned?.value) || 0,
          unit: form.quantityPlanned?.unit || ""
        }
      };
      
      if (task) {
        await onSubmit(task._id, formattedData);
      } else {
        await onSubmit(formattedData);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  // Get priority style classes
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Get category style classes
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'construction':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'inspection':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'procurement':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'planning':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'safety':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'basic':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task name"
                />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4 text-slate-500" />
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={form.estimatedHours}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {/* Project & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="h-4 w-4 text-slate-500" />
                  Project
                </label>
                <select
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a Project</option>
                  {projects && Array.isArray(projects) && projects.length > 0 ? (
                    projects.map(project => (
                      <option key={project._id || project.id} value={project._id || project.id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No projects available</option>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="h-4 w-4 text-slate-500" />
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="construction">Construction</option>
                  <option value="inspection">Inspection</option>
                  <option value="procurement">Procurement</option>
                  <option value="planning">Planning</option>
                  <option value="safety">Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  Priority
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['low', 'medium', 'high', 'critical'].map(p => (
                    <label 
                      key={p}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                        form.priority === p ? getPriorityStyle(p) : 'bg-white border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={form.priority === p}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <BadgeAlert className={`h-4 w-4 ${form.priority === p ? 'opacity-100' : 'opacity-60'}`} />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quantity Planned */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planned Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="quantityPlanned.value"
                    value={form.quantityPlanned.value}
                    onChange={(e) => handleQuantityChange("value", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter quantity"
                  />
                  
                  <select
                    name="quantityPlanned.unit"
                    value={form.quantityPlanned.unit}
                    onChange={(e) => handleQuantityChange("unit", e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select unit</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="pcs">pcs</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Milestone className="h-4 w-4 text-slate-500" />
                  Milestone
                </label>
                <input
                  type="text"
                  name="milestone"
                  value={form.milestone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter milestone (optional)"
                />
              </div>
            </div>
          </motion.div>
        );
      case 'assignees':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Assign Team Members
                </h3>
                <button
                  type="button"
                  onClick={addAssignee}
                  className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Assignee
                </button>
              </div>
              
              {form.assignees.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No assignees yet. Add team members to this task.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.assignees.map((assignee, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <select
                        value={assignee.user}
                        onChange={(e) => handleAssigneeChange(index, "user", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select a staff member</option>
                        {localUsers && localUsers.length > 0 ? (
                          localUsers.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.name} {user.position ? `(${user.position})` : ""}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No staff available</option>
                        )}
                      </select>
                      
                      <select
                        value={assignee.role}
                        onChange={(e) => handleAssigneeChange(index, "role", e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="lead">Lead</option>
                        <option value="member">Member</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="observer">Observer</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => removeAssignee(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'checklist':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-700 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-indigo-500" />
                  Quality Control Checklist
                </h3>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
              
              {form.checklist.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No checklist items yet. Add quality control items to track.
                </div>
              ) : (
                <div className="space-y-2">
                  {form.checklist.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => handleChecklistChange(index, e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter checklist item"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-indigo-600" />
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-6">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "basic" 
                    ? "border-indigo-500 text-indigo-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assignees")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "assignees" 
                    ? "border-indigo-500 text-indigo-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Assignees
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("checklist")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "checklist" 
                    ? "border-indigo-500 text-indigo-600" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Checklist
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {task ? "Update Task" : "Create Task"}
                </>
              )}
            </motion.button>
            
            
          </div>
        </form>
      </div>
    </motion.div>
  );
}
