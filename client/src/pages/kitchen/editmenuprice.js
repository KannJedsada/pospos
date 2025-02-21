import React, { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for the DatePicker
import { useLocation, useNavigate } from "react-router-dom";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Editmenuprice() {
  const { state } = useLocation();
  const { id } = state; // Make sure to extract id properly
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [menuPrices, setMenuPrices] = useState([]);
  const [cost, setCost] = useState({});
  const [data, setData] = useState({
    price: "",
    date_start: "",
    date_end: "",
  });

  const fetchData = async () => {
    try {
      console.log(id);
      setIsLoading(true);
      const menuPriceRes = await axios.get(`/api/menu/menuprice/${id}`);
      setMenuPrices(menuPriceRes.data.data);

      const menuCost = await axios.get(`/api/menu/getcost/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setCost(menuCost.data.data);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewPrice = async (e) => {
    e.preventDefault();

    if (cost < data.price) {
      Swal.fire({
        title: "ยืนยันการบันทึก?",
        text: "คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      });

      try {
        setIsLoading(true);
        await axios.post(`/api/menu/new-price/${id}`, data, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });

        Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });

        navigate("/menus");
      } catch (error) {
        console.error("Error Insert data", error);
        Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึก", "error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // แสดงป๊อปอัปยืนยันก่อนบันทึกข้อมูล
    const result = await Swal.fire({
      title: "ยืนยันการบันทึก?",
      text: "คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    // ถ้าผู้ใช้กดยืนยัน ให้ทำการบันทึกข้อมูล
    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await axios.post(`/api/menu/new-price/${id}`, data, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });

        Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });

        navigate("/menus");
      } catch (error) {
        console.error("Error Insert data", error);
        Swal.fire("Error", "เกิดข้อผิดพลาดในการบันทึก", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const minDate = new Date();

  const [currentPage, setCurrentPage] = useState(1);
  const [pricePerPage] = useState(5);
  const totalPages = Math.ceil(menuPrices.length / pricePerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const generatePaginationButtons = (currentPage, totalPages, isMobile) => {
    const maxButtons = isMobile ? 3 : 5;
    const half = Math.floor(maxButtons / 2);
    const buttons = [];

    if (totalPages <= maxButtons) {
      // กรณีที่มีจำนวนน้อยกว่าหรือเท่ากับปุ่มที่แสดง
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= half) {
        // กรณีที่อยู่ในช่วงเริ่มต้น
        for (let i = 1; i <= maxButtons - 1; i++) {
          buttons.push(i);
        }
        buttons.push("...");
        buttons.push(totalPages);
      } else if (currentPage > totalPages - half) {
        // กรณีที่อยู่ในช่วงท้าย
        buttons.push(1);
        buttons.push("...");
        for (let i = totalPages - (maxButtons - 2); i <= totalPages; i++) {
          buttons.push(i);
        }
      } else {
        // กรณีที่อยู่ตรงกลาง
        buttons.push(1);
        buttons.push("...");
        for (
          let i = currentPage - Math.floor((maxButtons - 4) / 2);
          i <= currentPage + Math.floor((maxButtons - 4) / 2);
          i++
        ) {
          buttons.push(i);
        }
        buttons.push("...");
        buttons.push(totalPages);
      }
    }

    return buttons;
  };

  const isMobile = window.innerWidth < 640;

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-4 shadow"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-3xl font-semibold mb-4 text-blue-700">
            แก้ไขราคา
          </h1>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                ต้นทุนเมนู {cost.menuName}
              </h2>
              <form
                onSubmit={handleAddNewPrice}
                className="bg-white p-8 shadow-lg rounded-lg max-w-full mx-auto"
              >
                <div className="mb-6">
                  <label
                    htmlFor="costSelection"
                    className="block mb-2 text-lg font-medium text-gray-800"
                  >
                    เลือกต้นทุนที่จะใช้
                  </label>
                  <h1 className="text-2xl font-semibold text-blue-700">
                    {cost.totalcost !== undefined
                      ? cost.totalcost.toFixed(2)
                      : "ยังไม่ได้ระบุข้อมูล"}{" "}
                    บาท
                  </h1>
                </div>

                {/* <div className="mb-6">
                  <label
                    htmlFor="profitPercentage"
                    className="block mb-2 text-lg font-medium text-gray-800"
                  >
                    ระบุเปอร์เซ็นต์ต้นทุน
                  </label>
                  <select
                    id="profitPercentage"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const profitPercentage = parseFloat(e.target.value);
                      setCost((prev) => ({
                        ...prev,
                        profit: profitPercentage,
                      }));

                      const calculatedPrice =
                        profitPercentage && cost.totalcost
                          ? (
                            Math.ceil(
                              cost.totalcost / (profitPercentage / 100)
                            )
                          ).toFixed(2)
                          : "";

                      const roundToNearest0or5 = (price) => {
                        return Math.round(price / 5) * 5;
                      };
                      setData((prevData) => ({
                        ...prevData,
                        price:roundToNearest0or5(calculatedPrice),
                      }));
                    }}
                    value={cost.profit || ""}
                  >
                    <option value="" disabled>
                      เลือกเปอร์เซ็นต์ต้นทุน
                    </option>
                    {[...Array(21).keys()].map((i) => (
                      <option key={i} value={i * 5}>
                        {i * 5}%
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-800">
                    ราคาขาย:{" "}
                    {data.price ? `${data.price} บาท` : "ยังไม่ได้ระบุข้อมูล"}
                  </h2>
                </div> */}

                <div className="mb-6">
                  <label
                    htmlFor="sellingPrice"
                    className="block mb-2 text-lg font-medium text-gray-800"
                  >
                    ระบุราคาขาย
                  </label>
                  <input
                    type="number"
                    id="sellingPrice"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={data.price || ""}
                    onChange={(e) => {
                      const sellingPrice = parseFloat(e.target.value) || 0;

                      setData((prevData) => ({
                        ...prevData,
                        price: sellingPrice,
                      }));
                    }}
                    placeholder="กรอกราคาขาย"
                  />
                </div>

                {/* <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-800">
                    ราคาขาย: {data.price ? `${data.price} บาท` : "ยังไม่ได้ระบุข้อมูล"}
                  </h2>
                </div> */}

                <div className="mb-6">
                  <label
                    htmlFor="date_start"
                    className="block mb-2 text-lg font-medium text-gray-800"
                  >
                    วันที่เริ่มต้น
                  </label>
                  <DatePicker
                    selected={
                      data.date_start ? new Date(data.date_start) : null
                    }
                    onChange={(date) => {
                      const dateEnd = new Date(date);
                      dateEnd.setDate(dateEnd.getDate() - 1);

                      setData((prevData) => ({
                        ...prevData,
                        date_start: date.toISOString().slice(0, 10),
                        date_end: dateEnd.toISOString().slice(0, 10),
                      }));
                    }}
                    minDate={minDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  บันทึก
                </button>
              </form>
            </div>
            {/* ประวัติราคา */}
            <div>
              <h2 className="text-2xl font-semibold mt-6 mb-4 text-blue-700">
                ประวัติราคา
              </h2>
              {menuPrices.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="px-4 py-2 border-b text-left">
                        วันที่เริ่มต้น
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        วันที่สิ้นสุด
                      </th>
                      <th className="px-4 py-2 border-b text-left">ราคา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuPrices
                      .slice(
                        (currentPage - 1) * pricePerPage,
                        currentPage * pricePerPage
                      )
                      .map((price, index) => (
                        <tr
                          key={index}
                          className="transition-all duration-300 bg-white hover:bg-blue-50"
                        >
                          <td className="px-4 py-2 border-b h-full">
                            {new Date(price.date_start).toLocaleDateString(
                              "th-TH"
                            )}
                          </td>
                          <td className="px-4 py-2 border-b h-full">
                            {price.date_end
                              ? new Date(price.date_end).toLocaleDateString(
                                  "th-TH"
                                )
                              : "ไม่มีข้อมูล"}
                          </td>
                          <td className="px-4 py-2 border-b h-full">
                            {price.price.toFixed(2)} บาท
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600">ไม่มีประวัติราคา</p>
              )}

              {/* Pagination Buttons */}
              <div className="flex justify-center items-center mt-6">
                {/* Previous Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronLeft />
                </button>

                {/* Page Numbers */}
                <div className="mx-4 flex space-x-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Editmenuprice;
