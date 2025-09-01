import { useState } from "react";
import avatar from "../../assets/avatar.webp";

const Table = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const users = [
    {
      id: 1,
      name: "David Harrison",
      email: "david@site.com",
      position: "Seller",
      department: "Branding products",
      status: "warning",
      progress: 60,
      created: "20 Dec, 09:27",
      avatar: avatar,
    },
    {
      id: 2,
      name: "Anne Richard",
      email: "anne@site.com",
      position: "Designer",
      department: "IT department",
      status: "active",
      progress: 100,
      created: "18 Dec, 15:20",
      avatar: null,
      initials: "A",
    },
    {
      id: 3,
      name: "John Smith",
      email: "john@site.com",
      position: "Developer",
      department: "Engineering",
      status: "active",
      progress: 80,
      created: "17 Dec, 10:15",
      avatar: null,
      initials: "J",
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma@site.com",
      position: "Manager",
      department: "Marketing",
      status: "warning",
      progress: 45,
      created: "16 Dec, 14:30",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael@site.com",
      position: "Analyst",
      department: "Finance",
      status: "active",
      progress: 90,
      created: "15 Dec, 11:45",
      avatar: null,
      initials: "M",
    },
    {
      id: 6,
      name: "Sarah Davis",
      email: "sarah@site.com",
      position: "HR",
      department: "Human Resources",
      status: "warning",
      progress: 70,
      created: "14 Dec, 09:00",
      avatar: "/api/placeholder/40/40",
    },
  ];

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      if (selectedUsers.length + 1 === users.length) {
        setSelectAll(true);
      }
    }
  };

  const handleViewAll = () => {
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const StatusBadge = ({ status }) => {
    if (status === "active") {
      return (
        <span className="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
          <svg
            className="size-2.5"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
          </svg>
          Active
        </span>
      );
    } else if (status === "warning") {
      return (
        <span className="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <svg
            className="size-2.5"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          Warning
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col max-w-7xl p-10">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                <p className="text-sm text-gray-600">
                  Add users, edit and more.
                </p>
              </div>

              <div>
                <div className="inline-flex gap-x-2">
                  <button
                    className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray50"
                    onClick={handleViewAll}
                  >
                    View all
                  </button>

                  <a
                    className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-black text-white hover:bg-gray-800 focus:outline-hidden focus:bg-black disabled:opacity-50 disabled:pointer-events-none"
                    href="#"
                  >
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add user
                  </a>
                </div>
              </div>
            </div>
            {/* End Header */}

            {/* Table */}
            <div className="min-h-">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="ps-6 py-3 text-start">
                      <label
                        htmlFor="hs-at-with-checkboxes-main"
                        className="flex"
                      >
                        <input
                          type="checkbox"
                          className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                          id="hs-at-with-checkboxes-main"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                        <span className="sr-only">Checkbox</span>
                      </label>
                    </th>

                    <th
                      scope="col"
                      className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start"
                    >
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-800">
                          Name
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-800">
                          Position
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-800">
                          Status
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-800">
                          Portfolio
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase text-gray-800">
                          Created
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-end"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="size-px whitespace-nowrap">
                        <div className="ps-6 py-3">
                          <label
                            htmlFor={`hs-at-with-checkboxes-${user.id}`}
                            className="flex"
                          >
                            <input
                              type="checkbox"
                              className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                              id={`hs-at-with-checkboxes-${user.id}`}
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                            <span className="sr-only">Checkbox</span>
                          </label>
                        </div>
                      </td>
                      <td className="size-px whitespace-nowrap">
                        <div className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3">
                          <div className="flex items-center gap-x-3">
                            {user.avatar ? (
                              <img
                                className="inline-block size-9.5 rounded"
                                src={user.avatar}
                                alt="Avatar"
                              />
                            ) : (
                              <span className="inline-flex items-center justify-center size-9.5 rounded bg-white border border-gray-300">
                                <span className="font-medium text-sm text-gray-800">
                                  {user.initials}
                                </span>
                              </span>
                            )}
                            <div className="grow">
                              <span className="block text-sm font-semibold text-gray-800">
                                {user.name}
                              </span>
                              <span className="block text-sm text-gray-500">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="h-px w-72 whitespace-nowrap">
                        <div className="px-6 py-3">
                          <span className="block text-sm font-semibold text-gray-800">
                            {user.position}
                          </span>
                          <span className="block text-sm text-gray-500">
                            {user.department}
                          </span>
                        </div>
                      </td>
                      <td className="size-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <StatusBadge status={user.status} />
                        </div>
                      </td>
                      <td className="size-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <div className="flex items-center gap-x-3">
                            <span className="text-xs text-gray-500">
                              {user.progress === 100 ? "5/5" : "3/5"}
                            </span>
                            <div className="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="flex flex-col justify-center overflow-hidden bg-gray-800"
                                role="progressbar"
                                style={{ width: `${user.progress}%` }}
                                aria-valuenow={user.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="size-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <span className="text-sm text-gray-500">
                            {user.created}
                          </span>
                        </div>
                      </td>
                      <td className="size-px whitespace-nowrap">
                        <div className="px-6 py-1.5">
                          <a
                            className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium"
                            href="#"
                          >
                            Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* End Table */}

            {/* Footer */}
            <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {users.length}
                  </span>{" "}
                  results
                </p>
              </div>

              <div>
                <div className="inline-flex gap-x-2">
                  <button
                    type="button"
                    className="py-1.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>{" "}
                    Prev
                  </button>

                  <button
                    type="button"
                    className="py-1.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    Next
                  </button>
                </div>
              </div>
            </div>
            {/* End Footer */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
