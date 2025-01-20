import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { useNavigate } from "react-router-dom";
import { Pencil, X, View, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";
import Modal from "react-modal";
const EmpManagement = () => {
  const { authData } = useContext(AuthContext);
  const [employees, setEmployees] = useState({ data: [] });
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState({ data: [] });
  const [positions, setPositions] = useState({ data: [] });
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emp, setEmp] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPerPage] = useState(10);
  // fetch data emp
  const fetchEmployees = async (deptId = "", positionId = "") => {
    try {
      let response;
      if (deptId && positionId) {
        response = await axios.get(
          `/api/emp/dept/${deptId}/position/${positionId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          }
        );
      } else if (deptId) {
        response = await axios.get(`/api/emp/dept/${deptId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else if (positionId) {
        response = await axios.get(`/api/emp/position/${positionId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else {
        response = await axios.get("/api/emp", {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      }
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error", "Failed to fetch employee data", "error");
    }
  };

  // fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/api/dept", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      Swal.fire("Error", "Failed to fetch departments", "error");
    }
  };

  // fetch position
  const fetchPositions = async () => {
    try {
      const response = await axios.get("/api/pos", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      Swal.fire("Error", "Failed to fetch positions", "error");
    }
  };

  // edit button
  const handleEdit = (id_card) => {
    navigate("/editemp", { state: { id_card } });
  };

  // delete button
  const handleDelete = async (id_card) => {
    try {
      const res = await axios.get(`/api/emp/${id_card}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const emp_name = res.data.data;
      Swal.fire({
        icon: "warning",
        title: "ต้องการลบหรือไม่?",
        text: `${emp_name.f_name + " " + emp_name.l_name}`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await axios.delete(`/api/emp/${id_card}`, {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          });
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            showConfirmButton: false,
            timer: 1000,
          });

          fetchEmployees();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("Deletion cancelled");
        }
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  // add new emp
  const handleAdd = () => {
    navigate("/addemp");
  };

  const openModal = async (id_card) => {
    const res = await axios.get(`/api/emp/${id_card}`, {
      headers: {
        Authorization: `Bearer ${authData.token}`,
      },
    });
    setEmp(res.data.data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEmp([]);
    setIsModalOpen(false);
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      fetchDepartments();
      fetchPositions();
      fetchEmployees(selectedDept, selectedPosition);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, selectedPosition, authData.token]);

  // filter name emp
  useEffect(() => {
    if (!Array.isArray(employees?.data)) {
      setFilteredEmployees([]); // ตั้งค่าเริ่มต้นเป็น array ว่าง
      return;
    }

    let filtered = employees.data;

    if (searchTerm) {
      filtered = filtered.filter((employee) =>
        (employee.f_name + " " + employee.l_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered); // กำหนดค่าที่ผ่านการกรอง
  }, [searchTerm, employees]);

  const indexOfLastEmp = currentPage * materialsPerPage;
  const indexOfFirstEmp = indexOfLastEmp - materialsPerPage;
  const currentEmps = Array.isArray(filteredEmployees)
    ? filteredEmployees.slice(indexOfFirstEmp, indexOfLastEmp)
    : [];
  const totalPages = Math.ceil(
    (filteredEmployees?.length || 0) / materialsPerPage
  );

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

  return (
    <div className="wrapper">
      <Menubar />
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div className="container mx-auto p-4 bg-white ">
          <h2 className="text-3xl font-semibold text-blue-700 mb-4">
            การจัดการพนักงาน
          </h2>

          {/* Search and Filter Section */}
          <div className="flex flex-wrap justify-between mb-2">
            <div className="flex items-center space-x-4 mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ"
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="">เลือกแผนก</option>
                {departments.data.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="">เลือกตำแหน่ง</option>
                {positions.data.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.p_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => handleAdd()}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                เพิ่มข้อมูลพนักงาน
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-blue-100">
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="py-3 px-6 text-left">รหัสประจำตัว</th>
                  <th className="py-3 px-6 text-left">ชื่อ-นามสกุล</th>
                  <th className="py-3 px-6 text-left">แผนก</th>
                  <th className="py-3 px-6 text-left">ตำแหน่ง</th>
                  <th className="py-3 px-6 text-left">การแก้ไข</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  currentEmps.map((employee) => (
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
                        <button
                          onClick={() => openModal(employee.id_card)}
                          className={`px-4 py-1 rounded-lg text-white ${
                            employee.dept_id === 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-400 hover:bg-blue-500"
                          }`}
                          disabled={employee.dept_id === 1}
                        >
                          <View />
                        </button>
                        <button
                          onClick={() => handleEdit(employee.id_card)}
                          className={`px-4 py-1 rounded-lg mt-2 sm:mt-0 sm:ml-2 text-white ${
                            employee.dept_id === 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-700 hover:bg-blue-800"
                          }`}
                          disabled={employee.dept_id === 1}
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id_card)}
                          className={`px-4 py-1 rounded-lg mt-2 sm:mt-0 sm:ml-2 text-white ${
                            employee.dept_id === 1 ||
                            employee.id_card === authData.id_card
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                          disabled={
                            employee.dept_id === 1 ||
                            employee.id_card === authData.id_card
                          }
                        >
                          <X />
                        </button>
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

          {/* Pagination */}
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

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            ariaHideApp={false}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 max-h-4/5 overflow-auto space-y-6">
              {/* Header */}
              <h3 className="text-2xl font-semibold text-blue-700 border-b pb-2">
                ข้อมูลส่วนตัว
              </h3>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-500 font-medium">
                    ชื่อ-นามสกุล:
                  </label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.f_name} {emp.l_name}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">
                    รหัสประจำตัวประชาชน:
                  </label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.id_card}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">อีเมล:</label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.emp_mail}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">
                    เบอร์โทรศัพท์:
                  </label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.emp_phone}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">แผนก:</label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.dept_name}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 font-medium">ตำแหน่ง:</label>
                  <p className="text-lg text-gray-700 font-semibold">
                    {emp.p_name}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-gray-500 font-medium">ที่อยู่:</label>
                <p className="text-lg text-gray-700 font-semibold">
                  {emp.house_number} {emp.road || ""} {emp.province}{" "}
                  {emp.district} {emp.subdistrict} {emp.zipcode}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-blue-700 text-white px-5 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  ปิด
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default EmpManagement;
