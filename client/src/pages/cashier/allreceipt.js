import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import { X, View, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import PrintReceipt from "../../components/printReceipt";

function Allreceipt() {
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState([]);
  const [receiptDetail, setReceiptDetail] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(null);
  const [receiptbyid, setReceiptbyid] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/receipt/get-receipts`);
      setReceipt(res.data.data);
      setCurrentReceipt(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setCurrentReceipt(receipt);
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
    const filteredReceipt = receipt.filter((rept) => {
      const reptDate = new Date(rept.created_at).toISOString().split("T")[0];
      return reptDate === date;
    });
    setCurrentReceipt(filteredReceipt);
  };

  const handleViewDetail = async (id) => {
    const resdetail = await axios.get(`/api/receipt/get-rept-detail/${id}`);
    const res = await axios.get(`/api/receipt/get-rept-id/${id}`);
    setReceiptbyid(res.data.data);
    setReceiptDetail(resdetail.data.data);
    setShowReceipt(true);
  };

  const groupedOrders = (receiptDetail || []).reduce((acc, curr) => {
    if (!curr.menu_id || !curr.id) {
      console.warn("Missing data in order:", curr);
      return acc;
    }

    let total_price = curr.price; // Initialize total_price with the current price

    const existingItem = acc.find((item) => item.menu_id === curr.menu_id);

    if (existingItem) {
      existingItem.qty += curr.qty;
      existingItem.price += curr.price; // Update price for the existing item
    } else {
      acc.push({
        ...curr,
        total_price,
      });
    }
    return acc;
  }, []);

  const indexOfLastreceipt = currentPage * receiptPerPage;
  const indexOfFirstreceipt = indexOfLastreceipt - receiptPerPage;
  const currentrept = currentReceipt.slice(
    indexOfFirstreceipt,
    indexOfLastreceipt
  );

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(currentReceipt.length / receiptPerPage);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const isMobile = window.innerWidth < 640;

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

  // การเรียกใช้งาน

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        text: `ต้องการลบใบเสร็จนี้หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/receipt/delete-rept/${id}`);

        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });

        fetchData();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      Swal.fire("Error", "Failed to delete receipt", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-4 sm:mb-0">
            ใบเสร็จ
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
                    วันเวลาที่สร้างใบเสร็จ
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    วันเวลาที่แก้ไขใบเสร็จ
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    ราคารวม (บาท)
                  </th>
                  <th className="px-4 py-2 border-b text-left">สถานะ</th>
                  <th className="px-4 py-2 border-b text-left">แก้ไข</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentrept.length > 0 ? (
                  currentrept.map((rept, index) => (
                    <tr
                      key={rept.id}
                      className={`transition-all duration-300 ${
                        rept.payment_status === 1
                          ? "bg-orange-500 text-white"
                          : "bg-white hover:bg-blue-50"
                      }`}
                    >
                      <td className="px-4 py-2 border-b text-center h-full">
                        {indexOfFirstreceipt + index + 1}
                      </td>

                      <td className="px-4 py-2 border-b truncate h-full">
                        {rept.created_at
                          ? new Intl.DateTimeFormat("th-TH", {
                              year: "numeric",
                              month:
                                window.innerWidth > 640 ? "long" : "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }).format(new Date(rept.created_at))
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        {rept.updated_at
                          ? new Intl.DateTimeFormat("th-TH", {
                              year: "numeric",
                              month:
                                window.innerWidth > 640 ? "long" : "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }).format(new Date(rept.updated_at))
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        {rept.total_price || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b h-full">
                        {rept.payment_status === 1 ? "ยังไม่ชำระ" : "ชำระแล้ว"}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                            onClick={() =>
                              handleViewDetail(rept.id, rept.total_price)
                            }
                          >
                            <View />
                          </button>

                          <button
                            className={`flex items-center justify-center w-10 h-10 rounded-lg shadow transition duration-300 ${
                              rept.payment_status === 2
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            }`}
                            disabled={rept.payment_status === 2}
                            onClick={() => handleDelete(rept.id)}
                          >
                            <X />
                          </button>
                        </div>
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

        {showReceipt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-100">
            <div className="relative bg-white rounded shadow-lg p-4 max-w-md">
              <button
                onClick={() => setShowReceipt(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
              <PrintReceipt
                receiptData={receiptbyid}
                receiptDetailData={groupedOrders}
                currpage={"allrept"}
              />
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

export default Allreceipt;
