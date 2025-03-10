import React, { useState, useEffect } from "react";
import { FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";
import config from "../../../config";

const ModeOfPayment = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [paymentPeriod, setPaymentPeriod] = useState("Day");
    const [paymentData, setPaymentData] = useState([]);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Define a color scheme for payment modes
    const paymentModeColors = {
        cash: "#328cd2", // Blue
        upi: "#01e296", // Green
        card: "#ffb01a", // Orange
        wallet: "#ff5a5a", // Red
        netbanking: "#9147ff", // Purple
        unknown: "#666666", // Gray for unknown modes
    };

    const fetchPaymentData = async (
        selectedPeriod = "Day",
        date = selectedDate
    ) => {
        try {
            setPaymentPeriod(selectedPeriod);

            let apiUrl = `${config.apiUrl}/api/swalook/mode-of-payment-analysis/?branch_name=${bid}`;
            const dateObj = new Date(date);
            const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD format

            if (selectedPeriod.toLowerCase() === "day") {
                apiUrl += `&filter=day&date=${formattedDate}`;
            } else if (selectedPeriod.toLowerCase() === "week") {
                apiUrl += `&filter=week&week=${Math.ceil(
                    dateObj.getDate() / 7
                )}&month=${
                    dateObj.getMonth() + 1
                }&year=${dateObj.getFullYear()}`;
            } else if (selectedPeriod.toLowerCase() === "month") {
                apiUrl += `&filter=month&month=${
                    dateObj.getMonth() + 1
                }&year=${dateObj.getFullYear()}`;
            } else if (selectedPeriod.toLowerCase() === "year") {
                apiUrl += `&filter=year&year=${dateObj.getFullYear()}`;
            }

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();

            // Process the API response
            const processedData = [];
            if (data.data_of_mode_of_payment) {
                data.data_of_mode_of_payment.forEach((item) => {
                    if (item.payment_mode) {
                        // Ignore null or empty payment modes
                        processedData.push({
                            payment_mode: item.payment_mode,
                            total_revenue: item.total_revenue,
                        });
                    }
                });
            }

            if (data.data_of_new_mode) {
                data.data_of_new_mode.forEach((item) => {
                    item.payment_mode.forEach((mode) => {
                        if (mode.mode) {
                            // Ignore null or empty payment modes
                            processedData.push({
                                payment_mode: mode.mode,
                                total_revenue: parseFloat(mode.amount),
                            });
                        }
                    });
                });
            }

            // Aggregate total revenue for each payment mode
            const aggregatedData = processedData.reduce((acc, curr) => {
                if (!acc[curr.payment_mode]) {
                    acc[curr.payment_mode] = 0;
                }
                acc[curr.payment_mode] += curr.total_revenue;
                return acc;
            }, {});

            // Convert aggregated data into an array for rendering
            const finalData = Object.keys(aggregatedData).map((mode) => ({
                payment_mode: mode,
                total_revenue: aggregatedData[mode],
            }));

            // Sort the data in decreasing order of total revenue
            finalData.sort((a, b) => b.total_revenue - a.total_revenue);

            setPaymentData(finalData);
        } catch (error) {
            console.error("Error fetching payment data:", error);
        }
    };

    useEffect(() => {
        fetchPaymentData();
    }, []);

    // Function to get the color for a payment mode
    const getPaymentModeColor = (paymentMode) => {
        return (
            paymentModeColors[paymentMode.toLowerCase()] ||
            paymentModeColors.unknown
        );
    };

    // Calculate the grand total of all payment modes
    const grandTotal = paymentData.reduce(
        (total, mode) => total + mode.total_revenue,
        0
    );

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Mode of Payment
                </h3>
                <div className="flex items-center space-x-4 relative">
                    <select
                        value={paymentPeriod}
                        onChange={(e) => fetchPaymentData(e.target.value)}
                        className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
                    >
                        <option value="Day">Daily</option>
                        <option value="Week">Weekly</option>
                        <option value="Month">Monthly</option>
                        <option value="Year">Year-to-date</option>
                    </select>
                    <div className="relative">
                        <FaCalendar
                            className="cursor-pointer text-gray-600"
                            onClick={() => setCalendarVisible(!calendarVisible)}
                        />
                        {calendarVisible && (
                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                <Calendar
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        fetchPaymentData(paymentPeriod, date);
                                    }}
                                    value={selectedDate}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="rounded-lg mt-4">
                <table className="min-w-full  bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Payment Mode
                            </th>
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData.length > 0 ? (
                            paymentData.map((mode, index) => (
                                <tr key={index}>
                                    <td
                                        className="py-2 px-4 border-b border-gray-200 text-center uppercase"
                                        style={{
                                            color: getPaymentModeColor(
                                                mode.payment_mode
                                            ),
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {mode.payment_mode}
                                    </td>
                                    <td
                                        className="py-2 px-4 border-b border-gray-200 text-center"
                                        style={{
                                            fontWeight: "bold",
                                            color: "#4a5568", // A neutral color for amounts
                                        }}
                                    >
                                        ₹{mode.total_revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="2"
                                    className="py-2 px-4 border-b border-gray-200 text-center"
                                >
                                    No data available
                                </td>
                            </tr>
                        )}
                        {/* Grand Total Row */}
                        <tr>
                            <td
                                className="py-2 px-4 border-b bg-gray-50 border-gray-200 text-center uppercase font-semibold"
                                style={{
                                    color: "#000000", // Black color for grand total
                                }}
                            >
                                Grand Total
                            </td>
                            <td
                                className="py-2 px-4 border-b bg-gray-50 border-gray-200 text-center font-semibold"
                                style={{
                                    color: "#000000", // Black color for grand total
                                }}
                            >
                                ₹{grandTotal.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModeOfPayment;
