import React, { useState, useContext, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";

function Addmaterial() {
  const { authData } = useContext(AuthContext);
  const [data, setData] = useState({
    m_name: "",
    unit: "",
    m_img_url: "",
    composite: false,
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
  const [subMaterials, setSubMaterials] = useState([
    { material_id: "", quantity_used: "", unit_id: "" },
  ]);

  const fetchUnits = async () => {
    try {
      const res = await axios.get("/unit");
      setUnits(res.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      setErrorMessage("Failed to fetch units");
    }
  };

  const fetchMaterial = async () => {
    try {
      const res = await axios.get("/material", {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setMaterial(res.data.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
      setErrorMessage("Failed to fetch raw materials");
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "m_name" && !value.trim()) {
      error = "ชื่อวัสดุไม่สามารถเป็นค่าว่างได้";
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
      // จัดการ checkbox ของ composite
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

    const newErrors = {};
    Object.keys(data).forEach((key) => {
      validateField(key, data[key]);
    });

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("m_name", data.m_name);
      formData.append("unit", data.unit);
      formData.append("composite", data.composite);

      if (selectedFile) {
        formData.append("m_img", selectedFile);
      }

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

      const response = await axios.post("/material/add", formData, {
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
      });
      setSelectedFile(null);
      setPreviewImage("");
      setSubMaterials([{ material_id: "", quantity_used: "", unit_id: "" }]);
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการส่งข้อมูล");
      console.error("Error submitting data:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchMaterial();
    setData(data);
  }, [data]);

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
          <h1 className="text-2xl font-semibold mb-4">เพิ่มวัตถุดิบ</h1>
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
            {previewImage ? (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Selected Preview"
                  className="w-32 h-32 object-cover"
                />
              </div>
            ) : (
              data.m_img_url && (
                <div className="mt-4">
                  <img
                    src={data.m_img_url}
                    alt="Existing Material"
                    className="w-32 h-32 object-cover"
                  />
                </div>
              )
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
              {subMaterials.map((subMaterial, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <select
                    name="material_id"
                    value={subMaterial.material_id}
                    onChange={(e) => handleSubMaterialChange(index, e)}
                    className="px-4 py-2 border border-gray-300 rounded-md w-1/2"
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

export default Addmaterial;
