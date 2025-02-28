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

    const formatTimeToThai = (timeString) => {
        try {
            // สร้าง Date object จากเวลา input (timeString)
            const [hours, minutes, seconds] = timeString.split(":").map(Number);

            // สร้าง Date object ในเวลาปัจจุบัน
            const now = new Date();

            // ตั้งค่าเวลาเป็นเวลาที่ได้รับจาก input
            now.setHours(hours, minutes, seconds);

            // เพิ่มเวลา 7 ชั่วโมงสำหรับ Time Zone ประเทศไทย
            now.setHours(now.getHours() + 7);

            // ดึงชั่วโมงและนาทีหลังจากปรับโซนเวลา
            const thaiHours = String(now.getHours()).padStart(2, "0");
            const thaiMinutes = String(now.getMinutes()).padStart(2, "0");

            return `${thaiHours}:${thaiMinutes}`; // คืนค่าชั่วโมงและนาทีในรูปแบบ HH:mm
        } catch (error) {
            console.error("Error formatting time:", error);
            return "เวลาไม่ถูกต้อง"; // คืนค่าข้อความกรณีเกิดข้อผิดพลาด
        }
    };

    // เริ่มการสแกน QR
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

    // หยุดการสแกน
    const stopScanner = () => {
        if (qrScanner) {
            qrScanner.stop();
            qrScanner.destroy();
            setQrScanner(null);
        }
    };

    // ฟังก์ชันจัดการการสแกน
    const handleScan = async (data) => {
        try {
            setIsProcessing(true);

            if (!authData || !authData.token) {
                throw new Error("Authentication data is missing or invalid.");
            }

            if (!data || typeof data !== "string") {
                throw new Error("Invalid QR Code data.");
            }

            // ส่งข้อมูลไปที่ API
            const response = await axios.post(
                "/api/ts/checkin",
                { id_card: data },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );

            if (response.status !== 200) {
                throw new Error(`Unexpected response: ${response.status}`);
            }

            const { already_checked_in, existing_checkin, new_checkin, is_late } = response.data.data;

            if (already_checked_in) {
                // แสดงแจ้งเตือนว่าเคยเช็คอินแล้ว
                Swal.fire({
                    title: "คุณได้เช็คอินแล้ววันนี้!",
                    text: `เวลาเช็คอินก่อนหน้านี้: ${formatTimeToThai(existing_checkin.check_in)}`,
                    icon: "info",
                    showConfirmButton: false,
                    timer: 1500,
                    willClose: () => {
                        setIsProcessing(false); // เปลี่ยนสถานะให้พร้อมสำหรับสแกนใหม่
                        startScanner(); // เปิด Scanner ใหม่เมื่อ Swal ปิด
                    },
                });
                return;
            }

            // แสดงผลการเช็คอินใหม่
            Swal.fire({
                title: is_late ? "คุณมาสาย!" : "เช็คอินสำเร็จ",
                text: is_late ? "คุณได้เช็คอินล่าช้า" : "คุณได้เช็คอินสำเร็จ",
                icon: is_late ? "warning" : "success",
                showConfirmButton: false,
                timer: 1500,
                willClose: () => {
                    setIsProcessing(false); // เปลี่ยนสถานะให้พร้อมสำหรับสแกนใหม่
                    startScanner(); // เปิด Scanner ใหม่เมื่อ Swal ปิด
                },
            });
        } catch (error) {
            console.error("Error during check-in:", error);

            const errorMessage =
                error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการเช็คอิน";

            // แสดงข้อความผิดพลาด
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: errorMessage,
                icon: "error",
                showConfirmButton: false,
                timer: 1500,
                willClose: () => {
                    setIsProcessing(false); // เปลี่ยนสถานะให้พร้อมสำหรับสแกนใหม่
                    startScanner(); // เปิด Scanner ใหม่เมื่อ Swal ปิด
                },
            });
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

export default Checkin;
