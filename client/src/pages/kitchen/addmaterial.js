import React, { useState, useContext, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { ChevronLeft } from "lucide-react";

function Addmaterial() {
  const { authData } = useContext(AuthContext);
  const [data, setData] = useState({
    m_name: "",
    unit: "",
    m_img_url: "",
    composite: false,
    material_category: "",
  });

  const [errors, setErrors] = useState({
    m_name: "",
    unit: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [units, setUnits] = useState([]);
  const [material, setMaterial] = useState([]);
  const [category, setCategory] = useState([]);
  const [subMaterials, setSubMaterials] = useState([
    { material_id: "", quantity_used: "", unit_id: "" },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchUnits = async () => {
    try {
      const res = await axios.get("/api/unit");
      setUnits(res.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      setErrorMessage("Failed to fetch units");
    }
  };

  const fetchMaterial = async () => {
    try {
      const res = await axios.get("/api/material", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMaterial(res.data.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
      setErrorMessage("Failed to fetch raw materials");
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get("/api/stock/category");
      setCategory(res.data.data);
    } catch (error) {
      console.error("Error fetching category:", error);
      setErrorMessage("Failed to fetch category");
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "m_name" && !value.trim()) {
      error = "ชื่อวัตถุดิบไม่สามารถเป็นค่าว่างได้";
    }
    if (name === "unit" && !value.trim()) {
      error = "หน่วยไม่สามารถเป็นค่าว่างได้";
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (files && files[0]) {
        const file = files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (name === "composite") {
      // Handle composite checkbox
      setData((prevData) => ({
        ...prevData,
        [name]: !prevData.composite,
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      validateField(name, value);
    }
  };

  const handleSubMaterialChange = (index, event) => {
    const { name, value } = event.target;
    const newSubMaterials = [...subMaterials];
    newSubMaterials[index][name] = value;
    setSubMaterials(newSubMaterials);
  };

  const addSubMaterial = () => {
    setSubMaterials([
      ...subMaterials,
      { material_id: "", quantity_used: "", unit_id: "" },
    ]);
  };

  const removeSubMaterial = (index) => {
    const newSubMaterials = subMaterials.filter((_, i) => i !== index);
    setSubMaterials(newSubMaterials);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("category :", data.material_category);
    const newErrors = {};
    Object.keys(data).forEach((key) => {
      validateField(key, data[key]);
    });

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("m_name", data.m_name);
      formData.append("unit", data.unit);
      formData.append("composite", data.composite);
      formData.append("category", data.material_category);

      if (selectedFile) {
        formData.append("m_img", selectedFile);
      }
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }
      if (data.composite) {
        subMaterials.forEach((subMaterial, index) => {
          formData.append(
            `composition[${index}][material_id]`,
            subMaterial.material_id
          );
          formData.append(
            `composition[${index}][quantity_used]`,
            subMaterial.quantity_used
          );
          formData.append(
            `composition[${index}][unit_id]`,
            subMaterial.unit_id
          );
        });
      }

      const response = await axios.post("/api/material/add", formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("วัสดุถูกเพิ่มเรียบร้อยแล้ว");
      setErrorMessage("");
      setData({
        m_name: "",
        unit: "",
        m_img_url: "",
        composite: false,
        material_category: "",
      });
      setSelectedFile(null);
      setPreviewImage("");
      setSubMaterials([{ material_id: "", quantity_used: "", unit_id: "" }]);
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึก");
      console.error("Error submitting data:", error);
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchMaterial();
    fetchCategory();
    setData(data);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => window.history.back()}
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-4 shadow"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-3xl font-semibold text-blue-700">
            เพิ่มวัตถุดิบ
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              ชื่อวัตถุดิบ:
            </label>
            <input
              type="text"
              name="m_name"
              value={data.m_name}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            {errors.m_name && (
              <p className="text-red-500 text-sm mt-1">{errors.m_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              เลือกรูปภาพ:
            </label>
            <input
              type="file"
              name="m_img"
              accept="image/*"
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            {previewImage ? (
              <div className="mt-4 flex justify-center">
                <img
                  src={previewImage}
                  alt="Selected Preview"
                  className="w-40 h-40 object-cover rounded-md shadow"
                />
              </div>
            ) : (
              data.m_img_url && (
                <div className="mt-4">
                  <img
                    src={data.m_img_url}
                    alt="Existing Material"
                    className="w-40 h-40 object-cover rounded-md shadow"
                  />
                </div>
              )
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              หน่วย:
            </label>
            <select
              name="unit"
              value={data.unit}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="">เลือกหน่วย</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.u_name}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              หมวดหมู่:
            </label>
            <select
              name="material_category"
              value={data.material_category}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="">เลือกหมวดหมู่</option>
              {category.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            {errors.material_category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.material_category}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="composite"
              id="isComposite"
              checked={data.composite}
              onChange={handleChange}
              className="mr-2"
            />
            <label
              htmlFor="isComposite"
              className="text-sm font-medium text-blue-700"
            >
              วัตถุดิบนี้เป็นวัตถุดิบผสม (Composite)
            </label>
          </div>
          {data.composite && (
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                วัตถุดิบย่อย:
              </label>
              {subMaterials.map((subMaterial, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    name="material_id"
                    value={subMaterial.material_id}
                    disabled={isLoading}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="">เลือกวัตถุดิบย่อย</option>
                    {material.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.m_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="quantity_used"
                    disabled={isLoading}
                    value={subMaterial.quantity_used}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    placeholder="ปริมาณ"
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                  <select
                    name="unit_id"
                    disabled={isLoading}
                    value={subMaterial.unit_id}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                    onClick={() => removeSubMaterial(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-400 shadow"
                  >
                    ลบ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubMaterial}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 mt-2 shadow"
              >
                เพิ่มวัตถุดิบย่อย
              </button>
            </div>
          )}
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

          {successMessage && (
            <p className="text-green-500 text-sm mt-2">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Addmaterial;
