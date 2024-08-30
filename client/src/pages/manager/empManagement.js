import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EmpManagement = () => {
  const { authData } = useContext(AuthContext);
  const [employees, setEmployees] = useState({ data: [] });
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState({ data: [] });
  const [positions, setPositions] = useState({ data: [] });
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const navigate = useNavigate();

  // fetch data emp
  const fetchEmployees = async (deptId = "", positionId = "") => {
    try {
      let response;
      if (deptId && positionId) {
        response = await axios.get(
          `/emp/dept/${deptId}/position/${positionId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          }
        );
      } else if (deptId) {
        response = await axios.get(`/emp/dept/${deptId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else if (positionId) {
        response = await axios.get(`/emp/position/${positionId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else {
        response = await axios.get("/emp", {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      }
      setEmployees(response.data);
      setFilteredEmployees(response.data);
      // console.log("Fetched data:", response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error", "Failed to fetch employee data", "error");
    }
  };

  // fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/dept", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      Swal.fire("Error", "Failed to fetch departments", "error");
    }
  };

  // fetch position
  const fetchPositions = async () => {
    try {
      const response = await axios.get("/pos", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      Swal.fire("Error", "Failed to fetch positions", "error");
    }
  };

  // edit button
  const handleEdit = (id_card) => {
    navigate("/editemp", { state: { id_card } });
    // console.log("Edit employee with ID:", id_card);
  };

  // delete button
  const handleDelete = (id_card) => {
    try {
      Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: `Do you want to delete employee with ID: ${id_card}?`,
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          console.log("Delete employee with ID:", id_card);
          const res = await axios.delete(`/emp/${id_card}`, {
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
          });
          Swal.fire({
            icon: "success",
            title: "delete success",
            showConfirmButton: false,
            timer: 1000,
          });

          fetchEmployees();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log("Deletion cancelled");
        }
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  // add new emp
  const handleAdd = () => {
    navigate("/addemp");
  };

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    fetchEmployees(selectedDept, selectedPosition);
  }, [selectedDept, selectedPosition, authData.token]);

  // filter name emp
  useEffect(() => {
    let filtered = employees.data;

    if (searchTerm) {
      filtered = filtered.filter((employee) =>
        (employee.f_name + " " + employee.l_name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  return (
    <div className="wrapper">
      <Menubar />
      <div className="container mx-auto mt-4 p-4">
        <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
        <div className="flex justify-between">
          {/* search name select by department and position */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="border border-gray-300 p-2 rounded-md"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border border-gray-300 p-2 rounded-md mr-4 ml-4"
            >
              <option value="">Select Department</option>
              {departments.data.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            >
              <option value="">Select Position</option>
              {positions.data.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.p_name}
                </option>
              ))}
            </select>
          </div>
          {/* Add new emp button */}
          <div>
            <button
              onClick={() => handleAdd()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add
            </button>
          </div>
        </div>
        {/* table emp data */}
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left text-gray-600">Id Card</th>
              <th className="py-2 px-4 text-left text-gray-600">Name</th>
              <th className="py-2 px-4 text-left text-gray-600">Department</th>
              <th className="py-2 px-4 text-left text-gray-600">Position</th>
              <th className="py-2 px-4 text-left text-gray-600">Salary</th>
              <th className="py-2 px-4 text-left text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredEmployees) &&
            filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id_card} className="border-b">
                  <td className="py-2 px-4"> {employee.id_card}</td>
                  <td className="py-2 px-4">
                    {employee.f_name} {employee.l_name}
                  </td>
                  <td className="py-2 px-4">{employee.dept_name || "N/A"}</td>
                  <td className="py-2 px-4">{employee.p_name || "N/A"}</td>
                  <td className="py-2 px-4">{employee.salary || "N/A"}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEdit(employee.id_card)}
                      className={`px-4 py-1 rounded ${
                        employee.dept_id === 1
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                      disabled={employee.dept_id === 1}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id_card)}
                      className={`px-4 py-1 rounded ${
                        employee.dept_id === 1 ||
                        employee.id_card === authData.id_card
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white ml-2`}
                      disabled={
                        employee.dept_id === 1 ||
                        employee.id_card === authData.id_card
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-2 px-4 text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmpManagement;
