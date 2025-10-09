// Fix the imports to ensure proper loading of pdfMake
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with fonts correctly
pdfMake.vfs = pdfFonts.pdfMake
  ? pdfFonts.pdfMake.vfs
  : pdfFonts.default?.vfs || {};

// Enhanced styles for task reports
const taskReportStyles = {
  header: {
    fontSize: 26,
    bold: true,
    color: "#3b82f6",
    margin: [0, 0, 0, 15],
    alignment: "center",
  },
  subheader: {
    fontSize: 20,
    bold: true,
    color: "#4b5563",
    margin: [0, 20, 0, 10],
    decoration: "underline",
    decorationStyle: "solid",
    decorationColor: "#e5e7eb",
  },
  section: {
    fontSize: 16,
    bold: true,
    color: "#6366f1",
    margin: [0, 10, 0, 8],
  },
  tableHeader: {
    fontSize: 12,
    bold: true,
    color: "#ffffff",
    fillColor: "#4f46e5",
    alignment: "center",
  },
  metadata: {
    fontSize: 10,
    color: "#6b7280",
    alignment: "right",
    margin: [0, 5, 0, 20],
  },
  footer: {
    fontSize: 10,
    color: "#6b7280",
    alignment: "center",
    margin: [0, 10, 0, 0],
  },
  badge: {
    padding: [3, 5],
    margin: [0, 2, 0, 2],
    borderRadius: 5,
    alignment: "center",
  },
  card: {
    margin: [0, 5, 0, 5],
    padding: 10,
    fillColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 5,
  },
  statsValue: {
    fontSize: 28,
    bold: true,
    margin: [0, 8, 0, 5],
    alignment: "center",
  },
  statsLabel: {
    fontSize: 12,
    color: "#6b7280",
    alignment: "center",
    bold: true,
  },
  tableCell: {
    margin: [3, 5, 3, 5],
  },
  divider: {
    margin: [0, 15, 0, 15],
  },
};

// Status color mapping
const statusColors = {
  not_started: { color: "#6b7280", background: "#f3f4f6" },
  in_progress: { color: "#2563eb", background: "#dbeafe" },
  completed: { color: "#059669", background: "#d1fae5" },
  on_hold: { color: "#d97706", background: "#fef3c7" },
  cancelled: { color: "#dc2626", background: "#fee2e2" },
};

// Priority color mapping
const priorityColors = {
  low: { color: "#1d4ed8", background: "#dbeafe" },
  medium: { color: "#047857", background: "#d1fae5" },
  high: { color: "#b45309", background: "#fef3c7" },
  critical: { color: "#b91c1c", background: "#fee2e2" },
};

/**
 * Generate a task report PDF
 * @param {Object} options - Report options
 * @param {string} options.title - Report title
 * @param {Array} options.tasks - Task data array
 * @param {Object} options.filters - Applied filters
 * @param {Object} options.analytics - Task analytics data
 * @param {string} options.generatedBy - User who generated the report
 * @returns {Object} PDF document object
 */
