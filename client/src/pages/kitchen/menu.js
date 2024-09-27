import React, { useEffect, useState, useContext } from "react";
import Menubar from "../../components/menuBar";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Menu() {
  const { authData } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectCategory, setSelectdCategory] = useState("");
  const navigate = useNavigate();

  const fetchMenus = async (catId = "") => {
    try {
      let res;
      if (catId) {
        res = await axios.get(`/menu/menu/category/${catId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      } else {
        res = await axios.get(`/menu/menus`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
      }
      setMenus(res.data.data);
      setFilteredMenus(res.data.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      Swal.fire("Error", "Failed to fetch menus", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/menu/menucategory`, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });
      setCategory(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire("Error", "Failed to fetch categories", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: `Do you want to delete this menu with ID: ${id}?`,
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.delete(`/menu/deletemenu/${id}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });

        Swal.fire({
          icon: "success",
          title: "Delete successful",
          showConfirmButton: false,
          timer: 1000,
        });

        fetchMenus();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("Deletion cancelled");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      Swal.fire("Error", "Failed to delete menu", "error");
    }
  };

  const handleEdit = (id) => {
    navigate(`/editmenu`, { state: { id } });
  };

  const handleAddMenu = () => {
    navigate("/addmenu");
  };

  // Run once when the component mounts
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, [authData.token]);

  // Filter the menus by search term
  useEffect(() => {
    const filtered = menus.filter((menu) =>
      (menu.menu_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenus(filtered);
  }, [searchTerm, menus]);

  // Fetch menus by category when `selectCategory` changes
  useEffect(() => {
    fetchMenus(selectCategory);
  }, [selectCategory, authData.token]);

  return (
    <div>
      <Menubar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Menus</h1>
        <div className="mb-4 flex justify-between">
          <div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-1/4"
            />
            <select
              value={selectCategory}
              onChange={(e) => setSelectdCategory(e.target.value)}
              className="border border-gray-300 p-2 rounded-md mr-4 ml-4"
            >
              <option value="">หมวดหมู่</option>
              {category.length > 0 &&
                category.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={handleAddMenu}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Menu
          </button>
        </div>
        <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border-b">No.</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Price (บาท)</th>
              <th className="px-4 py-2 border-b">Img</th>
              <th className="px-4 py-2 border-b">Category</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {filteredMenus.length > 0 ? (
              filteredMenus.map((menu, index) => {
                return (
                  <tr key={menu.menu_id}>
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">
                      {menu.menu_name || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {menu.price || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b flex justify-center items-center">
                      {menu.menu_img ? (
                        <img
                          src={`http://localhost:5000/uploads/menu/${menu.menu_img}`}
                          alt={menu.menu_name || "Menu image"}
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {menu.category_name || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="mr-8"
                        onClick={() => handleEdit(menu.menu_id)}
                      >
                        edit
                      </button>
                      <button onClick={() => handleDelete(menu.menu_id)}>
                        delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Menu;
