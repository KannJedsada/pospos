import React, { useEffect, useState } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import { jsPDF } from "jspdf";

function Kitchen() {
  const [orderDetail, setOrderDetail] = useState([]);

  // ฟังก์ชันดึงข้อมูลคำสั่งอาหาร
  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`/api/order/ordered`);
      const filteredOrders = res.data.data.filter(
        (order) =>
          (order.dish_status === 1 || order.dish_status === 2) &&
          order.typename !== "เครื่องดื่ม"
      );
      setOrderDetail(filteredOrders);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะของเมนูทั้งหมด
  const updateMenuStatus = async (menuName, newStatus, tname) => {
    console.log(`Updating status for: ${menuName}, Status: ${newStatus}, Table: ${tname}`);

    try {
      // กรองเฉพาะออร์เดอร์ที่ต้องการเปลี่ยนสถานะและตรงกับโต๊ะ
      const ordersToUpdate = orderDetail.filter((order) => {
        const isSameMenu = order.menu_name === menuName;
        const isSameTable = order.t_name === tname;

        if (newStatus === 2) {
          // เปลี่ยนจาก "รอคิว" (1) เป็น "กำลังทำ" (2)
          return isSameMenu && isSameTable && order.dish_status === 1;
        }

        if (newStatus === 3) {
          // เปลี่ยนจาก "กำลังทำ" (2) เป็น "จัดเสิร์ฟ" (3)
          return isSameMenu && isSameTable && order.dish_status === 2;
        }

        return false; // กรณีที่ไม่ตรงกับสถานะที่ต้องการเปลี่ยน
      });

      // ถ้าไม่มีออร์เดอร์ที่สามารถเปลี่ยนสถานะได้
      if (ordersToUpdate.length === 0) {
        alert("ไม่มีออร์เดอร์ที่สามารถเปลี่ยนสถานะได้");
        return;
      }

      console.log(ordersToUpdate);

      // ส่งคำขอ PUT สำหรับออร์เดอร์ที่ต้องการเปลี่ยนสถานะ
      // await Promise.all(
      //   ordersToUpdate.map((order) =>
      //     axios.put("/api/order/change_dish", {
      //       order_id: order.id,
      //       new_status: newStatus,
      //     })
      //   )
      // );

      // เมื่ออัปเดตเสร็จ โหลดข้อมูลใหม่
      fetchOrderDetail();
      alert("อัปเดตสถานะสำเร็จ!");
    } catch (error) {
      console.error("Error updating menu status:", error.message);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะเมนู");
    }
  };

  const groupedByMenu = (orderDetail || [])
    .reduce((acc, curr) => {
      // ตรวจสอบว่ามีโต๊ะนี้ (t_name) อยู่ใน acc หรือยัง
      let tableGroup = acc.find((group) => group.t_name === curr.t_name);

      if (!tableGroup) {
        // ถ้าไม่มี ให้สร้างกลุ่มใหม่สำหรับโต๊ะนี้
        tableGroup = {
          t_name: curr.t_name,
          menus: [],
        };
        acc.push(tableGroup);
      }

      // ตรวจสอบว่ามีเมนูนี้ (menu_name) และสถานะ (dish_status) ในโต๊ะนี้หรือยัง
      let menuGroup = tableGroup.menus.find(
        (menu) =>
          menu.menu_name === curr.menu_name &&
          menu.dish_status === curr.dish_status
      );

      if (menuGroup) {
        // ถ้ามีเมนูนี้แล้ว ให้เพิ่ม qty
        menuGroup.qty += curr.qty;
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเมนูใหม่
        tableGroup.menus.push({
          menu_name: curr.menu_name,
          dish_status: curr.dish_status,
          qty: curr.qty,
        });
      }

      return acc;
    }, [])
    .reverse();

  console.log(groupedByMenu);


  // const groupedByMenu = (orderDetail || [])
  //   .reduce((acc, curr) => {
  //     // ตรวจสอบว่ามีรายการ menu_name และ dish_status นี้อยู่ใน acc แล้วหรือไม่
  //     const existingGroup = acc.find(
  //       (group) =>
  //         group.menu_name === curr.menu_name &&
  //         group.dish_status === curr.dish_status
  //     );

  //     if (existingGroup) {
  //       // ตรวจหาว่าใน orders มี t_name เดียวกันหรือไม่
  //       const existingOrder = existingGroup.orders.find(
  //         (order) => order.t_name === curr.t_name
  //       );

  //       if (existingOrder) {
  //         // ถ้าพบ t_name เดียวกัน เพิ่มจำนวน qty
  //         existingOrder.qty += curr.qty;
  //       } else {
  //         // ถ้า t_name ไม่ตรงกัน เพิ่มเป็น order ใหม่ในกลุ่มเดิม
  //         existingGroup.orders.push({ ...curr });
  //       }
  //     } else {
  //       // ถ้ายังไม่มี menu_name และ dish_status นี้ใน acc ให้สร้างกลุ่มใหม่
  //       acc.push({
  //         menu_name: curr.menu_name,
  //         dish_status: curr.dish_status,
  //         orders: [{ ...curr }],
  //       });
  //     }

  //     return acc;
  //   }, [])
  //   .reverse();

  useEffect(() => {
    fetchOrderDetail();

    const handleOrderUpdate = () => {
      fetchOrderDetail();
    };

    socket.on("orderUpdated", handleOrderUpdate);

    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          รายการคำสั่งอาหาร
        </h1>

        {groupedByMenu.length > 0 ? (
          <div className="space-y-6">
            {groupedByMenu.map((table, tableIndex) => {

              return (
                <div key={tableIndex} className="p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    โต๊ะ: {table.t_name}
                  </h2>

                  {/* ตรวจสอบว่า menus เป็นอาร์เรย์ก่อนใช้ map */}
                  {Array.isArray(table.menus) &&
                    table.menus.map((menu, menuIndex) => {

                      return (
                        <div
                          key={menuIndex}
                          className="mb-6 p-4 bg-gray-100 rounded-md shadow-sm"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-700">
                              เมนู: {menu.menu_name}
                            </h3>

                            <div className="space-x-4">
                              <button
                                className={`px-4 py-2 text-white rounded-lg shadow-md ${menu.dish_status === 2
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-orange-500 hover:bg-orange-600"
                                  }`}
                                onClick={() =>
                                  updateMenuStatus(menu.menu_name, 2, table.t_name)
                                }
                                disabled={menu.dish_status === 2}
                              >
                                กำลังทำ
                              </button>

                              <button
                                className={`px-4 py-2 text-white rounded-lg shadow-md ${menu.dish_status === 1
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 hover:bg-blue-600"
                                  }`}
                                onClick={() =>
                                  updateMenuStatus(menu.menu_name, 3, table.t_name)
                                }
                                disabled={menu.dish_status === 3}
                              >
                                จัดเสิร์ฟ
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-2">
                            <span className="font-semibold">จำนวนทั้งหมด:</span>{" "}
                            {menu.qty} {menu.menu_type !== 5 ? "จาน" : "แก้ว"}
                          </p>

                          {/* ตรวจสอบว่า orders เป็นอาร์เรย์ก่อนใช้ map */}
                          <div className="space-y-2">
                            {Array.isArray(menu.orders) &&
                              menu.orders.map((order, orderIndex) => (
                                <div
                                  key={orderIndex}
                                  className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm"
                                >
                                  <div>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-semibold">เวลา:</span>{" "}
                                      {new Date(order.time_ordered).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      })}{" "}
                                      น.
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-semibold">จำนวน:</span>{" "}
                                      {order.qty} {order.menu_type !== 5 ? "จาน" : "แก้ว"}
                                    </p>
                                  </div>

                                  <span className="text-sm font-medium text-gray-700">
                                    {order.dish_status === 1
                                      ? "รอคิว"
                                      : order.dish_status === 2
                                        ? "กำลังทำ"
                                        : "จัดเสิร์ฟ"}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-8">ยังไม่มีคำสั่ง</p>
        )}


        {/*  
        {groupedByMenu.length > 0 ? (
          <div className="space-y-6">
            {groupedByMenu.map((menu, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    เมนู: {menu.menu_name}
                  </h2>

                  <div className="space-x-4">
                    <button
                      className={`px-4 py-2 text-white rounded-lg shadow-md ${menu.orders.some((order) => order.dish_status === 2)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                        }`}
                      onClick={() => updateMenuStatus(menu.menu_name, 2)}
                      disabled={menu.orders.some(
                        (order) => order.dish_status === 2
                      )}
                    >
                      กำลังทำ
                    </button>

                    <button
                      className={`px-4 py-2 text-white rounded-lg shadow-md ${menu.orders.some((order) => order.dish_status === 1)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      onClick={() => updateMenuStatus(menu.menu_name, 3, menu.orders)}
                      disabled={menu.orders.some(
                        (order) => order.dish_status === 1
                      )}
                    >
                      จัดเสิร์ฟ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {menu.orders.map((order, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-md shadow-sm"
                    >
                      <div>
                        <p className="text-gray-700 text-sm">
                          <span className="font-semibold">เวลา:</span>{" "}
                          {new Date(order.time_ordered).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          น.
                        </p>

                        <p className="text-gray-700 text-sm">
                          <span className="font-semibold">โต๊ะที่:</span>{" "}
                          {order.t_name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-semibold">จำนวน:</span>{" "}
                          {order.qty} {order.menu_type !== 5 ? "จาน" : "แก้ว"}
                        </p>
                      </div>

                      <div>
                  
                        <span className="text-sm font-medium text-gray-700">
                        {order.dish_status === 1
                            ? "รอคิว"
                            : order.dish_status === 2
                              ? "กำลังทำ"
                              : "จัดเสิร์ฟ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-8">ยังไม่มีคำสั่ง</p>
        )}
        */}
      </div>
    </div>
  );
}

export default Kitchen;
