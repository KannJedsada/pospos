import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Swal from "sweetalert2";
import socket from "../../utils/socket";
import { Badge } from "@mui/material";
import Modal from "react-modal";

function Table() {
  const currentUrl = window.location.href;
  const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
  const [menus, setMenus] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0); // ใช้สำหรับบันทึกแท็บที่เลือก
  const [tableId, setTableId] = useState();
  const [table, setTable] = useState([]);
  const [orders, setOrders] = useState([]);
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [menuCate, setMenuCate] = useState([]);
  const [category, setCategory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [nameCat, setNameCat] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchMenus = async () => {
    try {
      const res = await axios.get("/api/menu/menu-cus");
      setMenus(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMenuCate = async (categoryId) => {
    try {
      const res = await axios.get(`/api/menu/menu/category/${categoryId}`);
      setMenuCate(res.data.data);
    } catch (error) {
      console.error("Error fetching menu by category:", error);
    }
  };

  const fetchNameCat = async (id) => {
    const res = await axios.get(`/api/menu/menucateone/${id}`);
    setNameCat(res.data.data);
  };

  const fetchMenuRecommended = async () => {
    try {
      const res = await axios.get(`/api/menu/menu-recom`);
      setRecommended(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`/api/menu/menucategory`);
      setCategory(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchQRCodeStatus = async () => {
      try {
        const response = await axios.post("/api/qr/get_by_url", {
          url: currentUrl,
        });
        const qrData = response.data?.data;
        if (qrData) {
          setIsQRCodeVisible(qrData.qr_status);
          setTableId(qrData.table_id);
        } else {
          console.error("No QR data found for this URL.");
        }
      } catch (error) {
        console.error("Error fetching QR code status:", error);
      }
    };

    fetchQRCodeStatus();
  }, [currentUrl]);

  const handleAddToCart = async (tableId, menu) => {
    const { menu_id, price } = menu;
    const qty = 1;

    const res = await axios.post(`/api/order/addtocarts`, {
      menu_id,
      qty,
      price,
      table_id: tableId,
    });
  };

  const handleAddMenuToCart = async (tableId, menuId, price) => {
    const qty = 1;

    const res = await axios.post(`/api/order/addtocarts`, {
      menu_id: menuId,
      qty,
      price,
      table_id: tableId,
    });
  };

  const removeCart = async (cart_id) => {
    const res = await axios.delete(`/api/order/removecart/${cart_id}`);
  };

  const handleConfirmOrder = async () => {
    const orderDetails = carts.map((item) => ({
      cart_id: item.id,
      menu_id: item.menu_id,
      qty: item.qty,
      table_id: item.table_id,
      price: item.price,
    }));

    if (orderDetails.table_id === tableId) {
      setIsLoading(true);
    }

    try {
      // ส่งคำสั่งซื้อไปยัง API
      const res = await axios.post("/api/order/addorder", {
        order_detail: orderDetails,
      });

      const data = res.data.data;
      if (!data) throw new Error("API ไม่ได้ส่งข้อมูลกลับมา");

      const { added_order = [], insufficient_items = [] } = data;

      // แจ้งเตือนกรณีวัตถุดิบไม่เพียงพอ
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecreaseQty = async (orderDetailId) => {
    try {
      const res = await axios.put(`/api/order/decreaseqty/${orderDetailId}`, {
        qty: 1,
      });

      // อัปเดตรายการ order ใหม่
      await fetchOrder(tableId);
    } catch (error) {
      console.error("Error decreasing order quantity:", error);
      alert("เกิดข้อผิดพลาดในการลดจำนวน");
    }
  };

  const handleCancelOrder = async (orderId, qty) => {
    const new_qty = orderId.length - qty;
    for (let i = 0; i < new_qty; i++) {
      handleDecreaseQty(orderId[i]);
    }

    setIsModalOpen(false);
  };

  const handleConfirmCancelorder = (orderId, qty) => {
    Swal.fire({
      title: "ยืนยันการลดจำนวน?",
      text: "คุณต้องการลดจำนวนออร์เดอร์นี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        handleCancelOrder(orderId, qty);
        Swal.fire({
          icon: "success",
          title: "ยกเลิกสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const handleConfirmDecrease = (orderId) => {
    Swal.fire({
      title: "ยืนยันการลดจำนวน?",
      text: "คุณต้องการลดจำนวนออร์เดอร์นี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDecreaseQty(orderId);
        // Swal.fire({
        //   icon: "success",
        //   title: "ลดจำนวนสำเร็จ",
        //   showConfirmButton: false,
        //   timer: 1500,
        // });
      }
    });
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const fetchTable = async (id) => {
    try {
      const res = await axios.get(`/api/table/table/${id}`);
      setTable(res.data.data);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  const fetchOrder = async (id) => {
    try {
      const res = await axios.get(`/api/order/orderdetail/${id}`);
      setOrders(res.data.data);
      updateFilteredMenus();
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const fetchCarts = async (id) => {
    const res = await axios.get(`/api/order/getcarts/${id}`);
    setCarts(res.data.data);
  };

  const updateFilteredMenus = () => {
    if (selectedCategory === "all") {
      setFilteredMenus(menus);
    } else if (selectedCategory === "recom") {
      setFilteredMenus(recommended);
    } else {
      setFilteredMenus(menuCate);
    }
  };

  useEffect(() => {
    if (tableId) {
      fetchTable(tableId);
      fetchOrder(tableId);
      fetchCarts(tableId);
    }

    // ฟัง Event "order update" จาก Socket.io
    const handleOrderUpdate = (updatedOrder) => {
      fetchOrder(tableId);
      fetchCarts(tableId);
      fetchMenus();
      fetchMenuRecommended();
    };

    socket.on("orderUpdated", handleOrderUpdate);

    // ล้าง Event Listener เมื่อ Component ถูก Unmount
    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  }, [tableId, selectedCategory, menus, recommended, menuCate]);

  const groupedOrders = (orders || []).reduce((acc, curr) => {
    const existingItem = acc.find(
      (item) =>
        item.menu_id === curr.menu_id && item.dish_status === curr.dish_status
    );
    if (existingItem) {
      existingItem.qty += curr.qty;
      existingItem.price += curr.price;
      existingItem.order_ids = [...(existingItem.order_ids || []), curr.id];
    } else {
      acc.push({ ...curr, order_ids: [curr.id] });
    }
    return acc;
  }, []);

  const groupedCarts = (carts || []).reduce((acc, curr) => {
    // หาค่าของเมนูในตะกร้าที่มี menu_id เดียวกัน
    const existingItem = acc.find((item) => item.menu_id === curr.menu_id);

    if (existingItem) {
      // ถ้ามีเมนูนี้ในตะกร้าแล้ว ให้รวม qty และคำนวณราคาใหม่
      existingItem.qty += curr.qty;
      // คำนวณราคาทั้งหมดโดยการคูณ price และ qty
      existingItem.price += curr.price;
      // รวม cart_id ทั้งหมด
      existingItem.cart_id = [...(existingItem.cart_id || []), curr.id];
    } else {
      // ถ้าไม่มีเมนูนี้ในตะกร้า ให้เพิ่มเมนูใหม่
      acc.push({ ...curr, cart_id: [curr.id] });
    }

    return acc;
  }, []);

  const total_price = groupedOrders.reduce((sum, order) => {
    return sum + order.price;
  }, 0);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const startTime = performance.now(); // ⏱ เริ่มจับเวลา

        if (tableId === undefined) {
          setIsLoading(true);
        }

        // ดึงข้อมูล QR Code
        const qrResponse = await axios.post("/api/qr/get_by_url", {
          url: currentUrl,
        });
        const qrData = qrResponse.data.data;

        if (qrData) {
          if (tableId === qrData.table_id) {
            setIsLoading(true);
          }
          setIsQRCodeVisible(qrData.qr_status);
          setTableId(qrData.table_id);

          // โหลดข้อมูลโต๊ะและคำสั่งซื้อเฉพาะถ้ามี table_id
          if (qrData.table_id) {
            await Promise.all([
              fetchTable(qrData.table_id),
              fetchOrder(qrData.table_id),
              fetchCarts(qrData.table_id),
            ]);
          }
        } else {
          console.error("No QR data found for this URL.");
        }

        await fetchMenus();
        await fetchMenuRecommended();

        const endTime = performance.now(); // 🛑 หยุดจับเวลา
        console.log(`⏳ โหลดข้อมูลเสร็จใน ${((endTime - startTime) / 1000).toFixed(2)} วินาที`);

      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // โหลดข้อมูลเฉพาะเมื่อ tableId ยังไม่ถูกตั้งค่า
    if (tableId === undefined) {
      fetchAllData();
    }

    // ฟัง event orderUpdated เฉพาะของ tableId นี้
    const handleOrderUpdate = (updatedTableId) => {
      if (updatedTableId === tableId) {
        fetchAllData(); // โหลดข้อมูลใหม่เฉพาะของโต๊ะนี้
      }
    };

    socket.on("orderUpdated", handleOrderUpdate);

    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  }, [currentUrl, socket, tableId]);


  useEffect(() => {
    fetchMenus();
    fetchCategory();
  }, [selectedCategory]);

  // ฟังก์ชันสำหรับแสดงเนื้อหาตามแท็บ
  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <div className="p-5 flex flex-col h-full">
            <p className="text-gray-700 font-semibold text-lg mb-6">
              รายการสั่งอาหาร
            </p>
            {groupedOrders.length > 0 ? (
              groupedOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md mb-4"
                  onClick={() => order.dish_status === 1 && openModal(order)}
                >
                  <div className="overflow-hidden max-w-xs">
                    <p className="text-gray-800 font-medium overflow-ellipsis overflow-hidden whitespace-nowrap">
                      {order.menu_name} x {order.qty}{" "}
                      {order.menu_category !== 6 && order.menu_category !== 7
                        ? "จาน"
                        : "ถ้วย"}
                    </p>
                    <span>
                      {order.qty} x {(order.price / order.qty).toFixed(2)} บาท
                    </span>
                    <p className="text-gray-600 overflow-ellipsis overflow-hidden whitespace-nowrap">
                      ราคา: {order.price} บาท | สถานะ: {order.status_name}
                    </p>
                  </div>

                  <div>
                    {order.dish_status === 1 ? (
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (order.order_ids && order.order_ids.length > 0) {
                            handleConfirmDecrease(order.order_ids[0]);
                          } else {
                            alert("ไม่มีข้อมูล order_id สำหรับลดจำนวน");
                          }
                        }}
                      >
                        ลด
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                        disabled
                      >
                        ลด
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">ไม่มีรายการสั่งซื้อ</p>
            )}

            <div className="mt-auto w-full max-w-xl">
              <p className="text-xl font-bold text-gray-800">
                ราคารวม: {total_price} บาท
              </p>
            </div>

            {/* Modal สำหรับแสดงรายละเอียดคำสั่งอาหาร */}
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-auto"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50"
              ariaHideApp={false}
            >
              {selectedOrder ? (
                <div className="bg-white p-6 rounded-md w-80">
                  <p className="text-xl font-semibold">
                    {selectedOrder.menu_name}
                  </p>

                  <div className="text-gray-700 mt-2">
                    <p>
                      จำนวน :
                      <button
                        onClick={() => {
                          if (selectedOrder.qty > 0) {
                            setSelectedOrder((prev) => ({
                              ...prev,
                              qty: prev.qty - 1,
                            }));
                          }
                        }}
                        disabled={selectedOrder.qty <= 0}
                        className={`m-4 px-1 py-1 ${selectedOrder.qty <= 0
                          ? "bg-gray-300 text-gray-500 rounded"
                          : "bg-red-500 text-white rounded hover:bg-red-600"
                          } `}
                      >
                        -
                      </button>
                      {selectedOrder.qty}{" "}
                      <button
                        onClick={() => {
                          setSelectedOrder((prev) => ({
                            ...prev,
                            qty: prev.qty + 1,
                          }));
                        }}
                        disabled={
                          selectedOrder.qty >= selectedOrder.order_ids.length
                        }
                        className={`m-4 px-1 py-1 ${selectedOrder.qty >= selectedOrder.order_ids.length
                          ? "bg-gray-300 text-gray-500 rounded"
                          : "bg-blue-500 text-white rounded hover:bg-blue-600"
                          } `}
                      >
                        +
                      </button>
                    </p>
                  </div>

                  <p className="text-gray-700 mt-2">
                    สถานะ: {selectedOrder.status_name}
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={closeModal}
                      className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      ปิด
                    </button>
                    <button
                      onClick={() =>
                        handleConfirmCancelorder(
                          selectedOrder.order_ids,
                          selectedOrder.qty
                        )
                      }
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <p>กำลังโหลดข้อมูล...</p>
              )}
            </Modal>
          </div>
        );
      case 1:
        return (
          <div className="p-4 space-y-6">
            <div className="flex space-x-4 border-b pb-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("recom")}
                className={`px-3 py-1 rounded min-w-max ${selectedCategory === "recom"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
                  }`}
              >
                ที่แนะนำ
              </button>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded min-w-max ${selectedCategory === "all"
                  ? "bg-blue-500 text-white"
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
                    fetchNameCat(cat.id);
                  }}
                  className={`px-3 py-1 rounded min-w-max ${selectedCategory === cat.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {cat.category_name}
                </button>
              ))}
            </div>

            <div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 max-w-full whitespace-nowrap sm:text-2xl md:text-3xl lg:text-4xl">
                  {selectedCategory === "all"
                    ? "เมนูทั้งหมด"
                    : selectedCategory === "recom"
                      ? "เมนูแนะนำ"
                      : `หมวดหมู่ : ${nameCat.category_name}`}
                </h3>
              </div>

              {filteredMenus.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredMenus.map((menu) => (
                    <div
                      key={menu.menu_id}
                      className={`flex flex-col items-center mb-4 p-2 rounded shadow cursor-pointer w-full ${menu.menu_status === 1
                        ? "bg-white hover:bg-gray-200"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}
                      onClick={() => {
                        if (menu.menu_status === 1) {
                          handleAddToCart(tableId, menu);
                        }
                      }}
                    >
                      <img
                        src={`${menu.menu_img}`}
                        alt={menu.menu_name || "Menu image"}
                        className="w-40 h-40 object-cover"
                      />
                      <div className="flex justify-between w-full">
                        <span>{menu.menu_name}</span>
                        <span>{menu.price} บาท</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">ไม่มีเมนูในหมวดหมู่นี้</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">ตะกร้าของฉัน</h3>
            <ul className="space-y-2">
              {groupedCarts.length > 0 ? (
                groupedCarts.map((cartItem, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow"
                  >
                    <div className="flex items-center text-gray-700 font-medium">
                      <img
                        src={`${cartItem.menu_img}`}
                        alt={cartItem.menu_name || "Menu image"}
                        className="w-10 h-10 object-cover mr-3"
                      />
                      <div>
                        <span>
                          {cartItem.menu_name} x {cartItem.qty} -{" "}
                        </span>
                        <span className="text-blue-500">
                          {cartItem.price || 0} บาท
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleAddMenuToCart(
                            cartItem.table_id,
                            cartItem.menu_id,
                            cartItem.price / cartItem.qty
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeCart(cartItem.cart_id[0])}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        -
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center">ไม่มีรายการในตะกร้า</p>
              )}
            </ul>

            <div className="flex justify-end border-t pt-4">
              <p className="text-lg font-semibold">
                ราคารวม:{" "}
                <span className="text-gray-800">
                  {carts.reduce(
                    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
                    0
                  )}{" "}
                  บาท
                </span>
              </p>
            </div>

            <button
              onClick={() => handleConfirmOrder(tableId)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              ยืนยันการสั่ง
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg font-semibold">
              กำลังดำเนินการ...
            </p>
          </div>
        </div>
      )}
      <div className="scrollbar-hide">
        {isQRCodeVisible ? (
          <div>
            <div className="bg-blue-700 w-full sticky top-0">
              <div className="flex justify-between">
                <p className="text-white font-semibold text-lg p-4">
                  RMUTI POS
                </p>
                <p className="text-white font-semibold text-lg p-4">
                  โต๊ะ {table.t_name}
                </p>
              </div>
            </div>
            <div style={{ paddingBottom: "56px" }}>{renderContent()}</div>
            <BottomNavigation
              value={selectedTab}
              onChange={(event, newValue) => setSelectedTab(newValue)}
              showLabels
              style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
            >
              <BottomNavigationAction
                label="รายการสั่งอาหาร"
                icon={<ListAltIcon />}
              />
              <BottomNavigationAction
                label="รายการอาหาร"
                icon={<RestaurantMenuIcon />}
              />
              <BottomNavigationAction
                label="ตะกร้า"
                icon={
                  <Badge
                    badgeContent={carts.length > 0 ? carts.length : null}
                    color="error"
                  >
                    <ShoppingCartIcon />
                  </Badge>
                }
              />
            </BottomNavigation>
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-700 font-semibold text-lg mb-6 text-center">
              ไม่สามารถใช้คิวอาร์โค้ดนี้ได้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;
