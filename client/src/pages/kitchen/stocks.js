import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Stocks() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [category, setCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]); // แก้ไขชื่อจาก filteredStcoks
  const [selectedCategory, setSelectedCategory] = useState(""); // แก้ไขจาก selectCategory
  const [currentPage, setCurrentPage] = useState(1);
  const [stockPerPage] = useState(10);

  const fetchStock = async (cat_id = "") => {
    try {
      let res;
      if (cat_id) {
        res = await axios.get(`/api/stock/stockbycat/${cat_id}`);
      } else {
        res = await axios.get(`/api/stock/stocks`);
      }
      // console.log(res.data.data);
      setStocks(res.data.data);
      setFilteredStocks(res.data.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      Swal.fire("Error", "Failed to fetch stocks", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/stock/category");
      // console.log(res.data.data);
      setCategory(res.data.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      Swal.fire("Error", "Failed to fetch stocks", "error");
    }
  };

  const handleNewstock = () => {
    navigate("/addstock");
  };

  const handleEdit = (id) => {
    navigate(`/editminstock`, { state: { id } });
  };

  useEffect(() => {
    fetchStock();
    fetchCategories();

    const handleOrderUpdate = (updatedOrder) => {
      // console.log("Received order update:", updatedOrder);
      fetchStock(); // อัปเดตคำสั่งซื้อ
    };

    socket.on("orderUpdated", handleOrderUpdate);

    // ล้าง Event Listener เมื่อ Component ถูก Unmount
    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  }, []);

  useEffect(() => {
    fetchStock(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const filtered = stocks.filter((stock) =>
      (stock.m_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStocks(filtered); // แก้ไขจาก setFilteredStcoks
    setCurrentPage(1);
  }, [searchTerm, stocks]);

  const indexOfLastStock = currentPage * stockPerPage;
  const indexOfFirstStock = indexOfLastStock - stockPerPage;
  const currentStocks = filteredStocks.slice(
    indexOfFirstStock,
    indexOfLastStock
  );

  const totalPages = Math.ceil(filteredStocks.length / stockPerPage);

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

  const isMobile = window.innerWidth < 640; // Mobile ถ้ากว้างน้อยกว่า 640px
  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6">
          คลังวัตถุดิบ
        </h1>
        
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          {/* กลุ่มค้นหา */}
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">หมวดหมู่</option>
              {category.length > 0 &&
                category.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
            </select>
          </div>

          {/* ปุ่มเพิ่มสต๊อก */}
          <button
            onClick={handleNewstock}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + เพิ่มสต๊อก
          </button>
        </div>

        <div className="overflow-y-auto rounded-lg shadow-lg">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                <th className="px-4 py-3 border-b text-left">ลำดับ</th>
                <th className="px-4 py-3 border-b text-left">ชื่อวัตถุดิบ</th>
                <th className="px-4 py-3 border-b text-left">จำนวน</th>
                <th className="px-4 py-3 border-b text-left">
                  จำนวนที่น้อยที่สุด
                </th>
                <th className="px-4 py-3 border-b text-left">หน่วย</th>
                <th className="px-4 py-3 border-b text-left">หมวดหมู่</th>
                <th className="px-4 py-3 border-b text-left">ราคา / หน่วย</th>
                <th className="px-4 py-3 border-b text-left">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredStocks.length > 0 ? (
                currentStocks.map((stock, index) => (
                  <tr
                    key={stock.material_id}
                    className={`transition-all duration-300 ${
                      Number(stock.qty) < Number(stock.min_qty)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : Number(stock.qty) - Number(stock.min_qty) <= 2
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-white hover:bg-blue-50"
                    }`}
                  >
                    <td className="px-4 py-3 border-b">
                      {indexOfFirstStock + index + 1}
                    </td>
                    <td className="px-4 py-3 border-b">{stock.m_name}</td>
                    <td className="px-4 py-3 border-b">{stock.qty}</td>
                    <td className="px-4 py-3 border-b">{stock.min_qty}</td>
                    <td className="px-4 py-3 border-b">{stock.u_name}</td>
                    <td className="px-4 py-3 border-b">
                      {stock.category_name}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {stock.price || "0.00"}
                    </td>
                    <td className="px-4 py-3 border-b">
                      <button
                        className=" hover:underline"
                        onClick={() => handleEdit(stock.material_id)}
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-4 text-gray-700">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

{currentPage > 1 && (
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
      )}     
      </div>
    </div>
  );
}

export default Stocks;
