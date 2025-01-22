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
  const [qrcodeValue, setQrcodeValue] = useState(null);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [qrCodeTimer, setQrCodeTimer] = useState(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`/api/emp/data/${authData.id_card}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      const workdate = await axios.get(
        `/api/emp/workdate/${authData.id_card}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );

      const countLateResponse = await axios.get(
        `/api/emp/countlate/${authData.id_card}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );

      const countAbsentResponse = await axios.get(
        `/api/emp/countabsent/${authData.id_card}`,
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
        start_time,
      } = response.data.data[0];
      setPersonalInfo({
        id_card,
        f_name,
        l_name,
        emp_phone,
        emp_mail,
        p_name,
        dept_name,
        start_time,
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
      setQrcodeValue(authData.id_card);
      setSchedules(filteredSchedules);
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
    <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <h2 className="text-4xl font-extrabold mb-8 text-blue-700 text-center">
          ข้อมูลส่วนตัว
        </h2>
        <div className="mb-8 bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">รหัสประจำตัว:</span>{" "}
              {personalInfo.id_card}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">ชื่อ:</span>{" "}
              {personalInfo.f_name}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">นามสกุล:</span>{" "}
              {personalInfo.l_name}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">
                เบอร์โทรศัพท์:
              </span>{" "}
              {personalInfo.emp_phone}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">อีเมล:</span>{" "}
              {personalInfo.emp_mail}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">ตำแหน่ง:</span>{" "}
              {personalInfo.p_name || "-"}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">แผนก:</span>{" "}
              {personalInfo.dept_name || "-"}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">เวลาเริ่มงาน:</span>{" "}
              {personalInfo.start_time || "-"}
            </p>
          </div>
        </div>
        {authData.id_card && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">
              QR Code สำหรับลงเวลางาน
            </h2>
            <div className="flex items-center justify-center mb-6">
              {qrcodeValue ? (
                <QRCode value={qrcodeValue} size={160} />
              ) : (
                <p className="text-red-500 text-lg">
                  {isQrExpired ? "QR Code หมดอายุแล้ว" : "ไม่มี QR Code"}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">ตารางเวลา</h2>
          <div className="mb-6 bg-white rounded-xl shadow-lg p-8">
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">ขาดงาน:</span>{" "}
              {countAbsent} ครั้ง
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-blue-700">สาย:</span>{" "}
              {countLate} ครั้ง
            </p>
          </div>
          <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wide">
                  วันที่ทำงาน
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <tr key={index} className="odd:bg-blue-100 even:bg-blue-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {schedule}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="1"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    ไม่มีข้อมูลตารางเวลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={logout}
          className="mt-8 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Schedules;
