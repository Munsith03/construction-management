import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const [openSubmenu, setOpenSubmenu] = useState(new Set()); // Use Set for multiple open submenus
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      active: true,
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "Restaurant Approval",
      path: "/restaurant-approval",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      label: "Restaurant Admin",
      path: "/restaurant-admin",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      hasDropdown: true,
      submenu: [
        { label: "Menu management", path: "/menu-management" },
        { label: "New Customers", path: "/customers/new" },
        { label: "VIP Customers", path: "/customers/vip" },
      ],
    },
    {
      label: "Customers",
      path: "/customers",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      hasDropdown: true,
      submenu: [
        { label: "All Customers", path: "/customers/all" },
        { label: "New Customers", path: "/customers/new" },
        { label: "VIP Customers", path: "/customers/vip" },
      ],
    },
    {
      label: "Products",
      path: "/products",
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    },
    {
      label: "Orders",
      path: "/orders",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      hasDropdown: true,
      submenu: [
        { label: "Sales Report", path: "/analytics/sales" },
        { label: "User Analytics", path: "/analytics/users" },
      ],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavClick = (label) => {
    setSelectedItem(label);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label); // Close submenu if already open
      } else {
        newSet.add(label); // Open submenu
      }
      return newSet;
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic here (e.g., filter navItems or API call)
  };

  return (
    <div className="flex h-screen font-sourceSans bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <img className="w-auto h-8" src={logo} alt="PickMyFood Logo" />
            <span className="text-xl font-bold text-gray-800">PickMyFood</span>
          </div>
          <button
            className="md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mt-4">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="search"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full py-2 pl-10 pr-3 text-sm rounded-lg border bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-black focus:ring-black focus:border-black transition duration-200"
              placeholder="Search..."
              aria-label="Search navigation"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1" aria-label="Primary navigation">
            {navItems.slice(0, 4).map((item) => (
              <div key={item.label}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    handleNavClick(item.label);
                    if (item.hasDropdown) toggleSubmenu(item.label);
                  }}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive || selectedItem === item.label
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                  aria-current={
                    selectedItem === item.label ? "page" : undefined
                  }
                >
                  <svg
                    className={`flex-shrink-0 w-5 h-5 mr-2.5 transition-colors ${
                      selectedItem === item.label
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-900"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  <span className="truncate">{item.label}</span>
                  {item.hasDropdown && (
                    <svg
                      className={`w-4 h-4 ml-auto transform transition-transform ${
                        openSubmenu.has(item.label) ? "rotate-180" : ""
                      } ${
                        selectedItem === item.label
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-900"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </NavLink>
                {item.hasDropdown && openSubmenu.has(item.label) && (
                  <div className="ml-5 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.label}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block px-3 py-2 text-sm rounded-md transition duration-200 ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(subItem.label);
                        }}
                        aria-current={
                          selectedItem === subItem.label ? "page" : undefined
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <hr className="my-4 border-gray-200" />

          <nav className="space-y-1" aria-label="Secondary navigation">
            {navItems.slice(4, 7).map((item) => (
              <div key={item.label}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    handleNavClick(item.label);
                    if (item.hasDropdown) toggleSubmenu(item.label);
                  }}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive || selectedItem === item.label
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                  aria-current={
                    selectedItem === item.label ? "page" : undefined
                  }
                >
                  <svg
                    className={`flex-shrink-0 w-5 h-5 mr-2.5 transition-colors ${
                      selectedItem === item.label
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-900"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                  <span className="truncate">{item.label}</span>
                  {item.hasDropdown && (
                    <svg
                      className={`w-4 h-4 ml-auto transform transition-transform ${
                        openSubmenu.has(item.label) ? "rotate-180" : ""
                      } ${
                        selectedItem === item.label
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-900"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </NavLink>
                {item.hasDropdown && openSubmenu.has(item.label) && (
                  <div className="ml-5 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.label}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block px-3 py-2 text-sm rounded-md transition duration-200 ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(subItem.label);
                        }}
                        aria-current={
                          selectedItem === subItem.label ? "page" : undefined
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <hr className="my-4 border-gray-200" />

          <nav className="space-y-1" aria-label="Tertiary navigation">
            {navItems.slice(7).map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => handleNavClick(item.label)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive || selectedItem === item.label
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
                aria-current={selectedItem === item.label ? "page" : undefined}
              >
                <svg
                  className={`flex-shrink-0 w-5 h-5 mr-2.5 transition-colors ${
                    selectedItem === item.label
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="px-3 py-4 mt-auto border-t border-gray-200">
          <button
            type="button"
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100"
            aria-label="User profile"
          >
            <img
              className="flex-shrink-0 object-cover w-6 h-6 mr-2.5 rounded-full"
              src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/vertical-menu/2/avatar-male.png"
              alt="User avatar"
            />
            <span className="truncate">Jacob Jones</span>
            <svg
              className="w-4 h-4 ml-auto text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Toggle Button for Mobile */}
        <div className="flex items-center p-3 md:hidden bg-white border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            aria-label="Open sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="ml-3 text-base font-semibold truncate text-gray-800">
            {selectedItem}
          </h1>
        </div>
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-full">
            <div className="h-full overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
