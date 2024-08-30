import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import AuthContext from "../components/auth/authcontext";

const Menubar = () => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pageName =
    location.pathname === "/manager"
      ? "Manager"
      : location.pathname === "/empmanagement"
      ? "Employee Management"
      : location.pathname === "/checkin"
      ? "Check in"
      : location.pathname === "/checkout"
      ? "Check out"
      : location.pathname === "/addemp"
      ? "Add Employee"
      : location.pathname === "/editemp"
      ? "Edit Employee"
      : location.pathname === "/workdate"
      ? "Work date"
      : "Default";

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
        <Link to="/manager" className="text-2xl font-semibold">
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
            <li>
              <Link
                to="/empmanagement"
                className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                onClick={toggleDrawer}
              >
                <span>Employee management</span>
              </Link>
            </li>
            {/* Time Stamped Dropdown */}
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
                <span>Work date</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products/kitchen-appliances"
                className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                onClick={toggleDrawer}
              >
                <span>Kitchen & Appliances</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products/storage-organization"
                className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                onClick={toggleDrawer}
              >
                <span>Storage & Organization</span>
              </Link>
            </li>
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
