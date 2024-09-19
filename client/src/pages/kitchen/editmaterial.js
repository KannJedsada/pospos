import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";

function Editmaterial() {
  const { state } = useLocation();
  const { id } = state || {};
  const { authData } = useContext(AuthContext);
  const [data, setData] = useState({
    m_name: "",
    unit: "",
    m_img: "",
    composite: false,
    sub_materials: [],
  });
  const [units, setUnits] = useState([]);
  const [subMaterial, setSubMaterials] = useState([]);
  const [material, setMaterial] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({
    m_name: "",
    unit: "",
  });

  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    if (name === "m_name" && !value.trim()) {
      error = "ชื่อวัสดุไม่สามารถเป็นค่าว่างได้";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Fetch material data
  const fetchdata = async () => {
    try {
      const res = await axios.get(`/material/${id}`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      console.log(res.data.data);
      // ตรวจสอบว่ามีข้อมูลใน res.data.data และเป็น array ที่ไม่ว่างเปล่า
      if (res.data.data && res.data.data.length > 0) {
        const item = res.data.data[0];

        const materialData = {
          m_name: item.m_name || "", // ใช้ค่าเริ่มต้นหากเป็น undefined
          unit: item.unit || "",
          m_img: item.m_img || "",
          composite: item.is_composite || false,
          // หาก composite เป็น true ให้แปลง sub_materials, ถ้าไม่ให้เป็น array ว่าง
          sub_materials: item.is_composite
            ? item.sub_materials.map((sub) => ({
                material_id: sub.sub_material || "",
                quantity_used: sub.quantity_used || 0,
                unit_id: sub.u_id || "",
              }))
            : [],
        };
        console.log(materialData);
        setData(materialData);
        setSubMaterials(materialData.sub_materials);

        if (materialData.m_img) {
          setPreviewImage(
            `http://localhost:5000/uploads/material/${materialData.m_img}`
          );
        }
      } else {
        // ข้อมูลไม่ถูกต้องหรือไม่พบ
        throw new Error("No data found");
      }
    } catch (error) {
      console.error("Error fetching material data:", error);
      Swal.fire("Error", "Failed to fetch material data", "error");
    }
  };

  // Fetch units and materials
  const fetchUnits = async () => {
    try {
      const res = await axios.get("/unit");
      setUnits(res.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      setErrorMessage("Failed to fetch units");
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`/material`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setMaterial(res.data.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setErrorMessage("Failed to fetch materials");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
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
      setData((prevData) => ({
        ...prevData,
        [name]: checked,
        sub_materials: checked
          ? prevData.sub_materials
          : prevData.sub_materials,
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      validateField(name, value);
    }
  };

  const handleSubMaterialChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubMaterials = [...data.sub_materials];
    updatedSubMaterials[index] = {
      ...updatedSubMaterials[index],
      [name]: value,
    };
    setData((prevData) => ({
      ...prevData,
      sub_materials: updatedSubMaterials,
    }));
  };

  const addSubMaterial = () => {
    setData((prevData) => ({
      ...prevData,
      sub_materials: [
        ...prevData.sub_materials,
        { material_id: "", quantity_used: "", unit_id: "" },
      ],
    }));
  };

  const removeSubMaterial = (index) => {
    setData((prevData) => ({
      ...prevData,
      sub_materials: prevData.sub_materials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("m_name", data.m_name);
    formData.append("unit", data.unit);
    formData.append("composite", data.composite);

    if (selectedFile) {
      formData.append("m_img", selectedFile);
    }

    formData.append("sub_materials", JSON.stringify(data.sub_materials));

    try {
      await axios.put(`/material/edit/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "Material updated successfully", "success");
      setTimeout(() => {
        navigate("/material");
      }, 1500);
    } catch (error) {
      console.error("There was an error editing the raw material!", error);
      Swal.fire(
        "Error",
        "Failed to edit raw material. Please try again.",
        "error"
      );
    }
  };

  useEffect(() => {
    if (id) {
      fetchdata();
      fetchUnits();
      fetchMaterials();
    }
  }, [id]);

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
          <h1 className="text-2xl font-semibold mb-4">แก้ไขวัตถุดิบ</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อวัตถุดิบ:
            </label>
            <input
              type="text"
              name="m_name"
              value={data.m_name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
            />
            {errors.m_name && (
              <p className="text-red-500 text-sm mt-1">{errors.m_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              เลือกรูปภาพ:
            </label>
            <input
              type="file"
              name="m_img"
              accept="image/*"
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
            />
            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Selected Preview"
                  className="w-32 h-32 object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">หน่วย:</label>
            <select
              name="unit"
              value={data.unit}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
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
          <div className="flex items-center">
            <input
              type="checkbox"
              name="composite"
              id="isComposite"
              checked={data.composite}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isComposite" className="text-sm font-medium">
              วัตถุดิบนี้เป็นวัตถุดิบผสม (Composite)
            </label>
          </div>

          {data.composite && (
            <div>
              <label className="block text-sm font-medium mb-1">
                วัตถุดิบย่อย:
              </label>
              {data.sub_materials.map((subMaterial, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    name="material_id"
                    value={subMaterial.material_id}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/2"
                  >
                    <option value="">เลือกวัตถุดิบย่อย</option>
                    {material.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.m_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="quantity_used"
                    value={subMaterial.quantity_used}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    placeholder="ปริมาณ"
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
                  />
                  <select
                    name="unit_id"
                    value={subMaterial.unit_id}
                    onChange={(e) => handleSubMaterialChange(index, e)}
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
                    onClick={() => removeSubMaterial(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    ลบ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubMaterial}
                className="px-4 py-2 bg-green-500 text-white rounded-md mt-2"
              >
                เพิ่มวัตถุดิบย่อย
              </button>
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            บันทึก
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

export default Editmaterial;
