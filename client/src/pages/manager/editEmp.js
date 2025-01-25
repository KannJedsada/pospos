import React, { useState, useEffect, useContext } from "react";
import Menubar from "../../components/menuBar";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";

const Editemp = () => {
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
        console.log(value);
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
  const [isLoading, setIsLoading] = useState(false);
  const [empAccess, setEmpAccess] = useState([]);
  
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
  
  // Fetch provinces once on component mount
  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json",
          {
            withCredentials: false,
          }
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

  // fetch emp data
  useEffect(() => {
    const fetchEmp = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/emp/${id_card}`, {
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
          `https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json`,
          {
            withCredentials: false,
          }
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
          `https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json`,
          {
            withCredentials: false,
          }
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
        };
        setFormData(newFormdata);
        setInitialData(newFormdata);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        Swal.fire("Error", "Failed to fetch employee data", "error");
      } finally {
        setIsLoading(false);
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
        const positionsRes = await axios.get("/api/pos");
        const allPositions = positionsRes.data.data;
        console.log(empAccess.access);
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
    const error = validateField(name, value, formData);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await axios.put(`/api/emp/${id_card}`, postData, {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  return (
    <div className="relative bg-gray-100 max-h-screen">
      <Menubar />
      <button
        onClick={() => window.history.back()}
        className="absolute top-20 left-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        <ArrowBackIosNewOutlinedIcon />
      </button>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-xxl bg-white p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
              แก้ไขข้อมูลพนักงาน
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* First Name Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2 ">
                    ชื่อจริง*
                  </label>
                  <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={handleChange}
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
                <div>
                  <label className="block text-sm font-semibold mb-2 ">
                    นามสกุล*
                  </label>
                  <input
                    type="text"
                    name="l_name"
                    value={formData.l_name}
                    onBlur={handleBlur}
                    onChange={handleChange}
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2 ">
                    อีเมล*
                  </label>
                  <input
                    type="email"
                    name="mail"
                    value={formData.mail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="example@email.com"
                    className={`w-full px-4 py-2 border ${errors.mail ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none`}
                    required
                  />
                  {errors.mail && (
                    <p className="text-red-500 text-sm mt-1">{errors.mail}</p>
                  )}
                </div>
                {/* Mobile Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2 ">
                    เบอร์โทรศัพท์*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="เบอร์โทรศัทพ์"
                    className={`w-full px-4 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mb-4 gap-4">
                {/* House number */}
                <div className="w-1/2">
                  <label className="block text-sm font-bold  mb-2">
                    บ้านเลขที่
                  </label>
                  <input
                    type="text"
                    name="h_number"
                    value={formData.h_number}
                    onChange={handleChange}
                    placeholder="บ้านเลขที่"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>
                {/* Road */}
                <div className="w-1/2">
                  <label className="block text-sm font-bold  mb-2">ถนน</label>
                  <input
                    type="text"
                    name="road"
                    value={formData.road}
                    onChange={handleChange}
                    placeholder="ถนน"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {/* Province Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2 ">
                    จังหวัด*
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
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
                <div className="w-full mr-2">
                  <label className="block text-sm font-bold  mb-2">
                    อำเภอ*
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
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
                {/* Subdistrict (Tambon) Selection */}
                <div className="w-full mr-2">
                  <label className="block text-sm font-bold  mb-2">ตำบล*</label>
                  <select
                    name="subdistrict"
                    value={formData.subdistrict}
                    onChange={handleChange}
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
                  <label className="block text-sm font-bold  mb-2">
                    รหัสไปรษณีย์*
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    placeholder="รหัสไปรษณีย์"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mb-4">
                {/* Position */}
                <div className="w-1/2 mr-2">
                  <label className="block text-sm font-bold  mb-2">
                    ตำแหน่ง*
                  </label>
                  <select
                    name="p_id"
                    value={formData.p_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    required
                  >
                    <option value="">เลือกตำแหน่ง</option>
                    {Array.isArray(position) &&
                      position.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.p_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 mr-4"
                >
                  คืนค่า
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-300"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editemp;
