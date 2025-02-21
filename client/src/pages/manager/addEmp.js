import React, { useState, useEffect, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";

const Addemp = () => {
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
  });

  const [errors, setErrors] = useState({
    mail: "",
    id_card: "",
    phone: "",
  });

  // ตรวจสอบ email phonenumber and id card
  const validateField = (name, value, otherFieldValues) => {
    switch (name) {
      case "mail":
        if (!/\S+@\S+\.\S+/.test(value)) {
          return "กรุณากรอกอีเมลให้ถูกต้อง";
        }
        break;
      case "id_card":
        if (!/^\d+$/.test(value)) {
          return "กรุณากรอกเลขบัตรประชาชนเป็นตัวเลขเท่านั้น";
        }
        if (value.length !== 13) {
          return "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก";
        }
        break;
      case "phone":
        if (!/^\d+$/.test(value)) {
          return "กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลขเท่านั้น";
        }
        if (value.length !== 10) {
          return "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก";
        }
        break;
      case "f_name":
        if (!/^[\u0E00-\u0E7F]+$/.test(value) && !/^[A-Za-z]+$/.test(value)) {
          return "กรุณากรอกชื่อ-นามสกุลเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น";
        }
        break;

      case "l_name":
        if (!/^[\u0E00-\u0E7F]+$/.test(value) && !/^[A-Za-z]+$/.test(value)) {
          return "กรุณากรอกชื่อ-นามสกุลเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น";
        }
        const isThai = /^[\u0E00-\u0E7F]+$/.test(value);
        const isEnglish = /^[A-Za-z]+$/.test(value);

        const isOtherThai = /^[\u0E00-\u0E7F]+$/.test(formData.f_name);
        const isOtherEnglish = /^[A-Za-z]+$/.test(formData.f_name);

        // // ตรวจสอบว่าทั้งสองฟิลด์เป็นภาษาที่ตรงกันหรือไม่
        if ((isThai && !isOtherThai) || (isEnglish && !isOtherEnglish)) {
          return "ชื่อและนามสกุลต้องเป็นภาษาเดียวกัน";
        }
        break;

      default:
        return "";
    }
    return "";
  };

  const [provinces, setProvinces] = useState([]);
  const [amphures, setAmphures] = useState([]);
  const [tambons, setTambons] = useState([]);
  const [positions, setPosition] = useState([]);
  const [empAccess, setEmpAccess] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { authData } = useContext(AuthContext);

  // fetch provinces and position
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        const access = await axios.get(`/api/emp/empdept/${authData.id_card}`);
        const empData = access?.data?.data;
        setEmpAccess(empData); // อัปเดต State
      } catch (error) {
        console.error("Error fetching employee data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // useEffect to fetch provinces and positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provincesRes, positionsRes] = await Promise.all([
          axios.get(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json",
            {
              withCredentials: false,
            }
          ),
          axios.get("/api/pos"),
        ]);

        setProvinces(provincesRes.data);

        // กรองตำแหน่งตามเงื่อนไข empAccess.access
        const allPositions = positionsRes.data.data;
        const filteredPositions =
          empAccess.access === 1 || empAccess.access === 0
            ? allPositions
            : allPositions.filter(
              (position) => position.dept_id !== 1 && position.dept_id !== 2
            );
        setPosition(filteredPositions);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to fetch data", "error");
      }
    };

    fetchData();
  }, [empAccess]);

  // fetch Amphues
  useEffect(() => {
    const fetchAmphures = async () => {
      if (formData.province) {
        try {
          const { data } = await axios.get(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json",
            {
              withCredentials: false,
            }
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
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json",
            {
              withCredentials: false,
            }
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

  // เมื่อมีการเปลี่ยนแปลง
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
    const error = validateField(name, value, formData);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // เมื่อกด submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่ามี error ในฟอร์มหรือไม่
    const hasErrors = Object.values(errors).some((error) => error !== "");

    if (hasErrors) {
      Swal.fire({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        icon: "error",
        showConfirmButton: true,
      });
      return;
    }

    const postData = {
      ...formData,
      province: formData.provinceName,
      district: formData.districtName,
      subdistrict: formData.subdistrictName,
    };

    try {
      setIsLoading(true);
      await axios.post("/api/emp", postData, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      Swal.fire({
        title: "เพิ่มข้อมูลสำเร็จ",
        icon: "success",
        showConfirmButton: false,
        timer: 1000,
      });
      handleReset();
    } catch (error) {
      console.error("There was an error adding the employee!", error);
      alert("Failed to add employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // reset data
  const handleReset = () => {
    setFormData({
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
    });
    setAmphures([]);
    setTambons([]);
    setErrors({});
  };

  return (
    <div className="">
      <Menubar />
      <button
        onClick={() => window.history.back()}
        className="absolute top-20 left-5 text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-2.5 shadow-md"
      >
        <ArrowBackIosNewOutlinedIcon />
      </button>
      <div className="flex justify-center items-center px-4">
        <div className="w-full max-w-4xl p-8 bg-white">
          <h2 className="text-3xl font-semibold mb-6 text-blue-700 text-center">
            เพิ่มข้อมูลพนักงานใหม่
          </h2>
          <form onSubmit={handleSubmit}>
            {/* ID Card Input */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">
                เลขประจำตัวประชาชน:
              </label>
              <input
                type="text"
                name="id_card"
                value={formData.id_card}
                onChange={handleChange}
                disabled={isLoading}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${errors.id_card ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                placeholder="เลขประจำตัวประชาชน 13 หลัก"
                required
              />
              {errors.id_card && (
                <p className="text-red-500 text-sm mt-1">{errors.id_card}</p>
              )}
            </div>

            {/* First and Last Name Inputs */}
            <div className="flex flex-col md:flex-row md:gap-4 mb-4">
              {/* First Name Input */}
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">
                  ชื่อจริง*
                </label>
                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  onBlur={handleBlur}
                  placeholder="ชื่อจริง"
                  className={`w-full px-3 py-2 border ${errors.f_name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  required
                />
                {errors.f_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.f_name}</p>
                )}
              </div>
              {/* Last Name Input */}
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">นามสกุล*</label>
                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleChange}
                  disabled={isLoading}
                  onBlur={handleBlur}
                  placeholder="นามสกุล"
                  className={`w-full px-3 py-2 border ${errors.l_name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  required
                />
                {errors.l_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.l_name}</p>
                )}
              </div>
            </div>

            {/* Email and Phone Inputs */}
            <div className="flex flex-col md:flex-row md:gap-4 mb-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">อีเมล*</label>
                <input
                  type="email"
                  name="mail"
                  value={formData.mail}
                  placeholder="example@email.com"
                  onChange={handleChange}
                  disabled={isLoading}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.mail ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  required
                />
                {errors.mail && (
                  <p className="text-red-500 text-sm mt-1">{errors.mail}</p>
                )}
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">
                  เบอร์โทรศัพท์:
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  onBlur={handleBlur}
                  placeholder="เบอร์โทรศัพท์"
                  className={`w-full px-3 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Inputs */}
            <div className="flex flex-col md:flex-row md:gap-4 mb-4">
              {/* House number */}
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">
                  บ้านเลขที่*
                </label>
                <input
                  type="text"
                  name="h_number"
                  value={formData.h_number}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="บ้านเลขที่"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              {/* Road */}
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-bold mb-2">ถนน</label>
                <input
                  type="text"
                  name="road"
                  value={formData.road}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="ถนน"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Province, District, Subdistrict and Zipcode Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Province */}
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2">
                  จังหวัด*
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* District */}
              <div className="w-full">
                <label className="block text-sm font-bold mb-2">อำเภอ*</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  required
                >
                  <option value="">เลือกอำเภอ</option>
                  {amphures.map((amphure) => (
                    <option key={amphure.id} value={amphure.id}>
                      {amphure.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* Subdistrict */}
              <div className="w-full">
                <label className="block text-sm font-bold mb-2">ตำบล*</label>
                <select
                  name="subdistrict"
                  value={formData.subdistrict}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  required
                >
                  <option value="">เลือกตำบล</option>
                  {tambons.map((tambon) => (
                    <option key={tambon.id} value={tambon.id}>
                      {tambon.name_th}
                    </option>
                  ))}
                </select>
              </div>
              {/* Zipcode */}
              <div className="w-full">
                <label className="block text-sm font-bold mb-2">
                  รหัสไปรษณีย์*
                </label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="รหัสไปรษณีย์"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Position */}
            <div className="w-full mb-4">
              <label className="block text-sm font-bold mb-2">ตำแหน่ง*</label>
              <select
                name="p_id"
                value={formData.p_id}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                required
              >
                <option value="">เลือกตำแหน่ง</option>
                {Array.isArray(positions) &&
                  positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.p_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Submit and Reset Buttons */}
            <div className="flex justify-center mt-6 gap-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                คืนค่า
              </button>
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Addemp;
