import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import { View, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";

function StockDetail() {
  const [isLoading, setIsLoading] = useState(false);
  const [stockAt, setStockAt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentStock, setCurrentStock] = useState([]);
  const [menusPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockDetail, setStockDetail] = useState([]);
  const [total, setTotal] = useState({
    price: "",
    qty: "",
  });

  // ฟังก์ชันสำหรับดึงข้อมูล
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/stock/get-stock`);
      setStockAt(res.data.data);
      setCurrentStock(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStockDetail([]);
  };

  const handleViewDetail = async (id, price, qty) => {
    const res = await axios.get(`/api/stock/get-stock-detail/${id}`);
    setStockDetail(res.data.data);
    setTotal({
      price: price,
      qty: qty,
    });
    openModal();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // คำนวณรายการปัจจุบัน
  const indexOfLastMaterial = currentPage * menusPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - menusPerPage;
  const currentMaterials = currentStock.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(currentStock.length / menusPerPage);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const isMobile = window.innerWidth < 640;

  // ฟังก์ชันสร้างปุ่มสำหรับเปลี่ยนหน้า
  const generatePaginationButtons = (currentPage, totalPages, isMobile) => {
    const maxButtons = isMobile ? 3 : 6;
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
  const handleClearDate = () => {
    setSelectedDate(null); // รีเซ็ตวันที่ที่เลือก
    setCurrentStock(stockAt);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date) => {
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
    filterDate(formattedDate);
  };

  const filterDate = (date) => {
    const filteredStock = stockAt.filter((stock) => {
      const stockDate = new Date(stock.timestamps).toISOString().split("T")[0];
      return stockDate === date;
    });
    setCurrentStock(filteredStock);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-4 sm:mb-0">
            รายละเอียดการสต๊อก
          </h1>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full sm:w-auto border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholderText="เลือกวันที่"
            />
            <button
              onClick={handleClearDate}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
            >
              เคลียร์
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto rounded-lg shadow-lg7">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="px-4 py-2 border-b text-left">ลำดับ</th>
                  <th className="px-4 py-2 border-b text-left">
                    วันเวลาการสต๊อก
                  </th>
                  <th className="px-4 py-2 border-b text-left">จำนวน</th>
                  <th className="px-4 py-2 border-b text-left">
                    ราคารวม (บาท)
                  </th>
                  <th className="px-4 py-2 border-b text-left">ดู</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentMaterials.length > 0 ? (
                  currentMaterials.map((stock, index) => (
                    <tr
                      key={stock.id}
                      className="transition-all duration-300 bg-white hover:bg-blue-50"
                    >
                      <td className="px-4 py-2 border-b text-center h-full">
                        {indexOfFirstMaterial + index + 1}
                      </td>

                      <td className="px-4 py-2 border-b truncate h-full">
                        {stock.timestamps
                          ? new Intl.DateTimeFormat("th-TH", {
                              year: "numeric",
                              month:
                                window.innerWidth > 640 ? "long" : "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }).format(new Date(stock.timestamps))
                          : "N/A"}
                      </td>

                      <td className="px-4 py-2 border-b text-center h-full">
                        {stock.total_qty || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        {stock.total_price || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b h-full">
                        <button
                          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                          onClick={() =>
                            handleViewDetail(
                              stock.id,
                              stock.total_price,
                              stock.total_qty
                            )
                          }
                        >
                          <View />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl w-full h-auto">
              <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
                รายละเอียดการสต๊อก
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg shadow-md mb-4 h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-y-auto scrollbar-hide">
                {stockDetail.length > 0 ? (
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr className="bg-blue-100 text-blue-700">
                        <th className="px-4 py-2 border-b text-left">
                          ชื่อสินค้า
                        </th>
                        <th className="px-4 py-2 border-b text-left">จำนวน</th>
                        <th className="px-4 py-2 border-b text-left">หน่วย</th>
                        <th className="px-4 py-2 border-b text-left">ราคา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockDetail.map((detail, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 transition"
                        >
                          <td className="px-4 py-2 border-b">
                            {detail.m_name}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {detail.qty}
                          </td>
                          <td className="px-4 py-2 border-b text-center">
                            {detail.u_name}
                          </td>
                          <td className="px-4 py-2 border-b text-right">
                            {detail.price} บาท
                          </td>
                        </tr>
                      ))}
                      {/* แถวสำหรับแสดง Total */}
                      <tr className="bg-gray-200 font-bold">
                        <td className="px-4 py-2 text-right">รวม</td>
                        <td className="px-4 py-2 text-center">{total.qty}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-right">
                          {total.price} บาท
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-600 text-center">ไม่มีข้อมูล</p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeModal}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-300 ease-in-out"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
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

export default StockDetail;
