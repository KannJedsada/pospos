import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChevronLeft } from "lucide-react";

function Editposition() {
  const { authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { id } = location.state || {};
  const [dept, setDept] = useState([]);
  const [data, setData] = useState({
    p_name: "",
    dept_id: "",
    start_time: "",
    end_time: "",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const posRes = await axios.get(`/api/pos/getpos/${id}`);
      const pos = posRes.data.data;
      setData({
        p_name: pos.p_name,
        dept_id: pos.dept_id,
        start_time: pos.start_time,
        end_time: pos.end_time,
      });
      const deptName = await axios.get(`/api/dept/${pos.dept_id}`);
      setDept(deptName.data.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (timeError) {
      Swal.fire({
        title: "เวลาเลิกงานห้ามน้อยกว่าเวลาเริ่มงาน",
        icon: "error",
        showConfirmButton: true,
      });
      return;
    }

    try {
      console.log(data);
      const res = await axios.put(`/api/pos/${id}`, data, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "แก้ไขตำแหน่งสำเร็จ",
        showConfirmButton: false,
        timer: 1000,
      });
      navigate(-1);
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "เกิดข้อผิดพลากในการแก้ไขตำแหน่ง", "error");
    }
  };

  const [timeError, setTimeError] = useState(false);

  const handleEndTimeChange = (e) => {
    const { name, value } = e.target;
    const startTime = data.start_time;

    if (startTime && value <= startTime) {
      setTimeError(true);
    } else {
      setTimeError(false);
    }

    // อัปเดตข้อมูล
    handleChange(e);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <Menubar />
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center">
          <button
            className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-4 shadow"
            onClick={() => window.history.back()}
          >
            <ChevronLeft />
          </button>
          <h2 className="text-3xl font-semibold text-blue-700">
            แก้ไขตำแหน่ง {dept.dept_name}
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow-lg mx-auto"
          >
            {/* ชื่อตำแหน่ง */}
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                ชื่อตำแหน่ง
              </label>
              <input
                type="text"
                name="p_name"
                value={data.p_name}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
                placeholder="กรอกชื่อตำแหน่ง"
                required
              />
            </div>

            {/* เวลาเริ่มงานและเวลาเลิกงาน */}
            <div className="flex gap-2">
              {/* เวลาเริ่มงาน */}
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  เวลาเริ่มงาน
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={data.start_time}
                  onChange={handleChange}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
                  required
                />
              </div>

              {/* เวลาเลิกงาน */}
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  เวลาเลิกงาน
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={data.end_time}
                  onChange={handleEndTimeChange}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-700"
                  required
                />
                {timeError && (
                  <p className="text-red-500 text-sm mt-1">
                    เวลาเลิกงานต้องมากกว่าเวลาเริ่มงาน
                  </p>
                )}
              </div>
            </div>

            {/* ปุ่มเพิ่มตำแหน่ง */}
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Editposition;
