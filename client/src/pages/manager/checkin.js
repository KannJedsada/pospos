import React, { useRef, useState, useEffect, useContext } from "react";
import QrScanner from "qr-scanner";
import Menubar from "../../components/menuBar";
import AuthContext from "../../components/auth/authcontext";
import axios from "../../utils/axiosInstance";
import Swal from "sweetalert2";

const Checkin = () => {
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { authData } = useContext(AuthContext);

  const startScanner = () => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (!isProcessing && result.data) {
            await handleScan(result.data);
          }
        },
        {
          onDecodeError: (error) => {
            console.error("QR Code decode error:", error);
          },
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

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      stopScanner();
    };
  }, [qrScanner]);

  const handleScan = async (data) => {
    setIsProcessing(true);
    try {
      if (!authData || !authData.token) {
        throw new Error("Authentication data is missing or invalid.");
      }

      stopScanner();

      const response = await axios.post(
        "/api/ts/checkin",
        { id_card: data },
        {
          headers: {
            Authorization: Bearer ${authData.token},
          },
        }
      );

      if (response.data.data.is_late) {
        Swal.fire({
          title: "คุณมาสาย!",
          text: "คุณได้เช็คอินล่าช้า",
          icon: "warning",
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "เช็คอินสำเร็จ",
          text: "คุณได้เช็คอินสำเร็จ",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเช็คอิน";
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
      });
    } finally {
      setIsProcessing(false);

      setTimeout(() => {
      startScanner();
      }, 1500); 
    }
  };

  return (
    <div className="wrapper bg-blue-50 min-h-screen">
      <Menubar />
      <div className="content-wrapper p-6">
        <div className="relative w-full max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl text-center font-bold text-blue-700 mb-6">
            ลงเวลาเข้างาน
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
        </div>
      </div>
    </div>
  );
};

export default Checkin;
