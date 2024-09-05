import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Editworkdate() {
  const { authData } = useContext(AuthContext);
  const [emp, setEmp] = useState([]);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [selectedDates, setSelectedDates] = useState({});

  const fetchEmp = async () => {
    try {
      const res = await axios.get("/ws/newdate", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const filterDept = res.data.data.filter(
        (emp) => emp.dept_id !== 1 && emp.dept_id !== 5
      );

      // Group employees by date
      const grouped = filterDept.reduce((acc, emp) => {
        const workDate = emp.work_date;
        if (!acc[workDate]) acc[workDate] = [];
        acc[workDate].push(emp);
        return acc;
      }, {});

      setGroupedByDate(grouped);
      setEmp(filterDept);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch data.",
      });
    }
  };

  const minDate = new Date();
  useEffect(() => {
    fetchEmp();
  }, []);

  const handleDateChange = (date, idCard, workDate) => {
    setSelectedDates((prevDates) => ({
      ...prevDates,
      [`${idCard}_${workDate}`]: date,
    }));
  };

  return (
    <div>
      <Menubar />
      <button
        onClick={() => window.history.back()}
        className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-yellow-900 mt-4 ml-4"
      >
        Back
      </button>
      {/* <div className="container p-4">
        {Object.keys(groupedByDate).map((date) => (
            <div key={date} className="date-section">
            <h2 className="mb-4 text-xl font-bold">
              {new Intl.DateTimeFormat("th-TH", { dateStyle: "full" }).format(
                new Date(date)
              )}
            </h2>
            <div className="flex justify-center">
              <table className="table-fixed w-5/6 text-left mb-8">
                <thead>
                  <tr>
                    <th className="px-0.5 py-2">ลำดับ</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Position</th>
                    <th className="px-0.5 py-2">เลือกวันใหม่</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByDate[date].map((emp, index) => (
                    <tr key={emp.id_card}>
                      <td className="border px-0.5 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">
                        {emp.f_name} {emp.l_name}
                      </td>
                      <td className="border px-4 py-2">{emp.p_name}</td>
                      <td className="border px-0.5 py-2">
                        <DatePicker
                          selected={
                            selectedDates[`${emp.id_card}_${date}`] || null
                          }
                          onChange={(date) =>
                            handleDateChange(date, emp.id_card, date)
                          }
                          dateFormat="dd/MM/yyyy"
                          className="p-2 border rounded"
                          minDate={minDate}
                          filterDate={(date) => date > minDate}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}

export default Editworkdate;
