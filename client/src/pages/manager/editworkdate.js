import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft } from "lucide-react";

function Editworkdate() {
  const { authData } = useContext(AuthContext);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลพนักงานและจัดกลุ่มตามวันที่
  const fetchEmp = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/ws/newdate", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const filterDept = res.data.data.filter(
        (emp) => emp.dept_id !== 1 && emp.dept_id !== 5
      );

      const grouped = filterDept.reduce((acc, emp) => {
        const workDate = emp.work_date;
        if (!acc[workDate]) acc[workDate] = [];
        acc[workDate].push(emp);
        return acc;
      }, {});

      setGroupedByDate(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลได้.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmp();
  }, []);

  const handleDateChange = (id, date, workDate) => {
    setSelectedDates((prevDates) => ({
      ...prevDates,
      [`${id}_${workDate}`]: {
        id: id,
        work_date: workDate,
        date: date,
      },
    }));
  };

  const handleDelete = async (id) => {
    // แสดงการยืนยันก่อนลบ
    const result = await Swal.fire({
      title: "คุณต้องการลบหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      confirmButtonColor: "#E90000",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true, // ปรับการแสดงปุ่มยืนยันกับยกเลิก
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const res = await axios.delete(`/api/ws/delete_workdate/${id}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ!",
        });
        fetchEmp();
      } catch (error) {
        console.error("Error Delete it:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบได้.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updates = Object.entries(selectedDates).map(([key, newData]) => {
        const [id] = key.split("_");
        const formattedDate = formatDate(new Date(newData.date));
        return { id: id, date: formattedDate };
      });

      // เปิดใช้งานการส่งคำขอ PUT เมื่อพร้อมใช้งาน
      const res = await axios.put(
        `/api/ws/edit_workdate`,
        { updates },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อัพเดตวันที่ทำงานเรียบร้อยแล้ว!",
      });

      fetchEmp();
      setSelectedDates({});
    } catch (error) {
      console.error("Error saving changes:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกการเปลี่ยนแปลงได้.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const minDate = new Date();

  return (
    <div className="wrapper min-h-screen bg-gray-100">
      <Menubar />
      <div className="p-3">
        <button
          onClick={() => window.history.back()}
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-blue-900 mt-4 ml-4"
        >
          <ChevronLeft />
        </button>
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
          แก้ไขวันที่ทำงาน
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div>
            {Object.keys(groupedByDate).map((workDate) => (
              <div
                key={workDate}
                className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-blue-200"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                  {new Intl.DateTimeFormat("th-TH", {
                    dateStyle: "full",
                  }).format(new Date(workDate))}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-100 text-blue-700">
                        <th className="border px-4 py-2">ลำดับ</th>
                        <th className="border px-4 py-2">ชื่อ-นามสกุล</th>
                        <th className="border px-4 py-2">ตำแหน่ง</th>
                        <th className="border px-4 py-2">แก้ไขวันที่</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByDate[workDate].map((emp, index) => (
                        <tr key={emp.id} className="border-b">
                          <td className=" px-4 py-2">{index + 1}</td>
                          <td className=" px-4 py-2">
                            {emp.f_name} {emp.l_name}
                          </td>
                          <td className=" px-4 py-2">{emp.p_name}</td>
                          <td className="px-4 py-2">
                            <DatePicker
                              selected={
                                selectedDates[`${emp.id}_${workDate}`]
                                  ? new Date(
                                    selectedDates[
                                      `${emp.id}_${workDate}`
                                    ].date
                                  )
                                  : new Date(workDate)
                              }
                              onChange={(date) =>
                                handleDateChange(emp.id, date, workDate)
                              }
                              dateFormat="dd/MM/yyyy"
                              minDate={new Date()}
                              filterDate={(date) => date > minDate}
                              className="w-full border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="ml-2 mt-2 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        {Object.keys(groupedByDate).length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleSaveChanges}
              disabled={isSaving || Object.keys(groupedByDate).length === 0}
              className={`${isSaving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                } text-white px-6 py-3 rounded-lg shadow-lg transition duration-300`}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Editworkdate;
