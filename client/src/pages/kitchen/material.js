import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";

function MaterialPage() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [materialsPerPage] = useState(10);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/material", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setMaterials(res.data.data);
      setFilteredMaterials(res.data.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      Swal.fire("Error", "Failed to fetch materials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = () => {
    navigate("/addmaterial");
  };

  const handleEdit = (id) => {
    navigate(`/editmaterial`, { state: { id } });
  };

  const handleDelete = async (id) => {
    try {
      const mat = await axios.get(`/api/material/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const material = mat.data.data;
      const materialName = material[0]?.m_name;
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        text: `ต้องการลบวัตถุดิบ ${materialName} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await axios.delete(`/api/material/delete/${id}`, {
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

        fetchMaterials(); // Refresh materials list
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      Swal.fire("Error", "Failed to delete material", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [authData.token]);

  useEffect(() => {
    const filtered = materials.filter((material) =>
      (material.m_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, materials]);

  // Get current materials for the current page
  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredMaterials.length / materialsPerPage);

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
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">วัตถุดิบ</h1>
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          {/* กล่องค้นหา */}
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* ปุ่มเพิ่มวัตถุดิบ */}
          <button
            onClick={handleAddMaterial}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + เพิ่มวัตถุดิบ
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
                  <th className="px-4 py-3 text-left">ลำดับ</th>
                  <th className="px-4 py-3 text-left">ชื่อ</th>
                  <th className="px-4 py-3 text-left">หน่วย</th>
                  <th className="px-4 py-3 text-left">รูปภาพ</th>
                  <th className="px-4 py-3 text-left">หมวดหมู่</th>
                  <th className="px-4 py-3 text-left">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentMaterials.length > 0 ? (
                  currentMaterials.map((material, index) => (
                    <tr
                      key={material.id}
                      className="hover:bg-blue-50 transition-all duration-300"
                    >
                      <td className="px-4 py-3 border-b">
                        {indexOfFirstMaterial + index + 1}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {material.m_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {material.u_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {material.m_img ? (
                          <img
                            src={`${material.m_img}`}
                            alt={material.m_name || "Material Image"}
                            className="w-12 h-12 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {material.category_name}
                      </td>
                      <td className="py-4 px-3 text-sm  border-b">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-300 transform hover:scale-105 xl:mr-1"
                            onClick={() => handleEdit(material.id)}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-transform duration-300 transform hover:scale-105 xl:ml-1"
                            onClick={() => handleDelete(material.id)}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
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
                      className={`px-4 py-2 rounded-lg ${currentPage === page.value
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
    </div>
  );
}

export default MaterialPage;
