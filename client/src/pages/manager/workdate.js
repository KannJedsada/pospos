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

  const fetchData = async () => {
    try {
      const res = await axios("/ws", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const filterDept = res.data.data.filter(
        (emp) => emp.dept_id !== 1 && emp.dept_id !== 5
      );

      // Process data to group employees by work_date
      const groupedData = filterDept.reduce((acc, emp) => {
        const date = emp.work_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(emp);
        return acc;
      }, {});

      // // Convert groupedData to an array of objects
      // const processedData = Object.keys(groupedData).map((date) => ({
      //   work_date: date,
      //   employees: groupedData[date],
      // }));

      // // Sort processedData by work_date from newest to oldest
      // const sortedData = processedData.sort(
      //   (a, b) => new Date(a.work_date) - new Date(b.work_date)
      // );

      setWorkdate(groupedData);
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWorkdate = () => {
    navigate("/addworkdate");
  };

  const handleEditWorkdate = () => {
    navigate("/editworkdate");
  };

  // Process the workdate data to be displayed
  // const workdateContent = workdate.map((item) => {
  //   const date = new Date(item.work_date);
  //   const formattedDate = new Intl.DateTimeFormat("th-TH", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     weekday: "long",
  //   }).format(date);

  // return (
  //   <div
  //     key={item.work_date}
  //     className="p-4 mb-4 bg-white shadow-md rounded-md"
  //   >
  //     <h1 className="text-xl font-semibold mb-2 text-gray-800">
  //       {formattedDate}
  //     </h1>
  //     {item.employees.map((employee, index) => (
  //       <p key={index} className="text-gray-600 text-xl">
  //         {index + 1}. {employee}
  //       </p>
  //     ))}
  //   </div>
  // );

  return (
    <div className="wrapper min-h-screen bg-gray-100">
      <Menubar />
      <div className="p-6">
        <div className="mb-4 flex justify-between">
          <h1 className="text-3xl font-bold mb-4">Work Schedule Overview</h1>
          <div>
            <button
              className="bg-green-500 text-white p-4 rounded-xl mr-4"
              onClick={() => handleAddWorkdate()}
            >
              Add Work Date
            </button>
            <button
              className="bg-gray-400 text-white p-4 rounded-xl"
              onClick={handleEditWorkdate}
            >
              Edit work date
            </button>
          </div>
        </div>
      </div>
      <div className="container p-4">
        {Object.keys(workdate).map((date) => (
          <div key={date} className="date-section">
            <h2 className="mb-4 text-xl font-bold">
              {new Intl.DateTimeFormat("th-TH", { dateStyle: "full" }).format(
                new Date(date)
              )}
            </h2>
            <div className="flex justify-center">
              <table className="table-fiexd w-5/6 text-left mb-8">
                <thead>
                  <tr>
                    <th className="px-4 py-2">ลำดับ</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {workdate[date].map((emp, index) => (
                    <tr key={emp.id_card}>
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">
                        {emp.f_name} {emp.l_name}
                      </td>
                      <td className="border px-4 py-2">{emp.p_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workdate;
