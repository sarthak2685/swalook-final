import React, { useState, useEffect } from "react";
import { FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";
import config from "../../../config";

const SalesByStaff = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [staffPeriod, setStaffPeriod] = useState("Day");
    const [staffData, setStaffData] = useState([]);
    const [staffCalendar, setStaffCalendar] = useState(false);
    const [selectedDate2, setSelectedDate2] = useState(new Date());

    const fetchStaffData = async (event, selectedDate = selectedDate2) => {
        const selectedPeriod = event?.target?.value || "Day"; // Default to "Day"
        setStaffPeriod(selectedPeriod); // Update state

        try {
            let apiUrl = `${config.apiUrl}/api/swalook/staff-analysis/?branch_name=${bid}`;

            if (selectedDate) {
                const dateObj = new Date(selectedDate);
                const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD format
                const year = dateObj.getFullYear();
                const month = dateObj.getMonth() + 1; // Months are zero-indexed in JS
                const week = Math.ceil(dateObj.getDate() / 7); // Approximate week number

                if (selectedPeriod.toLowerCase() === "day") {
                    apiUrl += `&filter=day&date=${formattedDate}`;
                } else if (selectedPeriod.toLowerCase() === "week") {
                    apiUrl += `&filter=week&week=${week}&month=${month}&year=${year}`;
                } else if (selectedPeriod.toLowerCase() === "month") {
                    apiUrl += `&filter=month&month=${month}&year=${year}`;
                } else if (selectedPeriod.toLowerCase() === "year") {
                    apiUrl += `&filter=year&year=${year}`;
                }
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

            // Check if response is valid and structured correctly
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
    }, []);

    return (
        <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Sales by Staff
                </h3>
                <div className="flex items-center space-x-4 relative">
                    <select
                        value={staffPeriod}
                        onChange={fetchStaffData}
                        className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
                    >
                        <option value="Day">Daily</option>
                        <option value="Week">Weekly</option>
                        <option value="Month">Monthly</option>
                        <option value="Year">Year-to-date</option>
                    </select>
                    {/* Calendar Component */}
                    <div className="relative">
                        <FaCalendar
                            className="cursor-pointer text-gray-600"
                            onClick={() => setStaffCalendar(!staffCalendar)}
                        />
                        {staffCalendar && (
                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                <Calendar
                                    onChange={(date) => {
                                        setSelectedDate2(date);
                                        fetchStaffData(null, date); // Trigger fetch with new date
                                    }}
                                    value={selectedDate2}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Staff Sales Data */}
            <div className="space-y-4">
                {staffData.length > 0 ? (
                    staffData
                        .sort((a, b) => b.totalSales - a.totalSales)
                        .map((staff, index) => {
                            // Define thresholds based on the selected period
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

                            return (
                                <div key={index}>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{staff.staffName}</span>
                                        <span>
                                            Invoices: {staff.totalInvoices}
                                        </span>
                                        <span>
                                            Rs. {staff.totalSales.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-lg mt-1">
                                        <div
                                            className="h-full bg-[#42a0fc] border rounded-lg"
                                            style={{
                                                width: `${progressBarWidth}%`,
                                                borderColor: "#328cd2",
                                                borderWidth: "3px",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                ) : (
                    <div>
                        <p className="text-red-600 font-light mb-2">
                            *No data available for the selected period.
                        </p>

                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm text-gray-400 italic">
                                    <span>{index + 1}. Staff</span>
                                    <span className="text-gray-400 text-sm mr-4">
                                        Invoices: _
                                    </span>
                                    <span>Rs. __</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-lg mt-1">
                                    <div
                                        className="h-full bg-gray-300 border rounded-lg"
                                        style={{
                                            width: "0%",
                                            borderColor: "#d1d5db",
                                            borderWidth: "3px",
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesByStaff;