export const generateTaskReport = (options) => {
  try {
    const {
      title = "Task Report",
      tasks = [],
      filters = {},
      analytics = null,
      generatedBy = "System",
    } = options;

    // Generate current date in readable format
    const generatedAt = new Date().toLocaleString();

    // Format date function
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString();
    };

    // Format completion time
    const formatCompletionTime = (minutes) => {
      if (!minutes) return "N/A";
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);

      if (days > 0) {
        return `${days}d ${hours}h`;
      } else {
        return `${hours}h`;
      }
    };

    // Add horizontal divider
    const addDivider = (thickness = 1) => {
      return {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: thickness,
            lineColor: "#e5e7eb",
          },
        ],
        margin: [0, 15, 0, 15],
      };
    };

    // Get status badge
    const getStatusBadge = (status) => {
      const style = statusColors[status] || statusColors.not_started;
      return {
        text: status?.replace("_", " ").toUpperCase() || "UNKNOWN",
        fontSize: 10,
        bold: true,
        color: style.color,
        fillColor: style.background,
        ...taskReportStyles.badge,
      };
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
      const style = priorityColors[priority] || priorityColors.medium;
      return {
        text: priority?.toUpperCase() || "MEDIUM",
        fontSize: 10,
        bold: true,
        color: style.color,
        fillColor: style.background,
        ...taskReportStyles.badge,
      };
    };

    // Get assignees names
    const getAssignees = (assignees) => {
      if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
        return "-";
      }
      return assignees
        .map((a) => a.user?.name || (typeof a.user === "string" ? "User" : "-"))
        .join(", ");
    };

    // Generate cover page
    const generateCoverPage = () => {
      return [
        {
          text: "CONSTRUCTION MANAGEMENT SYSTEM",
          fontSize: 14,
          color: "#6b7280",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        // Replace problematic image with simple canvas drawing
        {
          canvas: [
            // Simple building icon
            {
              type: "rect",
              x: 235,
              y: 0,
              w: 40,
              h: 60,
              color: "#4f46e5",
            },
            // Windows
            {
              type: "rect",
              x: 245,
              y: 10,
              w: 8,
              h: 8,
              color: "#ffffff",
            },
            {
              type: "rect",
              x: 258,
              y: 10,
              w: 8,
              h: 8,
              color: "#ffffff",
            },
            {
              type: "rect",
              x: 245,
              y: 25,
              w: 8,
              h: 8,
              color: "#ffffff",
            },
            {
              type: "rect",
              x: 258,
              y: 25,
              w: 8,
              h: 8,
              color: "#ffffff",
            },
            // Door
            {
              type: "rect",
              x: 250,
              y: 40,
              w: 10,
              h: 20,
              color: "#ffffff",
            },
          ],
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        {
          text: title.toUpperCase(),
          style: "header",
          fontSize: 32,
          margin: [0, 60, 0, 40],
        },
        {
          text: "TASK MANAGEMENT REPORT",
          fontSize: 18,
          color: "#6b7280",
          alignment: "center",
          margin: [0, 0, 0, 100],
        },
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              table: {
                headerRows: 0,
                widths: ["auto", "*"],
                body: [
                  [
                    {
                      text: "Generated on:",
                      bold: true,
                      margin: [0, 5, 10, 5],
                    },
                    { text: generatedAt, margin: [0, 5, 0, 5] },
                  ],
                  [
                    {
                      text: "Generated by:",
                      bold: true,
                      margin: [0, 5, 10, 5],
                    },
                    { text: generatedBy, margin: [0, 5, 0, 5] },
                  ],
                  [
                    { text: "Total Tasks:", bold: true, margin: [0, 5, 10, 5] },
                    { text: analytics?.totalTasks || 0, margin: [0, 5, 0, 5] },
                  ],
                ],
                layout: {
                  hLineWidth: function (i, node) {
                    return i === 0 || i === node.table.body.length ? 1 : 0;
                  },
                  vLineWidth: function (i, node) {
                    return i === 0 || i === node.table.widths.length ? 1 : 0;
                  },
                  hLineColor: "#e5e7eb",
                  vLineColor: "#e5e7eb",
                },
              },
            },
            { width: "*", text: "" },
          ],
        },
        { text: "", pageBreak: "after" },
      ];
    };

    // Generate task status breakdown
    const generateStatusBreakdown = () => {
      if (!analytics) return null;

      const {
        totalTasks = 0,
        completedTasks = 0,
        inProgressTasks = 0,
        notStartedTasks = 0,
        onHoldTasks = 0,
        cancelledTasks = 0,
      } = analytics;

      const data = [
        ["Status", "Count", "Percentage"],
        [
          "Completed",
          completedTasks,
          `${
            totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
          }%`,
        ],
        [
          "In Progress",
          inProgressTasks,
          `${
            totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0
          }%`,
        ],
        [
          "Not Started",
          notStartedTasks,
          `${
            totalTasks ? Math.round((notStartedTasks / totalTasks) * 100) : 0
          }%`,
        ],
        [
          "On Hold",
          onHoldTasks,
          `${totalTasks ? Math.round((onHoldTasks / totalTasks) * 100) : 0}%`,
        ],
        [
          "Cancelled",
          cancelledTasks,
          `${
            totalTasks ? Math.round((cancelledTasks / totalTasks) * 100) : 0
          }%`,
        ],
      ];

      return {
        stack: [
          {
            text: "Task Status Distribution",
            style: "subheader",
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto"],
              body: data.map((row, i) => {
                if (i === 0) {
                  return row.map((cell) => ({
                    text: cell,
                    style: "tableHeader",
                  }));
                }

                // Apply color based on status
                const statusStyle = {
                  Completed: statusColors.completed,
                  "In Progress": statusColors.in_progress,
                  "Not Started": statusColors.not_started,
                  "On Hold": statusColors.on_hold,
                  Cancelled: statusColors.cancelled,
                }[row[0]];

                return [
                  {
                    text: row[0],
                    color: statusStyle?.color || "#000000",
                    bold: true,
                    margin: [5, 8, 5, 8],
                  },
                  {
                    text: row[1],
                    alignment: "center",
                    margin: [5, 8, 5, 8],
                  },
                  {
                    text: row[2],
                    alignment: "center",
                    margin: [5, 8, 5, 8],
                  },
                ];
              }),
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0
                  ? "#4f46e5"
                  : rowIndex % 2 === 0
                  ? "#f9fafb"
                  : null;
              },
              hLineWidth: () => 1,
              vLineWidth: () => 0,
              hLineColor: () => "#e5e7eb",
            },
          },
          {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 10,
                w: 515,
                h: 25,
                r: 4,
                lineColor: "#e5e7eb",
                color: "#f9fafb",
              },
              {
                type: "rect",
                x: 0,
                y: 10,
                w: totalTasks ? 515 * (completedTasks / totalTasks) : 0,
                h: 25,
                r: 0,
                color: "#d1fae5",
              },
              {
                type: "rect",
                x: totalTasks ? 515 * (completedTasks / totalTasks) : 0,
                y: 10,
                w: totalTasks ? 515 * (inProgressTasks / totalTasks) : 0,
                h: 25,
                r: 0,
                color: "#dbeafe",
              },
              {
                type: "rect",
                x: totalTasks
                  ? 515 * ((completedTasks + inProgressTasks) / totalTasks)
                  : 0,
                y: 10,
                w: totalTasks ? 515 * (notStartedTasks / totalTasks) : 0,
                h: 25,
                r: 0,
                color: "#f3f4f6",
              },
              {
                type: "rect",
                x: totalTasks
                  ? 515 *
                    ((completedTasks + inProgressTasks + notStartedTasks) /
                      totalTasks)
                  : 0,
                y: 10,
                w: totalTasks ? 515 * (onHoldTasks / totalTasks) : 0,
                h: 25,
                r: 0,
                color: "#fef3c7",
              },
              {
                type: "rect",
                x: totalTasks
                  ? 515 *
                    ((completedTasks +
                      inProgressTasks +
                      notStartedTasks +
                      onHoldTasks) /
                      totalTasks)
                  : 0,
                y: 10,
                w: totalTasks ? 515 * (cancelledTasks / totalTasks) : 0,
                h: 25,
                r: 0,
                color: "#fee2e2",
              },
            ],
            margin: [0, 15, 0, 5],
          },
          {
            columns: [
              {
                width: "auto",
                stack: [
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 15,
                        h: 15,
                        r: 2,
                        color: "#d1fae5",
                      },
                    ],
                  },
                ],
                margin: [0, 0, 5, 0],
              },
              {
                width: "auto",
                text: "Completed",
                fontSize: 10,
                margin: [0, 0, 15, 0],
              },
              {
                width: "auto",
                stack: [
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 15,
                        h: 15,
                        r: 2,
                        color: "#dbeafe",
                      },
                    ],
                  },
                ],
                margin: [0, 0, 5, 0],
              },
              {
                width: "auto",
                text: "In Progress",
                fontSize: 10,
                margin: [0, 0, 15, 0],
              },
              {
                width: "auto",
                stack: [
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 15,
                        h: 15,
                        r: 2,
                        color: "#f3f4f6",
                      },
                    ],
                  },
                ],
                margin: [0, 0, 5, 0],
              },
              {
                width: "auto",
                text: "Not Started",
                fontSize: 10,
                margin: [0, 0, 15, 0],
              },
              {
                width: "auto",
                stack: [
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 15,
                        h: 15,
                        r: 2,
                        color: "#fef3c7",
                      },
                    ],
                  },
                ],
                margin: [0, 0, 5, 0],
              },
              {
                width: "auto",
                text: "On Hold",
                fontSize: 10,
                margin: [0, 0, 15, 0],
              },
              {
                width: "auto",
                stack: [
                  {
                    canvas: [
                      {
                        type: "rect",
                        x: 0,
                        y: 0,
                        w: 15,
                        h: 15,
                        r: 2,
                        color: "#fee2e2",
                      },
                    ],
                  },
                ],
                margin: [0, 0, 5, 0],
              },
              {
                width: "auto",
                text: "Cancelled",
                fontSize: 10,
              },
            ],
          },
        ],
        margin: [0, 0, 0, 30],
      };
    };

    // Generate task details table
    const generateTaskTable = (tasks) => {
      if (!tasks || tasks.length === 0) {
        return { text: "No tasks available.", italics: true, margin: [0, 10] };
      }

      return {
        stack: [
          {
            text: "Task Details",
            style: "subheader",
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto", "auto", "auto", "*"],
              body: [
                [
                  { text: "Task Name", style: "tableHeader" },
                  { text: "Status", style: "tableHeader" },
                  { text: "Priority", style: "tableHeader" },
                  { text: "Start Date", style: "tableHeader" },
                  { text: "Due Date", style: "tableHeader" },
                  { text: "Assignees", style: "tableHeader" },
                ],
                ...tasks.map((task) => [
                  {
                    text: task.name,
                    bold: true,
                    margin: [5, 8, 5, 8],
                  },
                  getStatusBadge(task.status),
                  getPriorityBadge(task.priority),
                  {
                    text: formatDate(task.startDate),
                    alignment: "center",
                    margin: [5, 8, 5, 8],
                  },
                  {
                    text: formatDate(task.endDate),
                    alignment: "center",
                    margin: [5, 8, 5, 8],
                  },
                  {
                    text: getAssignees(task.assignees),
                    margin: [5, 8, 5, 8],
                  },
                ]),
              ],
            },
            layout: {
              fillColor: function (rowIndex) {
                return rowIndex === 0
                  ? "#4f46e5"
                  : rowIndex % 2 === 0
                  ? "#f9fafb"
                  : null;
              },
              hLineWidth: () => 1,
              vLineWidth: () => 0,
              hLineColor: () => "#e5e7eb",
            },
          },
        ],
      };
    };

    // Generate analytics summary
    const generateAnalyticsSummary = () => {
      if (!analytics) return null;

      const {
        totalTasks = 0,
        completedTasks = 0,
        overdueTasks = 0,
        completionRate = 0,
        averageCompletionTime = 0,
      } = analytics;

      return {
        stack: [
          {
            text: "Task Analytics Summary",
            style: "subheader",
          },
          {
            columns: [
              {
                width: "*",
                stack: [
                  {
                    style: "card",
                    stack: [
                      {
                        text: "TOTAL TASKS",
                        style: "statsLabel",
                      },
                      {
                        text: totalTasks.toString(),
                        style: "statsValue",
                        color: "#4f46e5",
                      },
                      {
                        canvas: [
                          {
                            type: "line",
                            x1: 0,
                            y1: 3,
                            x2: 100,
                            y2: 3,
                            lineWidth: 1,
                            lineColor: "#e5e7eb",
                          },
                        ],
                        margin: [0, 5, 0, 5],
                      },
                      {
                        columns: [
                          {
                            width: "*",
                            text: [
                              { text: "Completed: ", bold: true },
                              completedTasks.toString(),
                            ],
                            fontSize: 10,
                            alignment: "center",
                          },
                          {
                            width: "*",
                            text: [
                              { text: "In Progress: ", bold: true },
                              (totalTasks - completedTasks).toString(),
                            ],
                            fontSize: 10,
                            alignment: "center",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                width: "*",
                stack: [
                  {
                    style: "card",
                    stack: [
                      {
                        text: "COMPLETION RATE",
                        style: "statsLabel",
                      },
                      {
                        text: `${Math.round(completionRate)}%`,
                        style: "statsValue",
                        color:
                          completionRate > 75
                            ? "#059669"
                            : completionRate > 50
                            ? "#047857"
                            : "#b45309",
                      },
                      {
                        canvas: [
                          {
                            type: "rect",
                            x: 0,
                            y: 3,
                            w: 100,
                            h: 10,
                            r: 5,
                            lineColor: "#e5e7eb",
                            color: "#f3f4f6",
                          },
                          {
                            type: "rect",
                            x: 0,
                            y: 3,
                            // Fix: use Math.min to ensure width doesn't exceed 100
                            w: Math.min(Math.round(completionRate), 100),
                            h: 10,
                            r: 5,
                            color:
                              completionRate > 75
                                ? "#059669"
                                : completionRate > 50
                                ? "#047857"
                                : "#b45309",
                          },
                        ],
                        margin: [0, 5, 0, 5],
                      },
                      {
                        columns: [
                          {
                            width: "*",
                            text: "0%",
                            fontSize: 8,
                            alignment: "left",
                            color: "#6b7280",
                          },
                          {
                            width: "*",
                            text: "50%",
                            fontSize: 8,
                            alignment: "center",
                            color: "#6b7280",
                          },
                          {
                            width: "*",
                            text: "100%",
                            fontSize: 8,
                            alignment: "right",
                            color: "#6b7280",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                width: "*",
                stack: [
                  {
                    style: "card",
                    stack: [
                      {
                        text: "OVERDUE TASKS",
                        style: "statsLabel",
                      },
                      {
                        text: overdueTasks.toString(),
                        style: "statsValue",
                        color: overdueTasks > 0 ? "#dc2626" : "#059669",
                      },
                      {
                        canvas: [
                          {
                            type: "line",
                            x1: 0,
                            y1: 3,
                            x2: 100,
                            y2: 3,
                            lineWidth: 1,
                            lineColor: "#e5e7eb",
                          },
                        ],
                        margin: [0, 5, 0, 5],
                      },
                      {
                        text: [
                          { text: "Status: ", bold: true },
                          overdueTasks > 0 ? "Attention Required" : "On Track",
                        ],
                        fontSize: 10,
                        alignment: "center",
                        color: overdueTasks > 0 ? "#dc2626" : "#059669",
                      },
                    ],
                  },
                ],
              },
              {
                width: "*",
                stack: [
                  {
                    style: "card",
                    stack: [
                      {
                        text: "AVG. COMPLETION TIME",
                        style: "statsLabel",
                      },
                      {
                        text: formatCompletionTime(averageCompletionTime),
                        style: "statsValue",
                        color: "#4338ca",
                      },
                      {
                        canvas: [
                          {
                            type: "line",
                            x1: 0,
                            y1: 3,
                            x2: 100,
                            y2: 3,
                            lineWidth: 1,
                            lineColor: "#e5e7eb",
                          },
                        ],
                        margin: [0, 5, 0, 5],
                      },
                      {
                        text: "Time from start to completion",
                        fontSize: 9,
                        alignment: "center",
                        color: "#6b7280",
                        italics: true,
                      },
                    ],
                  },
                ],
              },
            ],
            columnGap: 15,
            margin: [0, 10, 0, 0],
          },
        ],
      };
    };

    // Generate completion progress bar
    const generateCompletionBar = () => {
      if (!analytics) return null;

      const { completionRate = 0 } = analytics;
      const completionPercentage = Math.round(completionRate);

      let barColor = "#dc2626"; // red
      if (completionPercentage >= 75) barColor = "#059669"; // green
      else if (completionPercentage >= 50) barColor = "#047857"; // green-dark
      else if (completionPercentage >= 25) barColor = "#d97706"; // amber

      return {
        stack: [
          {
            text: "Overall Project Completion Progress",
            style: "section",
            margin: [0, 30, 0, 15],
          },
          {
            canvas: [
              // Background bar
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 515,
                h: 30,
                r: 6,
                color: "#e5e7eb",
              },
              // Progress bar
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 515 * (completionPercentage / 100),
                h: 30,
                r: 6,
                color: barColor,
              },
              // Percentage text
              {
                type: "text",
                x: 257.5,
                y: 19,
                text: `${completionPercentage}%`,
                fontStyle: "bold",
                color: "#ffffff",
              },
            ],
          },
          {
            columns: [
              {
                width: "*",
                text: "0%",
                fontSize: 10,
                alignment: "left",
                margin: [0, 5, 0, 0],
                color: "#6b7280",
              },
              {
                width: "*",
                text: `${completionPercentage}%`,
                fontSize: 10,
                bold: true,
                alignment: "center",
                margin: [0, 5, 0, 0],
              },
              {
                width: "*",
                text: "100%",
                fontSize: 10,
                alignment: "right",
                margin: [0, 5, 0, 0],
                color: "#6b7280",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 30],
      };
    };

    // Generate filters section
    const generateFiltersSection = () => {
      if (!filters || Object.keys(filters).length === 0) return null;

      const filterItems = [];

      if (filters.project) filterItems.push(`Project: ${filters.project}`);
      if (filters.status)
        filterItems.push(`Status: ${filters.status.replace("_", " ")}`);
      if (filters.priority) filterItems.push(`Priority: ${filters.priority}`);
      if (filters.category) filterItems.push(`Category: ${filters.category}`);
      if (filters.assignee) filterItems.push(`Assignee: ${filters.assignee}`);
      if (filters.startDate)
        filterItems.push(`From: ${formatDate(filters.startDate)}`);
      if (filters.endDate)
        filterItems.push(`To: ${formatDate(filters.endDate)}`);
      if (filters.search) filterItems.push(`Search: ${filters.search}`);

      if (filterItems.length === 0) return null;

      return {
        stack: [
          {
            text: "Applied Filters",
            style: "subheader",
          },
          {
            columns: filterItems.map((item) => ({
              width: "auto",
              stack: [
                {
                  text: item,
                  fontSize: 10,
                  color: "#4b5563",
                  bold: true,
                  background: "#f3f4f6",
                  padding: [8, 4, 8, 4],
                  border: [1, 1, 1, 1],
                  borderColor: "#e5e7eb",
                  borderRadius: 4,
                  alignment: "center",
                  margin: [0, 0, 10, 0],
                },
              ],
            })),
          },
        ],
        margin: [0, 0, 0, 20],
      };
    };

    // Document definition
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      info: {
        title: `${title} - Construction Management System`,
        author: generatedBy,
        subject: "Task Report",
        keywords: "construction, management, tasks, report",
        creator: "Construction Management System",
        producer: "Make",
        creationDate: new Date(),
      },
      header: {
        text: "Construction Management System",
        alignment: "center",
        margin: [0, 20, 0, 0],
        fontSize: 10,
        color: "#6b7280",
      },
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              width: 100,
              text: generatedAt,
              fontSize: 8,
              alignment: "left",
              margin: [40, 0, 0, 0],
              color: "#9ca3af",
            },
            {
              width: "*",
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: "center",
              fontSize: 10,
              color: "#6b7280",
            },
            {
              width: 100,
              text: "Construction Management",
              fontSize: 8,
              alignment: "right",
              margin: [0, 0, 40, 0],
              color: "#9ca3af",
            },
          ],
          margin: [0, 10, 0, 0],
        };
      },
      content: [
        // Cover page
        ...generateCoverPage(),

        // Filters section
        generateFiltersSection(),

        // Analytics section - use the fixed version
        generateAnalyticsSummary(),

        // Progress bar
        analytics ? generateCompletionBar() : null,

        // Divider
        addDivider(2),

        // Status breakdown table
        generateStatusBreakdown(),

        // Tasks table (on a new page if there are analytics)
        analytics && tasks.length > 5
          ? { text: "", pageBreak: "before" }
          : null,

        generateTaskTable(tasks),
      ].filter(Boolean), // Remove null items

      styles: taskReportStyles,
    };

    return Make.create(docDefinition);
  } catch (error) {
    console.error("Error creating :", error);
    throw new Error("Failed to generate report: " + error.message);
  }
};

/**
 * Download the generated task report
 * @param {Object} Doc - Generated PDF document
 * @param {string} fileName - File name for download
 */
export const downloadTaskReport = (pdfDoc, fileName = "task-report.pdf") => {
  if (!pdfDoc) {
    console.error("PDF document is undefined or null");
    return;
  }

  // Open the PDF in a new tab - this is what works well in Edge
  // and should now work the same way in Chrome and other browsers
  try {
    pdfDoc.open({}, window);
  } catch (error) {
    console.error("Error opening PDF in new tab:", error);

    // Fallback to base64 download if open fails
    try {
      pdfDoc.getBase64((data) => {
        const blob = new Blob(
          [Uint8Array.from(atob(data), (c) => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      });
    } catch (fallbackError) {
      console.error("Fallback method failed:", fallbackError);
      alert("Could not open PDF. Please check your browser settings.");
    }
  }
};

/**
 * Force download using alternative method
 */
export const forceDownloadTaskReport = (
  pdfDoc,
  fileName = "task-report.pdf"
) => {
  try {
    if (!pdfDoc) {
      console.error("PDF document is undefined");
      throw new Error("PDF document is undefined");
    }

    // Try the data URL approach which often works when other methods fail
    pdfDoc.getBase64((data) => {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data}`;
      link.download = fileName;
      link.target = "_blank";

      // Append to body and trigger click
      document.body.appendChild(link);
      link.click();

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    });
  } catch (err) {
    console.error("Force download failed:", err);
    throw err;
  }
};

/**
 * Print the generated task report
 * @param {Object} pdfDoc - Generated PDF document
 */
export const printTaskReport = (pdfDoc) => {
  try {
    pdfDoc.print();
  } catch (error) {
    console.error("Error printing report:", error);
    alert("Could not print report. Please try downloading it instead.");
  }
};

/**
 * Open the generated task report in a new window
 * @param {Object} pdfDoc - Generated PDF document
 */
export const openTaskReport = (pdfDoc) => {
  try {
    pdfDoc.open();
  } catch (error) {
    console.error("Error opening report:", error);
    alert("Could not open report. Please try downloading it instead.");
  }
};
