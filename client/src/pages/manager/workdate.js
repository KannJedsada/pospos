import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";

function Workdate() {
  const navigate = useNavigate();
  const { authData } = useContext(AuthContext);
  const [emp, setEmp] = useState([]);
  const [workdate, setWorkdate] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios("/api/ws", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      // const filterDept = res.data.data.filter(
      //   (emp) => emp.dept_id !== 1 && emp.dept_id !== 2
      // );
      const filterDept = res.data.data;
      console.log(filterDept);

      // Process data to group employees by work_date
      const groupedData = filterDept.reduce((acc, emp) => {
        const date = emp.work_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(emp);
        return acc;
      }, {});
      console.log(groupedData);

      setWorkdate(groupedData);
      setEmp(filterDept);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWorkdate = () => {
    navigate("/addworkdate");
  };

  const handleEditWorkdate = () => {
    navigate("/editworkdate");
  };

  return (
    <div className="wrapper min-h-screen bg-gray-100">
      <Menubar />
      <div className="p-3">
        <div className="mb-1 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-800 sm:text-xl md:text-3xl lg:text-4xl">
            ตารางวันทำงาน
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              onClick={() => handleAddWorkdate()}
            >
              เพิ่ม
            </button>
            <button
              className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow-md ml-4 hover:bg-blue-500 transition duration-300"
              onClick={handleEditWorkdate}
            >
              แก้ไข
            </button>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div className="p-4 w-full">
          {Object.keys(workdate).map((date) => (
            <div
              key={date}
              className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-blue-200 "
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                {new Intl.DateTimeFormat("th-TH", { dateStyle: "full" }).format(
                  new Date(date)
                )}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-blue-100 text-blue-700">
                      <th className="px-6 py-3 border-b">ลำดับ</th>
                      <th className="px-6 py-3 border-b">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3 border-b">ตำแหน่ง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workdate[date].map((emp, index) => (
                      <tr key={emp.id_card} className="border-b">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">
                          {emp.f_name} {emp.l_name}
                        </td>
                        <td className="px-6 py-4">{emp.p_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workdate;
