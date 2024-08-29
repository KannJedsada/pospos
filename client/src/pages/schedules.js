import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "../utils/axiosInstance";
import AuthContext from "../components/auth/authcontext";
import QRCode from "qrcode.react";
import socket from "../utils/socket";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countLate, setCountLate] = useState(0);
  const [countAbsent, setCountAbsent] = useState(0);
  const { authData, logout } = useContext(AuthContext);
  const [personalInfo, setPersonalInfo] = useState({});

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`/emp/data/${authData.id_card}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      const workdate = await axios.get(`/emp/workdate/${authData.id_card}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      const countLateResponse = await axios.get(
        `/emp/countlate/${authData.id_card}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );
      const countAbsentResponse = await axios.get(
        `/emp/countabsent/${authData.id_card}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );

      const {
        id_card,
        f_name,
        l_name,
        emp_phone,
        emp_mail,
        p_name,
        dept_name,
        salary,
      } = response.data.data[0];
      setPersonalInfo({
        id_card,
        f_name,
        l_name,
        emp_phone,
        emp_mail,
        p_name,
        dept_name,
        salary,
      });

      const filteredSchedules = workdate.data.data
        .filter((item) => {
          const itemDate = new Date(item.work_date);
          const today = new Date();
          itemDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return itemDate >= today;
        })
        .sort((a, b) => new Date(a.work_date) - new Date(b.work_date))
        .map((item) => {
          const date = new Date(item.work_date);
          return new Intl.DateTimeFormat("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          }).format(date);
        });

      setSchedules(filteredSchedules);
      // แปลงค่าจากสตริงเป็นตัวเลข
      setCountLate(parseInt(countLateResponse.data.data[0].countlate));
      setCountAbsent(parseInt(countAbsentResponse.data.data[0].absent_count));
    } catch (error) {
      setError("Failed to fetch schedules");
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  }, [authData.id_card, authData.token]);

  useEffect(() => {
    fetchSchedules();

    const handleWorkdateUpdate = () => {
      console.log("Work date updated");
      fetchSchedules();
    };

    socket.on("workdateUpdated", handleWorkdateUpdate);

    return () => {
      socket.off("workdateUpdated", handleWorkdateUpdate);
    };
  }, [fetchSchedules]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <div className="mb-6">
        <p>
          <strong>ID Card:</strong> {personalInfo.id_card}
        </p>
        <p>
          <strong>First Name:</strong> {personalInfo.f_name}
        </p>
        <p>
          <strong>Last Name:</strong> {personalInfo.l_name}
        </p>
        <p>
          <strong>Phone:</strong> {personalInfo.emp_phone}
        </p>
        <p>
          <strong>Email:</strong> {personalInfo.emp_mail}
        </p>
        <p>
          <strong>Position:</strong> {personalInfo.p_name}
        </p>
        <p>
          <strong>Department:</strong> {personalInfo.dept_name}
        </p>
        <p>
          <strong>Salary:</strong> {personalInfo.salary}
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-4">QR Code สำหรับลงเวลางาน</h2>
      <div className="flex items-center justify-center">
        <QRCode value={authData.id_card} size={150} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Schedules</h2>
      <div className="mb-3">
        <p>
          <strong>ขาดงาน:</strong> {countAbsent} ครั้ง
        </p>
        <p>
          <strong>สาย:</strong> {countLate} ครั้ง
        </p>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.map((schedule, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {schedule || "No schedule available"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Schedules;
