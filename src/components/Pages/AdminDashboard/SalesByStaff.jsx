import React, { useState, useEffect } from "react";
import { FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import config from "../../../config";

const SalesByStaff = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [staffPeriod, setStaffPeriod] = useState("Day");
    const [staffData, setStaffData] = useState([]);
    const [staffCalendar, setStaffCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);

    // Predefined color palette for staff profiles
    const profileColors = [
        "#42a0fc", // Blue
        "#ff6b6b", // Red
        "#4cd964", // Green
        "#ffd166", // Yellow
        "#9b59b6", // Purple
        "#ff9f43", // Orange
        "#00cec9", // Teal
        "#e84393", // Pink
    ];

    // Function to get a unique color for each staff member
    const getProfileColor = (index) => {
        return profileColors[index % profileColors.length];
    };

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const fetchStaffData = async () => {
        try {
            let apiUrl = `${config.apiUrl}/api/swalook/staff-analysis/?branch_name=${bid}`;

            if (staffPeriod === "Day") {
                apiUrl += `&filter=day&date=${formatDate(selectedDate)}`;
            } else if (staffPeriod === "Week") {
                apiUrl += `&filter=week&start_date=${formatDate(
                    dateRange[0]
                )}&end_date=${formatDate(dateRange[1])}`;
            } else if (staffPeriod === "Month") {
                apiUrl += `&filter=month&month=${
                    selectedDate.getMonth() + 1
                }&year=${selectedDate.getFullYear()}`;
            } else if (staffPeriod === "Year") {
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

            if (!Array.isArray(data)) {
                throw new Error("Invalid API response format");
            }

            const processedStaffData = data.flatMap((entry) =>
                entry.staff_data.map((staff) => ({
                    staffName: staff.staff_name || "Unknown",
                    totalInvoices: staff.total_invoices || 0,
                    totalSales: staff.total_sales || 0,
                    services:
                        staff.services?.map((service) => ({
                            name: service.service_name || "Unknown Service",
                            totalSales: service.total_sales || 0,
                            totalCount: service.total_services || 0,
                        })) || [],
                }))
            );

            setStaffData(processedStaffData || []);
        } catch (error) {
            console.error("Error fetching staff data:", error);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, [staffPeriod, selectedDate, dateRange]);

    const handleDateChange = (date) => {
        if (staffPeriod === "Week") {
            setDateRange(date);
        } else {
            setSelectedDate(date);
        }
        setStaffCalendar(false);
    };

    const handleActiveDateChange = ({ activeStartDate }) => {
        if (staffPeriod === "Month") {
            setSelectedDate(
                new Date(
                    activeStartDate.getFullYear(),
                    activeStartDate.getMonth(),
                    1
                )
            );
        } else if (staffPeriod === "Year") {
            setSelectedDate(new Date(activeStartDate.getFullYear(), 0, 1));
        }
        setStaffCalendar(false);
    };

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Sales by Staff
                </h3>
                <div className="flex items-center space-x-4 relative">
                    <select
                        value={staffPeriod}
                        onChange={(e) => setStaffPeriod(e.target.value)}
                        className="border border-gray-300 text-gray-700 rounded-lg p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Day">Daily</option>
                        <option value="Week">Weekly</option>
                        <option value="Month">Monthly</option>
                        <option value="Year">Yearly</option>
                    </select>

                    <div className="relative">
                        <FaCalendar
                            className="cursor-pointer text-gray-600 hover:text-blue-500 transition-colors"
                            onClick={() => setStaffCalendar(!staffCalendar)}
                        />
                        {staffCalendar && (
                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={
                                        staffPeriod === "Week"
                                            ? dateRange
                                            : selectedDate
                                    }
                                    selectRange={staffPeriod === "Week"}
                                    view={
                                        staffPeriod === "Year"
                                            ? "decade"
                                            : staffPeriod === "Month"
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

            <div className="space-y-2">
                {staffData.length > 0 ? (
                    staffData
                        .sort((a, b) => b.totalSales - a.totalSales)
                        .map((staff, index) => {
                            const thresholds = {
                                Day: 1000,
                                Week: 5000,
                                Month: 20000,
                                Year: 100000,
                            };
                            const revenueThreshold =
                                thresholds[staffPeriod] || 1000;
                            const progressBarWidth = Math.min(
                                (staff.totalSales / revenueThreshold) * 100,
                                100
                            );

                            // Get a unique color for the staff profile
                            const profileColor = getProfileColor(index);

                            return (
                                <div
                                    key={index}
                                    className="p-2 bg-white rounded-lg  transition-shadow"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                style={{
                                                    backgroundColor:
                                                        profileColor,
                                                }}
                                            >
                                                {staff.staffName[0]}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">
                                                {staff.staffName}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-600">
                                                Invoices: {staff.totalInvoices}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600">
                                                ₹ {staff.totalSales.toFixed()}/-
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${progressBarWidth}%`,
                                                backgroundColor: profileColor,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                ) : (
                    <div className="p-2 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600">
                            *No data available for the selected period.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesByStaff;
