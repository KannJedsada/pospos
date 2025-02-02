import React, { useEffect, useState } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import socket from "../../utils/socket";

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
  const updateMenuStatus = async (menuName, newStatus, menu) => {
    try {
      // กรองเฉพาะออร์เดอร์ที่ต้องการเปลี่ยนสถานะ
      const ordersToUpdate = orderDetail.filter((order) => {
        if (newStatus === 2) {
          // จาก "รอคิว" (สถานะ 1) ไป "กำลังทำ" (สถานะ 2)
          return order.menu_name === menuName && order.dish_status === 1;
        }
        if (newStatus === 3) {
          // // จาก "รอคิว" (สถานะ 1) หรือ "กำลังทำ" (สถานะ 2) ไป "จัดเสิร์ฟ" (สถานะ 3)
          // console.log(menu);
          return order.menu_name === menuName && order.dish_status === 2;
        }
        return false; // ถ้าสถานะใหม่ไม่ตรงกับกรณีที่กล่าวถึง
      });

      if (ordersToUpdate.length === 0) {
        alert("ไม่มีออร์เดอร์ที่สามารถเปลี่ยนสถานะได้");
        return;
      }

      // ส่งคำขอ PUT สำหรับออร์เดอร์ที่กรองมา
      if (ordersToUpdate.menu_status === 2) {
        console.log(ordersToUpdate);
      }
      // await Promise.all(
      //   ordersToUpdate.map((order) =>
      //     axios.put("/api/order/change_dish", {
      //       order_id: order.id,
      //       new_status: newStatus,
      //     })
      //   )
      // );

      // อัปเดตข้อมูลใหม่
      fetchOrderDetail();
    } catch (error) {
      console.error("Error updating menu status:", error.message);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะเมนู");
    }
  };

  const groupedByMenu = (orderDetail || [])
    .reduce((acc, curr) => {
      // ตรวจสอบว่ามีรายการ menu_name และ dish_status นี้อยู่ใน acc แล้วหรือไม่
      const existingGroup = acc.find(
        (group) =>
          group.menu_name === curr.menu_name &&
          group.dish_status === curr.dish_status
      );

      if (existingGroup) {
        // ตรวจหาว่าใน orders มี t_name เดียวกันหรือไม่
        const existingOrder = existingGroup.orders.find(
          (order) => order.t_name === curr.t_name
        );

        if (existingOrder) {
          // ถ้าพบ t_name เดียวกัน เพิ่มจำนวน qty
          existingOrder.qty += curr.qty;
        } else {
          // ถ้า t_name ไม่ตรงกัน เพิ่มเป็น order ใหม่ในกลุ่มเดิม
          existingGroup.orders.push({ ...curr });
        }
      } else {
        // ถ้ายังไม่มี menu_name และ dish_status นี้ใน acc ให้สร้างกลุ่มใหม่
        acc.push({
          menu_name: curr.menu_name,
          dish_status: curr.dish_status,
          orders: [{ ...curr }],
        });
      }

      return acc;
    }, [])
    .reverse();

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
            {groupedByMenu.map((menu, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    เมนู: {menu.menu_name}
                  </h2>

                  <div className="space-x-4">
                    {/* ปุ่มรวมสถานะสำหรับทั้งเมนู */}
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

                {/* รายการโต๊ะที่สั่งเมนูนี้ */}
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
                        {/* สถานะแต่ละโต๊ะ */}
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
      </div>
    </div>
  );
}

export default Kitchen;
