import React, { useState, useEffect, useContext } from "react";
import Menubar from "../../components/menuBar";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";

const Editemp = () => {
  // ตรวจสอบ email phonenumber and id card
  const validateField = (name, value) => {
    switch (name) {
      case "mail":
        if (!/\S+@\S+\.\S+/.test(value)) {
          return "กรุณากรอกอีเมลให้ถูกต้อง";
        }
        break;
      case "id_card":
        if (!/^\d+$/.test(value)) {
          // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
          return "กรุณากรอกเลขบัตรประชาชนเป็นตัวเลขเท่านั้น";
        }
        if (value.length !== 13) {
          return "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก";
        }
        break;
      case "phone":
        if (!/^\d+$/.test(value)) {
          // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
          return "กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลขเท่านั้น";
        }
        if (value.length !== 10) {
          return "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก";
        }
        break;
      default:
        return "";
    }
    return "";
  };
  const location = useLocation();
  const { id_card } = location.state || {};
  const [formData, setFormData] = useState({
    id_card: "",
    f_name: "",
    l_name: "",
    phone: "",
    mail: "",
    h_number: "",
    road: "",
    subdistrict: "",
    district: "",
    province: "",
    provinceName: "",
    districtName: "",
    subdistrictName: "",
    zipcode: "",
    p_id: "",
    salary: "",
  });

  const [errors, setErrors] = useState({
    mail: "",
    id_card: "",
    phone: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);
  const [initialData, setInitialData] = useState(formData);
  const [position, setPosition] = useState([]);
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch provinces once on component mount
  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching province data:", error);
        Swal.fire("Error", "Failed to fetch province data", "error");
      }
    };
    fetchProvince();
  }, []);
  useEffect(() => {
    const fetchAmphures = async () => {
      if (formData.province) {
        try {
          const { data } = await axios.get(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json"
          );
          const filteredAmphures = data.filter(
            (amphure) => amphure.province_id === Number(formData.province)
          );
          setAmphures(filteredAmphures);
        } catch (error) {
          console.error("Error fetching amphures:", error);
          Swal.fire("Error", "Failed to fetch amphures", "error");
        }
      } else {
        setAmphures([]);
      }
    };

    fetchAmphures();
  }, [formData.province]);

  // fetch tambons
  useEffect(() => {
    const fetchTambons = async () => {
      if (formData.district) {
        try {
          const { data } = await axios.get(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json"
          );
          const filteredTambons = data.filter(
            (tambon) => tambon.amphure_id === Number(formData.district)
          );
          setTambons(filteredTambons);
        } catch (error) {
          console.error("Error fetching tambons:", error);
          Swal.fire("Error", "Failed to fetch tambons", "error");
        }
      } else {
        setTambons([]);
      }
    };

    fetchTambons();
  }, [formData.district]);

  // set data
  useEffect(() => {
    if (formData.subdistrict) {
      const selectedTambon = tambons.find(
        (tambon) => tambon.id === Number(formData.subdistrict)
      );
      if (selectedTambon) {
        setFormData((prevData) => ({
          ...prevData,
          zipcode: selectedTambon.zip_code || "",
          subdistrictName: selectedTambon.name_th,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        zipcode: "",
        subdistrictName: "",
      }));
    }
  }, [formData.subdistrict, tambons]);

  // fetch emp data
  useEffect(() => {
    const fetchEmp = async () => {
      try {
        const response = await axios.get(`/emp/${id_card}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        const employeeData = response.data.data;

        const province = provinces.find(
          (p) => p.name_th === employeeData.province
        );
        const provinceId = province ? province.id : null;

        // Fetch amphures
        const amphuresResponse = await axios.get(
          `https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json`
        );
        const filteredAmphures = amphuresResponse.data.filter(
          (d) => d.province_id === provinceId
        );
        setAmphures(filteredAmphures);

        const district = filteredAmphures.find(
          (d) => d.name_th === employeeData.district
        );
        const districtId = district ? district.id : null;

        // Fetch tambons
        const tambonsResponse = await axios.get(
          `https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json`
        );
        const filteredTambons = tambonsResponse.data.filter(
          (s) => s.amphure_id === districtId
        );
        setTambons(filteredTambons);

        const subdistrict = filteredTambons.find(
          (s) => s.name_th === employeeData.subdistrict
        );
        const subdistrictId = subdistrict ? subdistrict.id : null;

        const newFormdata = {
          id_card: employeeData.id_card,
          f_name: employeeData.f_name,
          l_name: employeeData.l_name,
          phone: employeeData.emp_phone,
          mail: employeeData.emp_mail,
          h_number: employeeData.house_number,
          road: employeeData.road,
          subdistrict: subdistrictId,
          district: districtId,
          province: provinceId,
          provinceName: employeeData.province,
          districtName: employeeData.district,
          subdistrictName: employeeData.subdistrict,
          zipcode: employeeData.zipcode,
          p_id: employeeData.p_id,
          salary: employeeData.salary,
        };
        setFormData(newFormdata);
        setInitialData(newFormdata);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        Swal.fire("Error", "Failed to fetch employee data", "error");
      }
    };

    if (id_card && provinces.length > 0) {
      fetchEmp();
    }
  }, [id_card, authData.token, provinces]);

  // fetch position
  useEffect(() => {
    const fetchPos = async () => {
      try {
        const positionsRes = await axios.get("/pos");
        const filteredPositions = positionsRes.data.data.filter(
          (position) => position.dept_id !== 1 && position.dept_id !== 5
        );
        setPosition(filteredPositions);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data", "error");
      }
    };

    fetchPos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (!errorMsg) {
      setErrors({ ...errors, [name]: "" });
    }

    if (name === "province") {
      const selectedProvince = provinces.find(
        (province) => province.id === Number(value)
      );
      setFormData({
        ...formData,
        province: value,
        provinceName: selectedProvince ? selectedProvince.name_th : "",
        district: "",
        districtName: "",
        subdistrict: "",
        subdistrictName: "",
        zipcode: "",
      });
      setAmphures([]);
      setTambons([]);
    } else if (name === "district") {
      const selectedDistrict = amphures.find(
        (amphure) => amphure.id === Number(value)
      );
      setFormData({
        ...formData,
        district: value,
        districtName: selectedDistrict ? selectedDistrict.name_th : "",
        subdistrict: "",
        subdistrictName: "",
        zipcode: "",
      });
      setTambons([]);
    } else if (name === "subdistrict") {
      setFormData({
        ...formData,
        subdistrict: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setErrors({ ...errors, [name]: errorMsg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      ...formData,
      province: formData.provinceName,
      district: formData.districtName,
      subdistrict: formData.subdistrictName,
    };
    try {
      await axios.put(`/emp/${id_card}`, postData, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      Swal.fire({
        title: "แก้ไขข้อมูลสำเร็จ",
        icon: "success",
        showConfirmButton: false,
        timer: 1000,
      });
      navigate("/empmanagement");
    } catch (error) {
      console.error("There was an error adding the employee!", error);
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  return (
    <div className="relative">
      <Menubar />
      <button
        onClick={() => window.history.back()}
        className="absolute top-20
       left-5 text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-yellow-900"
      >
        Back
      </button>
      <div className="flex justify-center min-h-screen">
        <div className="w-full max-w-xxl p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
            Edit Employee
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between mb-4">
              {/* First Name Input */}
              <div className="w-1/2 mr-2">
                <label className="block text-sm font-bold mb-2">
                  First Name*
                </label>
                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {/* Last Name Input */}
              <div className="w-1/2">
                <label className="block text-sm font-bold mb-2">
                  Last Name*
                </label>
                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between mb-4">
              {/* Email Input */}
              <div className="w-1/2 mr-2">
                <label className="block text-sm font-bold mb-2">Email*</label>
                <input
                  type="text"
                  name="mail"
                  value={formData.mail}
                  placeholder="Enter Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded ${
                    errors.mail ? "border-red-500" : "border-gray-300"
                  } rounded`}
                  required
                />
                {errors.mail && (
                  <p className="text-red-500 text-sm">{errors.mail}</p>
                )}
              </div>
              {/* Mobile Input */}
              <div className="w-1/2">
                <label className="block text-sm font-bold mb-2">
                  Phone Number:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Phone number"
                  required
                  className={`w-full p-2 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="flex justify-between mb-4">
              {/* House number */}
              <div className="w-1/2 mr-2">
                <label className="block text-sm font-bold mb-2">
                  House number
                </label>
                <input
                  type="text"
                  name="h_number"
                  value={formData.h_number}
                  onChange={handleChange}
                  placeholder="Enter House number"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {/* Road */}
              <div className="w-1/2">
                <label className="block text-sm font-bold mb-2">Road</label>
                <input
                  type="text"
                  name="road"
                  value={formData.road}
                  onChange={handleChange}
                  placeholder="Enter road"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-between mb-4">
              {/* Province Selection */}
              <div className="w-1/4 mr-2">
                <label className="block text-sm font-bold mb-2">
                  Province*
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* District (Amphure) Selection */}
              <div className="w-1/4 mr-2">
                <label className="block text-sm font-bold mb-2">
                  District*
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select District</option>
                  {amphures.map((amphure) => (
                    <option key={amphure.id} value={amphure.id}>
                      {amphure.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* Subdistrict (Tambon) Selection */}
              <div className="w-1/4 mr-2">
                <label className="block text-sm font-bold mb-2">
                  Subdistrict*
                </label>
                <select
                  name="subdistrict"
                  value={formData.subdistrict}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Subdistrict</option>
                  {tambons.map((tambon) => (
                    <option key={tambon.id} value={tambon.id}>
                      {tambon.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* Zipcode */}
              <div className="w-1/4">
                <label className="block text-sm font-bold mb-2">Zipcode*</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  placeholder="Enter Zipcode"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between mb-4">
              {/* Position */}
              <div className="w-1/2 mr-2">
                <label className="block text-sm font-bold mb-2">
                  Position*
                </label>
                <select
                  name="p_id"
                  value={formData.p_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Select Position</option>
                  {Array.isArray(position) &&
                    position.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.p_name}
                      </option>
                    ))}
                </select>
              </div>
              {/* Salary */}
              <div className="w-1/2">
                <label className="block text-sm font-bold mb-2">Salary*</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 mr-4"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Editemp;
