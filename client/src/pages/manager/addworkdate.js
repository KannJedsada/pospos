import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { ChevronLeft } from "lucide-react";

const Addworkdate = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const { authData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmp = async () => {
    try {
      const res = await axios.get("/api/emp", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const filterDept = res.data.data.filter(
        (emp) => emp.dept_id !== 1 && emp.dept_id !== 2
      );
      // console.log(filterDept);
      setData(filterDept);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch employee data.",
      });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!selectedDate || selectedEmployees.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a date and at least one employee.",
      });
      return;
    }

    const formattedDate = formatDate(selectedDate);
    try {
      setIsLoading(true);
      for (const id_card of selectedEmployees) {
        const response = await axios.post(
          "/api/ws/add",
          {
            id_card: id_card,
            date: formattedDate,
          },
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          }
        );
      }
      Swal.fire({
        icon: "success",
        title: "เพิ่มสำเร็จ",
        showConfirmButton: false,
        timer: 1000,
      });
      setSelectedDate(null);
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Failed to submit work dates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to assign work dates.",
      });
    }finally{
      setIsLoading(false);
    }
  };

  const minDate = new Date();
  const [isAllSelected, setIsAllSelected] = useState(false);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmployees([]); // Clear all selections
    } else {
      setSelectedEmployees(data.map((employee) => employee.id_card)); // Select all employees
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleEmployeeSelect = (id_card) => {
    setSelectedEmployees(
      (prev) =>
        prev.includes(id_card)
          ? prev.filter((id) => id !== id_card) // Deselect if already selected
          : [...prev, id_card] // Add to selections
    );
  };

  useEffect(() => {
    // Update 'isAllSelected' state whenever selectedEmployees changes
    setIsAllSelected(
      data.length > 0 && selectedEmployees.length === data.length
    );
  }, [selectedEmployees, data]);

  useEffect(() => {
    fetchEmp();
  }, []);

  return (
    <div>
      <Menubar />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white bg-blue-400 hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-blue-900"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-2xl font-extrabold text-blue-800">
            กำหนดวันทำงานพนักงาน
          </h1>
        </div>

        {/* Date Picker */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <label className="block font-semibold text-gray-700">
            เลือกวันที่:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            disabled={isLoading}
            dateFormat="dd/MM/yyyy"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            minDate={minDate}
            filterDate={(date) => date > minDate}
          />
        </div>

        {/* Employee Selection */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-gray-700">
              เลือกพนักงาน:
            </label>
            <button
              onClick={toggleSelectAll}
              disabled={isLoading}
              className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isAllSelected ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
            </button>
          </div>
          <ul className="space-y-3">
            {data.map((employee) => (
              <li key={employee.id_card} className="flex items-center">
                <input
                  type="checkbox"
                  value={employee.id_card}
                  checked={selectedEmployees.includes(employee.id_card)}
                  onChange={() => handleEmployeeSelect(employee.id_card)}
                  disabled={isLoading}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-800">
                  {employee.f_name} {employee.l_name} ({employee.p_name})
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
        <button
        onClick={() => handleSubmit()}
            type="submit"
            className={`px-6 py-2 text-white rounded-lg shadow-md ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-600"
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                กำลังบันทึก...
              </div>
            ) : (
              "บันทึก"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addworkdate;
