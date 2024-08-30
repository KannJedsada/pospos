// src/App.js
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
import { AuthProvider } from "./components/auth/authcontext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginSystem />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/empmanagement" element={<EmpManagement />} />
            <Route path="/addemp" element={<Addemp />} />
            <Route path="/editemp" element={<Editemp />} />
            <Route path="/workdate" element={<Workdate />} />

            {/* เพิ่มเส้นทางที่ต้องการการเข้าสู่ระบบ */}
          </Route>

          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
