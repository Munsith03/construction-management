import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // Basic task information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Dates and timing
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualStartTime: Date,
    actualEndTime: Date,
    pausedTime: [
      {
        pauseStart: Date,
        pauseEnd: Date,
        reason: String,
      },
    ],

    // Location and categorization
    location: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    category: {
      type: String,
      enum: [
        "construction",
        "inspection",
        "procurement",
        "planning",
        "safety",
        "other",
      ],
      default: "construction",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Project and milestone linking
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    milestone: {
      type: String,
      trim: true,
    },

    // Assignment and roles
    assignees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff", // Changed from User to Staff
          required: true,
        },
        role: {
          type: String,
          enum: ["lead", "member", "reviewer", "observer"],
          default: "member",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Progress tracking
    status: {
      type: String,
      enum: ["not_started", "in_progress", "on_hold", "completed", "cancelled"],
      default: "not_started",
    },
    percentageComplete: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantityPlanned: {
      value: Number,
      unit: String,
    },
    quantityCompleted: {
      value: Number,
      unit: String,
    },

    // Dependencies
    dependencies: [
      {
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
        },
        type: {
          type: String,
          enum: [
            "finish_to_start",
            "start_to_start",
            "finish_to_finish",
            "start_to_finish",
          ],
          default: "finish_to_start",
        },
      },
    ],

    // Checklist and documentation
    checklist: [
      {
        item: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completedAt: Date,
        notes: String,
      },
    ],

    // Comments and notes
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            fileName: String,
            fileUrl: String,
            fileType: String,
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],

    // Documents and attachments
    documents: [
      {
        name: String,
        url: String,
        type: {
          type: String,
          enum: ["drawing", "permit", "instruction", "photo", "video", "other"],
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Issues and blockers
    issues: [
      {
        title: String,
        description: String,
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        status: {
          type: String,
          enum: ["open", "in_progress", "resolved", "closed"],
          default: "open",
        },
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        resolvedAt: Date,
        resolution: String,
      },
    ],

    // Audit trail
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],

    // Notifications
    notificationsSent: [
      {
        type: String,
        sentTo: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Add this field to the Task schema if it doesn't exist
    completedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ "assignees.user": 1 });
taskSchema.index({ startDate: 1, endDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ category: 1, priority: 1 });

// Virtual for overdue status
taskSchema.virtual("isOverdue").get(function () {
  return this.status !== "completed" && new Date() > this.endDate;
});

// Pre-save middleware to update status history
taskSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.modifiedBy || this.createdBy,
      changedAt: new Date(),
    });
  }
  next();
});

export default mongoose.model("Task", taskSchema);
