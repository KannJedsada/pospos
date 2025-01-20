import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import { Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

function Unit() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unit, setUnit] = useState([]);
  const [unitConver, setUnitConver] = useState([]);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    from_unit_id: "",
    to_unit_id: "",
    conversion_rate: "",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const unitRes = await axios.get(`/api/unit`);
      setUnit(unitRes.data.data);

      const unitConverRes = await axios.get("/api/unit/get-conver");
      setUnitConver(unitConverRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalType("");
    setFormData({
      name: "",
      from_unit_id: "",
      to_unit_id: "",
      conversion_rate: "",
    });
    setCurrentEditData(null);
    setIsModalOpen(false);
  };

  const handleAdd = (type) => {
    setModalType(type);
    openModal();
  };
  const handleEdit = (item, type) => {
    setModalType(type);
    setCurrentEditData(item);
    getModalValue(type, item);
    openModal();
  };

  const getModalValue = (type, data) => {
    if (type === "unit") {
      setFormData({
        ...formData,
        name: data.u_name,
        from_unit_id: "",
        to_unit_id: "",
        conversion_rate: "",
      });
    } else if (type === "unitConver") {
      setFormData({
        ...formData,
        name: "",
        from_unit_id: data.from_unit_id,
        to_unit_id: data.to_unit_id,
        conversion_rate: data.conversion_rate,
      });
    }
  };

  const handleDelete = async (id, type) => {
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
        if (type === "unit") {
          await axios.delete(`/api/unit/delete/${id}`);
        } else if (type === "unitConver") {
          await axios.delete(`/api/unit/delete-conver/${id}`);
        } 
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
      }
      fetchData();
    } catch (error) {
      console.error("Error delete table:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentEditData) {
        if (modalType === "unit") {
          await axios.put(`/api/unit/edit/${currentEditData.id}`, formData);
        } else if (modalType === "unitConver") {
          await axios.put(
            `/api/unit/edit-conver/${currentEditData.id}`,
            formData
          );
        }
        Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        if (modalType === "unit") {
          await axios.post(`/api/unit/add`, formData);
        } else if (modalType === "unitConver") {
          await axios.post(`/api/unit/add-conver`, formData);
        }
        Swal.fire({
          icon: "success",
          title: "เพิ่มสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const TableWithPagination = ({
    data,
    type,
    title,
    handleAdd,
    handleEdit,
    handleDelete,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // กำหนดขอบเขตของข้อมูลในหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = data.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    return (
      <div className="flex-1 overflow-x-auto mb-6 lg:mb-0">
        <div className="mb-4 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleAdd(type)}
          >
            + เพิ่มข้อมูล
          </button>
        </div>
        <table className="w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-blue-600 text-white">
            {type === "unitConver" ? (
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                <th className="px-4 py-2 text-center">ID</th>
                <th className="px-4 py-2 text-center">หน่วยจาก</th>
                <th className="px-4 py-2 text-center">เป็นหน่วย</th>
                <th className="px-4 py-2 text-center">เรท</th>
                <th className="px-4 py-2 text-center">จัดการ</th>
              </tr>
            ) : (
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                <th className="px-4 py-2 text-center">ID</th>
                <th className="px-4 py-2 text-center">ชื่อ</th>
                <th className="px-4 py-2 text-center">จัดการ</th>
              </tr>
            )}
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr
                  key={item.id}
                  className="transition-all duration-300 bg-white hover:bg-blue-50 border-b"
                >
                  <td className="px-4 py-2 text-center">
                    {startIndex + index + 1}
                  </td>
                  {type === "unitConver" ? (
                    <>
                      <td className="px-4 py-2 text-center">
                        {item.from_unit_name}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.to_unit_name}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.conversion_rate}
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-center">{item.u_name}</td>
                  )}
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                      onClick={() => handleEdit(item, type)}
                    >
                      <Pencil />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(item.id, type)}
                    >
                      <X />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={type === "unitConver" ? 5 : 3}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4">
            <button
              className={`px-4 py-2 rounded-l bg-blue-600 text-white shadow hover:bg-blue-500 ${
                currentPage === 1 ? "cursor-not-allowed" : ""
              }`}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </button>
            <span className="px-4 py-2 bg-white border-t border-b">
              {currentPage} / {totalPages}
            </span>
            <button
              className={`px-4 py-2 rounded-r bg-blue-600 text-white shadow hover:bg-blue-500${
                currentPage === totalPages ? "cursor-not-allowed" : ""
              }`}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6">
          การจัดการหน่วยวัด
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col lg:flex-row lg:gap-6">
              <TableWithPagination
                data={unit}
                type="unit"
                title="หน่วยวัดน้ำหนัก"
                handleAdd={handleAdd}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
              <TableWithPagination
                data={unitConver}
                type="unitConver"
                title="แปลงหน่วยวัด"
                handleAdd={handleAdd}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentEditData ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}
            </h2>
            <div className="space-y-4">
              <div>
                {modalType === "unitConver" ? (
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        หน่วยเริ่มต้น
                      </label>
                      <select
                        name="from_unit_id"
                        value={formData.from_unit_id}
                        onChange={handleInputChange}
                        className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
                      >
                        <option value="">เลือกหน่วยเริ่มต้น</option>
                        {unit.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.u_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        หน่วยที่ต้องการแปลง
                      </label>
                      <select
                        name="to_unit_id"
                        value={formData.to_unit_id}
                        onChange={handleInputChange}
                        className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
                      >
                        <option value="">เลือกหน่วยที่ต้องการแปลง</option>
                        {unit.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.u_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        เรทที่แปลง
                      </label>
                      <input
                        type="text"
                        name="conversion_rate"
                        value={formData.conversion_rate}
                        onChange={handleInputChange}
                        required
                        className="border p-3 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      ชื่อหน่วยวัด
                    </label>
                    <input
                      type="text"
                      name={"name"}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="border p-3 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Unit;
