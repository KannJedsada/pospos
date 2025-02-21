import React, { useEffect, useState } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import Modal from "react-modal";
import QRCode from "qrcode.react";
import QRCode1 from "qrcode";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import socket from "../../utils/socket";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

function Order() {
  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [dataByTable, setDatabyTable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingQR, setIsCreatingQR] = useState(false);
  const [orderDetail, setOrderDetail] = useState([]);
  const [table, setTable] = useState([]);
  const [tableStatus, setTableStatus] = useState([]);
  const [selectedTableStatus, setSelectedTableStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receipt, setReceipt] = useState([]);
  const navigate = useNavigate();

  function formatThaiDate(dateString) {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy HH:mm:ss", { locale: th });
  }

  const fetchTableStatus = async () => {
    const res = await axios.get(`/api/table/status`);
    setTableStatus(res.data.data);
  };

  const fetchTable = async () => {
    try {
      const res = await axios.get(`/api/table/tables`);
      setTables(res.data.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchTableById = async (table_id) => {
    try {
      const res = await axios.get(`/api/table/table/${table_id}`);
      setTable(res.data.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchReceipt = async (table_id) => {
    const res = await axios.get(`/api/receipt/get-receipt-detail/${table_id}`);
    setReceipt(res.data.data);
  };

  const fetchDataByTable = async (table_id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/qr/get_by_table/${table_id}`);
      setDatabyTable(res.data.data);
    } catch (error) {
      console.error("Error fetching Data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetail = async (table_id) => {
    try {
      const res = await axios.get(`/api/order/orderdetail/${table_id}`);
      console.log(res.data.data);
      setOrderDetail(res.data.data);
    } catch (error) {
      console.error("Error fetching Data:", error);
    }
  };

  const createQRCode = async (table_id, table_name) => {
    try {
      setIsCreatingQR(true);
      const uniqueId = uuidv4();
      const qr_url = `${process.env.REACT_APP_NGROK_URL_3000}/table/${table_name}?id=${uniqueId}`;
      const res = await axios.post(`/api/qr/new_qr`, {
        qr_url,
        table_id: table_id,
      });
      setDatabyTable(res.data.data);
    } catch (error) {
      console.error("Error creating QR Code:", error);
    } finally {
      setIsCreatingQR(false);
    }
  };

  useEffect(() => {
    fetchTable();
    fetchTableStatus();
    const handleTableUpdate = (updateTable) => {
      fetchTable();
    };

    socket.on("tableUpdated", handleTableUpdate);

    return () => {
      socket.off("tableUpdated", handleTableUpdate);
    };
  }, []);

  const openModal = async (table) => {
    await fetchTableById(table);
    setSelectedTable(table);
    await fetchDataByTable(table);
    await fetchOrderDetail(table);
    await fetchReceipt(table);
    setIsModalOpen(true);
    const handleOrderUpdate = (updatedOrder) => {
      fetchOrderDetail(table);
    };

    socket.on("orderUpdated", handleOrderUpdate);

    return () => {
      socket.off("orderUpdated", handleOrderUpdate);
    };
  };

  const closeModal = () => {
    setSelectedTable(null);
    setIsModalOpen(false);
  };

  const openModalCancel = async (orderidDetail) => {
    setSelectedOrder(orderidDetail);
    setIsModalOpen1(true);
  };

  const closeModalCancel = async () => {
    setIsModalOpen1(false);
    setSelectedOrder(null);
  };

  const handleConfirmCancelorder = (orderId, qty) => {
    Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "คุณต้องการยกเลิกออร์เดอร์นี้ใช่หรือไม่?",
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

  const handleCancelOrder = async (orderId, qty) => {
    const new_qty = orderId.length - qty;
    for (let i = 0; i < new_qty; i++) {
      handleDecreaseQty(orderId[i]);
    }

    setIsModalOpen1(false);
  };

  const handleOrder = (table_id) => {
    if (table_id) {
      navigate("/ordered", { state: { table_id } });
    }
  };

  const handleBill = (table_id) => {
    if (table_id) {
      navigate("/receipt", { state: { table_id } });
    }
  };

  const handleConfirmDecrease = (orderId) => {
    Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "คุณต้องการยกเลิกออร์เดอร์นี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDecreaseQty(orderId);
      }
    });
  };

  const handleDecreaseQty = async (orderDetailId) => {
    try {
      setIsLoading(true);
      const res = await axios.put(`/api/order/decreaseqty/${orderDetailId}`, {
        qty: 1,
      });
    } catch (error) {
      console.error("Error decreasing order quantity:", error);
      alert("เกิดข้อผิดพลาดในการลดจำนวน");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatusTable = async (table_id, status_id) => {
    try {
      await axios.put(`/api/table/change_status/${table_id}`, {
        status_id: status_id,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const groupedOrders = (orderDetail || []).reduce((acc, curr) => {
    if (!curr.menu_id || !curr.id) {
      console.warn("Missing data in order:", curr);
      return acc;
    }

    const existingItem = acc.find(
      (item) =>
        item.menu_id === curr.menu_id && item.dish_status === curr.dish_status
    );

    if (existingItem) {
      existingItem.qty += curr.qty;
      existingItem.price += curr.price;
      existingItem.order_ids = [...(existingItem.order_ids || []), curr.id];
    } else {
      acc.push({
        ...curr,
        order_ids: [curr.id],
      });
    }
    return acc;
  }, []);

  const total_price = groupedOrders.reduce((sum, order) => {
    return sum + order.price;
  }, 0);

  const printQRCode = async (table, dataqr, date) => {
    try {
      const qrDataUrl = await QRCode1.toDataURL(dataqr);
      if (qrDataUrl) {
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.top = "-10000px";
        iframe.style.left = "-10000px";

        document.body.appendChild(iframe);

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <style>
                @page {
                  size: 80mm 90mm;
                  margin: 0;
                }
                @media print {
                  html, body {
                    margin: 0;
                    padding: 0;
                    width: 80mm;
                    height: 80mm;
                    overflow: hidden;
                  }
                  body * {
                    visibility: hidden;
                  }
                  .receipt, .receipt * {
                    visibility: visible;
                  }
                  .receipt {
                    position: absolute;
                    top: 30;
                    left: 0;
                    width: 80mm;
                    height: 80mm;
                    padding: 4px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                  }
                  .title {
                    font-size: 16px;
                    margin: 4px 0;
                  }
                  .timestamp {
                    font-size: 12px;
                    margin: 4px 0;
                  }
                  .qr-container {
                    display: flex;
                    justify-content: center;
                    margin: 4px 0;
                  }
                  .qr-code {
                    width: auto;
                    max-width: 60mm;
                    height: auto;
                  }
                  .footer {
                    font-size: 12px;
                    margin: 4px 0;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <h1 class="title">RMUTI POS</h1>
                <h2 class="title">โต๊ะ: ${table}</h2>
                <p class="timestamp">${formatThaiDate(date)}</p>
                <div class="qr-container">
                  <img src="${qrDataUrl}" class="qr-code" />
                </div>
                <p class="footer">คิวอาร์โค้ดสั่งอาหาร</p>
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        // ให้เวลา iframe โหลดเนื้อหา
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        }, 500); // รอ 500 มิลลิวินาที
      }
    } catch (error) {
      console.error("Error generating QR Code:", error);
    }
  };

  const closeQr = async (qrid) => {
    const res = await axios.put(`/api/qr/change_qr/${qrid}`);
    fetchDataByTable(selectedTable);
    fetchTable();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Menubar />
      <div className="p-4">
        <div className="flex space-x-4 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            <p className="text-gray-700">ว่าง</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-orange-500 rounded"></span>
            <p className="text-gray-700">ไม่ว่าง</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-gray-500 rounded"></span>
            <p className="text-gray-700">ไม่พร้อมใช้งาน</p>
          </div>
        </div>

        <div className="p-1 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-10">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => openModal(table.id)}
              className={`flex items-center text-white justify-center p-2 rounded shadow transition ${
                table.status_id === 1
                  ? "bg-gray-500 hover:bg-gray-600"
                  : table.status_id === 2
                  ? "bg-green-500  hover:bg-green-600"
                  : "bg-orange-500  hover:bg-orange-600"
              } w-full aspect-square text-4xl`}
            >
              โต๊ะ {table.t_name}
            </button>
          ))}

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            ariaHideApp={false}
          >
            <div
              className={`bg-white rounded-lg shadow-lg p-4 ${
                groupedOrders.length === 0 ? "w-[380px]" : "w-[900px]"
              } ${
                dataByTable ? "h-[600]" : "h-[300]"
              } overflow-hidden flex flex-col`}
            >
              <h2 className="text-xl font-semibold mb-4">
                โต๊ะ {table.t_name}
              </h2>
              {table.status_id === 1 ? (
                <div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs mx-auto">
                      <label
                        htmlFor="selectedTableStatus"
                        className="text-gray-800 font-medium mb-2 block"
                      >
                        เลือกสถานะโต๊ะ
                      </label>
                      <select
                        name="selectedTableStatus"
                        className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        onChange={(e) => setSelectedTableStatus(e.target.value)}
                        value={selectedTableStatus}
                      >
                        {tableStatus
                          .filter((status) => status.id !== 3)
                          .map((status) => (
                            <option
                              key={status.id}
                              value={status.id}
                              className="text-gray-700"
                            >
                              {status.status_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-4">
                    {/* ปุ่มบันทึก */}
                    <button
                      onClick={() => {
                        if (selectedTableStatus) {
                          handleUpdateStatusTable(
                            table.id,
                            selectedTableStatus
                          );
                        } else {
                          alert("กรุณาเลือกสถานะโต๊ะ");
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      บันทึก
                    </button>

                    {/* ปุ่มปิด */}
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-4 flex-1">
                  <div
                    className={`flex flex-col justify-between ${
                      groupedOrders.length > 0 ? `w-2/5` : `w-full`
                    }`}
                  >
                    {isLoading ? (
                      <p className="text-blue-500">กำลังโหลด...</p>
                    ) : (
                      <>
                        <div className="mb-4">
                          {dataByTable ? (
                            <div className="text-center">
                              <p>
                                {dataByTable.date_create
                                  ? formatThaiDate(dataByTable.date_create)
                                  : "ไม่พบวันที่"}
                              </p>
                              <div className="flex justify-center m-4">
                                <QRCode
                                  className="w-32 h-32"
                                  value={dataByTable.qr_url}
                                />
                              </div>
                              <button
                                onClick={() =>
                                  printQRCode(
                                    table.t_name,
                                    dataByTable.qr_url,
                                    dataByTable.date_create
                                  )
                                }
                                className="px-4 py-2 mt-4 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                              >
                                พิมพ์ QR Code
                              </button>
                              <button
                                onClick={() => closeQr(dataByTable.id)}
                                disabled={groupedOrders?.length > 0}
                                className={`ml-4 px-4 py-2 mt-4 ${
                                  groupedOrders.length > 0
                                    ? "bg-gray-500"
                                    : "bg-red-500 hover:bg-red-600"
                                } text-white rounded  transition`}
                              >
                                ปิด QR Code
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-gray-700 mb-2">
                                ไม่มี QR Code สำหรับโต๊ะนี้
                              </p>
                              <button
                                onClick={() =>
                                  createQRCode(table.id, table.t_name)
                                }
                                className={`px-4 py-2 ${
                                  receipt.length > 0
                                    ? "bg-gray-500"
                                    : "bg-blue-500 hover:bg-blue-600"
                                } text-white rounded  transition ${
                                  isCreatingQR
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isCreatingQR || receipt.length > 0}
                              >
                                {isCreatingQR
                                  ? "กำลังสร้าง..."
                                  : "สร้าง QR Code"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* ปุ่มการกระทำ */}
                        {receipt.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleBill(table.id)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            >
                              พิมพ์ใบเสร็จ
                            </button>
                            <button
                              onClick={closeModal}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                              ปิด
                            </button>
                          </div>
                        ) : dataByTable &&
                          Array.isArray(groupedOrders) &&
                          groupedOrders.length === 0 ? (
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleOrder(table.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              สั่งอาหาร
                            </button>
                            <button
                              onClick={closeModal}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                              ปิด
                            </button>
                          </div>
                        ) : Array.isArray(groupedOrders) &&
                          groupedOrders.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleOrder(table.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                              สั่งอาหาร
                            </button>
                            <button
                              onClick={() => handleBill(table.id)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            >
                              พิมพ์ใบเสร็จ
                            </button>
                            <button
                              onClick={closeModal}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                              ปิด
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                            ปิด
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* ขวา: รายการสั่งอาหาร */}
                  {groupedOrders.length > 0 ? (
                    <div className="p-2 bg-white rounded-lg shadow flex flex-col w-3/5 h-full">
                      {/* หัวข้อรายการสั่งอาหาร */}
                      <div className="text-gray-700 font-semibold text-lg mb-2">
                        รายการสั่งอาหาร
                      </div>

                      {/* พื้นที่เลื่อนสำหรับรายการ */}
                      <div className="overflow-y-auto scrollbar-hide max-h-[400px] flex-1">
                        {groupedOrders.map((order, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              order.dish_status === 1 && openModalCancel(order)
                            }
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md mb-1"
                          >
                            <div className="overflow-hidden max-w-xs">
                              <p className="text-gray-800 font-medium overflow-ellipsis overflow-hidden whitespace-nowrap">
                                {order.menu_name} x {order.qty}{" "}
                                {order.category_name.includes("แกง") ||
                                order.category_name.includes("ต้ม")
                                  ? "ถ้วย"
                                  : "จาน"}
                              </p>

                              <span>
                                {order.qty} x{" "}
                                {(order.price / order.qty).toFixed(2)} บาท
                              </span>
                              <p className="text-gray-600 overflow-ellipsis overflow-hidden whitespace-nowrap">
                                ราคา: {order.price} บาท | สถานะ:{" "}
                                {order.status_name}
                              </p>
                            </div>
                            <div>
                              {order.dish_status === 1 ? (
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      order.order_ids &&
                                      order.order_ids.length > 0
                                    ) {
                                      handleConfirmDecrease(order.order_ids[0]);
                                    } else {
                                      alert(
                                        "ไม่มีข้อมูล order_id สำหรับลดจำนวน"
                                      );
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
                        ))}
                      </div>

                      {/* ส่วนแสดงราคารวม */}
                      <div className="mt-6 text-right w-full max-w-xl sticky bottom-0 bg-white">
                        <p className="text-xl font-bold text-gray-800">
                          ราคารวม: {total_price} บาท
                        </p>
                      </div>

                      <Modal
                        isOpen={isModalOpen1}
                        onRequestClose={closeModalCancel}
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
                                  className={`m-4 px-1 py-1 ${
                                    selectedOrder.qty <= 0
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
                                    selectedOrder.qty >=
                                    selectedOrder.order_ids.length
                                  }
                                  className={`m-4 px-1 py-1 ${
                                    selectedOrder.qty >=
                                    selectedOrder.order_ids.length
                                      ? "bg-gray-300 text-gray-500 rounded "
                                      : "bg-green-500 text-white rounded hover:bg-green-600"
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

                              <button
                                onClick={closeModalCancel}
                                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                ปิด
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p>กำลังโหลดข้อมูล...</p>
                        )}
                      </Modal>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Order;
