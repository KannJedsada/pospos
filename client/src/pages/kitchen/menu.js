import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { View, Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

function Menus() {
  const { authData } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectCategory, setSelectdCategory] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [menuIng, setMenuIng] = useState([]);
  const [isLoadingModal, setIsloadingModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [menusPerPage] = useState(10);

  const fetchMenus = async (catId = "") => {
    try {
      setIsLoading(true);
      let res;
      if (catId) {
        res = await axios.get(`/api/menu/menu/category/${catId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else {
        res = await axios.get(`/api/menu/menus`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      }
      setMenus(res.data.data);
      setFilteredMenus(res.data.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      Swal.fire("Error", "Failed to fetch menus", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/api/menu/menucategory`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setCategory(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Failed to fetch categories", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const menuRes = await axios.get(`/api/menu/menu/${id}`);
      const menu = menuRes.data.data;
      const menuname = menu.menu_name;

      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบหรือไม่?",
        text: `ต้องการลบเมนู ${menuname} หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#f44336",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        await axios.delete(`/api/menu/deletemenu/${id}`, {
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

        fetchMenus();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("Deletion cancelled");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      Swal.fire("Error", "Failed to delete menu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/editmenu`, { state: { id } });
  };

  const handleEditPrice = (id) => {
    navigate(`/editprice`, { state: { id } });
  };

  const handleAddMenu = () => {
    navigate("/addmenu");
  };

  const handleView = async (id) => {
    try {
      setIsOpenModal(true);
      setIsloadingModal(true);
      const res = await axios.get(`/api/menu/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setMenuIng(res.data.data);
      console.log(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloadingModal(false);
    }
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setMenuIng([]);
  };

  // Run once when the component mounts
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [authData.token]);

  // Filter the menus by search term
  useEffect(() => {
    const filtered = menus.filter((menu) =>
      (menu.menu_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenus(filtered);
  }, [searchTerm, menus]);

  // Fetch menus by category when `selectCategory` changes
  useEffect(() => {
    fetchMenus(selectCategory);
  }, [selectCategory, authData.token]);

  const indexOfLastMaterial = currentPage * menusPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - menusPerPage;
  const currentMaterials = filteredMenus.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredMenus.length / menusPerPage);

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
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6">
          รายการอาหาร
        </h1>
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectCategory}
              onChange={(e) => setSelectdCategory(e.target.value)}
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
          <button
            onClick={handleAddMenu}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + เพิ่มเมนู
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto rounded-lg shadow-lg">
            <table className="w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <th className="px-4 py-2 border-b text-left">ลำดับ</th>
                  <th className="px-4 py-2 border-b text-left">ชื่อ</th>
                  <th className="px-4 py-2 border-b text-left">ราคา (บาท)</th>
                  <th className="px-4 py-2 border-b text-left">รูปภาพ</th>
                  <th className="px-4 py-2 border-b text-left">หมวดหมู่</th>
                  <th className="px-4 py-2 border-b text-left">แก้ไข</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredMenus.length > 0 ? (
                  filteredMenus.map((menu, index) => (
                    <tr
                      key={menu.menu_id}
                      className="transition-all duration-300 bg-white hover:bg-blue-50"
                    >
                      <td className="px-4 py-2 border-b text-center h-full">
                        {indexOfFirstMaterial + index + 1}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        {menu.menu_name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center h-full">
                        {menu.price || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b text-center h-full">
                        {menu.menu_img ? (
                          <div className="flex justify-center items-center h-full">
                            <img
                              src={`${menu.menu_img}`}
                              alt={menu.menu_name || "Menu image"}
                              className="w-16 h-16 object-cover rounded-lg sm:w-20 sm:h-20"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b truncate h-full">
                        {menu.category_name || "N/A"}
                      </td>
                      <td className="px-4 py-2 border-b h-full">
                        <div className="flex space-x-2 items-center h-full relative">
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-blue-400 text-white rounded-lg shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                            onClick={() => handleView(menu.menu_id)}
                          >
                            <View />
                          </button>
                          <Menu
                            as="div"
                            className="relative inline-block text-left"
                          >
                            <div>
                              <MenuButton className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300">
                                <Pencil />
                              </MenuButton>
                            </div>

                            <MenuItems
                              transition
                              className="absolute left-0 z-20 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                              style={{
                                position: "absolute",
                                top: "-70%",
                                left: "-340%",
                              }}
                            >
                              <div className="py-1">
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() =>
                                        handleEditPrice(menu.menu_id)
                                      }
                                      className={`block w-full px-4 py-2 text-left text-sm ${active
                                          ? "bg-blue-100 text-blue-700"
                                          : "text-gray-700"
                                        }`}
                                    >
                                      แก้ไขราคา
                                    </button>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(menu.menu_id)}
                                      className={`block w-full px-4 py-2 text-left text-sm ${active
                                          ? "bg-blue-100 text-blue-700"
                                          : "text-gray-700"
                                        }`}
                                    >
                                      แก้ไขเมนู
                                    </button>
                                  )}
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </Menu>

                          <button
                            className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                            onClick={() => handleDelete(menu.menu_id)}
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

        {isOpenModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg sm:w-2/3 lg:w-1/3 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">รายละเอียดเมนู</h2>
              </div>
              {isLoadingModal ? (
                <div className="flex justify-center items-center min-h-screen">
                  <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
                </div>
              ) : (
                <>
                  {menuIng && (
                    <div className="max-h-[90vh] overflow-y-auto">
                      <div className="mb-4 flex justify-center">
                        <img
                          src={
                            menuIng.menu_img
                              ? `${menuIng.menu_img}`
                              : "/path/to/placeholder-image.png"
                          }
                          alt={menuIng.menu_name || "เมนูนี้ไม่มีชื่อ"}
                          className="w-48 h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          ชื่อเมนู: {menuIng.menu_name}
                        </h3>
                        <p>ราคา: {menuIng.price || "-"} บาท</p>
                      </div>
                      <div>
                        <h4 className="text-md font-semibold mb-2">
                          วัตถุดิบที่ใช้:
                        </h4>
                        <ul className="list-disc pl-6">
                          {menuIng.ingredients.map((ingredient, index) => (
                            <li key={index}>
                              {ingredient.material_name} -{" "}
                              {ingredient.quantity_used} {ingredient.u_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-6 text-right">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          onClick={closeModal}
                        >
                          ปิด
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
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
        )}

      </div>
    </div>
  );
}

export default Menus;
