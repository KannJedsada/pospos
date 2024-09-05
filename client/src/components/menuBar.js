import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import AuthContext from "../components/auth/authcontext";
import axios from "../utils/axiosInstance";

const Menubar = () => {
  const location = useLocation();
  const { authData, logout } = useContext(AuthContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deptId, setDeptId] = useState(null);

  const pageName =
    {
      "/manager": "Manager",
      "/empmanagement": "Employee Management",
      "/checkin": "Check in",
      "/checkout": "Check out",
      "/addemp": "Add Employee",
      "/editemp": "Edit Employee",
      "/workdate": "Work date",
      "/salary": "Salary",
      "/kitchen": "Kitchen",
    }[location.pathname] || "Default";

  const fetchData = async () => {
    try {
      const res = await axios.get(`/emp/data/${authData.id_card}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setDeptId(res.data.data[0].dept_id);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const getPageLink = () => {
    switch (deptId) {
      case 1:
      case 5:
        return "/manager";
      case 2:
        return "/kitchen";
      case 3:
        return ""; // Provide the actual path if necessary
      default:
        return "";
    }
  };

  const showEmployeeManagement = deptId === 1 || deptId === 5;
  const showKinchen = deptId === 1 || deptId === 2;

  useEffect(() => {
    fetchData();
  }, [authData.id_card, authData.token]);

  return (
    <>
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex items-center shadow-md">
        <button
          onClick={toggleDrawer}
          className="text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isDrawerOpen ? (
            <XMarkIcon className="h-8 w-8" />
          ) : (
            <Bars3Icon className="h-8 w-8" />
          )}
        </button>
        <Link to={getPageLink()} className="text-2xl font-semibold">
          {pageName}
        </Link>
      </header>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-700 text-white transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-64"
        } transition-transform duration-300 ease-in-out shadow-lg z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-600">
          <h2 className="text-xl font-semibold">{pageName}</h2>
          <button
            onClick={toggleDrawer}
            className="text-white focus:outline-none"
            aria-label="Close Menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4">
          <ul>
            {showEmployeeManagement && (
              <>
                <li>
                  <Link
                    to="/empmanagement"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>Employee Management</span>
                  </Link>
                </li>
                <li className="relative">
                  <button
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-blue-600 transition-colors"
                    onClick={toggleDropdown}
                  >
                    <span>Timestamp</span>
                    <svg
                      className={`ml-auto transform transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <ul className="bg-blue-600">
                      <li>
                        <Link
                          to="/checkin"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          Check in
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/checkout"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          Check out
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <Link
                    to="/workdate"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>Work Date</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/salary"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>Salary</span>
                  </Link>
                </li>
              </>
            )}
            {showKinchen && (
              <>
                <li>
                  <Link
                    to="/material"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>Material</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stock" // Updated with actual path for Stock
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>Stock</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-600">
          <button
            onClick={() => {
              logout();
              toggleDrawer();
            }}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Overlay (Optional) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
};

export default Menubar;
