import React, { useRef, useState, useEffect, useContext } from "react";
import QrScanner from "qr-scanner";
import Menubar from "../../components/menuBar";
import AuthContext from "../../components/auth/authcontext";
import axios from "../../utils/axiosInstance";
import Swal from "sweetalert2";

const Checkin = () => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { authData } = useContext(AuthContext);

  const isWithinTimeRange = () => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHours < 15) {
      return false;
    } else if (currentHours >= 15 && currentHours < 18) {
      return true;
    } else if (currentHours === 18 && currentMinutes <= 30) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    let qrScanner;

    const startScanner = () => {
      if (videoRef.current && isWithinTimeRange()) {
        qrScanner = new QrScanner(
          videoRef.current,
          async (result) => {
            if (!isProcessing && result.data) {
              // console.log("QR Code detected:", result.data);
              setIsScanning(false);
              await handleScan(result.data);
            }
          },
          {
            onDecodeError: (error) => {
              console.error("QR Code decode error:", error);
            },
          }
        );

        qrScanner.start().catch((error) => {
          console.error("Error starting QR scanner:", error);
        });
      }
    };

    if (isScanning) {
      startScanner();
    }

    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, [isScanning, isProcessing]);

  const handleScan = async (data) => {
    setIsProcessing(true);
    // console.log("Scanned QR Code:", data);
    try {
      if (!authData || !authData.token) {
        throw new Error("Authentication data is missing or invalid.");
      }

      const response = await axios.post(
        "ts/checkin",
        { id_card: data },
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      // console.log("Check-in response:", response.data);
      if (response.data.data.is_late) {
        Swal.fire({
          title: "คุณมาสาย!",
          text: "คุณได้เช็คอินล่าช้า",
          icon: "warning",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if (!response.data.data.is_late) {
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
        setIsScanning(true);
      }, 1000);
    }
  };

  return (
    <div className="wrapper">
      <Menubar />
      <div className="content-wrapper p-4">
        <div className="relative w-full max-w-md mx-auto">
          {isWithinTimeRange() ? (
            <>
              <h1 className="text-2xl text-center font-bold mb-4">
                ลงเวลาเข้างาน
              </h1>
              <video ref={videoRef} className="w-full border-4 rounded-lg" />
            </>
          ) : (
            <div className="text-center p-4">
              <p>ระบบเช็คอินจะเปิดใช้งานตั้งแต่ 15:30 ถึง 18:30 เท่านั้น</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkin;
