import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { ChevronLeft } from "lucide-react";

function Editmenu() {
  const { state } = useLocation();
  const { id } = state;
  const { authData } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [data, setData] = useState({
    menu_name: "",
    menu_img: "",
    menu_category: "",
    ingredients: [],
    menutype: "",
  });
  const navigate = useNavigate();
  const [menutype, setMenutype] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available materials
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

  // Fetch available units
  const fetchUnits = async () => {
    try {
      const unitRes = await axios.get("/api/unit", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      // กรองหน่วยที่ไม่ต้องการ (ไม่เอากิโลกรัมและลิตร)
      const filteredUnits = unitRes.data.data.filter(
        (unit) => unit.u_name !== "กิโลกรัม" && unit.u_name !== "ลิตร"
      );

      setUnits(filteredUnits);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Fetch available categories
  const fetchCategories = async () => {
    try {
      const categoryRes = await axios.get("/api/menu/menucategory", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/menu/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const item = res.data.data;
      const menuData = {
        menu_name: item.menu_name,
        menu_img: item.menu_img,
        menu_category: item.menu_category,
        ingredients: item.ingredients
          ? item.ingredients.map((ing) => ({
              material_id: ing.material_id,
              material_name: ing.material_name,
              quantity_used: ing.quantity_used,
              unit_id: ing.unit_id,
            }))
          : [],
        menutype: item.menu_type,
      };
      setData(menuData);
      if (item.menu_img) {
        setPreviewImage(`${item.menu_img}`);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      Swal.fire("Error", "Failed to fetch menu data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenutype = async () => {
    try {
      const menutypeRes = await axios.get("/api/menu/menutype");
      setMenutype(menutypeRes.data.data);
    } catch (error) {
      console.error("Error fetching menu type", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchUnits();
    fetchMaterials();
    fetchCategories();
    fetchData();
    fetchMenutype();
  }, []);

  // Handle change in input fields
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPreviewImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleMaterialChange = (index, e) => {
    const updatedIngredients = [...data.ingredients];
    const value =
      e.target.name === "material_id" ? Number(e.target.value) : e.target.value;

    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [e.target.name]: value,
    };
    setData({ ...data, ingredients: updatedIngredients });
  };

  const getFilteredMaterials = (currentIndex) => {
    // เก็บรายการ material_id ที่ถูกเลือกไปแล้ว (ยกเว้นตัวที่กำลังแก้ไข)
    const selectedMaterialIds = data.ingredients
      .filter((_, idx) => idx !== currentIndex)
      .map((item) => Number(item.material_id))
      .filter((id) => id); // กรองค่าว่างออก

    // คืนค่าวัตถุดิบที่ยังไม่ถูกเลือก
    return materials.filter(
      (material) => !selectedMaterialIds.includes(Number(material.id))
    );
  };

  const addMaterial = () => {
    setData({
      ...data,
      ingredients: [
        ...data.ingredients,
        { material_id: "", quantity_used: "", unit_id: "" },
      ],
    });
  };

  const removeMaterial = (index) => {
    const updatedIngredients = [...data.ingredients];
    updatedIngredients.splice(index, 1);
    setData({ ...data, ingredients: updatedIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const invalidQuantity = data.ingredients.some(
      (ingredient) =>
        ingredient.quantity_used < 1 || ingredient.quantity_used > 1000
    );

    if (invalidQuantity) {
      Swal.fire("Error", "ปริมาณต้องอยู่ระหว่าง 1 ถึง 1000 หน่วย", "error");
      return;
    }

    const formData = new FormData();
    formData.append("menu_name", data.menu_name);
    formData.append("menu_category", data.menu_category);
    formData.append("ingredients", JSON.stringify(data.ingredients));
    formData.append("menutype", data.menutype);

    if (selectedFile) {
      formData.append("img", selectedFile);
    }

    try {
      setIsLoading(true);
      await axios.put(`/api/menu/editmenu/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "อัปเดตสำเร็จ", "success");
      navigate("/menus");
    } catch (error) {
      console.error(
        "Error updating menu:",
        error.response ? error.response.data : error.message
      );
      Swal.fire("Error", "เกิดข้อผิดพลาดในการอัปเดต", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
            แก้ไขเมนู
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              ชื่อเมนู
            </label>
            <input
              type="text"
              name="menu_name"
              value={data.menu_name}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            />
          </div>

          {/* Menu Image */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              รูปภาพเมนู
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            {previewImage && (
              <div className="mt-4 flex justify-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-md shadow"
                />
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              หมวดหมู่
            </label>
            <select
              name="menu_category"
              value={data.menu_category}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              ประเภท
            </label>
            <select
              name="menutype"
              value={data.menutype}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="">เลือกประเภท</option>
              {menutype.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.typename}
                </option>
              ))}
            </select>
          </div>

          {/* Materials and Sub-materials */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              วัตถุดิบ
            </label>
            {data.ingredients.map((material, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-5 mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <select
                  name="material_id"
                  value={data.ingredients[index]?.material_id || ""}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกวัตถุดิบ</option>
                  {getFilteredMaterials(index).map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.m_name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="quantity_used"
                  value={material.quantity_used}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  placeholder="ปริมาณ"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="unit_id"
                  value={material.unit_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกหน่อย</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.u_name}
                    </option>
                  ))}
                </select>
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
            className={`px-6 py-2 text-white rounded-lg shadow-md ${
              isLoading
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

export default Editmenu;
