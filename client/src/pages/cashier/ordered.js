import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

function Ordered() {
  const navigate = useNavigate();
  const location = useLocation();
  const { table_id } = location.state || {};

  const [menus, setMenus] = useState([]);
  const [carts, setCarts] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [menuCate, setMenuCate] = useState([]);

  const fetchMenus = async () => {
    try {
      const res = await axios.get("/api/menu/menu-cus");
      setMenus(res.data.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchTableData = async () => {
    try {
      const res = await axios.get(`/api/table/table/${table_id}`);
      setTableData(res.data.data);
    } catch (error) {
      console.error(`Error fetching table:`, error);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`/api/menu/menucategory`);
      setCategory(res.data.data);
    } catch (error) {
      console.error(`Error fetching category`, error);
    }
  };

  const fetchMenuCate = async (categoryId) => {
    try {
      const res = await axios.get(`/api/menu/menu/category/${categoryId}`);
      setMenuCate(res.data.data);
    } catch (error) {
      console.error(`Error fetching menu by category`, error);
    }
  };

  // เพิ่มรายการเมนูลงใน cart
  const addToCart = (menu) => {
    setCarts((prevCarts) => {
      return [...prevCarts, { ...menu, qty: 1, price: menu.price }];
    });
  };

  const addMenuToCart = (menu_id, menu_price) => {
    setCarts((prevCarts) => {
      return [...prevCarts, { menu_id: menu_id, qty: 1, price: menu_price }];
    });
  };

  // ลบรายการเมนูออกจาก cart
  const removeFromCart = (menu_id) => {
    setCarts((prevCarts) => {
      const lastIndex = prevCarts
        .map((item) => item.menu_id)
        .lastIndexOf(menu_id);

      if (lastIndex !== -1) {
        return prevCarts.filter((_, index) => index !== lastIndex);
      }

      return prevCarts;
    });
  };

  const removeAllOrder = (menu_id) => {
    setCarts((prevCarts) =>
      prevCarts.filter((item) => item.menu_id !== menu_id)
    );
  };

  const groupedCarts = (carts || []).reduce((acc, curr) => {
    const existingItem = acc.find((item) => item.menu_id === curr.menu_id);

    if (existingItem) {
      existingItem.qty += curr.qty;
      existingItem.price += curr.price;
    } else {
      acc.push({ ...curr });
    }

    return acc;
  }, []);

  const handleConfirmOrder = async () => {
    const orderDetails = carts.map((item) => ({
      menu_id: item.menu_id,
      qty: item.qty,
      table_id: table_id,
      price: item.price,
    }));

    try {
      const res = await axios.post(`/api/order/addorder`, {
        order_detail: orderDetails,
      });
      const data = res.data.data;

      const { added_order = [], insufficient_items = [] } = data;

      // if (insufficient_items.length > 0) {
      //   insufficient_items.forEach((item) => {
      //     alert(`วัตถุดิบไม่เพียงพอสำหรับเมนู: ${item.menu_name}`);
      //   });
      // }
      if (insufficient_items.length > 0) {
        const groupedItems = insufficient_items.reduce((acc, item) => {
          const existingItem = acc.find((i) => i.menu_id === item.menu_id);
          if (existingItem) {
            existingItem.qty += item.qty;
          } else {
            acc.push({
              menu_id: item.menu_id,
              menu_name: item.menu_name,
              qty: item.qty,
            });
          }
          return acc;
        }, []);

        // สร้างข้อความที่จะแสดงใน Swal
        const insufficientMessage = groupedItems
          .map((item) => `- เมนู: ${item.menu_name} ${item.qty} จำนวน `)
          .join("\n");

        // แสดงข้อความใน Swal
        Swal.fire({
          icon: "error",
          html: `วัตถุดิบไม่เพียงพอสำหรับเมนู:<br><pre>${insufficientMessage}</pre>`,
          showConfirmButton: false,
          timer: 3000,
        });
      }

      setCarts([]);
      // navigate("/order");
    } catch (error) {
      console.error("Error confirming order:", error.response || error.message);
    }
  };

  const handleback = () => {
    navigate("/order");
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMenus(menus);
    } else {
      fetchMenuCate(selectedCategory).then(() => {
        setFilteredMenus(menuCate);
      });
    }
  }, [selectedCategory, menus, menuCate]);

  useEffect(() => {
    fetchMenus();
    fetchTableData();
    fetchCategory();

    const handleOrderUpdate = (updatedOrder) => {
      fetchMenus();
    };

    socket.on("orderUpdated", handleOrderUpdate);

    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  }, []);

  return (
    <div>
      <div className="flex h-screen">
        {/* Sidebar แสดงหมวดหมู่และเมนู */}
        <div className="w-2/3 bg-gray-100 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={handleback} className="text-lg font-bold">
              <ChevronLeft />
            </button>
            <h2 className="text-xl font-bold">เมนู</h2>
          </div>
          <div className="flex space-x-4 border-b pb-2 overflow-x-auto scrollbar-hide mb-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded min-w-max ${
                selectedCategory === "all"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              ทั้งหมด
            </button>
            {category.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  fetchMenuCate(cat.id);
                }}
                className={`px-3 py-1 rounded min-w-max ${
                  selectedCategory === cat.id
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
          {filteredMenus.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {filteredMenus.map((menu) => (
                <div
                  key={menu.menu_id}
                  className={`flex flex-col items-center mb-4 p-4 rounded shadow w-full transition-transform ${
                    menu.menu_status === 1
                      ? "bg-white hover:scale-105 hover:shadow-lg cursor-pointer"
                      : "bg-gray-300 opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (menu.menu_status === 1) {
                      addToCart(menu);
                    }
                  }}
                >
                  {/* รูปภาพเมนู */}
                  <div className="relative">
                    <img
                      src={`${menu.menu_img}`}
                      alt={menu.menu_name || "Menu image"}
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                    {menu.menu_status !== 1 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm">
                          ไม่พร้อมให้บริการ
                        </span>
                      </div>
                    )}
                  </div>
                  {/* ข้อมูลเมนู */}
                  <div className="mt-2 text-center">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {menu.menu_name}
                    </h3>
                    <p className="text-gray-600">{menu.price} บาท</p>
                  </div>
                  {/* ป้ายกำกับสถานะ */}
                  {menu.menu_status !== 1 && (
                    <span className="text-xs text-red-500 mt-1">
                      หมดชั่วคราว
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">ไม่มีเมนูในหมวดหมู่นี้</p>
          )}
        </div>

        {/* Main Content แสดงรายการที่เลือก */}
        <div className="w-1/3 bg-white p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4">โต๊ะ {tableData.t_name}</h2>
            {groupedCarts.length > 0 ? (
              groupedCarts.map((cartItem) => (
                <div
                  key={cartItem.menu_id}
                  className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded shadow"
                >
                  <span>
                    {cartItem.menu_name} x {cartItem.qty}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => removeFromCart(cartItem.menu_id)}
                    >
                      -
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                      onClick={() =>
                        addMenuToCart(
                          cartItem.menu_id,
                          cartItem.price / cartItem.qty
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <span>{cartItem.price} บาท</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAllOrder(cartItem.menu_id);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    x
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">ยังไม่มีรายการสั่งอาหาร</p>
            )}
          </div>

          {/* Total */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              ราคารวม: {carts.reduce((sum, item) => sum + item.price, 0)} บาท
            </h3>
            <button
              onClick={handleConfirmOrder}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ยืนยันการสั่งอาหาร
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ordered;
