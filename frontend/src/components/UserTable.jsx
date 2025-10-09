import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { UserPlusIcon, TrashIcon, MagnifyingGlassIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import SummaryCards from "./SummaryCard";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A2D729', '#FF6384', '#36A2EB', '#FFCE56'];

const UserTable = ({ users, onDelete, onAssignRole, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: "email", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [chartType, setChartType] = useState("pie");

  // Get unique roles for filter dropdown
  const roles = useMemo(() => {
    const roleSet = new Set();
    users?.forEach(user => {
      user.roles?.forEach(role => roleSet.add(role.name));
    });
    return ['All', 'No Roles', ...Array.from(roleSet)];
  }, [users]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return (users || []).filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.roles?.some(role => role.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.provider || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === "All" ? true :
        selectedRole === "No Roles" ? !user.roles || user.roles.length === 0 :
        user.roles?.some(role => role.name === selectedRole);
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortConfig.key === "email") {
        return sortConfig.direction === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      if (sortConfig.key === "isVerified") {
        return sortConfig.direction === "asc"
          ? (a.isVerified === b.isVerified ? 0 : a.isVerified ? 1 : -1)
          : (b.isVerified === a.isVerified ? 0 : b.isVerified ? 1 : -1);
      }
      if (sortConfig.key === "roles") {
        const aRoles = a.roles?.map(role => role.name).join(", ") || "";
        const bRoles = b.roles?.map(role => role.name).join(", ") || "";
        return sortConfig.direction === "asc"
          ? aRoles.localeCompare(bRoles)
          : bRoles.localeCompare(aRoles);
      }
      if (sortConfig.key === "provider") {
        const aProvider = a.provider || "";
        const bProvider = b.provider || "";
        return sortConfig.direction === "asc"
          ? aProvider.localeCompare(bProvider)
          : bProvider.localeCompare(aProvider);
      }
      if (sortConfig.key === "createdAt") {
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return sortConfig.direction === "asc"
          ? aDate - bDate
          : bDate - aDate;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Summary details
  const totalUsers = sortedUsers.length;
  const usersWithRoles = sortedUsers.filter(user => user.roles && user.roles.length > 0).length;
  const usersWithoutRoles = totalUsers - usersWithRoles;
  const verifiedUsers = sortedUsers.filter(user => user.isVerified).length;
  const socialUsers = sortedUsers.filter(user => user.provider).length;

  // Chart data for roles distribution
  const chartData = useMemo(() => {
    const roleData = sortedUsers.reduce((acc, user) => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach(role => {
          acc[role.name] = (acc[role.name] || 0) + 1;
        });
      } else {
        acc['No Role'] = (acc['No Role'] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(roleData).map(([name, value]) => ({ name, value }));
  }, [sortedUsers]);

  // Handle CSV export
  const handleExportCSV = () => {
    const csvData = sortedUsers.map(user => ({
      Email: user.email || 'N/A',
      Verified: user.isVerified ? 'Yes' : 'No',
      Roles: user.roles?.map(role => role.name).join(', ') || 'None',
      Provider: user.provider || 'None',
      CreatedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle PDF export
  const handleExportPDF = () => {
    try {
      if (!jsPDF || !autoTable) {
        throw new Error('jsPDF or jspdf-autotable not properly loaded. Run `npm install jspdf jspdf-autotable`.');
      }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('User Management Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.setFontSize(10);
      doc.text('Summary:', 14, 40);
      doc.text(`Total Users: ${totalUsers}`, 14, 48);
      doc.text(`Users with Roles: ${usersWithRoles}`, 14, 56);
      doc.text(`Users without Roles: ${usersWithoutRoles}`, 14, 64);
      doc.text(`Verified Users: ${verifiedUsers}`, 14, 72);
      doc.text(`Social Login Users: ${socialUsers}`, 14, 80);

      autoTable(doc, {
        head: [['Email', 'Verified', 'Roles', 'Provider', 'Created At']],
        body: sortedUsers.map(user => [
          user.email || 'N/A',
          user.isVerified ? 'Yes' : 'No',
          user.roles?.map(role => role.name).join(', ') || 'None',
          user.provider || 'None',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        ]),
        startY: 86,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 50 }, // Email
          1: { cellWidth: 20 }, // Verified
          2: { cellWidth: 40 }, // Roles
          3: { cellWidth: 30 }, // Provider
          4: { cellWidth: 30 }, // Created At
        },
      });

      doc.save(`users_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error.message, error.stack);
      alert(`Failed to generate PDF report: ${error.message}. Please ensure dependencies are installed (npm install jspdf jspdf-autotable) and try again.`);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      {/* Summary Cards */}
     <SummaryCards
  totalUsers={totalUsers}
  usersWithRoles={usersWithRoles}
  verifiedUsers={verifiedUsers}
  socialUsers={socialUsers}
/>

      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Users</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <label htmlFor="roleFilter" className="block text-base font-semibold text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              aria-label="Filter users by role"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setSelectedRole("All")}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-w-[120px]"
            aria-label="Reset role filter"
          >
            Reset Filter
          </Button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Roles Distribution</h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setChartType("pie")}
              className={`px-4 py-2 text-base font-medium rounded-lg ${chartType === "pie" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
              aria-label="Show pie chart"
            >
              Pie Chart
            </Button>
            <Button
              onClick={() => setChartType("bar")}
              className={`px-4 py-2 text-base font-medium rounded-lg ${chartType === "bar" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
              aria-label="Show bar chart"
            >
              Bar Chart
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end mb-8 space-x-4">
        <Button
          onClick={handleExportCSV}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          disabled={isLoading}
          aria-label="Export users to CSV"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Export CSV
        </Button>
        <Button
          onClick={handleExportPDF}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          disabled={isLoading}
          aria-label="Export users to PDF"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users by email, role, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
            aria-label="Search users"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="grid">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("email")}
                  aria-sort={sortConfig.key === "email" ? sortConfig.direction : "none"}
                >
                  Email {getSortIcon("email")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("isVerified")}
                  aria-sort={sortConfig.key === "isVerified" ? sortConfig.direction : "none"}
                >
                  Verified {getSortIcon("isVerified")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("roles")}
                  aria-sort={sortConfig.key === "roles" ? sortConfig.direction : "none"}
                >
                  Roles {getSortIcon("roles")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("provider")}
                  aria-sort={sortConfig.key === "provider" ? sortConfig.direction : "none"}
                >
                  Provider {getSortIcon("provider")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("createdAt")}
                  aria-sort={sortConfig.key === "createdAt" ? sortConfig.direction : "none"}
                >
                  Created At {getSortIcon("createdAt")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <LoadingSpinner size="md" color="indigo" />
                      <span className="text-base text-gray-600 animate-pulse">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500 text-base"
                  >
                    <div>
                      <p>No users found.</p>
                      <button
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                        onClick={() => onAssignRole(null)}
                        aria-label="Add a new user"
                      >
                        Add a new user
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-indigo-50 transition-colors duration-200 animate-fade"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-600">
                        {user.isVerified ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base text-gray-600">
                        {user.roles?.map((role) => role.name).join(", ") || (
                          <span className="text-gray-400">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-600">
                        {user.provider || (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Button
                        onClick={() => onAssignRole(user._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                        disabled={isLoading}
                        aria-label={`Assign role to ${user.email}`}
                      >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Assign Role
                      </Button>
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.email}?`
                            )
                          ) {
                            onDelete(user._id);
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                        disabled={isLoading}
                        aria-label={`Delete user ${user.email}`}
                      >
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive Card Layout for Mobile */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <LoadingSpinner size="md" color="indigo" />
              <span className="text-base text-gray-600 animate-pulse">Loading users...</span>
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-base">
            <p>No users found.</p>
            <button
              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => onAssignRole(null)}
              aria-label="Add a new user"
            >
              Add a new user
            </button>
          </div>
        ) : (
          sortedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-200 animate-fade"
            >
              <div className="mb-4 space-y-2">
                <h4 className="text-lg font-semibold text-gray-900">{user.email}</h4>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Verified:</span>{" "}
                  {user.isVerified ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </p>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Roles:</span>{" "}
                  {user.roles?.map((role) => role.name).join(", ") || (
                    <span className="text-gray-400">No roles assigned</span>
                  )}
                </p>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Provider:</span>{" "}
                  {user.provider || (
                    <span className="text-gray-400">None</span>
                  )}
                </p>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => onAssignRole(user._id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  disabled={isLoading}
                  aria-label={`Assign role to ${user.email}`}
                >
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  Assign Role
                </Button>
                <Button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${user.email}?`
                      )
                    ) {
                      onDelete(user._id);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  disabled={isLoading}
                  aria-label={`Delete user ${user.email}`}
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      isVerified: PropTypes.bool,
      roles: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string.isRequired,
        })
      ),
      provider: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ),
  onDelete: PropTypes.func.isRequired,
  onAssignRole: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

UserTable.defaultProps = {
  users: [],
  isLoading: false,
};

export default UserTable;