import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/login";
import LoginSystem from "./components/auth/loginSystem";
import Schedules from "./pages/schedules";
import Manager from "./pages/manager/manager";
import Checkin from "./pages/manager/checkin";
import Checkout from "./pages/manager/checkout";
import Addemp from "./pages/manager/addEmp";
import Editemp from "./pages/manager/editEmp";
import EmpManagement from "./pages/manager/empManagement";
import Workdate from "./pages/manager/workdate";
import PrivateRoute from "./components/PrivateRoute";
import Addworkdate from "./pages/manager/addworkdate";
import Editworkdate from "./pages/manager/editworkdate";
import Kitchen from "./pages/kitchen/kitchen";
import Orderdinks from "./pages/kitchen/orderDrink";
import MaterialPage from "./pages/kitchen/material";
import Addmaterial from "./pages/kitchen/addmaterial";
import Editmaterial from "./pages/kitchen/editmaterial";
import Menus from "./pages/kitchen/menu";
import Addmenu from "./pages/kitchen/addmenu";
import Editmenu from "./pages/kitchen/editmenu";
import Editmenuprice from "./pages/kitchen/editmenuprice";
import Stocks from "./pages/kitchen/stocks";
import Addstock from "./pages/kitchen/addstock";
import Editminstock from "./pages/kitchen/editminstock";
import DeptManagement from "./pages/manager/deptManagement";
import Position from "./pages/manager/position";
import AddPosition from "./pages/manager/addPosition";
import Editposition from "./pages/manager/editposition";
import Tables from "./pages/cashier/tables";
import Table from "./pages/cashier/table";
import Promotion from "./pages/manager/promotion";
import Order from "./pages/cashier/order";
import Ordered from "./pages/cashier/ordered";
import Receipt from "./pages/cashier/receipt";
import Menucategory from "./pages/kitchen/menucategory";
import Unit from "./pages/kitchen/unit";
import StockDetail from "./pages/kitchen/stockDetail";
import Allreceipt from "./pages/cashier/allreceipt";
import PrintReceipt from "./components/printReceipt";
import Access from "./pages/manager/access";
import { AuthProvider } from "./components/auth/authcontext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* เส้นทางหลัก */}
          <Route path="/" element={<LoginSystem />} />
          <Route path="/login" element={<Login />} />

          {/* เส้นทางที่ต้องการการยืนยันตัวตน */}
          <Route element={<PrivateRoute />}>
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/empmanagement" element={<EmpManagement />} />
            <Route path="/addemp" element={<Addemp />} />
            <Route path="/editemp" element={<Editemp />} />
            <Route path="/workdate" element={<Workdate />} />
            <Route path="/addworkdate" element={<Addworkdate />} />
            <Route path="/editworkdate" element={<Editworkdate />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/orderdinks" element={<Orderdinks />} />
            <Route path="/material" element={<MaterialPage />} />
            <Route path="/addmaterial" element={<Addmaterial />} />
            <Route path="/editmaterial" element={<Editmaterial />} />
            <Route path="/editprice" element={<Editmenuprice />} />
            <Route path="/menus" element={<Menus />} />
            <Route path="/addmenu" element={<Addmenu />} />
            <Route path="/editmenu" element={<Editmenu />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/addstock" element={<Addstock />} />
            <Route path="/editminstock" element={<Editminstock />} />
            <Route path="/department" element={<DeptManagement />} />
            <Route path="/position" element={<Position />} />
            <Route path="/addposition" element={<AddPosition />} />
            <Route path="/editposition" element={<Editposition />} />
            <Route path="/promotion" element={<Promotion />} />
            <Route path="/order" element={<Order />} />
            <Route path="/ordered" element={<Ordered />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/menucategory" element={<Menucategory />} />
            <Route path="/unit" element={<Unit />} />
            <Route path="/stockdetail" element={<StockDetail />} />
            <Route path="/allreeipt" element={<Allreceipt />} />
            <Route path="/access" element={<Access />} />
          </Route>

          {/* เส้นทางที่ไม่ต้องการการยืนยันตัวตน */}
          <Route path="/table/:id" element={<Table />} />
          <Route path="/printReceipt" element={<PrintReceipt />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
