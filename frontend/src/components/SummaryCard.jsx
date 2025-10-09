import { UsersIcon, UserGroupIcon, CheckCircleIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const SummaryCards = ({ totalUsers, usersWithRoles, verifiedUsers, socialUsers }) => {
  return (
    <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8" role="region" aria-label="User summary statistics">
      <div
        className="bg-gradient-to-r from-indigo-50 to-white p-4 sm:p-5 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade"
        aria-label={`Total users: ${totalUsers}`}
      >
        <UsersIcon className="w-8 h-8 text-indigo-600 mb-2" />
        <h3 className="text-base font-medium text-gray-800">Total Users</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{totalUsers}</p>
      </div>
      <div
        className="bg-gradient-to-r from-indigo-50 to-white p-4 sm:p-5 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade"
        aria-label={`Users with roles: ${usersWithRoles}`}
      >
        <UserGroupIcon className="w-8 h-8 text-indigo-600 mb-2" />
        <h3 className="text-base font-medium text-gray-800">Users with Roles</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{usersWithRoles}</p>
      </div>
      <div
        className="bg-gradient-to-r from-indigo-50 to-white p-4 sm:p-5 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade"
        aria-label={`Verified users: ${verifiedUsers}`}
      >
        <CheckCircleIcon className="w-8 h-8 text-indigo-600 mb-2" />
        <h3 className="text-base font-medium text-gray-800">Verified Users</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{verifiedUsers}</p>
      </div>
      <div
        className="bg-gradient-to-r from-indigo-50 to-white p-4 sm:p-5 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade"
        aria-label={`Social login users: ${socialUsers}`}
      >
        <GlobeAltIcon className="w-8 h-8 text-indigo-600 mb-2" />
        <h3 className="text-base font-medium text-gray-800">Social Login Users</h3>
        <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{socialUsers}</p>
      </div>
    </section>
  );
};

SummaryCards.propTypes = {
  totalUsers: PropTypes.number.isRequired,
  usersWithRoles: PropTypes.number.isRequired,
  verifiedUsers: PropTypes.number.isRequired,
  socialUsers: PropTypes.number.isRequired,
};

export default SummaryCards;