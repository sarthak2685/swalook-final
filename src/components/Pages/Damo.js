import React from 'react'


// Dummy data for employee details
const dummyData = {
  staff_joining_date: "2020-01-01",
  staff_name: "John Doe",
  staff_role: "Software Engineer",
  staff_salary_monthly: 50000,
  staff_commision_cap: 1000,
  house_rent_allownance: 2000,
  meal_allowance: 1500,
  staff_provident_fund: 1000,
  staff_professional_tax: 200,
  totalDeductions: 1200,
};

const Damo = () => {
  const currentMonth = "December";
  const currentYear = "2024";
  const netPay = {
    no_of_working_days: 20,
    earning: 54000,
    net_payble_amount: 52800,
  };

  const toWords = (num) => {
    // Function to convert numbers to words (simplified for demonstration)
    const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    return words[num] || "";
  };

  return (
    <div
      id="salary-slip-template"
      style={{
        display: "block",
        width: "210mm",
        padding: "20px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Salary Slip</h1>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>{dummyData.staff_name || "N/A"}</h3>
      <p>
        Date of Joining: {dummyData.staff_joining_date || "N/A"}
        <span style={{ marginLeft: "300px" }}>Employee Name: {dummyData.staff_name || "N/A"}</span>
      </p>
      <p>
        Payslip Period: {currentMonth} {currentYear}
        <span style={{ marginLeft: "300px" }}>Designation: {dummyData.staff_role || "N/A"}</span>
      </p>
      <p>Worked Days: {netPay.no_of_working_days || 0}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>Earnings</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Basic</td>
            <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.staff_salary_monthly || 0}</td>
          </tr>
          {dummyData.staff_commision_cap > 0 && (
            <tr>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Commission</td>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹{dummyData.staff_commision_cap || 0}</td>
            </tr>
          )}
          {dummyData.house_rent_allownance > 0 && (
            <tr>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>House Rent Allowance</td>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.house_rent_allownance || 0}</td>
            </tr>
          )}
          {dummyData.meal_allowance > 0 && (
            <tr>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Meal Allowance</td>
              <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.meal_allowance || 0}</td>
            </tr>
          )}
          <tr>
            <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Total Earnings</td>
            <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {netPay.earning || 0}</td>
          </tr>
        </tbody>
      </table>

      {(dummyData.staff_provident_fund > 0 ||
        dummyData.staff_professional_tax > 0 ||
        dummyData.totalDeductions > 0) && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "5px" }}>Deductions</th>
              <th style={{ border: "1px solid black", padding: "5px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.staff_provident_fund > 0 && (
              <tr>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Provident Fund</td>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.staff_provident_fund}</td>
              </tr>
            )}
            {dummyData.staff_professional_tax > 0 && (
              <tr>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Professional Tax</td>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.staff_professional_tax}</td>
              </tr>
            )}
            {dummyData.totalDeductions > 0 && (
              <tr>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Total Deductions</td>
                <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {dummyData.totalDeductions}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <h3 style={{ textAlign: "right", marginTop: "20px" }}>
        Net Pay: ₹ {netPay.net_payble_amount || 0}
      </h3>

      <div style={{ textAlign: "center", marginTop: "40px", fontSize: "16px" }}>
        <p>
          <strong>Net Pay in Numbers:</strong> ₹ {netPay.net_payble_amount || 0}
        </p>
        <p>
          In Words: {toWords(Math.floor(netPay.net_payble_amount))}{" "}
          {netPay.net_payble_amount % 1 > 0
            ? "and " + toWords(Math.round((netPay.net_payble_amount % 1) * 100)) + " Cents"
            : ""}
        </p>
      </div>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#888" }}>
        [This is a system-generated Salary Slip]
      </p>
    </div>
  );
};



export default Damo