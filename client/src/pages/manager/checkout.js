import React, { useRef, useState, useEffect, useContext } from "react";
import QrScanner from "qr-scanner";
import Menubar from "../../components/menuBar";
import AuthContext from "../../components/auth/authcontext";
import axios from "../../utils/axiosInstance";
import Swal from "sweetalert2";

const Checkout = () => {
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { authData } = useContext(AuthContext);

  const formatTimeToThai = (timeString) => {
    // สร้าง Date object จากเวลา UTC
    const utcDate = new Date(`1970-01-01T${timeString}Z`);

    // เพิ่มเวลา 7 ชั่วโมงสำหรับประเทศไทย
    const thaiDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

    // ดึงชั่วโมงและนาทีออกมา
    const hours = String(thaiDate.getHours()).padStart(2, "0"); // เติม 0 ด้านหน้า (ถ้าจำเป็น)
    const minutes = String(thaiDate.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`; // คืนค่าเวลาที่แปลงแล้ว
  };

  const startScanner = () => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (!isProcessing && result.data) {
            stopScanner();
            setIsProcessing(true);
            await handleScan(result.data);
          }
        },
        {
          onDecodeError: (error) => {
            console.error("QR Code decode error:", error);
          },
          maxScansPerSecond: 1,
        }
      );
      scanner.start().catch((error) => {
        console.error("Error starting QR scanner:", error);
      });
      setQrScanner(scanner);
    }
  };

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
  };

  const handleScan = async (data) => {
    console.log(data);
    try {
      setIsProcessing(true);
      if (!authData || !authData.token) {
        throw new Error("Authentication data is missing or invalid.");
      }

      const response = await axios.put(
        "/api/ts/checkout",
        { id_card: data },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      const { already_checked_out, existing_checkout, new_checkout } = response.data.data;

      if (already_checked_out) {
        Swal.fire({
          title: "คุณได้เช็คอินแล้ววันนี้!",
          text: `เวลาเช็คอินก่อนหน้านี้: ${formatTimeToThai(existing_checkout.check_out)}`,
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          willClose: () => {
            setIsProcessing(false);
            startScanner();
          },
        });
        return;
      }

      Swal.fire({
        title: "เช็คเอาท์สำเร็จ",
        text: "คุณได้เช็คเอาท์สำเร็จ",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        willClose: () => {
          setIsProcessing(false);
          startScanner();
        },
      });
    } catch (error) {
      console.error("Error during check-out:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเช็คเอาท์";
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="wrapper bg-blue-50 min-h-screen">
      <Menubar />
      <div className="content-wrapper p-6">
        <div className="relative w-full max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl text-center font-bold text-blue-700 mb-6">
            ลงเวลาออกงาน
          </h1>
          <video
            ref={videoRef}
            className="w-full border-4 border-blue-700 rounded-lg shadow-md"
          />
          <div className="flex justify-center gap-4 mt-4">
            {!qrScanner ? (
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                เปิดกล้อง
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                ปิดกล้อง
              </button>
            )}
          </div>
          {isProcessing && (
            <div className="loading-spinner mt-4 text-center">
              <p>กำลังประมวลผล...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
