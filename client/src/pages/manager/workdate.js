import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";

function Workdate() {
  const { authData } = useContext(AuthContext);
  const [workdate, setWorkdate] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios("/ws");
      const data = res.data.data;

      // Process data to group employees by work_date
      const groupedData = data.reduce((acc, curr) => {
        const date = curr.work_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(`${curr.f_name} ${curr.l_name}`);
        return acc;
      }, {});

      // Convert groupedData to an array of objects
      const processedData = Object.keys(groupedData).map((date) => ({
        work_date: date,
        employees: groupedData[date],
      }));

      setWorkdate(processedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process the workdate data to be displayed
  const workdateContent = workdate.map((item) => {
    const date = new Date(item.work_date);
    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);

    return (
      <div
        key={item.work_date}
        className="p-4 mb-4 bg-white shadow-md rounded-md"
      >
        <h1 className="text-xl font-semibold mb-2 text-gray-800">
          {formattedDate}
        </h1>
        {item.employees.map((employee, index) => (
          <p key={index} className="text-gray-600 text-xl">
            {index+1}. {employee}
          </p>
        ))}
      </div>
    );
  });

  return (
    <div className="wrapper min-h-screen bg-gray-100">
      <Menubar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Work Schedule Overview</h1>
        {workdateContent}
      </div>
    </div>
  );
}

export default Workdate;
