import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useNavigate } from "react-router-dom";

const PrintReceipt = ({ receiptData, receiptDetailData, currpage }) => {
  const receiptRef = useRef();
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);

    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const SaveAsPDFHandler = () => {
    const dom = receiptRef.current;
    toPng(dom)
      .then((dataUrl) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = dataUrl;
        img.onload = () => {
          // Calculate scaling if image is wider than target
          let scaleFactor = 1;

          // Calculate dimensions maintaining aspect ratio
          const scaledWidth = img.width * scaleFactor;
          const scaledHeight = img.height * scaleFactor;

          // Convert back to inches for PDF
          const pdfWidth = scaledWidth / 96;
          const pdfHeight = scaledHeight / 96; // Convert pixels to inches

          // Create PDF with calculated dimensions
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "in",
            format: [pdfWidth, pdfHeight],
          });

          const imgProps = pdf.getImageProperties(img);
          const imageType = imgProps.fileType;

          // Add image with calculated dimensions
          pdf.addImage(
            dataUrl,
            imageType,
            0, // x
            0, // y
            pdfWidth,
            pdfHeight
          );

          pdf.output("dataurlnewwindow");
          if (currpage === "order") {
            navigate(`/order`);
          }
        };
      })
      .catch((error) => {
        console.error("oops, something went wrong!", error);
      });
  };

  return (
    <div className="print-container">
      {/* Receipt content */}
      <div ref={receiptRef} className="receipt-content bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold">RMUTI POS</h1>
          <h2 className="text-lg font-bold mb-2">ใบเสร็จรับเงิน</h2>
        </div>

        <div className="text-sm space-y-1">
          <p>
            <strong>รหัสใบเสร็จ:</strong> {receiptData?.id || "-"}
          </p>
          <p>
            <strong>วันที่:</strong>{" "}
            {receiptData?.updated_at || receiptData?.created_at
              ? new Date(
                  receiptData?.updated_at || receiptData?.created_at
                ).toLocaleString("th-TH", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "-"}
          </p>
          <p>
            <strong>โต๊ะที่:</strong> {receiptData?.t_name || "-"}
          </p>
          <p>
            <strong>ชื่อพนักงาน:</strong>{" "}
            {`${receiptData?.f_name || ""} ${receiptData?.l_name || ""}`}
          </p>
          <div className="border-t border-gray-300 my-2"></div>
        </div>
        {receiptDetailData?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 w-1/3">รายการ</th>
                <th className="text-center py-1 w-1/4">จำนวน</th>
                <th className="text-right py-1 w-1/3">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {receiptDetailData.map((item, index) => (
                <tr key={index}>
                  <td className="py-1">{item.menu_name || "-"}</td>
                  <td className="text-center py-1">{item.qty || 0}</td>
                  <td className="text-right py-1">
                    {(item.price || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300">
                <td className="py-1 text-left font-bold ">รวม:</td>
                <td className="py-1 text-center font-bold">
                  {receiptDetailData?.reduce(
                    (total, item) => total + (item.qty || 0),
                    0
                  )}{" "}
                  {/* คำนวณรวม qty */}
                </td>
                <td className="py-1 text-right font-bold">
                  {receiptData?.total_price || 0} บาท
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-center text-gray-500 my-4">ไม่มีรายการสินค้า</p>
        )}

        <div className="mt-2 text-sm">
          {receiptData?.promo_id != null && (
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="py-1 font-bold w-1/3">โปรโมชั่น:</td>
                  <td className="py-1 w-1/4"></td>
                  <td className="py-1 w-1/4 text-right">
                    {" "}
                    {receiptData?.promo_name || "-"}
                  </td>
                </tr>
                <tr className=" border-gray-300">
                  <td className="py-1 font-bold w-1/4">ส่วนลด:</td>
                  <td className="py-1 font-bold w-1/4"></td>
                  <td className="py-1 text-right w-1/3">
                    {receiptData?.discount || 0} บาท
                  </td>
                </tr>
                <tr className=" border-gray-300">
                  <td className="py-1 font-bold">ราคารวมสุทธิ:</td>
                  <td className="py-1 font-bold"></td>
                  <td className="py-1 text-right font-bold">
                    {receiptData?.final_price || 0} บาท
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {receiptData?.amount_paid != null && (
          <table className="w-full text-sm">
            <tbody>
              <tr className=" border-gray-300">
                <td className="py-1 font-bold w-1/4">เงินสด:</td>
                <td className="py-1 font-bold w-1/4"></td>
                <td className="py-1 text-right w-1/3">
                  {receiptData?.amount_paid || 0} บาท
                </td>
              </tr>
              <tr className=" border-gray-300">
                <td className="py-1 font-bold">เงินทอน:</td>
                <td className="py-1 font-bold"></td>
                <td className="py-1 text-right">
                  {receiptData?.change_amount || 0} บาท
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="text-center mt-4 text-sm">
          <p>ขอบคุณที่ใช้บริการ</p>
        </div>
      </div>

      <div className="text-center mt-4 no-print">
        <button
          onClick={SaveAsPDFHandler}
          disabled={isPrinting}
          className={`px-6 py-2 rounded ${
            isPrinting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 text-white hover:bg-blue-800"
          }`}
        >
          {isPrinting ? "กำลังพิมพ์..." : "พิมพ์ใบเสร็จ"}
        </button>
        {/* <button
          onClick={SaveAsPDFHandler}
          className="px-6 py-2 rounded bg-green-700 text-white hover:bg-green-800 mt-4"
        >
          บันทึกเป็น PDF
        </button> */}
      </div>

      {/* CSS Styles */}
      <style jsx="true">{`
        @media screen {
          .receipt-content {
            width: 80mm;
            margin: 0 auto;
            padding: 0 4px;
            max-height: calc(80vh - 20px);
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .receipt-content::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintReceipt;
