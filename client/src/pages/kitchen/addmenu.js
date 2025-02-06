import React, { useState, useContext, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { ChevronLeft } from "lucide-react";

function Addmenu() {
  const { authData } = useContext(AuthContext);

  const [data, setData] = useState({
    name: "",
    img: "",
    category: "",
    ingredients: [],
    menutype: "",
  });

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [menutype, setMenutype] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const categoryRes = await axios.get("/api/menu/menucategory", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
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

  useEffect(() => {
    fetchMaterials();
    fetchUnits();
    fetchCategories();
    fetchMenutype();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Handle materials and sub-material changes
  const handleMaterialChange = (index, e) => {
    const updatedIngredients = [...data.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [e.target.name]: e.target.value,
    };
    setData({ ...data, ingredients: updatedIngredients });
  };

  // Add new material
  const addMaterial = () => {
    setData({
      ...data,
      ingredients: [
        ...data.ingredients,
        { material_id: "", quantity_used: "", unit_id: "" },
      ],
    });
  };

  // Remove material
  const removeMaterial = (index) => {
    const updatedMaterials = data.ingredients.filter((_, i) => i !== index);
    setData({ ...data, ingredients: updatedMaterials });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(data);
    if (!selectedFile) {
      Swal.fire("Error", "กรุณาใส่รูปภาพ", "error");
      return;
    }

    if (data.ingredients.length < 2) {
      Swal.fire("Error", "ต้องมีวัตถุดิบอย่างน้อย 2 วัตถุดิบ ขึ้นไป", "error");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("img", selectedFile);
      formData.append("category", data.category);
      formData.append("ingredients", JSON.stringify(data.ingredients));
      formData.append("menutype", data.menutype);
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }
      const response = await axios.post("/api/menu/addmenu", formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Swal.fire("Success", "เพิ่มเมนูสำเร็จ", "success");
        setData({
          name: "",
          img: "",
          category: "",
          ingredients: [],
          menutype: "",
        });
        setPreviewImage("");
        setSelectedFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่มเมนู", "error");
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
      <div className="container mx-auto p-6">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-4 shadow"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-3xl font-semibold mb-4 text-blue-700">
            เพิ่มเมนู
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
              name="name"
              value={data.name}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
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
              name="category"
              value={data.category}
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
                  value={material.material_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  name="quantity_used"
                  value={material.quantity_used}
                  disabled={isLoading}
                  onChange={(e) => handleMaterialChange(index, e)}
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
                  <option value="">เลือกหน่วย</option>
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
              "เพิ่มเมนู"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addmenu;
