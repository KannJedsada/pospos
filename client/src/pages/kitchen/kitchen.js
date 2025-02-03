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

      // const generateBill = (groupedByTable) => {
      //   const iframe = document.createElement("iframe");
      //   iframe.style.position = "absolute";
      //   iframe.style.top = "-10000px";
      //   iframe.style.left = "-10000px";
        
      //   document.body.appendChild(iframe);
        
      //   const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      //   iframeDoc.open();
      
      //   // Loop ผ่านทุกโต๊ะใน groupedByTable
      //   Object.entries(groupedByTable).forEach(([tableName, menu], index) => {
      //     // ถ้าไม่ใช่โต๊ะแรก ให้เพิ่มการตัดหน้าก่อน (สร้างหน้าใหม่)
      //     if (index > 0) {
      //       iframeDoc.write("<div style='page-break-before: always'></div>");
      //     }
      
      //     // เขียนข้อมูลในเอกสาร
      //     iframeDoc.write(`
      //       <html>
      //         <head>
      //           <style>
      //             @page {
      //               size: 80mm 40mm;
      //               margin: 0;
      //             }
      //             @media print {
      //               html, body {
      //                 margin: 0;
      //                 padding: 0;
      //                 width: 80mm;
      //                 height: 30mm;
      //                 overflow: hidden;
      //               }
      //               body * {
      //                 visibility: hidden;
      //               }
      //               .receipt, .receipt * {
      //                 visibility: visible;
      //               }
      //               .receipt {
      //                 position: absolute;
      //                 top: 30;
      //                 left: 0;
      //                 width: 80mm;
      //                 height: 30mm;
      //                 padding: 4px;
      //                 font-family: Arial, sans-serif;
      //               }
      //               .title {
      //                 font-size: 16px;
      //                 margin: 4px 0;
      //                 text-align: center;
      //               }
      //               .tName {
      //                 font-size: 14px;
      //                 margin: 4px;
      //               }
      //               p {
      //                 font-size: 14px;
      //               }
      //             }
      //           </style>
      //         </head>
      //         <body>
      //           <div class="receipt">
      //             <h1 class="title">RMUTI POS</h1>
      //             <h2 class="tName">โต๊ะ: ${tableName}</h2>
      //             <p class="menu">
      //               ${Object.entries(menu).map(([menuName, qty]) => `${menuName} X ${qty} จำนวน`).join('<br />')}
      //             </p>
      //           </div>
      //         </body>
      //       </html>
      //     `);
      //   });
      
      //   // หลังจาก loop เสร็จเรียบร้อยแล้วปิด document
      //   iframeDoc.close();
      
      //   // ให้เวลานิดหน่อยก่อนที่จะเรียก print
      //   setTimeout(() => {
      //     iframe.contentWindow.focus();
      //     iframe.contentWindow.print();
      //     document.body.removeChild(iframe);
      //   }, 500);
      // };
      // if (newStatus === 3) {
      //   const groupedByTable = ordersToUpdate.reduce((acc, order) => {
      //     const tableName = order.t_name;
      //     const menuName = order.menu_name;
      //     const qty = order.qty;

      //     if (!acc[tableName]) {
      //       acc[tableName] = {};
      //     }

      //     if (!acc[tableName][menuName]) {
      //       acc[tableName][menuName] = 0;
      //     }

      //     acc[tableName][menuName] += Number(qty);

      //     return acc;
      //   }, {});

      //   console.log(groupedByTable);
      //   generateBill(groupedByTable);
      // }

      // ส่งคำขอ PUT สำหรับออร์เดอร์ที่กรองมา
      await Promise.all(
        ordersToUpdate.map((order) =>
          axios.put("/api/order/change_dish", {
            order_id: order.id,
            new_status: newStatus,
          })
        )
      );

      // อัปเดตข้อมูลใหม่
      fetchOrderDetail();
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
