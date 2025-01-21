import React, { useContext, useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../components/auth/authcontext";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import PrintReceipt from "../../components/printReceipt";
import ReactToPdf from "react-to-pdf";
import Swal from "sweetalert2";

function Receipt() {
  const { authData } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { table_id } = location.state || {};
  const [back, setBack] = useState();
  const [orders, setOrders] = useState([]);
  const [promotion, setPromotion] = useState([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [emp, setEmp] = useState([]);
  const [table, setTable] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetail, setReceiptDetail] = useState([]);
  const [receipt, setReceipt] = useState([]);
  const [formData, setFormData] = useState({
    table_id: table_id,
    id_card: authData.id_card,
    total_price: 0,
    discount: 0,
    final_price: 0,
    promo_id: null,
    order_id: [],
  });
  const [payment, setPayment] = useState({
    id: "",
    amount_paid: "",
    change_amount: "",
    table_id: table_id,
    order_id: [],
  });

  const handleBack = () => {
    navigate(`/order`);
  };

  const fetchReceiptDetail = async (table_id) => {
    try {
      const res = await axios.get(
        `/api/receipt/get-receipt-detail/${table_id}`
      );
      setReceiptDetail(res.data.data);
    } catch (error) {
      console.error("Error fetching receipt details:", error);
    }
  };

  const fetchReceipt = async (table_id) => {
    try {
      const res = await axios.get(`/api/receipt/get-receipt/${table_id}`);
      setReceipt(res.data.data);
    } catch (error) {
      console.error("Error fetching receipt:", error);
    }
  };

  const fetchTable = async () => {
    const res = await axios.get(`/api/table/table/${table_id}`);
    setTable(res.data.data);
  };

  const fetchEmpData = async () => {
    const res = await axios.get(`/api/emp/${authData.id_card}`, {
      headers: { Authorization: `Bearer ${authData.token}` },
    });
    setEmp(res.data.data);
  };

  const fetchOrders = async (table_id) => {
    try {
      const res = await axios.get(`/api/order/orderdetail/${table_id}`);
      const orderData = res.data.data;
      setOrders(orderData);
      const total = orderData.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );
      setTotalPrice(total);
      setFinalPrice(total);
    } catch (error) {
      console.error(`Error fetching order`, error);
    }
  };

  const fetchPromotion = async () => {
    try {
      const res = await axios.get(`/api/promotion/get-promo`);
      setPromotion(res.data.data);
    } catch (error) {
      console.error(`Error fetching promotion`, error);
    }
  };

  const discount = (e) => {
    const selectedPromoId = e.target.value;

    // อัปเดต promo_id ใน formData
    setFormData((prevData) => ({
      ...prevData,
      total_price: totalPrice,
      promo_id: selectedPromoId,
    }));

    // ค้นหาโปรโมชั่นที่เลือก
    const selectedPromo = promotion.find(
      (promo) => promo.id === parseInt(selectedPromoId)
    );

    const currentTotalPrice = parseFloat(totalPrice) || 0;

    if (selectedPromo) {
      // คำนวณส่วนลด
      const discountAmount =
        selectedPromo.promo_type === "percentage"
          ? (currentTotalPrice * selectedPromo.promo_discount) / 100
          : selectedPromo.promo_discount;

      let finalPrice = currentTotalPrice - discountAmount;

      setFinalPrice(finalPrice);
      setFormData((prevData) => ({
        ...prevData,
        discount: discountAmount.toFixed(2),
        final_price: finalPrice.toFixed(2),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        discount: "0.00",
        final_price: currentTotalPrice.toFixed(2),
      }));
      setFinalPrice(currentTotalPrice);
    }
  };

  const handlePayment = async () => {
    const change = amountPaid - parseFloat(receipt?.final_price || totalPrice);
    const allOrderIds = [...new Set(orders.flatMap((order) => order.order_id))];

    const updatedPayment = {
      ...payment,
      id: receipt.id,
      amount_paid: amountPaid,
      change_amount: change,
      order_id: allOrderIds,
    };

    if (amountPaid < receipt.final_price) {
      Swal.fire("Error", "ยอดเงินชำระไม่เพียงพอ", "error");
      return;
    }

    try {
      const res = await axios.put(
        `/api/receipt/payment-receipt/${receipt.id}`,
        updatedPayment
      );

      const resdetail = await axios.get(
        `/api/receipt/get-rept-detail/${receipt.id}`
      );
      const resReceipt = await axios.get(
        `/api/receipt/get-rept-id/${receipt.id}`
      );
      setReceipt(resReceipt.data.data);
      setReceiptDetail(resdetail.data.data);
      setBack("order");
      setShowReceipt(true);
      Swal.fire({
        icon: "success",
        title: `ชำระสำเร็จ เงินทอน ${change.toFixed(2)}`,
      });
      // navigate(`/order`);
    } catch (error) {
      console.error("Error during payment:", error);
      alert("เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง!");
    }
  };

  const groupedOrders = (orders || []).reduce((acc, curr) => {
    if (!curr.menu_id || !curr.id) {
      console.warn("Missing data in order:", curr);
      return acc;
    }

    const existingItem = acc.find((item) => item.menu_id === curr.menu_id);

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

  const groupedReceiptDetail = (receiptDetail || []).reduce((acc, curr) => {
    const existingItem = acc.find((item) => item.menu_id === curr.menu_id);

    let total_price = curr.price;
    if (existingItem) {
      existingItem.qty += curr.qty;
      existingItem.price += curr.price;
    } else {
      acc.push({
        ...curr,
        total_price
      });
    }

    return acc;
  }, []);

  const handlePrintReceipt = async () => {
    const allOrderIds = [...new Set(orders.flatMap((order) => order.order_id))];

    const updatedFormData = {
      ...formData,
      total_price: total_price,
      order_id: allOrderIds,
      final_price: finalPrice || total_price,
    };
    setFormData((prevData) => ({
      ...prevData,
      total_price: total_price,
      final_price: finalPrice || total_price,
    }));

    if (receiptDetail.length > 0) {
      setShowReceipt(true);
    } else {
      try {
        const res = await axios.post(
          `/api/receipt/create-receipt`,
          updatedFormData
        );
        fetchReceiptDetail(updatedFormData.table_id);
        fetchReceipt(updatedFormData.table_id);
        setShowReceipt(true);
      } catch (error) {
        console.error("Error creating receipt:", error);
      }
    }
  };

  useEffect(() => {
    fetchPromotion();
    fetchEmpData();
    fetchTable();
    if (table_id) {
      fetchReceipt(table_id);
      fetchOrders(table_id);
      fetchReceiptDetail(table_id);
    } else {
      navigate(-1);
    }
  }, [table_id]);

  useEffect(() => {
    if (receiptDetail.length > 0) {
      const detail = receiptDetail[0];
      setFormData((prevData) => ({
        ...prevData,
        total_price: detail.total_price,
        discount: detail.discount,
        promo_id: detail.promo_id,
        final_price: detail?.final_price || detail.total_price,
      }));
      setFinalPrice(detail?.final_price || detail.total_price);
    }
  }, [receiptDetail]);

  return (
    <div className="flex p-6 h-screen">
      {/* ฝั่งซ้าย: แสดงรายการที่สั่ง */}
      <div className="w-1/2 p-4 bg-gray-100 rounded shadow flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center mb-4">
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              <ArrowBackIosNewOutlinedIcon />
            </button>

            <h2 className="text-xl font-semibold ml-4">
              รายการอาหาร โต๊ะ {table.t_name}
            </h2>
          </div>

          <div className="space-y-4" value={groupedOrders.order_ids}>
            {groupedOrders.length > 0 ? (
              groupedOrders.map((item) => (
                <div
                  key={item.menu_id}
                  className="flex justify-between items-center border-b pb-2 overflow-auto scrollbar-hide flex-1"
                >
                  <div>
                    <p>{item.menu_name}</p>
                    <span>
                      {item.qty} x {(item.price / item.qty).toFixed(2)}
                    </span>
                  </div>
                  <span>{item.price.toFixed(2)} บาท</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">ไม่มีรายการสั่งอาหาร</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-4">
          {/* แสดงยอดรวมก่อนโปรโมชัน */}
          <h3 className="text-lg font-semibold" value={total_price}>
            ยอดรวมอาหารทั้งหมด: {total_price.toFixed(2)} บาท
          </h3>

          {/* เลือกโปรโมชัน */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="promotion"
              className="text-sm font-medium text-gray-700"
            >
              เลือกโปรโมชัน
            </label>
            <select
              id="promotion"
              className={`className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700" ${
                receiptDetail.length > 0 ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              onChange={discount}
              value={formData.promo_id || ""}
              disabled={receiptDetail.length > 0}
            >
              <option value="">เลือกโปรโมชัน</option>
              {promotion.map((promo) => (
                <option key={promo.id} value={promo.id}>
                  {promo.promo_name} ส่วนลด {promo.promo_discount}{" "}
                  {promo.promo_type === "percentage" ? "%" : "บาท"}
                </option>
              ))}
            </select>
          </div>

          {/* แสดงยอดรวมหลังโปรโมชัน */}
          <h3 className="text-lg font-semibold">
            ยอดรวม (หลังโปรโมชัน): {Math.max(finalPrice, 0).toFixed(2)} บาท
          </h3>

          {/* ปุ่มพิมพ์ใบเสร็จ */}
          <button
            onClick={handlePrintReceipt}
            className={`px-4 py-2 mt-2 rounded w-full bg-blue-500 text-white hover:bg-blue-600`}
            // disabled={receiptDetail.length > 0}
          >
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>

      {/* ฝั่งขวา: กดเงินที่ลูกค้าชำระ */}
      <div className="w-1/2 p-4 bg-white rounded shadow ml-4 flex flex-col justify-between h-full">
        <h2 className="text-xl font-semibold mb-4">ชำระเงิน</h2>
        <div className="flex flex-col items-center">
          {/* Display จำนวนเงิน */}
          <div className="flex items-center justify-between w-full border p-2 rounded mb-4 bg-gray-100">
            <span className="text-2xl">฿</span>
            <span className="text-3xl font-bold">{amountPaid}</span>
          </div>

          {/* ปุ่มชำระเงินด่วน */}
          <div className="grid grid-cols-3 gap-2 w-full mb-4">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setAmountPaid(amountPaid + amount)}
                className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* ปุ่มตัวเลข */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {[...Array(9).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() =>
                  setAmountPaid(parseFloat(`${amountPaid}${num + 1}`))
                }
                className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={() => setAmountPaid(parseFloat(`${amountPaid}00`))}
              className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
            >
              00
            </button>
            <button
              onClick={() => setAmountPaid(parseFloat(`${amountPaid}0`))}
              className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
            >
              0
            </button>
            <button
              onClick={() => setAmountPaid(parseFloat(`${amountPaid}.`))}
              className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
            >
              .
            </button>
          </div>

          {/* ปุ่มลบ และ ล้าง */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <button
              onClick={() => setAmountPaid(Math.floor(amountPaid / 10))}
              className="bg-gray-200 text-lg font-medium py-2 rounded hover:bg-gray-300"
            >
              &lt;
            </button>
            <button
              onClick={() => setAmountPaid(0)}
              className="bg-red-500 text-white text-lg font-medium py-2 rounded hover:bg-red-600"
            >
              C
            </button>
          </div>
        </div>

        {/* ปุ่มชำระเงิน */}
        <button
          onClick={handlePayment}
          className={`text-lg font-medium py-3 rounded mt-4 ${
            receipt
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!receipt}
        >
          ชำระเงินสด
        </button>
      </div>

      {showReceipt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-100">
          <div className="relative bg-white rounded shadow-lg p-4 max-w-md">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <PrintReceipt
              receiptData={receipt}
              receiptDetailData={groupedReceiptDetail}
              currpage={"receipt"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Receipt;
