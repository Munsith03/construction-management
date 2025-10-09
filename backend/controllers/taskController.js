import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Staff from "../models/Staff.js"; // Add this import
import mongoose from "mongoose";

// Required fields from your backend controller
const requiredFields = [
  "name",
  "description",
  "startDate",
  "endDate",
  "category",
  "priority",
  "project",
];

// Create new task
export const createTask = async (req, res) => {
  try {
    console.log("Task creation request body:", req.body);

    const {
      name,
      description,
      startDate,
      endDate,
      location,
      coordinates,
      category,
      priority,
      project,
      milestone,
      assignees,
      estimatedHours,
      quantityPlanned,
      checklist,
      dependencies,
    } = req.body;

    // Validate project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Validate assignees exist
    if (assignees && assignees.length > 0) {
      console.log("Validating assignees:", assignees);
      const userIds = assignees.map((a) => a.user);
      console.log("User IDs to validate:", userIds);

      const staffExist = await Staff.find({ _id: { $in: userIds } });
      console.log("Found staff records:", staffExist.length);

      if (staffExist.length !== userIds.length) {
        console.log(
          "Missing staff IDs:",
          userIds.filter(
            (id) => !staffExist.some((s) => s._id.toString() === id.toString())
          )
        );
        return res
          .status(400)
          .json({ message: "One or more assignees not found" });
      }
    }

    // Make sure these fields are all present and valid in your form data
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    const task = new Task({
      name,
      description,
      startDate,
      endDate,
      location,
      coordinates,
      category,
      priority,
      project,
      milestone,
      assignees: assignees || [],
      estimatedHours,
      quantityPlanned,
      checklist: checklist || [],
      dependencies: dependencies || [],
      createdBy: req.user.id,
    });

    await task.save();
    await task.populate(["assignees.user", "project", "createdBy"]);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tasks with filters
export const getTasks = async (req, res) => {
  try {
    const {
      project,
      assignee,
      status,
      priority,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    // Apply filters
    if (project) filter.project = project;
    if (assignee) filter["assignees.user"] = assignee;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const tasks = await Task.find(filter)
      .populate("assignees.user", "name email")
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignees.user", "name email role")
      .populate("project", "name description")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email")
      .populate("dependencies.task", "name status")
      .populate("statusHistory.changedBy", "name email")
      .populate("issues.reportedBy", "name email")
      .populate("issues.assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Add modifier for audit trail
    updateData.modifiedBy = req.user.id;

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["assignees.user", "project", "createdBy"]);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldStatus = task.status;
    task.status = status;

    // Set completion date when task is completed
    if (status === "completed" && oldStatus !== "completed") {
      task.completedDate = new Date();
      task.percentageComplete = 100;
    }

    // Remove completion date if task is moved from completed to another status
    if (oldStatus === "completed" && status !== "completed") {
      task.completedDate = undefined;
    }

    await task.save();

    res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add comment to task
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments = [] } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = {
      user: req.user.id,
      content,
      attachments,
      createdAt: new Date(),
    };

    task.comments.push(comment);
    await task.save();

    await task.populate("comments.user", "name email");

    res.json({
      message: "Comment added successfully",
      comment: task.comments[task.comments.length - 1],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add issue/blocker
export const addIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, severity, assignedTo } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const issue = {
      title,
      description,
      severity,
      assignedTo,
      reportedBy: req.user.id,
      reportedAt: new Date(),
    };

    task.issues.push(issue);
    await task.save();

    await task.populate("issues.reportedBy issues.assignedTo", "name email");

    res.json({
      message: "Issue reported successfully",
      issue: task.issues[task.issues.length - 1],
    });
  } catch (error) {
    console.error("Add issue error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update checklist item
export const updateChecklistItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { completed, notes } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const checklistItem = task.checklist.id(itemId);
    if (!checklistItem) {
      return res.status(404).json({ message: "Checklist item not found" });
    }

    checklistItem.completed = completed;
    checklistItem.notes = notes;

    if (completed) {
      checklistItem.completedBy = req.user.id;
      checklistItem.completedAt = new Date();
    } else {
      checklistItem.completedBy = undefined;
      checklistItem.completedAt = undefined;
    }

    await task.save();

    res.json({
      message: "Checklist item updated successfully",
      checklistItem,
    });
  } catch (error) {
    console.error("Update checklist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update the getTaskAnalytics function to calculate all required fields
export const getTaskAnalytics = async (req, res) => {
  try {
    const { project, startDate, endDate } = req.query;

    const matchFilter = {};

    // Apply filters
    if (project) {
      matchFilter.project = mongoose.Types.ObjectId(project);
    }

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    // Simple count for basic metrics
    const totalTasks = await Task.countDocuments(matchFilter);

    // Status counts
    const completedTasks = await Task.countDocuments({
      ...matchFilter,
      status: "completed",
    });

    const inProgressTasks = await Task.countDocuments({
      ...matchFilter,
      status: "in_progress",
    });

    const notStartedTasks = await Task.countDocuments({
      ...matchFilter,
      status: "not_started",
    });

    const onHoldTasks = await Task.countDocuments({
      ...matchFilter,
      status: "on_hold",
    });

    const cancelledTasks = await Task.countDocuments({
      ...matchFilter,
      status: "cancelled",
    });

    // Calculate overdue tasks (end date is before today and not completed/cancelled)
    const overdueTasks = await Task.countDocuments({
      ...matchFilter,
      endDate: { $lt: new Date() },
      status: { $nin: ["completed", "cancelled"] },
    });

    // Calculate completion rate
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (in minutes)
    let averageCompletionTime = 0;

    if (completedTasks > 0) {
      const completedTasksData = await Task.find({
        ...matchFilter,
        status: "completed",
        startDate: { $exists: true },
        completedDate: { $exists: true },
      });

      let totalTimeMinutes = 0;
      let countForAverage = 0;

      completedTasksData.forEach((task) => {
        if (task.startDate && task.completedDate) {
          const startDate = new Date(task.startDate);
          const completedDate = new Date(task.completedDate);
          const diffTime = Math.abs(completedDate - startDate);
          const diffMinutes = Math.ceil(diffTime / (1000 * 60));

          totalTimeMinutes += diffMinutes;
          countForAverage++;
        }
      });

      if (countForAverage > 0) {
        averageCompletionTime = Math.round(totalTimeMinutes / countForAverage);
      }
    }

    // Return the analytics data
    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      onHoldTasks,
      cancelledTasks,
      overdueTasks,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageCompletionTime,
    });
  } catch (error) {
    console.error("Task analytics error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
