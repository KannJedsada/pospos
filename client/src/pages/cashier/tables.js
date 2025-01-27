import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import Swal from "sweetalert2";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

function Tables() {
  const [tables, setTables] = useState([]);
  const [tableStatus, setTableStatus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [formData, setFormData] = useState({
    t_name: "",
    status_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTable = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/table/tables`);
      setTables(res.data.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const fetchTableStatus = async () => {
    try {
      const res = await axios.get(`/api/table/status`);
      setTableStatus(res.data.data);
    } catch (error) {
      console.error("Error fetching table status:", error);
    }
  };

  const handleUpdateStatus = async (tableId, data) => {
    try {
      setIsLoading(true);

      // ส่งคำขอแก้ไขข้อมูลโต๊ะ
      await axios.put(`/api/table/edit_table/${tableId}`, data);

      // แจ้งเตือนผู้ใช้เมื่อแก้ไขสำเร็จ
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        showConfirmButton: false,
        timer: 1000,
      });

      // ปิด Modal และรีเซ็ตข้อมูลที่เกี่ยวข้อง
      closeModal();
      setEditingTableId(null);

      // โหลดข้อมูลโต๊ะใหม่
      fetchTable();
    } catch (error) {
      console.error("Error updating table status:", error);

      // จัดการข้อผิดพลาด
      if (
        error.response &&
        error.response.data.message === "Table name already exists. Please choose a different name."
      ) {
        Swal.fire("Error", "ชื่อโต๊ะนี้มีอยู่แล้ว", "error");
      } else {
        Swal.fire("Error", "เกิดข้อผิดพลาดในการแก้ไข", "error");
      }
    } finally {
      // รีเซ็ตฟอร์มหลังแก้ไขเสร็จ
      setFormData({
        t_name: "",
        status_id: "",
      });
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchTable();
    fetchTableStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleAddTable = async () => {
    try {
      setIsLoading(true);
      const trimmedFormData = {
        ...formData,
        t_name: formData.t_name.trim(),
      };

      // Send the trimmed data
      await axios.post(`/api/table/new_table`, trimmedFormData);
      Swal.fire({
        icon: "success",
        title: "เพิ่มสำเร็จ",
        showConfirmButton: false,
        timer: 1000,
      });
      fetchTable();
      closeModal();
    } catch (error) {
      console.error("Error adding new table:", error);
      if (
        error.response &&
        error.response.data.message === "Table name already exists"
      ) {
        Swal.fire("Error", "ชื่อโต๊ะนี้มีอยู่แล้ว", "error");
      } else {
        Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่ม", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setFormData({
      t_name: "",
      status_id: "",
    });
    setIsModalOpen(false);
    setEditingTableId(null);
  };

  const handleEdit = (table) => {
    setEditingTableId(table.id);
    setFormData({
      t_name: table.t_name,
      status_id: table.status_id,
    });
    openModal();
  };

  const handleDelte = async (id) => {
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
        setIsLoading(true);
        await axios.delete(`/api/table/delete_table/${id}`);

        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
        fetchTable();
      }
    } catch (error) {
      console.error("Error delete table:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการลบ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Menubar />
      <div className="container mx-auto p-6 space-y-6">
        <button
          onClick={openModal}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
        >
          + เพิ่มโต๊ะ
        </button>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {tables.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-9 gap-4">
                {tables.map((table) => (
                  <Menu
                    key={table.id}
                    as="div"
                    className="relative inline-block text-left"
                  >
                    <div className="flex justify-center">
                      <MenuButton
                        onClick={() => setEditingTableId(table.id)}
                        className={`${table.status_name === "ไม่พร้อมใช้งาน"
                          ? "bg-gray-500 hover:bg-gray-600"
                          : table.status_name === "ไม่ว่าง"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600"
                          } text-white px-6 py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 w-32 h-32 text-sm flex items-center justify-center`}
                      >
                        โต๊ะ {table.t_name} ({table.status_name})
                      </MenuButton>
                    </div>
                    <MenuItems
                      transition
                      className="absolute left-0 z-20 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transform transition-all duration-200 scale-95"
                    // className="absolute left-0 z-20 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    // style={{
                    //   position: "absolute",
                    //   top: "0",
                    //   left: "0",
                    // }}
                    >
                      <div className="py-1">
                        {table.status_id === 3 ? (
                          ""
                        ) : (
                          <div>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEdit(table)}
                                  className={`block w-full px-4 py-2 text-left text-sm ${active
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-700"
                                    }`}
                                >
                                  แก้ไข
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelte(table.id)}
                                  className={`block w-full px-4 py-2 text-left text-sm ${active
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-700"
                                    }`}
                                >
                                  ลบ
                                </button>
                              )}
                            </MenuItem>
                          </div>
                        )}
                      </div>
                    </MenuItems>
                  </Menu>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center">ยังไม่มีโต๊ะในระบบ</p>
            )}
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full sm:w-96">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                {editingTableId ? "แก้ไขข้อมูลโต๊ะ" : "เพิ่มโต๊ะใหม่"}
              </h2>
              <input
                name="t_name"
                value={formData.t_name}
                onChange={handleChange}
                disabled={isLoading}
                type="text"
                placeholder="ชื่อโต๊ะ"
                className="border p-3 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
              />
              <select
                name="status_id"
                value={formData.status_id}
                onChange={handleChange}
                disabled={isLoading}
                className="px-4 py-3 border border-gray-300 rounded-lg w-full mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
              >
                <option value="">สถานะ</option>
                {tableStatus
                  .filter((status) => status.id === 1 || status.id === 2) // กรองเฉพาะ status.id ที่เป็น 1 หรือ 2
                  .map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.status_name}
                    </option>
                  ))}
              </select>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 ease-in-out"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={
                    editingTableId
                      ? () => handleUpdateStatus(editingTableId, formData)
                      : handleAddTable
                  }
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                >
                  {editingTableId ? "บันทึก" : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tables;
