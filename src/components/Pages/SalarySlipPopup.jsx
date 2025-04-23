import React, { useEffect, useState } from "react";
import "../Styles/SalarySlip.css";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
} from "@react-pdf/renderer";
import config from "../../config";
import { toWords } from "number-to-words";

const SalarySlipPopup = ({ onClose, staffId }) => {
    const [salarySlipData, setSalarySlipData] = useState(null);
    const [salarySlips, setSalarySlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toLocaleString("default", {
        month: "long",
    });
    const currentYear = new Date().getFullYear();
    const [netPay, setNetPay] = useState();
    const [netPayableAmount, setNetPayableAmount] = useState(null);

    const branchName = localStorage.getItem("branch_name");
    const sname = localStorage.getItem("s-name");

    const fetchEmployeeDataById = async (staffId) => {
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/?id=${staffId}&branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error("Failed to fetch employee data");
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };
    const bid = localStorage.getItem("branch_id");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSalarySlip = async () => {
            setLoading(true);
            if (staffId) {
                try {
                    const response = await fetch(
                        `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                        {
                            headers: {
                                Authorization: `Token ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    const data = await response.json();

                    if (
                        data.status &&
                        data.table_data &&
                        Array.isArray(data.table_data)
                    ) {
                        const matchedEmployee = data.table_data.find(
                            (employee) => employee.id === staffId
                        );
                        if (matchedEmployee) {
                            setSalarySlipData(matchedEmployee);

                            const initialSlips =
                                matchedEmployee.salarySlips?.map((slip) => ({
                                    id: slip.id,
                                    month: slip.month,
                                    year: slip.year,
                                    downloadLink: slip.downloadLink,
                                })) || [];
                            setSalarySlips(initialSlips);

                            const payLoad = await fetch(
                                `${config.apiUrl}/api/swalook/staff/generate-payslip/?branch_name=${bid}&id=${staffId}`,
                                {
                                    headers: {
                                        Authorization: `Token ${token}`,
                                        "Content-Type": "application/json",
                                    },
                                }
                            );
                            const payLoadData = await payLoad.json();
                            setNetPay(payLoadData);
                            setNetPayableAmount(payLoadData.net_payble_amount);
                        } else {
                            setSalarySlipData(null);
                            setSalarySlips([]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching salary slip:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSalarySlip();
    }, [staffId]);

    const handleGenerateSalarySlip = () => {
        try {
            const newSlip = {
                id: salarySlips.length + 1,
                month: currentMonth,
                year: currentYear,
                downloadLink: "#",
            };
            setSalarySlips([...salarySlips, newSlip]);
        } catch (error) {
            console.error("Error generating salary slip:", error);
        }
    };

    const handleDownloadSlip = async (id) => {
        const slip = salarySlips.find((s) => s.id === id);
        if (slip) {
            const employeeData = await fetchEmployeeDataById(staffId);
            if (employeeData) {
                // Render the PDFDownloadLink component to trigger download
                setSalarySlips((prevSlips) =>
                    prevSlips.map((s) =>
                        s.id === id ? { ...s, downloadLink: true } : s
                    )
                );
            } else {
                alert("Employee data not found.");
            }
        }
    };

    const employeeData = salarySlipData || {};

    const SalarySlipDocument = ({
        employeeData,
        netPay,
        currentMonth,
        currentYear,
    }) => {
        const styles = StyleSheet.create({
            page: {
                padding: 30,
                fontFamily: "Helvetica",
                border: "1px solid #ccc",
                marginTop: 20,
            },
            title: {
                textAlign: "center",
                fontSize: 20,
                marginBottom: 10,
            },
            subtitle: {
                textAlign: "center",
                fontSize: 14,
                marginBottom: 20,
                color: "gray",
            },
            row: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
                fontSize: 12,
            },
            tableContainer: {
                marginTop: 20,
                border: "1px solid black",
                width: "100%",
            },
            tableHeader: {
                display: "flex",
                flexDirection: "row",
                backgroundColor: "#f0f0f0",
                borderBottom: "1px solid black",
                fontWeight: "bold",
            },
            tableRow: {
                display: "flex",
                flexDirection: "row",
                borderBottom: "1px solid black",
            },
            tableColumn: {
                flex: 1,
                borderRight: "1px solid black",
                padding: 5,
                textAlign: "center",
                fontSize: 12,
            },
            lastColumn: {
                borderRight: "none",
            },
            totalRow: {
                fontWeight: "bold",
            },
            netPayRow: {
                marginTop: 20,
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "right",
            },
            footer: {
                textAlign: "center",
                marginTop: 40,
                fontSize: 12,
            },
            disclaimer: {
                textAlign: "center",
                marginTop: 20,
                fontSize: 10,
                color: "#888",
            },
        });

        return (
            <Document>
                <Page style={styles.page}>
                    <Text style={styles.title}>Salary Slip</Text>
                    <Text style={styles.subtitle}>{sname || " "}</Text>

                    {/* Employee Info */}
                    <View style={styles.row}>
                        <Text>
                            <Text style={styles.fieldLabel}>
                                Date of Joining:{" "}
                            </Text>
                            <Text style={styles.fieldValue}>
                                {employeeData?.staff_joining_date || "N/A"}
                            </Text>
                        </Text>
                        <Text>
                            <Text style={styles.fieldLabel}>
                                Employee Name:{" "}
                            </Text>
                            <Text style={styles.fieldValue}>
                                {employeeData?.staff_name || "N/A"}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text>
                            <Text style={styles.fieldLabel}>
                                Payslip Period:{" "}
                            </Text>
                            <Text style={styles.fieldValue}>
                                {currentMonth} {currentYear}
                            </Text>
                        </Text>
                        <Text>
                            <Text style={styles.fieldLabel}>Designation: </Text>
                            <Text style={styles.fieldValue}>
                                {employeeData?.staff_role || "N/A"}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text>
                            <Text style={styles.fieldLabel}>Worked Days: </Text>
                            <Text style={styles.fieldValue}>
                                {netPay?.no_of_working_days || 0}
                            </Text>
                        </Text>
                    </View>
                    {/* Earnings Table */}
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableColumn}>Earnings</Text>
                            <Text
                                style={[styles.tableColumn, styles.lastColumn]}
                            >
                                Amount
                            </Text>
                        </View>

                        <View style={styles.tableRow}>
                            <Text style={styles.tableColumn}>Basic</Text>
                            <Text
                                style={[styles.tableColumn, styles.lastColumn]}
                            >
                                Rs. {employeeData?.staff_salary_monthly || 0}
                            </Text>
                        </View>

                        {employeeData.staff_commision_cap > 0 && (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableColumn}>
                                    Commission
                                </Text>
                                <Text
                                    style={[
                                        styles.tableColumn,
                                        styles.lastColumn,
                                    ]}
                                >
                                    Rs. {employeeData.staff_commision_cap || 0}
                                </Text>
                            </View>
                        )}

                        {employeeData.house_rent_allownance > 0 && (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableColumn}>
                                    House Rent Allowance
                                </Text>
                                <Text
                                    style={[
                                        styles.tableColumn,
                                        styles.lastColumn,
                                    ]}
                                >
                                    Rs.{" "}
                                    {employeeData.house_rent_allownance || 0}
                                </Text>
                            </View>
                        )}

                        {employeeData.meal_allowance > 0 && (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableColumn}>
                                    Meal Allowance
                                </Text>
                                <Text
                                    style={[
                                        styles.tableColumn,
                                        styles.lastColumn,
                                    ]}
                                >
                                    Rs. {employeeData.meal_allowance || 0}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.tableRow, styles.totalRow]}>
                            <Text style={styles.tableColumn}>
                                Total Earnings
                            </Text>
                            <Text
                                style={[styles.tableColumn, styles.lastColumn]}
                            >
                                Rs. {netPay?.earning || 0}
                            </Text>
                        </View>
                    </View>

                    {/* Deductions Table */}
                    {(employeeData.staff_provident_fund > 0 ||
                        employeeData.staff_professional_tax > 0 ||
                        employeeData.totalDeductions > 0) && (
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColumn}>
                                    Deductions
                                </Text>
                                <Text
                                    style={[
                                        styles.tableColumn,
                                        styles.lastColumn,
                                    ]}
                                >
                                    Amount
                                </Text>
                            </View>

                            {employeeData.staff_provident_fund > 0 && (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableColumn}>
                                        Provident Fund
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableColumn,
                                            styles.lastColumn,
                                        ]}
                                    >
                                        Rs. {employeeData.staff_provident_fund}
                                    </Text>
                                </View>
                            )}

                            {employeeData.staff_professional_tax > 0 && (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableColumn}>
                                        Professional Tax
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableColumn,
                                            styles.lastColumn,
                                        ]}
                                    >
                                        Rs.{" "}
                                        {employeeData.staff_professional_tax}
                                    </Text>
                                </View>
                            )}

                            {employeeData.totalDeductions > 0 && (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableColumn}>
                                        Total Deductions
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableColumn,
                                            styles.lastColumn,
                                        ]}
                                    >
                                        Rs. {employeeData.totalDeductions}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Net Pay */}
                    <Text style={styles.netPayRow}>
                        Net Pay:Rs. {netPay?.net_payble_amount || 0}
                    </Text>
                    <View style={styles.footer}>
                        <Text>
                            <Text style={styles.fieldLabel}>
                                Net Pay in Words:
                            </Text>{" "}
                            {toWords(Math.floor(netPay?.net_payble_amount))}{" "}
                            {netPay?.net_payble_amount % 1 > 0 && (
                                <Text>
                                    and{" "}
                                    {toWords(
                                        Math.round(
                                            (netPay?.net_payble_amount % 1) *
                                                100
                                        )
                                    )}{" "}
                                    Cents
                                </Text>
                            )}
                        </Text>
                    </View>
                    <Text style={styles.disclaimer}>
                        [This is a system-generated Salary Slip]
                    </Text>
                </Page>
            </Document>
        );
    };

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
                                                    {slip.downloadLink ? (
                                                        <PDFDownloadLink
                                                            document={
                                                                <SalarySlipDocument
                                                                    employeeData={
                                                                        employeeData
                                                                    }
                                                                    netPay={
                                                                        netPay
                                                                    }
                                                                    currentMonth={
                                                                        currentMonth
                                                                    }
                                                                    currentYear={
                                                                        currentYear
                                                                    }
                                                                />
                                                            }
                                                            fileName={`Salary_Slip_${employeeData.staff_name}_${currentMonth}_${currentYear}.pdf`}
                                                        >
                                                            {({ loading }) =>
                                                                loading
                                                                    ? "Loading document..."
                                                                    : "Download PDF"
                                                            }
                                                        </PDFDownloadLink>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleDownloadSlip(
                                                                    slip.id
                                                                )
                                                            }
                                                        >
                                                            Generate PDF
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    className="generate-button2"
                                    onClick={handleGenerateSalarySlip}
                                >
                                    Generate Salary Slip
                                </button>
                            </>
                        ) : (
                            <p>No salary slips available for this employee.</p>
                        )}
                    </>
                )}
                <button className="close-button2" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default SalarySlipPopup;
