import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Menubar from "../../components/menuBar";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Swal from "sweetalert2";
import BarChart from "../../components/barChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
const Manager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [countWd, setCountWd] = useState(null);
  const [countEmp, setCountEmp] = useState(null);
  const [checkemp, setCheckemp] = useState([]);
  const [menuRecom, setMenuRecom] = useState([]);
  const [stockLess, setStockless] = useState([]);
  const [countLate, setCountLate] = useState();
  const [costprofitcurrdate, setCostprofitcurrdate] = useState();
  const [costprofitcurrmonth, setCostprofitcurrmonth] = useState();
  const [revenurcurrdate, setRevenuecurrdate] = useState();
  const [revenuecurrmonth, setRevenuecurrmonth] = useState();
  const [formData, setFormData] = useState({
    currdate: "",
    currmonth: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [data, setData] = useState();
  const [materialSummaryWithAvg, setMaterialSummaryWithAvg] = useState([]);
  const [todaySummary, setTodaySummary] = useState([]);
  const [today, setToday] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const countRes = await axios.get(`/api/ws/count-workdate`);
      setCountWd(countRes?.data?.data?.countWd?.countworkdate || "");
      setCountEmp(countRes?.data?.data?.countEmp?.countempworkdate || "");
      const checkempRes = await axios.get(`/api/ws/check-empworkdate`);
      setCheckemp(checkempRes.data.data);
      const menuRecommendRes = await axios.get(`/api/menu/menu-recom`);
      setMenuRecom(menuRecommendRes.data.data);
      const stocklessRes = await axios.get(`/api/stock/stock-less`);
      setStockless(stocklessRes.data.data);
      const checklateRes = await axios.get(`/api/ts/count-late`);
      setCountLate(checklateRes.data.data);
      const costprofit = await axios.get(`/api/receipt/get-cost-profit`);
      setCostprofitcurrdate(costprofit?.data?.data?.costprofitcurrdate);
      setCostprofitcurrmonth(costprofit?.data?.data?.costprofitcurrmonth);
      setRevenuecurrdate(costprofit?.data?.data?.revenuecurrdate);
      setRevenuecurrmonth(costprofit?.data?.data?.revenuecurrmonth);
      const getdata = await axios.get(`/api/receipt/get-data`);
      setData(getdata.data.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    // เรียกฟังก์ชันที่ดึงข้อมูลตามวันที่ที่เลือก
    const formattedDate = format(date, "yyyy-MM-dd");
    const updateData = {
      ...formData,
      currdate: formattedDate,
    };
    setFormData((prev) => ({
      ...prev,
      currdate: formattedDate,
    }));
    setSelectedDate(formattedDate);

    if (date === "") {
      fetchData();
    } else {
      const res = await axios.post(
        `/api/receipt/get-costprofit-bydate`,
        updateData
      );
      setCostprofitcurrdate(res?.data?.data?.costprofitcurrdate);
      setRevenuecurrdate(res?.data?.data?.revenuecurrdate);
    }
  };

  const handleMonthChange = async (month) => {
    // เรียกฟังก์ชันที่ดึงข้อมูลตามเดือนที่เลือก
    const formattedMonth = format(month, "yyyy-MM");
    const updateData = {
      ...formData,
      currmonth: formattedMonth,
    };
    setFormData((prev) => ({
      ...prev,
      currmonth: formattedMonth,
    }));
    setSelectedMonth(formattedMonth);
    if (month === "") {
      fetchData();
    } else {
      const res = await axios.post(
        `/api/receipt/get-costprofit-bydate`,
        updateData
      );
      setCostprofitcurrmonth(res?.data?.data?.costprofitcurrmonth);
      setRevenuecurrmonth(res?.data?.data?.revenuecurrmonth);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // จำนวนวัตถุดิบที่ต้องเตรียมในแต่ละวัน
  useEffect(() => {
    if (data) {
      // กำหนดอ็อบเจ็กต์เพื่อเก็บการใช้วัตถุดิบในแต่ละวันของสัปดาห์
      const weeklyMaterialUse = {
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
      };

      // สร้างฟังก์ชันในการแปลงวันที่เป็นวันในสัปดาห์
      const getDayOfWeek = (date) => {
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const day = new Date(date).getDay();
        return daysOfWeek[day];
      };
      const getDayOfWeekThai = (date) => {
        const daysOfWeekInThai = [
          "อาทิตย์", // Sunday
          "จันทร์", // Monday
          "อังคาร", // Tuesday
          "พุธ", // Wednesday
          "พฤหัสบดี", // Thursday
          "ศุกร์", // Friday
          "เสาร์", // Saturday
        ];
        const day = new Date(date).getDay();
        return daysOfWeekInThai[day];
      };

      const getCurrentDay = () => {
        const currentDay = new Date();
        return getDayOfWeekThai(currentDay);
      };
      const getCurrentDayEng = () => {
        const currentDay = new Date();
        return getDayOfWeek(currentDay);
      };

      setToday(getCurrentDay());

      const getDayNumber = (dayName) => {
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const dayNumber = daysOfWeek.indexOf(dayName);
        return dayNumber;
      };

      const dailyUsage = Object.values(data).reduce((acc, item) => {
        if (
          !item.updated_at ||
          !item.m_name ||
          !item.qty_use_per_mat ||
          !item.qty_use_conver
        ) {
          console.warn("Missing required data for item:", item);
          return acc;
        }

        const date = item.updated_at.split("T")[0];
        const material = item.m_name;
        const totalQty = Number(item.qty_use_conver);
        const unitName = item.u_name;

        if (!acc[material]) acc[material] = [];
        acc[material].push({ date, totalQty, unitName });

        return acc;
      }, {});

      // คำนวณค่าเฉลี่ยการใช้วัสดุ โดยคำนึงถึงจำนวนวันที่ซ้ำ
      const averageUsage = Object.keys(dailyUsage).map((material) => {
        const usageData = dailyUsage[material];

        // ใช้ Set เพื่อหาจำนวนวันที่ไม่ซ้ำกัน
        const uniqueDates = new Set(usageData.map((item) => item.date));
        const uniqueDateCount = uniqueDates.size;

        // คำนวณ totalQty จากข้อมูลทั้งหมด
        const total = usageData.reduce((sum, item) => sum + item.totalQty, 0);

        // คำนวณค่าเฉลี่ยตามจำนวนวันที่ไม่ซ้ำ
        const average = uniqueDateCount > 0 ? total / uniqueDateCount : 0;

        const unitName = usageData.length > 0 ? usageData[0].unitName : "";

        return { material, average, uniqueDateCount, unitName };
      });

      const weeklyDuplicateCount = Object.values(data).reduce((acc, item) => {
        if (
          !item.updated_at ||
          !item.m_name ||
          !item.qty_use_per_mat ||
          !item.qty_use_conver
        ) {
          console.warn("Missing required data for item:", item);
          return acc; // ข้ามรายการถ้าข้อมูลไม่ครบ
        }

        const date = item.updated_at.split("T")[0];
        const material = item.m_name;
        const dayOfWeek = new Date(date).getDay();

        if (!acc[material]) acc[material] = {};

        if (!acc[material][dayOfWeek]) acc[material][dayOfWeek] = new Set();

        acc[material][dayOfWeek].add(date);

        return acc;
      }, {});

      const duplicateCountByWeek = Object.keys(weeklyDuplicateCount).map(
        (material) => {
          const days = weeklyDuplicateCount[material];
          const countByDay = Object.keys(days).reduce((counts, dayOfWeek) => {
            counts[dayOfWeek] = days[dayOfWeek].size;
            return counts;
          }, {});
          return { material, countByDay };
        }
      );

      // วิเคราะห์ข้อมูลการใช้วัตถุดิบ
      Object.values(data).forEach((item) => {
        const date = item.updated_at.split("T")[0];
        const dayOfWeek = getDayOfWeek(date);
        const materialId = item.mat_id;
        const materialName = item.m_name;
        const qtyUseConver = item.qty_use_conver;
        const totalQty = qtyUseConver;
        const unitName = item.u_name;

        // เก็บข้อมูลการใช้วัตถุดิบในวันนั้นๆ ของสัปดาห์
        weeklyMaterialUse[dayOfWeek].push({
          materialId,
          materialName,
          totalQty,
          unitName,
        });
      });

      // สรุปการใช้วัตถุดิบตามวันในสัปดาห์
      const materialSummary = Object.keys(weeklyMaterialUse).map((day) => {
        const materials = weeklyMaterialUse[day];
        const totalPerDay = materials.reduce((acc, curr) => {
          if (!acc[curr.materialName]) {
            acc[curr.materialName] = { totalQty: 0, unitName: curr.unitName };
          }
          acc[curr.materialName].totalQty += curr.totalQty;
          return acc;
        }, {});

        return {
          day,
          materials: totalPerDay,
        };
      });

      const materialSummaryWithAvg1 = Object.keys(weeklyMaterialUse).map(
        (day) => {
          const materials = weeklyMaterialUse[day] || []; // ตรวจสอบหาก materials ไม่มีข้อมูล
          const totalPerDay = materials.reduce((acc, curr) => {
            if (!acc[curr.materialName]) {
              acc[curr.materialName] = { totalQty: 0, unitName: curr.unitName };
            }
            acc[curr.materialName].totalQty += curr.totalQty;
            return acc;
          }, {});

          const materialSummaryWithAvg = Object.keys(totalPerDay).map(
            (materialName) => {
              const totalQty = totalPerDay[materialName].totalQty;

              // หาข้อมูลจำนวนวันที่ซ้ำจาก duplicateCountByWeek
              const dayData = duplicateCountByWeek.find(
                (item) => item.material === materialName
              );
              const countByDay = dayData ? dayData.countByDay : {};

              // กรณีไม่มีข้อมูลใน countByDay ให้กำหนดค่าเริ่มต้นเป็น 0
              const totalDays = countByDay[getDayNumber(day)] || 0;

              let avg;
              if (totalDays <= 0) {
                // ใช้ค่าเฉลี่ยจาก averageUsage หากไม่มีข้อมูลในวันนั้น
                const materialAvgData = averageUsage.find(
                  (item) => item.material === materialName
                );
                avg = materialAvgData ? materialAvgData.average : 0;
              } else {
                avg = totalQty / totalDays;
              }

              return {
                materialName,
                totalQty,
                avg,
                unitName: totalPerDay[materialName].unitName,
              };
            }
          );

          // เพิ่มวัสดุที่ไม่มีข้อมูลจาก averageUsage
          averageUsage.forEach((item) => {
            if (
              !materialSummaryWithAvg.some(
                (m) => m.materialName === item.material
              )
            ) {
              materialSummaryWithAvg.push({
                materialName: item.material,
                totalQty: 0,
                avg: item.average,
                unitName: item.unitName,
              });
            }
          });

          return {
            day,
            materials: materialSummaryWithAvg,
          };
        }
      );

      const new_dayeng = getCurrentDayEng();

      setMaterialSummaryWithAvg(materialSummaryWithAvg1);
      const filteredData = materialSummaryWithAvg.filter(
        (item) => item.day === new_dayeng
      );

      setTodaySummary(filteredData);
    }
  }, [data, today]);

  const groupedDataCurrdate =
    costprofitcurrdate && costprofitcurrdate.length > 0
      ? costprofitcurrdate.reduce((acc, item) => {
          const existingMenu = acc[item.menu_name];

          if (existingMenu) {
            existingMenu.total_cost_per_menu += Number(
              item.total_cost_per_menu
            );
            existingMenu.total_price_per_menu += Number(
              item.total_price_per_menu
            );
            existingMenu.profit += Number(item.profit);
            existingMenu.net_total += Number(item.net_total);
          } else {
            acc[item.menu_name] = {
              menu_name: item.menu_name,
              total_cost_per_menu: Number(item.total_cost_per_menu),
              total_price_per_menu: Number(item.total_price_per_menu),
              net_total: Number(item.net_total),
              profit: Number(item.profit),
            };
          }

          return acc;
        }, {})
      : {};

  const groupedDataCurrMonth =
    costprofitcurrmonth && costprofitcurrmonth.length > 0
      ? costprofitcurrmonth.reduce((acc, item) => {
          const existingMenu = acc[item.menu_name];

          if (existingMenu) {
            existingMenu.total_cost_per_menu += Number(
              item.total_cost_per_menu
            );
            existingMenu.total_price_per_menu += Number(
              item.total_price_per_menu
            );
            existingMenu.profit += Number(item.profit);
            existingMenu.net_total += Number(item.net_total);
          } else {
            acc[item.menu_name] = {
              menu_name: item.menu_name,
              total_cost_per_menu: Number(item.total_cost_per_menu),
              total_price_per_menu: Number(item.total_price_per_menu),
              profit: Number(item.profit),
              net_total: Number(item.net_total),
            };
          }

          return acc;
        }, {})
      : {};

  const groupedDataCurrMonthBar =
    costprofitcurrmonth && costprofitcurrmonth.length > 0
      ? costprofitcurrmonth.reduce((acc, item) => {
          // ใช้คีย์ผสมระหว่างวันที่
          const key = item.date;

          if (acc[key]) {
            acc[key].total_cost_per_menu += Number(item.total_cost_per_menu);
            acc[key].total_price_per_menu += Number(item.total_price_per_menu);
            acc[key].profit += Number(item.profit);
            acc[key].net_total += Number(item.net_total);
          } else {
            acc[key] = {
              date: item.date,
              total_cost_per_menu: Number(item.total_cost_per_menu),
              total_price_per_menu: Number(item.total_price_per_menu),
              profit: Number(item.profit),
              net_total: Number(item.net_total),
            };
          }

          return acc;
        }, {})
      : {};

  const groupedArray1 = Object.values(groupedDataCurrMonthBar);
  console.log(groupedArray1);
  const groupedArray = Object.values(groupedDataCurrdate);
  const groupedCurrmonth = Object.values(groupedDataCurrMonth);

  const totalscurrdate = groupedArray.reduce(
    (acc, item) => {
      acc.total_cost_per_menu += item.total_cost_per_menu;
      acc.profit += item.profit;

      return acc;
    },
    { total_cost_per_menu: 0, profit: 0 }
  );

  const totalscurrmonth = groupedCurrmonth.reduce(
    (acc, item) => {
      acc.total_cost_per_menu += item.total_cost_per_menu;
      acc.profit += item.profit;

      return acc;
    },
    { total_cost_per_menu: 0, profit: 0 }
  );

  const dailyData = {
    labels: groupedArray.map((item) => item.menu_name),
    datasets: [
      {
        label: "ยอดขายรายวัน (บาท)",
        data: groupedArray.map((item) => item.net_total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(54, 162, 235, 0.8)",
        hoverBorderColor: "rgba(54, 162, 235, 1)",
        fill: true,
      },
      {
        label: "ต้นทุนรายวัน (บาท)",
        data: groupedArray.map((item) => item.total_cost_per_menu),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255, 99, 132, 0.8)",
        hoverBorderColor: "rgba(255, 99, 132, 1)",
        fill: true,
      },
    ],
  };

  // ข้อมูลกราฟสำหรับรายเดือน
  const daysInMonth = new Date(formData.currmonth).getDate();
  console.log(daysInMonth);
  const allDatesInMonth = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return `2025-01-${day.toString().padStart(2, "0")}`; // สร้างวันที่ในรูปแบบ YYYY-MM-DD
  });

  const monthlyData = {
    labels: allDatesInMonth.map((date) => {
      const formattedDate = new Date(date);
      return formattedDate.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "ยอดขายรายวัน (บาท)",
        data: allDatesInMonth.map((date) => {
          const formattedDate = new Date(date).toLocaleDateString("th-TH");
          const dataItem = groupedArray1.find((item) => {
            const itemDate = new Date(item.date).toLocaleDateString("th-TH");
            return itemDate === formattedDate;
          });
          return dataItem ? dataItem.net_total : 0;
        }),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(153, 102, 255, 0.8)",
        hoverBorderColor: "rgba(153, 102, 255, 1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "ต้นทุนรายวัน (บาท)",
        data: allDatesInMonth.map((date) => {
          const formattedDate = new Date(date).toLocaleDateString("th-TH");
          const dataItem = groupedArray1.find((item) => {
            const itemDate = new Date(item.date).toLocaleDateString("th-TH");
            return itemDate === formattedDate;
          });
          return dataItem ? dataItem.total_cost_per_menu : 0;
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(75, 192, 192, 0.8)",
        hoverBorderColor: "rgba(75, 192, 192, 1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    aspectRatio: 2, 
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          beginAtZero: true,
        },
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
  };

  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const currentMonth = new Date().toLocaleDateString("th-TH", {
    month: "long",
  });

  const clear = () => {
    setFormData({
      currdate: "",
      currmonth: "",
    });
    setSelectedDate(null);
    setSelectedMonth(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-blue-700 mb-6">แดชบอร์ด</h1>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-4 md:px-0">
              {/* คนมาทำงาน */}
              <div className="bg-white shadow-md rounded-lg p-3 h-80 overflow-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-600">
                    คนมาทำงาน
                  </h2>
                  <p className="text-lg font-bold text-gray-700">
                    {countEmp || 0} / {countWd || 0} คน
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 text-base">
                    สาย:{" "}
                    <span className="text-red-600 font-bold">
                      {countLate?.countlate.late_count || "0"}
                    </span>{" "}
                    คน
                  </p>
                </div>
                <div className="overflow-x-auto mt-2">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-2">ชื่อ</th>
                        <th className="px-4 py-2">การลงเวลา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkemp.length > 0 ? (
                        checkemp.map((emp, index) => {
                          const empStartTime = new Date(
                            `1970-01-01T${emp.start_time}Z`
                          );
                          const empCheckInTime = emp.check_in
                            ? new Date(`1970-01-01T${emp.check_in}Z`)
                            : null;

                          return (
                            <tr
                              key={index}
                              className={`hover:bg-blue-100 transition-colors duration-200 ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }`}
                            >
                              <td className="border px-4 py-2">
                                {emp.f_name} {emp.l_name}
                              </td>
                              <td className="border px-4 py-2">
                                {empCheckInTime ? (
                                  emp.check_out === null ? (
                                    <span
                                      className={`${
                                        empCheckInTime > empStartTime
                                          ? "bg-red-500 text-white" // กรณีมาสาย
                                          : "bg-green-500 text-white" // กรณีตรงเวลา
                                      } px-2 py-1 rounded`}
                                    >
                                      {empCheckInTime > empStartTime
                                        ? `สาย`
                                        : `ตรงเวลา`}
                                    </span>
                                  ) : (
                                    <span className="bg-blue-500 text-white px-2 py-1 rounded">
                                      ลงเวลาออกแล้ว
                                    </span>
                                  )
                                ) : (
                                  <span className="bg-yellow-500 text-white px-2 py-1 rounded">
                                    ยังไม่ลงเวลา
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="text-center py-4 text-gray-500"
                          >
                            ไม่มีข้อมูลพนักงาน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* เมนูแนะนำ */}
              <div className="bg-white shadow-md rounded-lg p-3 h-80 overflow-auto scrollbar-hide">
                <h2 className="text-xl font-semibold text-blue-600 mb-4 scrollbar-hide">
                  เมนูแนะนำ
                </h2>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-2">ลำดับ</th>
                        <th className="px-4 py-2">ชื่อเมนู</th>
                        <th className="px-4 py-2">จำนวน</th>
                        <th className="px-4 py-2">ประเภท</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuRecom.map((menu, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-blue-100 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="border px-4 py-2 text-center">
                            {index + 1}
                          </td>
                          <td className="border px-4 py-2">{menu.menu_name}</td>
                          <td className="border px-4 py-2 text-center">
                            {menu.total_qty || "0"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {menu.typename}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* วัตถุดิบ */}
              <div className="bg-white shadow-md rounded-lg p-3 h-80 overflow-auto scrollbar-hide">
                <h2 className="text-xl font-semibold text-blue-600 mb-4 scrollbar-hide">
                  วัตถุดิบที่ต้องสต๊อก
                </h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-1 py-2">ลำดับ</th>
                        <th className="px-1 py-2">ชื่อ</th>
                        <th className="px-1 py-2">จำนวนคงเหลือ</th>
                        <th className="px-1 py-2">ขั้นต่ำ</th>
                        <th className="px-1 py-2">หน่วย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockLess.map((stock, index) => (
                        <tr
                          key={index}
                          className={`transition-colors duration-200 ${
                            stock.qty < stock.min_qty
                              ? "bg-red-500 text-white border hover:bg-red-600"
                              : "bg-white hover:bg-blue-50"
                          }`}
                        >
                          <td className="border px-4 py-2 text-center">
                            {index + 1}
                          </td>
                          <td className="border px-4 py-2">{stock.m_name}</td>
                          <td className="border px-4 py-2 text-center">
                            {stock.qty || "0"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {stock.min_qty || "0"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {stock.u_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-3 h-80 overflow-auto scrollbar-hide">
                <h2 className="text-xl font-semibold text-blue-600 mb-4 scrollbar-hide">
                  วัตถุดิบที่ต้องเตรียมในวัน {today}
                </h2>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-1 py-2">ลำดับ</th>
                        <th className="px-1 py-2">ชื่อ</th>
                        <th className="px-1 py-2">จำนวน</th>
                        <th className="px-1 py-2">หน่วย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySummary.map((summary, index) =>
                        summary.materials.map((material, matIndex) => (
                          <tr
                            key={`${index}-${matIndex}`} // ใช้การรวม index ของทั้งสองเพื่อให้ key เป็น unique
                            className={`transition-colors duration-200 bg-white hover:bg-blue-50`}
                          >
                            <td className="border px-4 py-2 text-center">
                              {matIndex + 1}
                            </td>{" "}
                            {/* แสดงเลขลำดับวัสดุ */}
                            <td className="border px-4 py-2">
                              {material.materialName}
                            </td>
                            <td className="border px-4 py-2 text-center">
                              {material.avg.toFixed(3) || "0"}
                            </td>{" "}
                            {/* ใช้ค่า avg หรือแสดง "0" ถ้าไม่มีค่า */}
                            <td className="border px-4 py-2 text-center">
                              {material.unitName}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-2 sm:mt-5">
              <div className="flex md:flex-row md:space-x-2 flex-col p-4">
                {/* ช่องเลือกวันที่ */}
                <div className="flex flex-col gap-2  w-full">
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="เลือกวันที่"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* ช่องเลือกเดือน */}
                <div className="flex flex-col gap-2  w-full">
                  <DatePicker
                    selected={selectedMonth}
                    onChange={handleMonthChange}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="เลือกเดือน"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* ปุ่มเคลียร์ */}
                <div className="flex justify-center items-center w-full md:w-auto">
                  <button
                    onClick={clear}
                    className="w-full  mt-1 flex justify-center items-center px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                  >
                    <X /> {/* กำหนดขนาดของ X */}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 px-2 md:px-0 mt-4">
                {/* ต้นทุน กำไร วันนี้ */}
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    <p>
                      ต้นทุนและกำไร วันที่{" "}
                      {formData?.currdate
                        ? new Date(formData.currdate).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : currentDate}
                    </p>
                  </h3>
                  <p className="text-gray-600">
                    ต้นทุน:{" "}
                    <span className="font-bold text-gray-800">
                      {totalscurrdate?.total_cost_per_menu
                        ? Number(totalscurrdate.total_cost_per_menu).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    กำไร:{" "}
                    <span
                      className={`font-bold ${
                        totalscurrdate?.profit < 0
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {totalscurrdate?.profit
                        ? Number(totalscurrdate.profit).toFixed(3)
                        : 0}
                    </span>
                  </p>
                </div>

                {/* ยอดขายวันนี้ */}
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    <p>
                      ยอดขาย วันที่{" "}
                      {formData?.currdate
                        ? new Date(formData.currdate).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : currentDate}
                    </p>
                  </h3>
                  <p className="text-gray-600">
                    ยอดขาย:{" "}
                    <span className="font-bold text-gray-800">
                      {revenurcurrdate?.[0].total_price
                        ? Number(revenurcurrdate[0].total_price).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    รายได้สุทธิ:{" "}
                    <span className="font-bold text-gray-800">
                      {revenurcurrdate?.[0]?.total_revenue
                        ? Number(revenurcurrdate[0].total_revenue).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    ส่วนลด:{" "}
                    <span className="font-bold text-gray-800">
                      {revenurcurrdate?.[0]?.discount
                        ? Number(revenurcurrdate[0].discount).toFixed(3)
                        : 0}
                    </span>
                  </p>
                </div>

                {/* ต้นทุน กำไร เดือนนี้ */}
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    ต้นทุนและกำไร เดือน
                    {formData?.currmonth
                      ? new Date(formData.currmonth).toLocaleDateString(
                          "th-TH",
                          { month: "long" }
                        )
                      : currentMonth}
                  </h3>

                  <p className="text-gray-600">
                    ต้นทุน:{" "}
                    <span className="font-bold text-gray-800">
                      {totalscurrmonth?.total_cost_per_menu
                        ? Number(totalscurrmonth.total_cost_per_menu).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    กำไร:{" "}
                    <span
                      className={`font-bold ${
                        totalscurrmonth?.profit < 0
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {totalscurrmonth?.profit
                        ? Number(totalscurrmonth.profit).toFixed(3)
                        : 0}
                    </span>
                  </p>
                </div>

                {/* ยอดขายเดือนนี้ */}
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-blue-600 mb-4">
                    ยอดขายเดือน
                    {formData?.currmonth
                      ? new Date(formData.currmonth).toLocaleDateString(
                          "th-TH",
                          { month: "long" }
                        )
                      : currentMonth}
                  </h3>
                  <p className="text-gray-600">
                    ยอดขาย:{" "}
                    <span className="font-bold text-gray-800">
                      {revenuecurrmonth?.[0]?.total_price
                        ? Number(revenuecurrmonth[0].total_price).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    รายได้สุทธิ:{" "}
                    <span className="font-bold text-gray-800">
                      {revenuecurrmonth?.[0]?.total_revenue
                        ? Number(revenuecurrmonth[0].total_revenue).toFixed(3)
                        : 0}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    ส่วนลด:{" "}
                    <span className="font-bold text-gray-800">
                      {revenuecurrmonth?.[0]?.discount
                        ? Number(revenuecurrmonth[0].discount).toFixed(3)
                        : 0}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {/* กราฟแสดงยอดขายรายวัน */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">ยอดขายรายวัน</h3>
                  <BarChart data={dailyData} options={options} />
                </div>

                {/* กราฟแสดงยอดขายรายเดือน */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mt-6 md:mt-0">
                    ยอดขายรายเดือน
                  </h3>
                  <BarChart data={monthlyData} options={options} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manager;
