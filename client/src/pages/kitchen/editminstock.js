import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import Menubar from "../../components/menuBar";
import { ChevronLeft } from "lucide-react";

function Editminstock() {
  const { state } = useLocation();
  const { id } = state || {};
  const { authData } = useContext(AuthContext);
  const [data, setData] = useState({
    material_id: "",
    min_qty: "",
    m_name: "",
    u_name: "",
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const fetchBymaterial = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/stock/bymaterial/${id}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setData({
        ...data,
        material_id: res.data.data.material_id || "",
        min_qty: res.data.data.min_qty || "",
        m_name: res.data.data.m_name || "",
        u_name: res.data.data.u_name || "",
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBymaterial();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(
        `/api/stock/editmin/${id}`,
        { min_qty: data.min_qty },
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );
      Swal.fire("Success", "อัปเดตเสร็จ", "success");
    } catch (error) {
      Swal.fire("เกิดข้อผิดพลาด");
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setIsLoading(false);
      navigate("/stocks");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Menubar />
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-4 shadow-md transition-all"
          >
            <ChevronLeft className="mr-2" />
            กลับ
          </button>
        </div>

        {/* Form Section */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="spinner border-t-4 border-blue-700 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-xl rounded-xl p-8 space-y-6 border border-gray-200"
          >
            {/* Material Name */}
            <div>
              <label
                htmlFor="m_name"
                className="block text-lg font-semibold text-blue-700 mb-2"
              >
                ชื่อวัตถุดิบ:
              </label>
              <h1 className="text-gray-800 text-lg font-medium px-4 py-2 bg-gray-50 border border-gray-200 rounded-md">
                {data.m_name}
              </h1>
            </div>

            {/* Minimum Quantity */}
            <div>
              <label
                htmlFor="min_qty"
                className="block text-lg font-semibold text-blue-700 mb-2"
              >
                จำนวนที่น้อยที่สุด:
              </label>
              <div className="flex items-center">
                <input
                  id="min_qty"
                  type="text"
                  name="min_qty"
                  value={data.min_qty}
                  onChange={(e) => setData({ ...data, min_qty: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
                />
                <span className="text-gray-700 text-lg">{data.u_name}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              บันทึก
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Editminstock;
