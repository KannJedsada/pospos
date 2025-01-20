import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, X, View, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import Swal from "sweetalert2";

function Position() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = location.state || {};
  const { authData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [pos, setPos] = useState([]);

  const fetchPosition = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/dept/pos/${id}`);
      setPos(res.data.data);
    } catch (error) {
      console.error("Error fetching position data:", error);
      Swal.fire("Error", "Failed to load position data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPosition = () => {
    navigate("/addposition", { state: { id } });
  };

  const handleEditPos = (id) => {
    navigate("/editposition", { state: { id } });
  };

  const handleDeletePos = async (id) => {
    try {
      const pos = await axios.get(`/api/pos/getpos/${id}`);
      const p_name = pos.data.data;
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        text: `ต้องการลบตำแหน่ง ${p_name} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        confirmButtonColor: "#f44336",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/pos/${id}`, {
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

        fetchPosition();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("Deletion cancelled");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาด", "error");
    }
  };

  useEffect(() => {
    if (id) fetchPosition();
  }, [id]);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center gap-2 text-white bg-blue-400 hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:focus:ring-blue-900"
              onClick={() => window.history.back()}
            >
              <ChevronLeft />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-blue-800">
              ตำแหน่ง
            </h1>
          </div>
          <button
            onClick={handleAddPosition}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + เพิ่มตำแหน่ง
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          // Table Container
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="px-4 py-2 border-b text-left">ชื่อตำแหน่ง</th>
                  <th className="px-4 py-2 border-b text-left">เวลาเริ่มงาน</th>
                  <th className="px-4 py-2 border-b text-left">เวลาเลิกงาน</th>
                  <th className="px-4 py-2 border-b text-left">จำนวนคน</th>
                  <th className="px-4 py-2 border-b text-left">การแก้ไข</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {Array.isArray(pos) && pos.length > 0 ? (
                  pos.map((positions) => (
                    <tr
                      key={positions.id}
                      className="transition-all duration-300 bg-white hover:bg-blue-50"
                    >
                      <td className="px-4 py-2 border-b">
                        {positions.p_name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {positions.start_time || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {positions.end_time || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {positions.total_employees || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b flex gap-2">
                        <button
                          onClick={() => handleEditPos(positions.id)}
                          className="px-4 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDeletePos(positions.id)}
                          className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
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
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Position;
