import React, { useState, useEffect } from "react";
import { FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import config from "../../../config";

const ModeOfPayment = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [paymentPeriod, setPaymentPeriod] = useState("Day");
    const [paymentData, setPaymentData] = useState([]);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);

    const paymentModeColors = {
        cash: "#328cd2",
        upi: "#01e296",
        card: "#ffb01a",
        netbanking: "#9147ff",
        unknown: "#666666",
    };

    // Default payment modes
    const defaultPaymentModes = [
        { payment_mode: "cash", total_revenue: "" },
        { payment_mode: "upi", total_revenue: "" },
        { payment_mode: "card", total_revenue: "" },
        { payment_mode: "netbanking", total_revenue: "" },
    ];

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const fetchPaymentData = async () => {
        try {
            let apiUrl = `${config.apiUrl}/api/swalook/mode-of-payment-analysis/?branch_name=${bid}`;

            if (paymentPeriod === "Day") {
                apiUrl += `&filter=day&date=${formatDate(selectedDate)}`;
            } else if (paymentPeriod === "Week") {
                apiUrl += `&filter=week&start_date=${formatDate(
                    dateRange[0]
                )}&end_date=${formatDate(dateRange[1])}`;
            } else if (paymentPeriod === "Month") {
                apiUrl += `&filter=month&month=${
                    selectedDate.getMonth() + 1
                }&year=${selectedDate.getFullYear()}`;
            } else if (paymentPeriod === "Year") {
                apiUrl += `&filter=year&year=${selectedDate.getFullYear()}`;
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
            const processedData = [];

            if (data.data_of_mode_of_payment) {
                data.data_of_mode_of_payment.forEach((item) => {
                    if (item.payment_mode) {
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
                            processedData.push({
                                payment_mode: mode.mode,
                                total_revenue: parseFloat(mode.amount),
                            });
                        }
                    });
                });
            }

            const aggregatedData = processedData.reduce((acc, curr) => {
                acc[curr.payment_mode] =
                    (acc[curr.payment_mode] || 0) + curr.total_revenue;
                return acc;
            }, {});

            // Merge default payment modes with fetched data
            const finalData = defaultPaymentModes.map((mode) => ({
                payment_mode: mode.payment_mode,
                total_revenue: aggregatedData[mode.payment_mode] || "",
            }));

            setPaymentData(finalData);
        } catch (error) {
            console.error("Error fetching payment data:", error);
        }
    };

    useEffect(() => {
        fetchPaymentData();
    }, [paymentPeriod, selectedDate, dateRange]);

    const handleDateChange = (date) => {
        if (paymentPeriod === "Week") {
            setDateRange(date);
        } else {
            setSelectedDate(date);
        }
        setCalendarVisible(false);
    };

    const handleActiveDateChange = ({ activeStartDate }) => {
        if (paymentPeriod === "Month") {
            setSelectedDate(
                new Date(
                    activeStartDate.getFullYear(),
                    activeStartDate.getMonth(),
                    1
                )
            );
        } else if (paymentPeriod === "Year") {
            setSelectedDate(new Date(activeStartDate.getFullYear(), 0, 1));
        }
        setCalendarVisible(false);
    };

    const grandTotal = paymentData.reduce(
        (total, mode) => total + (mode.total_revenue || 0),
        0
    );

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Mode of Payment
                </h3>
                <div className="flex items-center space-x-4 relative">
                    <select
                        value={paymentPeriod}
                        onChange={(e) => setPaymentPeriod(e.target.value)}
                        className="border border-gray-300 text-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Day">Daily</option>
                        <option value="Week">Weekly</option>
                        <option value="Month">Monthly</option>
                        <option value="Year">Yearly</option>
                    </select>
                    <div className="relative">
                        <FaCalendar
                            className="cursor-pointer text-gray-600 hover:text-blue-500 transition-colors"
                            onClick={() => setCalendarVisible(!calendarVisible)}
                        />
                        {calendarVisible && (
                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={
                                        paymentPeriod === "Week"
                                            ? dateRange
                                            : selectedDate
                                    }
                                    selectRange={paymentPeriod === "Week"}
                                    view={
                                        paymentPeriod === "Year"
                                            ? "decade"
                                            : paymentPeriod === "Month"
                                            ? "year"
                                            : "month"
                                    }
                                    onActiveStartDateChange={
                                        handleActiveDateChange
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg mt-4 overflow-hidden ">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className="py-3 px-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Payment Mode
                            </th>
                            <th className="py-3 px-4 border-b border-gray-200 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Total Revenue
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData.map((mode, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td
                                    className="py-3 px-4 border-b border-gray-200 text-center uppercase font-bold"
                                    style={{
                                        color:
                                            paymentModeColors[
                                                mode.payment_mode.toLowerCase()
                                            ] || paymentModeColors.unknown,
                                    }}
                                >
                                    {mode.payment_mode}
                                </td>
                                <td
                                    className="py-3 px-4 border-b border-gray-200 text-center font-bold text-gray-700"
                                    style={{
                                        color:
                                            paymentModeColors[
                                                mode.payment_mode.toLowerCase()
                                            ] || paymentModeColors.unknown,
                                    }}
                                >
                                    {mode.total_revenue === ""
                                        ? "__" // Display __ for blank values
                                        : `₹ ${mode.total_revenue.toLocaleString()}/-`}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td className="py-3 px-4 border-b border-gray-200 text-center uppercase font-semibold">
                                Grand Total
                            </td>
                            <td className="py-3 px-4 border-b border-gray-200 text-center font-semibold">
                                ₹ {grandTotal.toLocaleString()}/-
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModeOfPayment;
