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
  const [dropdownStates, setDropdownStates] = useState({});
  const [deptId, setDeptId] = useState(null);

  const pageName = "RMUTI POS";

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/emp/data/${authData.id_card}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setDeptId(res.data.data[0].access);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [dropdownName]: !prevState[dropdownName],
    }));
  };

  const getPageLink = () => {
    switch (deptId) {
      case 0:
      case 1:
      case 2:
        return "/manager";
      case 3:
        return "/kitchen";
      case 4:
        return "/order";
      default:
        return "";
    }
  };

  const showOwner = deptId === 1 || deptId === 0;
  const showEmployeeManagement = deptId === 1 || deptId === 2 || deptId === 0;
  const showKinchen = deptId === 1 || deptId === 3 || deptId === 0;
  const showCashier = deptId === 4 || deptId === 0;

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
        } transition-transform duration-300 ease-in-out shadow-lg z-50 flex flex-col scrollbar-hide`}
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

        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <ul>
            {showEmployeeManagement && (
              <>
                <li>
                  <Link
                    to="/manager"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>แดชบอร์ด</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/empmanagement"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>การจัดการพนักงาน</span>
                  </Link>
                </li>
                <li className="relative">
                  <button
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-blue-600 transition-colors"
                    onClick={() => toggleDropdown("emptimestamp")}
                  >
                    <span>การลงเวลา</span>
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
                  {dropdownStates.emptimestamp && (
                    <ul className="bg-blue-600">
                      <li>
                        <Link
                          to="/checkin"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          ลงเวลาเข้า
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/checkout"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          ลงเวลาออก
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
                    <span>วันทำงาน</span>
                  </Link>
                </li>
              </>
            )}
            {showKinchen && (
              <>
                <li>
                  <Link
                    to="/kitchen"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>คำสั่งอาหาร</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orderdinks"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>คำสั่งเครื่องดื่ม</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/material"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>วัตถุดิบ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stocks"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>คลังวัตถุดิบ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stockdetail"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>รายละเอียดการสต๊อก</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/menus" // Updated with actual path for Stock
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>รายการอาหาร</span>
                  </Link>
                </li>
              </>
            )}
            {showOwner && (
              <>
                <li>
                  <Link
                    to="/department"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>แผนก</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tables"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>โต๊ะ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/promotion"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>โปรโมชั่น</span>
                  </Link>
                </li>
              </>
            )}
            {showCashier && (
              <>
                <li>
                  <Link
                    to="/order"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>สั่งอาหาร</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/allreeipt"
                    className="flex items-center px-4 py-2 hover:bg-blue-600 transition-colors"
                    onClick={toggleDrawer}
                  >
                    <span>ใบเสร็จ</span>
                  </Link>
                </li>
              </>
            )}

            {showKinchen && (
              <>
                <li className="relative">
                  <button
                    className="flex items-center px-4 py-2 w-full text-left hover:bg-blue-600 transition-colors"
                    onClick={() => toggleDropdown("orther")}
                  >
                    <span>อื่น ๆ</span>
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
                  {dropdownStates.orther && (
                    <ul className="bg-blue-600">
                      <li>
                        <Link
                          to="/menucategory"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          การจัดการหมวดหมู่
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/unit"
                          className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                          onClick={toggleDrawer}
                        >
                          การจัดการหน่วยวัดน้ำหนัก
                        </Link>
                      </li>
                      {showOwner && (
                        <li>
                          <Link
                            to="/access"
                            className="block px-4 py-2 hover:bg-blue-500 transition-colors"
                            onClick={toggleDrawer}
                          >
                            กำหนดสิทธิ์ในการเข้าถึง
                          </Link>
                        </li>
                      )}

                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t border-blue-600">
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
