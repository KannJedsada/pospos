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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMaterials();
    fetchUnits();
    fetchCategories();
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      const updatedstock_detail = [...data.stock_detail];

      let hasChanges = false; // Track if any changes are made

      for (let index = 0; index < updatedstock_detail.length; index++) {
        const detail = updatedstock_detail[index];

        // Check if material_id and qty are provided
        if (detail.material_id && detail.qty) {
          const materialDataArray = await checkTrue(detail.material_id);

          let totalPrice = 0;

          if (materialDataArray && materialDataArray.length > 0) {
            // ถ้ามีวัสดุผสม (วัสดุใน materialDataArray)
            for (let i = 0; i < materialDataArray.length; i++) {
              const materialData = materialDataArray[i];
              if (materialData && materialData.price !== undefined) {
                const priceForCurrentMaterial =
                  materialData.price * materialData.quantity_used * detail.qty;
                totalPrice += priceForCurrentMaterial;
              }
            }
          } else {
            // ถ้าไม่มีวัสดุผสม ให้ใช้ราคาที่กรอกตามปกติ
            totalPrice = detail.price || 0;
          }

          // Only update if there's a change in price
          if (updatedstock_detail[index].price !== totalPrice) {
            updatedstock_detail[index].price = totalPrice;
            hasChanges = true; // Set to true if a change is made
          }
        }
      }

      // Only set the state if there are changes
      if (hasChanges) {
        setData((prevState) => ({
          ...prevState,
          stock_detail: updatedstock_detail,
        }));
      }
    };

    updatePrices();
  }, [data.stock_detail]);

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

  const fetchCategories = async () => {
    try {
      const categoryRes = await axios.get("/api/stock/category", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

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
        { material_id: "", qty: "", unit_id: "", price: "", category_id: "" },
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
      const response = await axios.post("/api/stock/new_stock", data, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });

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
                <select
                  name="material_id"
                  value={material.material_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกวัตถุดิบ</option>
                  {materials.map((mat) => (
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
                  placeholder="ปริมาณ"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="unit_id"
                  value={material.unit_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
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
                  placeholder="ราคา"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="category_id"
                  value={material.category_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">หมวดหมู่</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              +
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full md:w-auto bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            บันทึกการสต๊อก
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addstock;
