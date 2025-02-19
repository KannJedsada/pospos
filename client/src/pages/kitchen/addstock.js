import React, { useState, useContext, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import Menubar from "../../components/menuBar";
import { ChevronLeft } from "lucide-react";

function Addstock() {
  const { authData } = useContext(AuthContext);

  const [data, setData] = useState({
    stock_detail: [],
  });

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchUnits();
  }, []);

  // useEffect(() => {
  //   const updatePrices = async () => {
  //     const updatedStockDetail = [...data.stock_detail];
  //     let hasChanges = false;

  //     for (let index = 0; index < updatedStockDetail.length; index++) {
  //       const detail = updatedStockDetail[index];

  //       if (detail.material_id && detail.qty) {
  //         // เรียก API เพื่อตรวจสอบวัสดุผสม
  //         const materialDataArray = await checkTrue(detail.material_id);

  //         let totalPrice = 0;

  //         if (materialDataArray && materialDataArray.length > 0) {
  //           // ถ้ามีวัสดุผสม ตรวจสอบว่ามีการกรอกราคาเองหรือไม่
  //           if (detail.manual_price !== undefined && detail.manual_price !== null) {
  //             totalPrice = detail.manual_price;  // ใช้ราคาที่กรอกเอง
  //           } else {
  //             // ถ้าไม่มีการกรอกราคาเอง ให้คำนวณจากวัสดุผสม
  //             for (let materialData of materialDataArray) {
  //               if (materialData?.price !== undefined) {
  //                 totalPrice += materialData.price * materialData.quantity_used * detail.qty;
  //               }
  //             }
  //           }
  //         } else {
  //           // ถ้าไม่มีวัสดุผสม ให้ใช้ราคาที่กรอกเองหรือตั้งค่าเริ่มต้นเป็น 0
  //           totalPrice = detail.manual_price !== undefined && detail.manual_price !== null
  //             ? detail.manual_price * detail.qty
  //             : detail.price || 0;
  //         }

  //         // อัปเดตราคาเฉพาะเมื่อมีการเปลี่ยนแปลง
  //         if (detail.price !== totalPrice) {
  //           updatedStockDetail[index].price = totalPrice;
  //           hasChanges = true;
  //         }
  //       }
  //     }

  //     // อัปเดต state เมื่อมีการเปลี่ยนแปลง
  //     if (hasChanges) {
  //       setData((prevState) => ({
  //         ...prevState,
  //         stock_detail: updatedStockDetail,
  //       }));
  //     }
  //   };

  //   if (data.stock_detail && data.stock_detail.length > 0) {
  //     updatePrices();
  //   }
  // }, [JSON.stringify(data.stock_detail)]);


  const fetchMaterials = async () => {
    try {
      const materialRes = await axios.get("/api/material", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMaterials(materialRes.data.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const unitRes = await axios.get("/api/unit", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setUnits(unitRes.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // const fetchCategories = async () => {
  //   try {
  //     const categoryRes = await axios.get("/api/stock/category", {
  //       headers: { Authorization: `Bearer ${authData.token}` },
  //     });
  //     setCategories(categoryRes.data.data);
  //   } catch (error) {
  //     console.error("Error fetching categories", error);
  //   }
  // };

  const checkTrue = async (id) => {
    try {
      const check = await axios.get(`/api/material/true/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      return check.data.data;
    } catch (error) {
      console.error("Error fetching material:", error);
      return null;
    }
  };

  const handleMaterialChange = (index, e) => {
    const updatedstock_detail = [...data.stock_detail];

    if (updatedstock_detail[index]) {
      const newValue = e.target.value || "";
      if (updatedstock_detail[index][e.target.name] !== newValue) {
        updatedstock_detail[index] = {
          ...updatedstock_detail[index],
          [e.target.name]: newValue,
        };

        // Only update the state if there's an actual change
        setData({ ...data, stock_detail: updatedstock_detail });
      }
    }
  };

  const addMaterial = () => {
    setData({
      ...data,
      stock_detail: [
        ...data.stock_detail,
        { material_id: "", qty: "", unit_id: "", price: "", },
      ],
    });
  };

  const removeMaterial = (index) => {
    setData((prevState) => ({
      ...prevState,
      stock_detail: prevState.stock_detail.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.stock_detail.length === 0) {
      Swal.fire("Error", "Please add at least one material", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/stock/new_stock", data, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });

      const { insufficient_items = [] } = response.data.data;

      if (insufficient_items.length > 0) {
        // จัดกลุ่มรายการที่สต็อกไม่พอ
        const groupedItems = insufficient_items.reduce((acc, item) => {
          const { compositeMaterial: mainMaterial, componentMaterial: compMaterial, current_qty: currentQty, required_qty: requiredQty } = item;

          // ค้นหาวัสดุในกลุ่มที่มีอยู่แล้ว
          const existingItem = acc.find((i) => i.compMaterial === compMaterial);

          if (existingItem) {
            existingItem.missingQty += requiredQty - currentQty;
          } else {
            acc.push({
              mainMaterial,
              compMaterial,
              currentQty,
              requiredQty,
              missingQty: requiredQty - currentQty,
            });
          }

          return acc;
        }, []);

        // สร้าง HTML สำหรับแจ้งเตือน
        const htmlContent = groupedItems
          .map(
            (item) =>
              `<b>${item.compMaterial}</b> (ใช้ใน <b>${item.mainMaterial}</b>)<br>
              มีในสต็อก: <b>${item.currentQty}</b> | ต้องการ: <b>${item.requiredQty}</b> | ขาด: <b>${item.missingQty}</b><br><br>`
          )
          .join("");

        Swal.fire({
          title: "⚠️ สต็อกไม่เพียงพอ",
          html: htmlContent,
          icon: "warning",
        });

        return; // หยุดการทำงานเพื่อให้แก้ไขปัญหาสต็อกก่อน
      }

      // ถ้าสต็อกเพียงพอ ดำเนินการต่อ
      if (response.status === 200) {
        Swal.fire("Success", "เพิ่มสต๊อกสำเร็จ", "success");
        setData({
          stock_detail: [],
        });
      }
    } catch (error) {
      Swal.fire("Error", "เกิดข้อผิดพลาด", "error");
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto px-4 py-6 ">
        {/* Header Section */}
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 shadow"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-3xl font-bold text-blue-700">เพิ่มสต๊อก</h1>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 space-y-6"
        >
          {/* Materials Section */}
          <div>
            <label className="block text-lg font-semibold text-blue-700 mb-2">
              วัตถุดิบ
            </label>
            {data.stock_detail.map((material, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                {/* <select
                  name="material_id"
                  value={material.material_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกวัตถุดิบ</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.m_name}
                    </option>
                  ))}
                </select> */}
                <select
                  name="material_id"
                  value={material.material_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกวัตถุดิบ</option>
                  {materials
                    .filter((mat) => data.stock_detail.some((stock) => stock.material_id === mat.id)) // ✅ กรองด้วย stock_data
                    .map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.m_name}
                      </option>
                    ))}
                </select>

                <input
                  type="text"
                  name="qty"
                  value={material.qty || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  placeholder="ปริมาณ"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="unit_id"
                  value={material.unit_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกหน่วย</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.u_name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="price"
                  value={material.price || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  placeholder="ราคา"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              +
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`px-6 py-2 text-white rounded-lg shadow-md ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-600"
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                กำลังบันทึก...
              </div>
            ) : (
              "บันทึก"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addstock;
