import { useEffect, useState } from "react";
import {
  fetchBudgets,
  addBudget as apiAddBudget,
  updateBudget as apiUpdateBudget,
  deleteBudget as apiDeleteBudget,
  fetchExpenses,
  addExpense as apiAddExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  fetchCategories,
  addCategory as apiAddCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "../services/budgetApi.js";

const BudgetManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    projectName: "",
    totalBudget: "",
    startDate: "",
    endDate: "",
    status: "Active",
    projectId: "",
    currency: "LKR",
    description: "",
  });
  const [newExpense, setNewExpense] = useState({
    description: "",
    projectId: "",
    amount: "",
    category: "",
    date: "",
    status: "Pending",
    currency: "LKR",
    notes: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    budget: "",
    description: "",
    spent: 0,
    remaining: 0,
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load initial data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bRes, eRes, cRes] = await Promise.all([
          fetchBudgets(),
          fetchExpenses(),
          fetchCategories(),
        ]);
        setBudgets(Array.isArray(bRes.data) ? bRes.data : []);
        setExpenses(Array.isArray(eRes.data) ? eRes.data : []);
        setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "budgets", label: "Budgets", icon: "💰" },
    { id: "expenses", label: "Expenses", icon: "📝" },
    { id: "reports", label: "Reports", icon: "📈" },
    { id: "approvals", label: "Approvals", icon: "✅" },
    { id: "forecasting", label: "Forecasting", icon: "🔮" },
    { id: "payments", label: "Payments", icon: "💳" },
    { id: "categories", label: "Categories", icon: "🏷️" },
  ];

  // Helper function to format dates for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Helper function to format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return "";
    }
  };

  // Export functions
  const exportToExcel = () => {
    try {
      // Create CSV content
      const csvContent = generateCSVContent();

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `budget-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Excel file exported successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const exportToPDF = () => {
    try {
      // Create HTML content for the report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Budget Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BUDGET MANAGEMENT REPORT</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Financial Summary</h2>
            <div class="summary">
              <p><strong>Total Budget:</strong> LKR ${budgets
                .reduce((sum, b) => sum + b.totalBudget, 0)
                .toLocaleString()}</p>
              <p><strong>Total Spent:</strong> LKR ${budgets
                .reduce((sum, b) => sum + b.spent, 0)
                .toLocaleString()}</p>
              <p><strong>Total Remaining:</strong> LKR ${budgets
                .reduce((sum, b) => sum + b.remaining, 0)
                .toLocaleString()}</p>
              <p><strong>Budget Utilization:</strong> ${
                budgets.reduce((sum, b) => sum + b.totalBudget, 0) > 0
                  ? (
                      (budgets.reduce((sum, b) => sum + b.spent, 0) /
                        budgets.reduce((sum, b) => sum + b.totalBudget, 0)) *
                      100
                    ).toFixed(1)
                  : 0
              }%</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Project Budgets</h2>
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Total Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${budgets
                  .map(
                    (budget) => `
                  <tr>
                    <td>${budget.projectName}</td>
                    <td>LKR ${budget.totalBudget.toLocaleString()}</td>
                    <td>LKR ${budget.spent.toLocaleString()}</td>
                    <td>LKR ${budget.remaining.toLocaleString()}</td>
                    <td>${formatDateForDisplay(budget.startDate)}</td>
                    <td>${formatDateForDisplay(budget.endDate)}</td>
                    <td>${budget.status}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Expenses</h2>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${expenses
                  .map(
                    (expense) => `
                  <tr>
                    <td>${expense.description}</td>
                    <td>LKR ${expense.amount.toLocaleString()}</td>
                    <td>${expense.category}</td>
                    <td>${formatDateForDisplay(expense.date)}</td>
                    <td>${expense.status}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Categories</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                ${categories
                  .map(
                    (category) => `
                  <tr>
                    <td>${category.name}</td>
                    <td>LKR ${category.budget.toLocaleString()}</td>
                    <td>LKR ${category.spent.toLocaleString()}</td>
                    <td>LKR ${category.remaining.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated by Construction Management System</p>
            <p>For questions or support, please contact your system administrator</p>
          </div>
        </body>
        </html>
      `;

      // Create and download the file as HTML
      const blob = new Blob([htmlContent], {
        type: "text/html;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `budget-report-${new Date().toISOString().split("T")[0]}.html`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      alert(
        "HTML report downloaded successfully! You can open it in any web browser."
      );
    } catch (error) {
      console.error("Error exporting to HTML:", error);
      alert("Failed to export to HTML. Please try again.");
    }
  };

  const generateReport = () => {
    try {
      // Generate comprehensive report
      const reportData = generateReportData();

      // Create and download text report
      const blob = new Blob([reportData], {
        type: "text/plain;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `budget-report-${new Date().toISOString().split("T")[0]}.txt`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Report generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  // Helper function to generate CSV content
  const generateCSVContent = () => {
    const headers = [
      "Project Name",
      "Total Budget",
      "Spent",
      "Remaining",
      "Start Date",
      "End Date",
      "Status",
    ];
    const csvRows = [headers.join(",")];

    budgets.forEach((budget) => {
      const row = [
        `"${budget.projectName}"`,
        budget.totalBudget,
        budget.spent,
        budget.remaining,
        `"${formatDateForDisplay(budget.startDate)}"`,
        `"${formatDateForDisplay(budget.endDate)}"`,
        `"${budget.status}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  // Helper function to generate PDF content
  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Budget Management Report</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            color: #2c3e50; 
            font-size: 28px;
          }
          .header p { 
            margin: 5px 0 0 0; 
            color: #666; 
            font-size: 14px;
          }
          .summary { 
            background: #f8f9fa; 
            padding: 20px; 
            margin-bottom: 25px; 
            border-radius: 8px; 
            border-left: 4px solid #007bff;
          }
          .summary h3 { 
            margin-top: 0; 
            color: #2c3e50; 
            font-size: 18px;
          }
          .summary p { 
            margin: 8px 0; 
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            color: #2c3e50;
            font-size: 13px;
          }
          tr:nth-child(even) { 
            background-color: #f8f9fa; 
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
        
        <div class="header">
          <h1>Budget Management Report</h1>
          <p>Generated on: ${currentDate}</p>
        </div>
        
        <div class="summary">
          <h3>Financial Summary</h3>
          <p><strong>Total Budget:</strong> LKR ${totalBudget.toLocaleString()}</p>
          <p><strong>Total Spent:</strong> LKR ${totalSpent.toLocaleString()}</p>
          <p><strong>Total Remaining:</strong> LKR ${totalRemaining.toLocaleString()}</p>
          <p><strong>Budget Utilization:</strong> ${
            totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0
          }%</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Total Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${budgets
              .map(
                (budget) => `
              <tr>
                <td>${budget.projectName}</td>
                <td>LKR ${budget.totalBudget.toLocaleString()}</td>
                <td>LKR ${budget.spent.toLocaleString()}</td>
                <td>LKR ${budget.remaining.toLocaleString()}</td>
                <td>${formatDateForDisplay(budget.startDate)}</td>
                <td>${formatDateForDisplay(budget.endDate)}</td>
                <td>${budget.status}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report was generated by the Construction Management System</p>
          <p>For questions or support, please contact your system administrator</p>
        </div>
      </body>
      </html>
    `;
  };

  // Helper function to generate PDF text content
  const generatePDFTextContent = () => {
    const currentDate = new Date().toLocaleDateString();
    const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
    const utilization =
      totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

    let pdfContent = `
BUDGET MANAGEMENT REPORT
========================
Generated on: ${currentDate}

FINANCIAL SUMMARY
================
Total Budget: LKR ${totalBudget.toLocaleString()}
Total Spent: LKR ${totalSpent.toLocaleString()}
Total Remaining: LKR ${totalRemaining.toLocaleString()}
Budget Utilization: ${utilization}%

PROJECT BUDGETS
===============
`;

    if (budgets.length === 0) {
      pdfContent += "No budgets found.\n\n";
    } else {
      budgets.forEach((budget, index) => {
        pdfContent += `
${index + 1}. ${budget.projectName}
   Total Budget: LKR ${budget.totalBudget.toLocaleString()}
   Spent: LKR ${budget.spent.toLocaleString()}
   Remaining: LKR ${budget.remaining.toLocaleString()}
   Start Date: ${formatDateForDisplay(budget.startDate)}
   End Date: ${formatDateForDisplay(budget.endDate)}
   Status: ${budget.status}
   Utilization: ${
     budget.totalBudget > 0
       ? ((budget.spent / budget.totalBudget) * 100).toFixed(1)
       : 0
   }%
`;
      });
    }

    pdfContent += `
EXPENSES
========
Total Expenses: ${expenses.length}
`;

    if (expenses.length === 0) {
      pdfContent += "No expenses found.\n\n";
    } else {
      expenses.forEach((expense, index) => {
        pdfContent += `
${index + 1}. ${expense.description}
   Amount: LKR ${expense.amount.toLocaleString()}
   Category: ${expense.category}
   Date: ${formatDateForDisplay(expense.date)}
   Status: ${expense.status}
`;
      });
    }

    pdfContent += `
CATEGORIES
==========
Total Categories: ${categories.length}
`;

    if (categories.length === 0) {
      pdfContent += "No categories found.\n\n";
    } else {
      categories.forEach((category, index) => {
        pdfContent += `
${index + 1}. ${category.name}
   Budget: LKR ${category.budget.toLocaleString()}
   Spent: LKR ${category.spent.toLocaleString()}
   Remaining: LKR ${category.remaining.toLocaleString()}
`;
      });
    }

    pdfContent += `
========================================
END OF REPORT
Generated by Construction Management System
For questions or support, please contact your system administrator
`;

    return pdfContent;
  };

  // Helper function to generate report data
  const generateReportData = () => {
    const currentDate = new Date().toLocaleDateString();
    const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
    const utilization =
      totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

    let report = `BUDGET MANAGEMENT REPORT
Generated on: ${currentDate}

=== SUMMARY ===
Total Budget: LKR ${totalBudget.toLocaleString()}
Total Spent: LKR ${totalSpent.toLocaleString()}
Total Remaining: LKR ${totalRemaining.toLocaleString()}
Budget Utilization: ${utilization}%

=== PROJECT BUDGETS ===
`;

    budgets.forEach((budget, index) => {
      report += `
${index + 1}. ${budget.projectName}
   Total Budget: LKR ${budget.totalBudget.toLocaleString()}
   Spent: LKR ${budget.spent.toLocaleString()}
   Remaining: LKR ${budget.remaining.toLocaleString()}
   Start Date: ${formatDateForDisplay(budget.startDate)}
   End Date: ${formatDateForDisplay(budget.endDate)}
   Status: ${budget.status}
   Utilization: ${
     budget.totalBudget > 0
       ? ((budget.spent / budget.totalBudget) * 100).toFixed(1)
       : 0
   }%
`;
    });

    report += `
=== EXPENSES ===
Total Expenses: ${expenses.length}
`;

    expenses.forEach((expense, index) => {
      report += `
${index + 1}. ${expense.description}
   Amount: LKR ${expense.amount.toLocaleString()}
   Category: ${expense.category}
   Date: ${formatDateForDisplay(expense.date)}
   Status: ${expense.status}
`;
    });

    report += `
=== CATEGORIES ===
Total Categories: ${categories.length}
`;

    categories.forEach((category, index) => {
      report += `
${index + 1}. ${category.name}
   Budget: LKR ${category.budget.toLocaleString()}
   Spent: LKR ${category.spent.toLocaleString()}
   Remaining: LKR ${category.remaining.toLocaleString()}
`;
    });

    report += `
=== END OF REPORT ===
Generated by Construction Management System
`;

    return report;
  };

  const handleAddBudget = async () => {
    console.log("Adding budget with data:", newBudget);

    if (
      !newBudget.projectName ||
      !newBudget.totalBudget ||
      !newBudget.startDate ||
      !newBudget.endDate
    ) {
      alert(
        "Please fill in all required fields: Project Name, Total Budget, Start Date, and End Date"
      );
      return;
    }

    const payload = {
      projectName: newBudget.projectName,
      totalBudget: parseInt(newBudget.totalBudget),
      startDate: newBudget.startDate,
      endDate: newBudget.endDate,
      status: newBudget.status,
      projectId: newBudget.projectId,
      currency: newBudget.currency,
      description: newBudget.description,
    };

    console.log("Sending payload:", payload);

    try {
      const res = await apiAddBudget(payload);
      console.log("Budget added successfully:", res.data);
      const created = res.data;
      setBudgets([...budgets, created]);
      setNewBudget({
        projectName: "",
        totalBudget: "",
        startDate: "",
        endDate: "",
        status: "Active",
        projectId: "",
        currency: "LKR",
        description: "",
      });
      setShowAddBudgetModal(false);
      alert("Budget added successfully!");
    } catch (err) {
      console.error("Failed to add budget", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to add budget: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExpense = async () => {
    console.log("Adding expense with data:", newExpense);

    if (
      !newExpense.description ||
      !newExpense.amount ||
      !newExpense.category ||
      !newExpense.date
    ) {
      alert(
        "Please fill in all required fields: Description, Amount, Category, and Date"
      );
      return;
    }

    const payload = {
      projectId:
        newExpense.projectId && newExpense.projectId.trim() !== ""
          ? newExpense.projectId
          : null,
      description: newExpense.description,
      amount: parseInt(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      status: newExpense.status,
      currency: newExpense.currency,
      notes: newExpense.notes,
    };

    console.log("Sending expense payload:", payload);

    try {
      const res = await apiAddExpense(payload);
      console.log("Expense added successfully:", res.data);
      const created = res.data;
      setExpenses([...expenses, created]);
      setNewExpense({
        description: "",
        projectId: "",
        amount: "",
        category: "",
        date: "",
        status: "Pending",
        currency: "LKR",
        notes: "",
      });
      setShowAddExpenseModal(false);
      alert("Expense added successfully!");
    } catch (err) {
      console.error("Failed to add expense", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to add expense: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleAddCategory = async () => {
    console.log("Adding category with data:", newCategory);

    if (!newCategory.name || !newCategory.budget) {
      alert("Please fill in all required fields: Category Name and Budget");
      return;
    }

    const payload = {
      name: newCategory.name,
      budget: parseInt(newCategory.budget),
      description: newCategory.description,
    };

    console.log("Sending category payload:", payload);

    try {
      const res = await apiAddCategory(payload);
      console.log("Category added successfully:", res.data);
      const created = res.data;
      setCategories([...categories, created]);
      setNewCategory({
        name: "",
        budget: "",
        description: "",
        spent: 0,
        remaining: 0,
      });
      setShowAddCategoryModal(false);
      alert("Category added successfully!");
    } catch (err) {
      console.error("Failed to add category", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to add category: ${err.response?.data?.message || err.message}`
      );
    }
  };

  // Budget functions
  const handleEditBudget = (budget) => {
    console.log("Editing budget:", budget);
    setEditingBudget(budget);

    setNewBudget({
      projectName: budget.projectName || "",
      totalBudget: budget.totalBudget ? budget.totalBudget.toString() : "",
      startDate: formatDateForInput(budget.startDate),
      endDate: formatDateForInput(budget.endDate),
      status: budget.status || "Active",
      projectId: budget.projectId || "",
      currency: budget.currency || "LKR",
      description: budget.description || "",
    });
    setShowAddBudgetModal(true);
  };

  const handleUpdateBudget = async () => {
    console.log("Updating budget:", editingBudget);
    console.log("With data:", newBudget);

    if (!editingBudget) {
      alert("No budget selected for editing");
      return;
    }

    if (
      !newBudget.projectName ||
      !newBudget.totalBudget ||
      !newBudget.startDate ||
      !newBudget.endDate
    ) {
      alert(
        "Please fill in all required fields: Project Name, Total Budget, Start Date, and End Date"
      );
      return;
    }

    const payload = {
      projectName: newBudget.projectName,
      totalBudget: parseInt(newBudget.totalBudget),
      status: newBudget.status,
      startDate: newBudget.startDate,
      endDate: newBudget.endDate,
      projectId:
        newBudget.projectId && newBudget.projectId.trim() !== ""
          ? newBudget.projectId
          : null,
      currency: newBudget.currency,
      description: newBudget.description,
    };

    console.log("Sending budget update payload:", payload);

    try {
      const budgetId = editingBudget.id || editingBudget._id;
      console.log("Updating budget with ID:", budgetId);

      const res = await apiUpdateBudget(budgetId, payload);
      console.log("Budget updated successfully:", res.data);

      const updated = res.data;
      setBudgets(
        budgets.map((b) => ((b.id || b._id) === budgetId ? updated : b))
      );
      setEditingBudget(null);
      setNewBudget({
        projectName: "",
        totalBudget: "",
        startDate: "",
        endDate: "",
        status: "Active",
        projectId: "",
        currency: "LKR",
        description: "",
      });
      setShowAddBudgetModal(false);
      alert("Budget updated successfully!");
    } catch (err) {
      console.error("Failed to update budget", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to update budget: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        console.log("Deleting budget with ID:", budgetId);
        await apiDeleteBudget(budgetId);
        setBudgets(budgets.filter((b) => (b.id || b._id) !== budgetId));
        setExpenses(
          expenses.filter((e) => (e.projectId || e.project?._id) !== budgetId)
        );
        alert("Budget deleted successfully!");
      } catch (err) {
        console.error("Failed to delete budget", err);
        console.error("Error response:", err.response?.data);
        alert(
          `Failed to delete budget: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  // Expense functions
  const handleEditExpense = (expense) => {
    console.log("Editing expense:", expense);
    setEditingExpense(expense);

    setNewExpense({
      description: expense.description || "",
      projectId: expense.projectId ? expense.projectId.toString() : "",
      amount: expense.amount ? expense.amount.toString() : "",
      category: expense.category || "",
      date: formatDateForInput(expense.date),
      status: expense.status || "Pending",
      currency: expense.currency || "LKR",
      notes: expense.notes || "",
    });
    setShowAddExpenseModal(true);
  };

  const handleUpdateExpense = async () => {
    console.log("Updating expense:", editingExpense);
    console.log("With data:", newExpense);

    if (!editingExpense) {
      alert("No expense selected for editing");
      return;
    }

    if (
      !newExpense.description ||
      !newExpense.amount ||
      !newExpense.category ||
      !newExpense.date
    ) {
      alert(
        "Please fill in all required fields: Description, Amount, Category, and Date"
      );
      return;
    }

    const payload = {
      projectId:
        newExpense.projectId && newExpense.projectId.trim() !== ""
          ? newExpense.projectId
          : null,
      description: newExpense.description,
      amount: parseInt(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      status: newExpense.status,
      currency: newExpense.currency,
      notes: newExpense.notes,
    };

    console.log("Sending update payload:", payload);

    try {
      const expenseId = editingExpense.id || editingExpense._id;
      console.log("Updating expense with ID:", expenseId);

      const res = await apiUpdateExpense(expenseId, payload);
      console.log("Expense updated successfully:", res.data);

      const updated = res.data;
      setExpenses(
        expenses.map((e) => ((e.id || e._id) === expenseId ? updated : e))
      );
      setEditingExpense(null);
      setNewExpense({
        description: "",
        projectId: "",
        amount: "",
        category: "",
        date: "",
        status: "Pending",
        currency: "LKR",
        notes: "",
      });
      setShowAddExpenseModal(false);
      alert("Expense updated successfully!");
    } catch (err) {
      console.error("Failed to update expense", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to update expense: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        console.log("Deleting expense with ID:", expenseId);
        await apiDeleteExpense(expenseId);
        setExpenses(expenses.filter((e) => (e.id || e._id) !== expenseId));
        alert("Expense deleted successfully!");
      } catch (err) {
        console.error("Failed to delete expense", err);
        console.error("Error response:", err.response?.data);
        alert(
          `Failed to delete expense: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  // Category functions
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      budget: category.budget.toString(),
      description: category.description || "",
    });
    setShowAddCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategory.name && newCategory.budget) {
      const payload = {
        name: newCategory.name,
        budget: parseInt(newCategory.budget),
        description: newCategory.description,
      };
      try {
        const res = await apiUpdateCategory(
          editingCategory.id || editingCategory._id,
          payload
        );
        const updated = res.data;
        setCategories(
          categories.map((c) =>
            (c.id || c._id) === (editingCategory.id || editingCategory._id)
              ? updated
              : c
          )
        );
        setEditingCategory(null);
        setNewCategory({
          name: "",
          budget: "",
          description: "",
          spent: 0,
          remaining: 0,
        });
        setShowAddCategoryModal(false);
      } catch (err) {
        console.error("Failed to update category", err);
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        console.log("Deleting category with ID:", categoryId);
        await apiDeleteCategory(categoryId);
        setCategories(categories.filter((c) => (c.id || c._id) !== categoryId));
        alert("Category deleted successfully!");
      } catch (err) {
        console.error("Failed to delete category", err);
        console.error("Error response:", err.response?.data);
        alert(
          `Failed to delete category: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  // Approval functions
  const handleApproveExpense = async (expenseId) => {
    try {
      console.log("Approving expense with ID:", expenseId);
      const expense = expenses.find((e) => (e.id || e._id) === expenseId);
      if (!expense) {
        alert("Expense not found");
        return;
      }

      // Send all required fields along with status update
      const updateData = {
        projectId:
          expense.projectId && expense.projectId.trim() !== ""
            ? expense.projectId
            : null,
        description: expense.description,
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,
        status: "Approved",
        currency: expense.currency || "LKR",
        notes: expense.notes || "",
      };

      console.log("Sending approval data:", updateData);
      const res = await apiUpdateExpense(expenseId, updateData);
      console.log("Expense approved successfully:", res.data);
      const updated = res.data;
      setExpenses(
        expenses.map((e) => ((e.id || e._id) === expenseId ? updated : e))
      );
      alert("Expense approved successfully!");
    } catch (err) {
      console.error("Failed to approve expense", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to approve expense: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleRejectExpense = async (expenseId) => {
    try {
      console.log("Rejecting expense with ID:", expenseId);
      const expense = expenses.find((e) => (e.id || e._id) === expenseId);
      if (!expense) {
        alert("Expense not found");
        return;
      }

      // Send all required fields along with status update
      const updateData = {
        projectId:
          expense.projectId && expense.projectId.trim() !== ""
            ? expense.projectId
            : null,
        description: expense.description,
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,
        status: "Rejected",
        currency: expense.currency || "LKR",
        notes: expense.notes || "",
      };

      console.log("Sending rejection data:", updateData);
      const res = await apiUpdateExpense(expenseId, updateData);
      console.log("Expense rejected successfully:", res.data);
      const updated = res.data;
      setExpenses(
        expenses.map((e) => ((e.id || e._id) === expenseId ? updated : e))
      );
      alert("Expense rejected successfully!");
    } catch (err) {
      console.error("Failed to reject expense", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Failed to reject expense: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Payment functions
  const handleProcessPayment = (paymentId) => {
    // This would typically update payment status
    console.log("Processing payment:", paymentId);
  };

  // Reset form when modal is closed
  const handleCloseBudgetModal = () => {
    setShowAddBudgetModal(false);
    setEditingBudget(null);
    setNewBudget({
      projectName: "",
      totalBudget: "",
      startDate: "",
      endDate: "",
      status: "Active",
      projectId: "",
      currency: "LKR",
      description: "",
    });
  };

  const handleCloseExpenseModal = () => {
    setShowAddExpenseModal(false);
    setEditingExpense(null);
    setNewExpense({
      description: "",
      projectId: "",
      amount: "",
      currency: "LKR",
      notes: "",
    });
  };

  const handleCloseCategoryModal = () => {
    setShowAddCategoryModal(false);
    setEditingCategory(null);
    setNewCategory({
      name: "",
      budget: "",
      description: "",
      spent: 0,
      remaining: 0,
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total Budget
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            LKR{" "}
            {budgets
              .reduce((sum, budget) => sum + budget.totalBudget, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Across all projects</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Total Spent
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            LKR{" "}
            {budgets
              .reduce((sum, budget) => sum + budget.spent, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {budgets.length > 0
              ? `${(
                  (budgets.reduce((sum, budget) => sum + budget.spent, 0) /
                    budgets.reduce(
                      (sum, budget) => sum + budget.totalBudget,
                      0
                    )) *
                  100
                ).toFixed(1)}% utilization`
              : "0% utilization"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Remaining
          </h3>
          <p className="text-3xl font-bold text-green-600">
            LKR{" "}
            {budgets
              .reduce((sum, budget) => sum + budget.remaining, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Available funds</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Budget Utilization
        </h3>
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              No budgets added yet. Add your first budget to see utilization
              data.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.totalBudget) * 100;
              const isOverBudget = percentage > 100;
              const isWarning = percentage > 90;

              return (
                <div key={budget.id || budget._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.projectName}</span>
                    <span
                      className={`font-semibold ${
                        isOverBudget
                          ? "text-red-600"
                          : isWarning
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget
                          ? "bg-red-500"
                          : isWarning
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      LKR {budget.spent.toLocaleString()} / LKR{" "}
                      {budget.totalBudget.toLocaleString()}
                    </span>
                    <span>
                      LKR {budget.remaining.toLocaleString()} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Expenses
        </h3>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              No expenses added yet. Add your first expense to see recent
              activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">
                    Project
                  </th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map((expense) => (
                  <tr
                    key={expense.id || expense._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">{expense.description}</td>
                    <td className="py-2 px-4">
                      {
                        budgets.find(
                          (b) =>
                            (b.id || b._id) ===
                            (expense.projectId || expense.project?._id)
                        )?.projectName
                      }
                    </td>
                    <td className="py-2 px-4 font-medium">
                      LKR {expense.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      {formatDateForDisplay(expense.date)}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          expense.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderBudgets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Project Budgets</h3>
        <button
          onClick={() => setShowAddBudgetModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No budgets added yet</p>
            <p className="text-sm">
              Click the "Add Budget" button to create your first project budget.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Project
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Total Budget
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Spent
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Remaining
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Start Date
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  End Date
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr
                  key={budget.id || budget._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-6 font-medium">
                    {budget.projectName}
                  </td>
                  <td className="py-3 px-6">
                    LKR {budget.totalBudget.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    LKR {budget.spent.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    LKR {budget.remaining.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    {formatDateForDisplay(budget.startDate)}
                  </td>
                  <td className="py-3 px-6">
                    {formatDateForDisplay(budget.endDate)}
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {budget.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteBudget(budget.id || budget._id)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Expense Tracking
        </h3>
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Expense
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No expenses added yet</p>
            <p className="text-sm">
              Click the "Add Expense" button to create your first expense
              record.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Description
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Project
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Category
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id || expense._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-6">{expense.description}</td>
                  <td className="py-3 px-6">
                    {
                      budgets.find(
                        (b) =>
                          (b.id || b._id) ===
                          (expense.projectId || expense.project?._id)
                      )?.projectName
                    }
                  </td>
                  <td className="py-3 px-6">{expense.category}</td>
                  <td className="py-3 px-6 font-medium">
                    LKR {expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    {formatDateForDisplay(expense.date)}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteExpense(expense.id || expense._id)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Budget Reports</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800 mb-4">Budget vs Actual</h4>
          {budgets.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => {
                const variance = budget.spent - budget.totalBudget;
                const variancePercent = (variance / budget.totalBudget) * 100;

                return (
                  <div
                    key={budget.id || budget._id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{budget.projectName}</span>
                    <div className="text-right">
                      <div
                        className={`font-medium ${
                          variance > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        LKR {Math.abs(variance).toLocaleString()}
                      </div>
                      <div
                        className={`text-xs ${
                          variance > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {variancePercent > 0 ? "+" : ""}
                        {variancePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800 mb-4">
            Category Breakdown
          </h4>
          {categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No categories available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id || category._id}
                  className="flex justify-between"
                >
                  <span className="text-sm">{category.name}</span>
                  <span className="font-medium">
                    LKR {category.spent.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Export Options</h4>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export to Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export to PDF
          </button>
          <button
            onClick={generateReport}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Approval Workflow</h3>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No expenses to approve</p>
            <p className="text-sm">
              Add expenses first to see them in the approval workflow.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Item
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Project
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id || expense._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-6">{expense.description}</td>
                  <td className="py-3 px-6">
                    LKR {expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    {
                      budgets.find(
                        (b) =>
                          (b.id || b._id) ===
                          (expense.projectId || expense.project?._id)
                      )?.projectName
                    }
                  </td>
                  <td className="py-3 px-6">
                    {formatDateForDisplay(expense.date)}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : expense.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {expense.status === "Pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleApproveExpense(expense.id || expense._id)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleRejectExpense(expense.id || expense._id)
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {expense.status === "Approved"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderForecasting = () => {
    // Calculate real forecasting data
    const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

    // Calculate average monthly spending based on actual data
    const getAverageMonthlySpending = () => {
      if (expenses.length === 0) return 0;
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const monthsSinceStart =
        expenses.length > 0 ? Math.max(1, Math.ceil(expenses.length / 2)) : 1;
      return totalExpenses / monthsSinceStart;
    };

    const averageMonthlySpending = getAverageMonthlySpending();

    // Generate next 6 months forecast
    const getNextMonths = () => {
      const months = [];
      const currentDate = new Date();
      for (let i = 1; i <= 6; i++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i,
          1
        );
        months.push(date.toLocaleDateString("en-US", { month: "long" }));
      }
      return months;
    };

    const nextMonths = getNextMonths();

    // Calculate projected spending for each month
    const getProjectedSpending = (monthIndex) => {
      if (totalRemaining <= 0) return 0;
      const remainingMonths = Math.max(1, 12 - monthIndex);
      return Math.min(totalRemaining, averageMonthlySpending * remainingMonths);
    };

    // Generate dynamic risk alerts based on actual data
    const getRiskAlerts = () => {
      const alerts = [];

      // Budget utilization risk
      if (totalBudget > 0) {
        const utilizationPercent = (totalSpent / totalBudget) * 100;
        if (utilizationPercent > 90) {
          alerts.push({
            type: "high",
            icon: "🚨",
            message: `Budget utilization at ${utilizationPercent.toFixed(
              1
            )}% - Risk of overrun`,
          });
        } else if (utilizationPercent > 75) {
          alerts.push({
            type: "medium",
            icon: "⚠️",
            message: `Budget utilization at ${utilizationPercent.toFixed(
              1
            )}% - Monitor closely`,
          });
        }
      }

      // Spending rate risk
      if (averageMonthlySpending > 0 && totalRemaining > 0) {
        const monthsToExhaustion = totalRemaining / averageMonthlySpending;
        if (monthsToExhaustion < 3) {
          alerts.push({
            type: "high",
            icon: "🚨",
            message: `Current spending rate will exhaust budget in ${monthsToExhaustion.toFixed(
              1
            )} months`,
          });
        } else if (monthsToExhaustion < 6) {
          alerts.push({
            type: "medium",
            icon: "⚠️",
            message: `Budget may be exhausted in ${monthsToExhaustion.toFixed(
              1
            )} months at current rate`,
          });
        }
      }

      // Category spending analysis
      if (categories.length > 0) {
        const overBudgetCategories = categories.filter(
          (cat) => cat.spent > cat.budget
        );
        if (overBudgetCategories.length > 0) {
          alerts.push({
            type: "high",
            icon: "🚨",
            message: `${overBudgetCategories.length} category(ies) over budget`,
          });
        }
      }

      // No risks
      if (alerts.length === 0) {
        alerts.push({
          type: "low",
          icon: "✅",
          message: "Budget performance is on track",
        });
      }

      return alerts;
    };

    const riskAlerts = getRiskAlerts();

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Cost Forecasting
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-4">Budget Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Budget:</span>
                <span className="font-medium">
                  LKR {totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Spent:</span>
                <span className="font-medium">
                  LKR {totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Remaining:</span>
                <span className="font-medium text-green-600">
                  LKR {totalRemaining.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Utilization:</span>
                <span
                  className={`font-medium ${
                    totalBudget > 0
                      ? (totalSpent / totalBudget) * 100 > 90
                        ? "text-red-600"
                        : "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {totalBudget > 0
                    ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-4">
              Spending Trends
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg Monthly:</span>
                <span className="font-medium">
                  LKR {averageMonthlySpending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Projected End:</span>
                <span className="font-medium">
                  {totalRemaining > 0 && averageMonthlySpending > 0
                    ? `${Math.ceil(
                        totalRemaining / averageMonthlySpending
                      )} months`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Risk Level:</span>
                <span
                  className={`font-medium ${
                    riskAlerts.some((a) => a.type === "high")
                      ? "text-red-600"
                      : riskAlerts.some((a) => a.type === "medium")
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {riskAlerts.some((a) => a.type === "high")
                    ? "High"
                    : riskAlerts.some((a) => a.type === "medium")
                    ? "Medium"
                    : "Low"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-4">Next 6 Months</h4>
            {budgets.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nextMonths.map((month, index) => {
                  const projected = getProjectedSpending(index + 1);
                  return (
                    <div
                      key={month}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{month}</span>
                      <div className="text-right">
                        <div className="font-medium">
                          LKR {projected.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Projected</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-4">Risk Alerts</h4>
            {riskAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No risks detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      alert.type === "high"
                        ? "text-red-600"
                        : alert.type === "medium"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    <span>{alert.icon}</span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-4">
              Category Performance
            </h4>
            {categories.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No categories available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => {
                  const utilization =
                    category.budget > 0
                      ? (category.spent / category.budget) * 100
                      : 0;
                  return (
                    <div
                      key={category.id || category._id}
                      className="space-y-1"
                    >
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span
                          className={`font-medium ${
                            utilization > 100
                              ? "text-red-600"
                              : utilization > 90
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            utilization > 100
                              ? "bg-red-500"
                              : utilization > 90
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800 mb-4">Forecast Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                LKR {totalRemaining.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Available for Future</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalBudget > 0
                  ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%`
                  : "0%"}
              </div>
              <div className="text-sm text-gray-600">Budget Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalRemaining > 0 && averageMonthlySpending > 0
                  ? `${Math.ceil(totalRemaining / averageMonthlySpending)}`
                  : "∞"}
              </div>
              <div className="text-sm text-gray-600">Months Remaining</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Payment Tracking</h3>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No payments to track</p>
            <p className="text-sm">
              Add expenses first to see payment tracking data.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Description
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Project
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 5).map((expense) => (
                <tr
                  key={expense.id || expense._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-6">{expense.description}</td>
                  <td className="py-3 px-6">
                    {
                      budgets.find(
                        (b) =>
                          (b.id || b._id) ===
                          (expense.projectId || expense.project?._id)
                      )?.projectName
                    }
                  </td>
                  <td className="py-3 px-6">
                    LKR {expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6">
                    {formatDateForDisplay(expense.date)}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : expense.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {expense.status === "Approved" ? (
                      <button
                        onClick={() => handleProcessPayment(expense.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2"
                      >
                        Process
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {expense.status === "Pending"
                          ? "Pending Approval"
                          : "Cannot Process"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Budget Categories
        </h3>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No categories added yet</p>
            <p className="text-sm">
              Click the "Add Category" button to create your first budget
              category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id || category._id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteCategory(category.id || category._id)
                    }
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget:</span>
                  <span className="font-medium">
                    LKR {category.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent:</span>
                  <span className="font-medium">
                    LKR {category.spent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className="font-medium text-green-600">
                    LKR {category.remaining.toLocaleString()}
                  </span>
                </div>
                {category.description && (
                  <div className="text-xs text-gray-600 mt-2">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "budgets":
        return renderBudgets();
      case "expenses":
        return renderExpenses();
      case "reports":
        return renderReports();
      case "approvals":
        return renderApprovals();
      case "forecasting":
        return renderForecasting();
      case "payments":
        return renderPayments();
      case "categories":
        return renderCategories();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Budget Management
          </h1>
          <p className="text-gray-600">
            Manage project budgets, track expenses, and monitor financial
            performance
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">{renderContent()}</div>

      {/* Add Budget Modal */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingBudget ? "Edit Budget" : "Add New Budget"}
              </h3>
              <button
                onClick={handleCloseBudgetModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={newBudget.projectName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget (LKR)
                </label>
                <input
                  type="number"
                  name="totalBudget"
                  value={newBudget.totalBudget}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newBudget.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newBudget.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newBudget.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingBudget ? "Update Budget" : "Add Budget"}
              </button>
              <button
                onClick={handleCloseBudgetModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </h3>
              <button
                onClick={handleCloseExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newExpense.description}
                  onChange={handleExpenseInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={newExpense.projectId}
                  onChange={handleExpenseInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {budgets.length === 0 ? (
                    <option value="" disabled>
                      No projects available - Add a budget first
                    </option>
                  ) : (
                    budgets.map((budget) => (
                      <option
                        key={budget.id || budget._id}
                        value={budget.id || budget._id}
                      >
                        {budget.projectName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleExpenseInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newExpense.date}
                    onChange={handleExpenseInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newExpense.category}
                    onChange={handleExpenseInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.length === 0 ? (
                      <option value="" disabled>
                        No categories available - Add categories first
                      </option>
                    ) : (
                      categories.map((category) => (
                        <option
                          key={category.id || category._id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newExpense.status}
                    onChange={handleExpenseInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={
                  editingExpense ? handleUpdateExpense : handleAddExpense
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingExpense ? "Update Expense" : "Add Expense"}
              </button>
              <button
                onClick={handleCloseExpenseModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handleCloseCategoryModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (LKR)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={newCategory.budget}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter budget amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCategory.description}
                  onChange={handleCategoryInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={
                  editingCategory ? handleUpdateCategory : handleAddCategory
                }
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </button>
              <button
                onClick={handleCloseCategoryModal}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
