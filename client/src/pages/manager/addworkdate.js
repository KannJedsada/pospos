import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";

const Addworkdate = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const { authData } = useContext(AuthContext);

  const fetchEmp = async () => {
    try {
      const res = await axios.get("/emp", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const filterDept = res.data.data.filter(
        (emp) => emp.dept_id !== 1 && emp.dept_id !== 5
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

  const handleEmployeeSelect = (id_card) => {
    setSelectedEmployees((prevSelected) => {
      if (prevSelected.includes(id_card)) {
        return prevSelected.filter((id) => id !== id_card);
      } else {
        return [...prevSelected, id_card];
      }
    });
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
      for (const id_card of selectedEmployees) {
        await axios.post(
          "/ws/add",
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
      if (error.message.includes("Workdate already assigned")) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to assign work dates.",
        });
      }
    }
  };

  const minDate = new Date();

  useEffect(() => {
    fetchEmp();
  }, []);

  return (
    <div>
      <Menubar />
      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-yellow-900 mr-4"
          >
            Back
          </button>
          <h1 className="text-xl font-bold">กำหนดวันทำงานพนักงาน</h1>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">เลือกวันที่:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="border border-gray-300 p-2 rounded"
            minDate={minDate}
            filterDate={(date) => date > minDate}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">เลือกพนักงาน:</label>
          <ul>
            {data.map((employee) => (
              <li key={employee.id_card}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value={employee.id_card}
                    checked={selectedEmployees.includes(employee.id_card)}
                    onChange={() => handleEmployeeSelect(employee.id_card)}
                    className="mr-2"
                  />
                  {employee.f_name} {employee.l_name} {employee.p_name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          บันทึกวันทำงาน
        </button>
      </div>
    </div>
  );
};

export default Addworkdate;
