import React, { useState, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import DatePicker from "react-datepicker";
import { Pencil, X, View, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

function Promotion() {
  const [promotion, setPromotion] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    promo_name: "",
    promo_discount: "",
    promo_type: "",
  });
  const [startPromoDate, setStartPromoDate] = useState(null);
  const [endPromoDate, setEndPromoDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const minDate = new Date();

  const fetchPromotion = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/promotion/promotions`);
      setPromotion(res.data.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleStartDateChange = (date) => setStartPromoDate(date);
  const handleEndDateChange = (date) => setEndPromoDate(date);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setStartPromoDate(null);
    setEndPromoDate(null);
    setEditingPromo(null);
    setIsModalOpen(false);
    setFormData({
      promo_name: "",
      promo_discount: "",
      promo_type: "",
      start_promo: "",
      end_promo: "",
    });
  };

  const handleSavePromotion = async () => {
    try {
      const data = {
        ...formData,
        start_promo: startPromoDate ? formatDate(startPromoDate) : null,
        end_promo: endPromoDate ? formatDate(endPromoDate) : null,
      };

      await axios.post("/api/promotion/new_promotion", data);
      setStartPromoDate(null);
      setEndPromoDate(null);
      fetchPromotion();
      closeModal();
    } catch (error) {
      console.error("Error saving promotion:", error);
    }
  };

  const handleUpdata = async () => {
    try {
      const data = {
        ...formData,
        start_promo: startPromoDate ? formatDate(startPromoDate) : null,
        end_promo: endPromoDate ? formatDate(endPromoDate) : null,
      };
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        showConfirmButton: false,
        timer: 1000,
      });
      await axios.put(`/api/promotion/edit_promotion/${editingPromo}`, data);
      setEditingPromo(null);
      fetchPromotion();
      closeModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการแก้ไข",
      });
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo.id);
    setFormData({
      promo_name: promo.promo_name,
      promo_discount: promo.promo_discount,
      promo_type: promo.promo_type,
    });
    setStartPromoDate(new Date(promo.start_promo));
    setEndPromoDate(new Date(promo.end_promo));
    openModal();
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/promotion/delete_promotion/${id}`);

        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
        fetchPromotion();
      }
    } catch (error) {
      console.error("Error delete table:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="mb-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
          <h1 className="text-3xl font-semibold text-blue-700">โปรโมชั่น</h1>
          <button
            onClick={openModal}
            className="w-full xl:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + เพิ่มโปรโมชั่น
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                {editingPromo ? "แก้ไขข้อมูลโปรโมชัน" : "เพิ่มโปรโชัน"}
              </h2>

              {/* ชื่อโปรโมชั่น */}
              <input
                name="promo_name"
                value={formData.promo_name}
                onChange={handleChange}
                type="text"
                placeholder="ชื่อโปรโมชั่น"
                className="border p-3 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
              />

              {/* ส่วนลด */}
              <input
                name="promo_discount"
                value={formData.promo_discount}
                onChange={handleChange}
                type="text"
                placeholder="ส่วนลด"
                className="border p-3 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
              />

              {/* ประเภทโปรโมชัน */}
              <div className="mb-4">
                <label className="block font-medium mb-2">ประเภทโปรโมชัน</label>
                <select
                  name="promo_type"
                  value={formData.promo_type}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                >
                  <option value="">เลือกประเภทโปรโมชัน</option>
                  <option value="percentage">ส่วนลดเปอร์เซ็นต์ (%)</option>
                  <option value="amount">ส่วนลดเงินสด (บาท)</option>
                </select>
              </div>

              {/* วันเริ่มต้นโปรโมชั่น */}
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  เลือกวันเริ่มต้นโปรโมชั่น
                </label>
                <DatePicker
                  selected={startPromoDate}
                  onChange={handleStartDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                  minDate={minDate}
                />
              </div>

              {/* วันสิ้นสุดโปรโมชั่น */}
              <div className="mb-4">
                <label className="block font-medium mb-2">
                  เลือกวันสิ้นสุดโปรโมชั่น
                </label>
                <DatePicker
                  selected={endPromoDate}
                  onChange={handleEndDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="px-4 py-3 border border-gray-300 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                  minDate={startPromoDate}
                />
              </div>

              {/* ปุ่ม */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 ease-in-out mr-2"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={
                    editingPromo
                      ? () => handleUpdata(editingPromo, formData)
                      : handleSavePromotion
                  }
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto rounded-lg shadow-lg">
            <table className="w-full bg-white border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="px-4 py-2 border-b text-left">ชื่อ</th>
                  <th className="px-4 py-2 border-b text-left">ส่วนลด </th>
                  <th className="px-4 py-2 border-b text-left">
                    วันเริ่มต้นโปรโมชั่น
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    วันสิ้นสุดโปรโมชั่น
                  </th>
                  <th className="px-4 py-2 border-b text-left">เครื่องมือ</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {promotion.length > 0 ? (
                  promotion.map((promo) => {
                    return (
                      <tr
                        key={promo.id}
                        className="transition-all duration-300 bg-white hover:bg-blue-50"
                      >
                        <td className="px-4 py-3 border-b ">
                          {promo.promo_name}
                        </td>
                        <td className="px-4 py-3 border-b ">
                          {promo.promo_discount}{" "}
                          {promo.promo_type === "percentage" ? "%" : "บาท"}
                        </td>
                        <td className="px-4 py-3 border-b ">
                          {promo.start_promo
                            ? new Intl.DateTimeFormat("th-TH", {
                                dateStyle: "long",
                              }).format(new Date(promo.start_promo))
                            : "-"}
                        </td>
                        <td className="px-4 py-3 border-b">
                          {promo.end_promo
                            ? new Intl.DateTimeFormat("th-TH", {
                                dateStyle: "long",
                              }).format(new Date(promo.end_promo))
                            : "-"}
                        </td>
                        <td className="px-4 py-2 border-b sm:flex sm:space-x-2 sm:justify-center sm:items-center">
                          <button
                            onClick={() => handleEdit(promo)}
                            className={`px-3 py-1 rounded-lg mt-2 sm:mt-0 sm:ml-2 text-white
                                bg-blue-700 hover:bg-blue-800
                            `}
                          >
                            <Pencil />
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className={`px-3 py-1 rounded-lg mt-2 sm:mt-0 sm:ml-2 text-white bg-red-500 hover:bg-red-600`}
                          >
                            <X />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-2  text-center text-gray-500"
                    >
                      ไม่มีข้อมูล
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

export default Promotion;
