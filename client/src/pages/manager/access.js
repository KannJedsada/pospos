import React, { useEffect, useState, useContext } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Access() {
  const { authData } = useContext(AuthContext);
  const [emp, setEmp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/emp", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setEmp(res.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error", "Failed to fetch employee data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = async (id_card, newAccess) => {
    try {
      const res = await axios.put(`/api/emp/permission/${id_card}`, {
        newAccess: newAccess,
      });

      if (res.status === 200) {
        Swal.fire("สำเร็จ", "ปรับสิทธิ์เรียบร้อยแล้ว", "success");
        fetchData();
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      Swal.fire("Error", "ไม่สามารถปรับสิทธิ์ได้", "error");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [empPerPage] = useState(10);

  const indexOfLastEmp = currentPage * empPerPage;
  const indexOfFirstEmp = indexOfLastEmp - empPerPage;
  const currentEmps = Array.isArray(emp)
    ? emp.slice(indexOfFirstEmp, indexOfLastEmp)
    : [];
  const totalPages = Math.ceil((emp?.length || 0) / empPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const generatePaginationButtons = (currentPage, totalPages, isMobile) => {
    const maxButtons = isMobile ? 3 : 6; // จำนวนปุ่มสูงสุดที่แสดง
    const buttons = [];

    const addButton = (value) => {
      if (!buttons.includes(value)) {
        buttons.push(value);
      }
    };

    if (totalPages <= maxButtons) {
      // กรณีที่จำนวนหน้าทั้งหมดน้อยกว่าหรือเท่ากับจำนวนปุ่มสูงสุด
      for (let i = 1; i <= totalPages; i++) {
        addButton(i);
      }
    } else if (isMobile) {
      // กรณีสำหรับมือถือ (isMobile = true)
      addButton(1);
      if (currentPage > 2) {
        addButton("...");
      }
      if (currentPage > 1 && currentPage < totalPages) {
        addButton(currentPage); // หน้าปัจจุบัน
      }
      if (currentPage < totalPages - 1) {
        addButton(" ..."); // จุดไข่ปลา
      }
      addButton(totalPages); // หน้าสุดท้าย
    } else {
      // กรณีสำหรับเดสก์ท็อป (isMobile = false)
      const half = Math.floor(maxButtons / 2);

      if (currentPage <= half + 1) {
        // กรณีที่อยู่ในหน้าแรก ๆ
        for (let i = 1; i <= maxButtons - 1; i++) {
          addButton(i);
        }
        addButton("...");
        addButton(totalPages);
      } else if (currentPage >= totalPages - half) {
        // กรณีที่อยู่ในหน้าท้าย ๆ
        addButton(1);
        addButton("...");
        for (let i = totalPages - (maxButtons - 3); i <= totalPages; i++) {
          addButton(i);
        }
      } else {
        // กรณีที่อยู่ในหน้ากลาง
        addButton(1);
        addButton("...");
        const start = Math.max(
          2,
          currentPage - Math.floor((maxButtons - 4) / 2)
        ); // เริ่มต้นที่หน้า 2
        const end = Math.min(
          totalPages - 1,
          currentPage + Math.floor((maxButtons - 4) / 2)
        ); // สิ้นสุดที่หน้าก่อนหน้าสุดท้าย

        for (let i = start; i <= end; i++) {
          addButton(i);
        }

        addButton("...");
        addButton(totalPages);
      }
    }

    return buttons.map((button, index) => ({
      value: button,
      key: typeof button === "string" ? `ellipsis-${index}` : `page-${button}`,
    }));
  };

  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Menubar />
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div div className="container mx-auto p-4 bg-white ">
          <h2 className="text-3xl font-semibold text-blue-700 mb-4">
            กำหนดสิทธิ์ในการเข้าถึง
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-blue-100">
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="py-3 px-6 text-left">รหัสประจำตัว</th>
                  <th className="py-3 px-6 text-left">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-6 text-left">แผนก</th>
                  <th className="py-3 px-6 text-left">ตำแหน่ง</th>
                  <th className="py-3 px-6 text-left">สิทธิ์ในการเข้าถึง</th>
                </tr>
              </thead>
              <tbody>
                {emp.length > 0 ? (
                  emp.map((employee) => (
                    <tr
                      key={employee.id_card}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-6 text-sm">{employee.id_card}</td>
                      <td className="py-3 px-6 text-sm">
                        {employee.f_name} {employee.l_name}
                      </td>
                      <td className="py-3 px-6 text-sm">
                        {employee.dept_name || "N/A"}
                      </td>
                      <td className="py-3 px-6 text-sm">
                        {employee.p_name || "N/A"}
                      </td>
                      <td className="py-3 px-6 text-sm flex flex-col sm:flex-row">
                        <select
                          className="border border-gray-300 rounded px-2 py-1"
                          value={employee.access || ""} // ค่าเริ่มต้นคือสิทธิ์ของพนักงาน
                          onChange={(e) =>
                            handlePermissionChange(
                              employee.id_card,
                              e.target.value
                            )
                          }
                        >
                          <option value="">เลือกสิทธิ์</option>
                          <option value="1">เจ้าของร้าน</option>
                          <option value="2">ผู้จัดการ</option>
                          <option value="3">พนักงานครัว</option>
                          <option value="4">แคชเชียร์</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-3 px-6 text-center text-sm text-gray-600"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center mt-6">
            {/* ปุ่มย้อนกลับ */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft />
            </button>

            {/* ปุ่มเลขหน้า */}
            <div className="mx-4 flex space-x-1">
              {generatePaginationButtons(currentPage, totalPages, isMobile).map(
                (page, index) =>
                  page === "..." ? (
                    <span key={index} className="px-4 py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page.key}
                      onClick={() => paginate(page.value)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page.value
                          ? "bg-blue-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      disabled={page.value === "..."}
                    >
                      {page.value}
                    </button>
                  )
              )}
            </div>

            {/* ปุ่มไปข้างหน้า */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Access;
