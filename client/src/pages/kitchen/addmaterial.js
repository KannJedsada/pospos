import React, { useState, useContext, useEffect } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";

function Addmaterial() {
  const { authData } = useContext(AuthContext);
  const [data, setData] = useState({
    m_name: "",
    unit: "",
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

  const fetchUnits = async () => {
    try {
      const res = await axios.get("/unit");
      setUnits(res.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      setErrorMessage("Failed to fetch units");
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
    } else {
      setData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
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

      if (selectedFile) {
        formData.append("m_img", selectedFile);
      }

      const response = await axios.post("/material/add", formData, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("วัสดุถูกเพิ่มเรียบร้อยแล้ว");
      setErrorMessage("");
      console.log("Data submitted:", response.data);

      setData({
        m_name: "",
        unit: "",
      });
      setSelectedFile(null);
      setPreviewImage("");
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการส่งข้อมูล");
      console.error("Error submitting data:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

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
          <h1 className="text-2xl font-semibold mb-4">เพิ่มวัสดุ</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อวัสดุ:</label>
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
