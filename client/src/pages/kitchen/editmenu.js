import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";

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
    price: "",
    ingredients: [],
  });
  const navigate = useNavigate();

  // Fetch available materials
  const fetchMaterials = async () => {
    try {
      const materialRes = await axios.get("/material", {
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
      const unitRes = await axios.get("/unit", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setUnits(unitRes.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Fetch available categories
  const fetchCategories = async () => {
    try {
      const categoryRes = await axios.get("/menu/menucategory", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`/menu/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      const item = res.data.data;
      const menuData = {
        menu_name: item.menu_name,
        menu_img: item.menu_img,
        menu_category: item.menu_category,
        price: item.price || "",
        ingredients: item.ingredients
          ? item.ingredients.map((ing) => ({
              material_id: ing.material_id,
              material_name: ing.material_name,
              quantity_used: ing.quantity_used,
              unit_id: ing.unit_id,
            }))
          : [],
      };
      setData(menuData);
      if (item.menu_img) {
        setPreviewImage(`http://localhost:5000/uploads/menu/${item.menu_img}`);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      Swal.fire("Error", "Failed to fetch menu data", "error");
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchUnits();
    fetchMaterials();
    fetchCategories();
    fetchData();
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
    updatedIngredients[index][e.target.name] = e.target.value;
    setData({ ...data, ingredients: updatedIngredients });
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

    const formData = new FormData();
    formData.append("menu_name", data.menu_name);
    formData.append("menu_category", data.menu_category);
    formData.append("price", data.price);
    formData.append("ingredients", JSON.stringify(data.ingredients)); // ตรวจสอบว่าข้อมูลนี้ถูกต้อง

    if (selectedFile) {
      formData.append("img", selectedFile);
    }

    // ตรวจสอบค่าใน FormData
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    try {
      await axios.put(`/menu/editmenu/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "Menu updated successfully", "success");
      navigate("/menus");
    } catch (error) {
      console.error(
        "Error updating menu:",
        error.response ? error.response.data : error.message
      );
      Swal.fire("Error", "Failed to update menu", "error");
    }
  };

  return (
    <div>
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-yellow-900 mr-4"
          >
            Back
          </button>
          <h1 className="text-2xl font-semibold mb-4">Edit Menu</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Menu Name</label>
            <input
              type="text"
              name="menu_name"
              value={data.menu_name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          {/* Menu Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Menu Image</label>
            <input type="file" onChange={handleFileChange} />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-2 w-32 h-32"
              />
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="menu_category"
              value={data.menu_category}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={data.price}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          {/* Materials and Sub-materials */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ingredients
            </label>
            {data.ingredients.map((material, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  name="material_id"
                  value={material.material_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/2"
                >
                  <option value="">Select Material</option>
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
                  onChange={(e) => handleMaterialChange(index, e)}
                  placeholder="Quantity"
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
                />
                <select
                  name="unit_id"
                  value={material.unit_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.u_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md"
                >
                  ลบ
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-2 bg-green-500 text-white rounded-md mt-2"
            >
              เพิ่มวัตถุดิบ
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            บันทึก
          </button>
        </form>
      </div>
    </div>
  );
}

export default Editmenu;
