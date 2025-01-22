import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { useNavigate } from "react-router-dom";
import { Pencil, X, View } from "lucide-react";
import Swal from "sweetalert2";

function DeptManagement() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [depts, setDept] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentDept, setCurrentDept] = useState(null); // สำหรับแก้ไข
  const [formData, setFormData] = useState({ dept_name: "" });

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/dept", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setDept(res.data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      Swal.fire("Error", "Failed to fetch departments", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPosition = (id) => {
    navigate("/position", { state: { id } });
  };

  const handleAddDept = () => {
    setFormData({ dept_name: "" });
    setOpenAdd(true);
  };

  const handleEdit = (dept) => {
    setCurrentDept(dept);
    setFormData({ dept_name: dept.dept_name });
    setOpenEdit(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitAdd = async () => {
    try {
      await axios.post("/api/dept", formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      Swal.fire("Success", "เพิ่มแผนกสำเร็จ", "success");
      setOpenAdd(false);
      fetchDepartments();
    } catch (error) {
      Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่มแผนก", "error");
    }
  };

  const handleSubmitEdit = async () => {
    try {
      await axios.put(`/api/dept/edit/${currentDept.id}`, formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      Swal.fire("Success", "แก้ไขแผนกสำเร็จ", "success");
      setOpenEdit(false);
      fetchDepartments();
    } catch (error) {
      Swal.fire("Error", "เกิดข้อผิดพลาดในการแก้ไขแผนก", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const deptRes = await axios.get(`/api/dept/${id}`);
      const dept_name = deptRes.data.data.dept_name;
      console.log(dept_name);
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        text: `ต้องการลบวัตถุดิบ ${dept_name} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/dept/delete/${id}`, {
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

        fetchDepartments();
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการลบแผนก", "error");
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-700">แผนก</h2>
          <button
            onClick={handleAddDept}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 sm:mt-0"
          >
            + เพิ่มแผนก
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-y-auto rounded-lg shadow-lg">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="px-4 py-3 text-center">ชื่อแผนก</th>
                  <th className="px-4 py-3 text-center">การแก้ไข</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {Array.isArray(depts) && depts.length > 0 ? (
                  depts.map((dept) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-blue-50 transition-all duration-300"
                    >
                      <td className="px-4 py-3 border-b">
                        {dept.dept_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center border-b">
                        <button
                          onClick={() => handleViewPosition(dept.id)}
                          className="px-4 py-1 rounded-lg text-white bg-blue-400 hover:bg-blue-500"
                        >
                          <View />
                        </button>
                        <button
                          onClick={() => handleEdit(dept)}
                          className={`px-4 py-1 rounded-lg text-white  ${
                            dept.dept_id === 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white ml-2`}
                          disabled={dept.dept_id === 1}
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className={`px-4 py-1 rounded-lg text-white ${
                            dept.id === 1 ||
                            dept.id === 2
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white ml-2`}
                          disabled={
                            dept.id === 1 || dept.id === 2
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
                      colSpan="6"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {openAdd && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
              <h3 className="text-xl font-bold text-blue-700 mb-4">
                เพิ่มแผนก
              </h3>
              <input
                type="text"
                name="dept_name"
                value={formData.dept_name}
                onChange={handleFormChange}
                placeholder="ชื่อแผนก"
                className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpenAdd(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitAdd}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal สำหรับแก้ไข */}
        {openEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
              <h3 className="text-xl font-bold text-blue-700 mb-4">แก้ไขแผนก</h3>
              <input
                type="text"
                name="dept_name"
                value={formData.dept_name}
                onChange={handleFormChange}
                placeholder="ชื่อแผนก"
                className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpenEdit(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeptManagement;
