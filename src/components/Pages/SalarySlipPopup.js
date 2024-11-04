import React, { useEffect, useState } from "react";
import "../Styles/SalarySlip.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import config from "../../config";
import { toWords } from 'number-to-words';


const SalarySlipPopup = ({ onClose, staffId }) => {
  const [salarySlipData, setSalarySlipData] = useState(null);
  const [salarySlips, setSalarySlips] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();
  const [netPay, setNetPay] = useState();
  const [netPayableAmount, setNetPayableAmount] = useState(null);

  
  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');

  const fetchEmployeeDataById = async (staffId) => {
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/staff/?id=${staffId}&branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch employee data');
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  useEffect(() => {
    const fetchSalarySlip = async () => {
      setLoading(true); // Set loading to true while fetching data
      const token = localStorage.getItem('token');
      const bid = localStorage.getItem('branch_id');
      if (staffId) {
        try {
          const response = await fetch(`${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          // Log the data to inspect its structure
          console.log('API Response:', data);

          if (data.status && data.table_data && Array.isArray(data.table_data)) {
            const matchedEmployee = data.table_data.find((employee) => employee.id === staffId);
            console.log('Employee Data:', matchedEmployee);
            if (matchedEmployee) {
              setSalarySlipData(matchedEmployee);

              // Set initial salary slips based on the matched employee's data
              const initialSlips = matchedEmployee.salarySlips?.map((slip) => ({
                id: slip.id,
                month: slip.month,
                year: slip.year,
                downloadLink: slip.downloadLink,
              })) || [];
              setSalarySlips(initialSlips);

              const payLoad = await fetch(`${config.apiUrl}/api/swalook/staff/generate-payslip/?id=${staffId}`, {
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              const payLoadData = await payLoad.json();
              console.log("kya hua ", payLoadData);
              setNetPay(payLoadData);
              setNetPayableAmount(payLoadData.net_payble_amount);
            } else {
              console.error(`No employee found with ID: ${staffId}`);
              setSalarySlipData(null);
              setSalarySlips([]);
            }
          } else {
            console.error("API response does not contain table_data or it's not an array:", data);
            setSalarySlipData(null);
            setSalarySlips([]);
          }
        } catch (error) {
          console.error("Error fetching salary slip:", error);
        } finally {
          setLoading(false); // Stop loading regardless of success or failure
        }
      }
    };

    fetchSalarySlip();
  }, [staffId]);

 


  const handleGenerateSalarySlip = async () => {
    try {
      const newSlip = {
        id: salarySlips.length + 1,
        month: currentMonth,
        year: currentYear,
        downloadLink: "#", // Placeholder until PDF generation is implemented
      };
      setSalarySlips([...salarySlips, newSlip]);
      generatePDF(salarySlipData); // Generate PDF after adding the new slip
    } catch (error) {
      console.error("Error generating salary slip:", error);
    }
  };

  const handleDownloadSlip = async (id) => {
    const slip = salarySlips.find((s) => s.id === id);
    if (slip) {
      const employeeData = await fetchEmployeeDataById(staffId);
      if (employeeData) {
        generatePDF(employeeData);
      } else {
        alert('Employee data not found.');
      }
    }
  };

  const generatePDF = async (employeeData) => {
    const slipContent = document.getElementById("salary-slip-template");
  
    // Temporarily make the slip content visible for rendering
    slipContent.style.display = "block";
  
    try {
      // Create a canvas from the slip content
      const canvas = await html2canvas(slipContent, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Increase scale for better resolution
      });
  
      // Check if canvas was created successfully
      if (!canvas) {
        console.error("Failed to create canvas");
        return;
      }
  
      // Generate image data from canvas
      const imgData = canvas.toDataURL("image/png");
  
      // Validate imgData
      if (!imgData || imgData === "data:,") {
        console.error("Generated image data is invalid");
        return;
      }
  
      // Create PDF and add the image
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 150); // Adjust position and size if necessary
  
      // Save the PDF
      pdf.save(`Salary_Slip_${employeeData?.staff_name || "Unknown"}_${currentMonth}_${currentYear}.pdf`);
    } catch (error) {
      // Log the error if PDF generation fails
      console.error("Error generating PDF:", error);
    } finally {
      // Hide the slip content again
      slipContent.style.display = "none";
    }
  };
  
  

  // const amount = netPay?.net_payble_amount;
  // const amountInWords = toWords(amount);   
  

  const employeeData = salarySlipData || {}; // Default to empty object to avoid errors
  console.log("Employee Data:", employeeData);

  return (
    <div className="popup-overlay2">
      <div className="popup-container2">
        <h2 className="popup-title2">Salary Slips</h2>
        {loading ? (
          <p>Loading...</p> 
        ) : (
          <>
            {salarySlipData ? (
              <>
                <table className="salary-table2">
                  <thead>
                    <tr>
                      <th>Month & Year</th>
                      <th>Salary Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salarySlips.map((slip) => (
                      <tr key={slip.id}>
                        <td>{`${slip.month} ${slip.year}`}</td>
                        <td>
                          <button
                            className="download-button2"
                            onClick={() => handleDownloadSlip(slip.id)}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="button-group2">
                  <button
                    className="generate-button2"
                    onClick={handleGenerateSalarySlip}
                  >
                    Generate Salary Slip for {currentMonth} {currentYear}
                  </button>
                </div>
              </>
            ) : (
              <p>No salary slip data available.</p>
            )}
            <div className="button-group2">
              <button className="close-button2" onClick={onClose}>
                Close
              </button>
            </div>

            {/* Salary Slip Template to be captured */}
            <div
              id="salary-slip-template"
              style={{
                display: "none",
                width: "210mm",
                padding: "20px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <h1 style={{ textAlign: "center",marginBottom:"1rem" }}>Salary Slip</h1>
              <h3 style={{ textAlign: "center", marginBottom:"1rem" }}>{sname}</h3>
              <p>
                Date of Joining: {employeeData.staff_joining_date || "N/A"}
                <span style={{ marginLeft: "300px" }}>Employee Name: {employeeData.staff_name || "N/A"}</span>
              </p>
              <p>
                Payslip Period: {currentMonth} {currentYear}
                <span style={{ marginLeft: "300px" }}>Designation: {employeeData.staff_role || "N/A"}</span>
              </p>
              <p>
                Worked Days: {netPay.no_of_working_days || 0}
              </p>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "5px",  }}>Earnings</th>
                    <th style={{ border: "1px solid black", padding: "5px",  }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Basic</td>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.staff_salary_monthly || 0}</td>
                  </tr>
                  { employeeData.staff_commision_cap>0 &&(
                  <tr>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Commission</td>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹{employeeData.staff_commision_cap || 0}</td>
                  </tr>
                  )}
                  { employeeData.house_rent_allownance>0 &&(
                  <tr>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>House Rent Allowance</td>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.house_rent_allownance || 0}</td>
                  </tr>
                  )}
                  { employeeData.meal_allowance>0 &&(
                  <tr>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Meal Allowance</td>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.meal_allowance || 0}</td>
                  </tr>
                  )}
                  <tr>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Total Earnings</td>
                    <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {netPay.earning || 0}</td>
                  </tr>
                  
                </tbody>
              </table>

                {(employeeData.staff_provident_fund > 0 || employeeData.staff_professional_tax > 0 || employeeData.totalDeductions > 0) && (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid black", padding: "5px" }}>Deductions</th>
                      <th style={{ border: "1px solid black", padding: "5px" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.staff_provident_fund > 0 && (
                      <tr>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Provident Fund</td>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.staff_provident_fund}</td>
                      </tr>
                    )}
                    {employeeData.staff_professional_tax > 0 && (
                      <tr>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Professional Tax</td>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.staff_professional_tax}</td>
                      </tr>
                    )}
                    {employeeData.totalDeductions > 0 && (
                      <tr>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>Total Deductions</td>
                        <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>₹ {employeeData.totalDeductions}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}


              <h3 style={{ textAlign: "right", marginTop: "20px" }}>
                Net Pay: ₹ {netPay.net_payble_amount || 0}
              </h3>

              <div style={{ textAlign: "center", marginTop: "40px", fontSize: "16px" }}>
                <p><strong>Net Pay in Numbers:</strong> ₹ {netPay.net_payble_amount || 0}</p>
                <p>In Words: {toWords(Math.floor(netPayableAmount))} {netPayableAmount % 1 > 0 ? "and " + toWords(Math.round((netPayableAmount % 1) * 100)) + " Cents" : ""}</p>
                </div>

              <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#888" }}>
                [This is a system-generated Salary Slip]
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalarySlipPopup;