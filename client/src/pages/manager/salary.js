import React, { useContext, useState, useEffect } from "react";
import Menubar from "../../components/menuBar";
import Swal from "sweetalert2";
import axios from "../../utils/axiosInstance";
import AuthContext from "../../components/auth/authcontext";

function Salary() {
  const [allemp, setAllemp] = useState([]);
  const [employeeDept, setEmployeeDept] = useState(null);
  const [lateCounts, setLateCounts] = useState({});
  const [absentCounts, setabsentCounts] = useState({});
  const { authData } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empResponse = await axios.get("/emp", {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        const allEmployees = empResponse.data.data;

        const deptResponse = await axios.get(`/emp/data/${authData.id_card}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });
        const employeeDept = Array.isArray(deptResponse.data.data)
          ? deptResponse.data.data[0].dept_id
          : deptResponse.data.data.dept_id;

        setEmployeeDept(employeeDept);

        let filteredEmployees = [];
        if (employeeDept === 1) {
          filteredEmployees = allEmployees;
        } else if (employeeDept === 5) {
          filteredEmployees = allEmployees.filter(
            (emp) => emp.dept_id !== 5 && emp.dept_id !== 1
          );
        }

        setAllemp(filteredEmployees);

        const lateCountsData = {};
        const absentCountData = {};

        for (let emp of filteredEmployees) {
          const lateres = await axios.get(`/emp/countlate/${emp.id_card}`);
          const absentres = await axios.get(`/emp/countabsent/${emp.id_card}`);

          lateCountsData[emp.id_card] = lateres.data.data[0]?.countlate || 0;
          absentCountData[emp.id_card] =
            absentres.data.data[0]?.absent_count || 0;
        }

        setLateCounts(lateCountsData);
        setabsentCounts(absentCountData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch data.",
        });
      }
    };

    fetchData();
  }, [authData.token, authData.id_card]);

  const calculateSalaryAfterDeductions = (salary, lateCount, absentCount) => {
    const lateDeduction = lateCount * 50;
    const absentDeduction = absentCount * 300;
    const finalSalary = salary - lateDeduction - absentDeduction;

    return isNaN(finalSalary) ? 0 : finalSalary;
  };

  const handlePrint = (emp) => {
    const printContent = `
      <div>
        <h1>ใบเงินเดือนพนักงาน</h1>
        <p>ชื่อ: ${emp.f_name} ${emp.l_name}</p>
        <p>ตำแหน่ง: ${emp.p_name}</p>
        <p>แผนก: ${emp.dept_name}</p>
        <p>เงินเดือน: ${emp.salary}</p>
        <p>สาย: ${lateCounts[emp.id_card]} ครั้ง</p>
        <p>ขาด: ${absentCounts[emp.id_card]} ครั้ง</p>
        <p>เงินเดือนหลังหัก: ${calculateSalaryAfterDeductions(
          emp.salary,
          lateCounts[emp.id_card],
          absentCounts[emp.id_card]
        )}</p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <Menubar />
      <h1>ข้อมูลพนักงาน</h1>
      <table>
        <thead>
          <tr>
            <th>ID card</th>
            <th>ชื่อ</th>
            <th>ตำแหน่ง</th>
            <th>แผนก</th>
            <th>เงินเดือน</th>
            <th>สาย</th>
            <th>ขาด</th>
            <th>เงินเดือนหลังหัก</th>
            <th>พิมพ์</th>
          </tr>
        </thead>
        <tbody>
          {allemp.length > 0 ? (
            allemp.map((emp) => (
              <tr key={emp.id_card}>
                <td>{emp.id_card}</td>
                <td>
                  {emp.f_name} {emp.l_name}
                </td>
                <td>{emp.p_name}</td>
                <td>{emp.dept_name}</td>
                <td>{emp.salary}</td>
                <td>{lateCounts[emp.id_card]}</td>
                <td>{absentCounts[emp.id_card]}</td>
                <td>
                  {calculateSalaryAfterDeductions(
                    emp.salary,
                    lateCounts[emp.id_card],
                    absentCounts[emp.id_card]
                  )}
                </td>
                <td>
                  <button onClick={() => handlePrint(emp)}>พิมพ์</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">ไม่มีข้อมูลพนักงาน</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Salary;
