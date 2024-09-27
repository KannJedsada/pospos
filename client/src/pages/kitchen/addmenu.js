import React, { useState, useContext, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";

function Addmenu() {
  const { authData } = useContext(AuthContext);

  const [data, setData] = useState({
    name: "",
    img: "",
    category: "", // This will be used for the selected category ID
    price: "",
    ingredients: [], // materials array including sub-materials
  });

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

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
      console.log(categoryRes.data.data);
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchUnits();
    fetchCategories();
  }, []);

  // Handle file input change and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Handle form input changes
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Handle materials and sub-material changes
  const handleMaterialChange = (index, e) => {
    const updatedIngredients = [...data.ingredients]; // Fixed typo
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [e.target.name]: e.target.value,
    };
    setData({ ...data, ingredients: updatedIngredients }); // Fixed typo
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

    if (!selectedFile) {
      Swal.fire("Error", "Please upload an image", "error");
      return;
    }

    if (data.ingredients.length === 0) {
      Swal.fire("Error", "Please add at least one material", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("img", selectedFile);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("ingredients", JSON.stringify(data.ingredients));
    //   for (let [key, value] of formData.entries()) {
    //     console.log(`${key}: ${value}`);
    //   }
      const response = await axios.post("/menu/addmenu", formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Swal.fire("Success", "Menu added successfully", "success");
        setData({
          name: "",
          img: "",
          category: "",
          price: "",
          ingredients: [],
        });
        setPreviewImage("");
        setSelectedFile(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add menu", "error");
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
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
          <h1 className="text-2xl font-semibold mb-4">เพิ่มเมนู</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อเมนู</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          {/* Menu Image */}
          <div>
            <label className="block text-sm font-medium mb-1">รูปภาพเมนู</label>
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
            <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
            <select
              name="category"
              value={data.category}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
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

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">ราคา</label>
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
            <label className="block text-sm font-medium mb-1">วัตถุดิบ</label>
            {data.ingredients.map((material, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  name="material_id"
                  value={material.material_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/2"
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
                  onChange={(e) => handleMaterialChange(index, e)}
                  placeholder="ปริมาณ"
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
                />
                <select
                  name="unit_id"
                  value={material.unit_id}
                  onChange={(e) => handleMaterialChange(index, e)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
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
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">
            Add Menu
          </button>
        </form>
      </div>
    </div>
  );
}

export default Addmenu;
