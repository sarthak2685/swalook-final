import React, { useState, useEffect, useMemo } from "react";
import Header from "../Header";
import VertNav from "../VertNav";
import { FaCalendar } from "react-icons/fa";
import { BiBarChartSquare } from "react-icons/bi";
import ApexCharts from "react-apexcharts";
import config from "../../../config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Scheduler from "./Scheduler";
import Status from "./Status";
import SalesByStaff from "./SalesByStaff";
import ModeOfPayment from "./ModeOfPayment";

const AdminDashboard = () => {
    const [chartData, setChartData] = useState([]);
    const [xAxisCategories, setXAxisCategories] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDate1, setSelectedDate1] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const fetchChartData = async () => {
        if (!selectedDate) return;

        const currentDate = new Date(selectedDate);
        const currentWeek = Math.ceil(
            (currentDate.getDate() - currentDate.getDay() + 1) / 7
        );
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let apiData;

        switch (selectedPeriod) {
            case "Daily":
                apiData = `${config.apiUrl}/api/swalook/business-analysis/daily-customer/?branch_name=${bid}`;
                break;
            case "Weekly":
                apiData = `${config.apiUrl}/api/swalook/business-analysis/week/?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`;
                break;
            case "Monthly":
                apiData = `${config.apiUrl}/api/swalook/business-analysis/month/?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`;
                break;
            case "YTD":
                apiData = `${config.apiUrl}/api/swalook/business-analysis/year/?branch_name=${bid}&year=${currentYear}`;
                break;
            default:
                console.error("Invalid period selected");
                return;
        }

        try {
            const response = await fetch(apiData, {
                method: "GET",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const responseData = await response.json();
            let months = [];
            let monthlyTotals = [];

            // if (selectedPeriod === "Daily" && responseData.data) {
            //   let customerNames = [];
            //   let dailyTotals = [];
            //   responseData.data.forEach((item) => {
            //     customerNames.push(item.customer_name);
            //     dailyTotals.push(item.daily_total || 0);
            //   });

            //   months = customerNames;
            //   monthlyTotals = dailyTotals;
            // } else
            if (selectedPeriod === "Weekly" && responseData.data) {
                const weekDays = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                ];
                let weeklySales = new Array(7).fill(0);

                responseData.data.forEach((item) => {
                    const dayIndex = item.day_of_week - 1;
                    weeklySales[dayIndex] = item.total_sales || 0;
                });

                months = weekDays;
                monthlyTotals = weeklySales;
            } else if (selectedPeriod === "Monthly" && responseData.data2) {
                const allWeeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
                let monthSales = new Array(4).fill(0);

                responseData.data2.forEach((item) => {
                    const weekIndex = allWeeks.indexOf(item.week);
                    if (weekIndex !== -1) {
                        monthSales[weekIndex] = item.weekly_total || 0;
                    }
                });

                months = allWeeks;
                monthlyTotals = monthSales;
            } else if (selectedPeriod === "YTD" && responseData.data) {
                const allMonths = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                let yearSales = new Array(12).fill(0);

                responseData.data.forEach((item) => {
                    const monthMatch = item.month.match(/Month (\d+)/);
                    if (monthMatch) {
                        const monthIndex = parseInt(monthMatch[1], 10) - 1; // Convert "Month X" to index
                        if (monthIndex >= 0 && monthIndex < 12) {
                            yearSales[monthIndex] = item.monthly_total || 0;
                        }
                    }
                });

                months = allMonths;
                monthlyTotals = yearSales;
            }

            setChartData(monthlyTotals);
            setXAxisCategories(months);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [selectedPeriod, selectedDate]);
    const options = {
        chart: {
            type: "bar",
            height: 350,
        },
        colors: ["#42a0fc"],
        plotOptions: {
            bar: {
                horizontal: false, // Keep this as false for vertical bars
                columnWidth: "60%",
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    horizontal: true,
                    formatter: (val) => `₹${val.toLocaleString()}`, // Format with "₹" and comma-separated values
                    style: {
                        colors: ["#fff"],
                        fontSize: "14px", // Adjust font size
                        fontWeight: "bold", // Bold text
                        transform: "rotate(0deg)", // Ensure the label stays horizontal
                    },
                    offsetX: 0,
                    offsetY: 0, // Adjust the vertical offset to move labels closer to the top
                },
            },
        },
        stroke: {
            show: true,
            width: 5,
            colors: ["#328cd2"],
        },
        xaxis: {
            categories: xAxisCategories, // Monthly categories (e.g., Jan, Feb, etc.)
        },
        yaxis: {
            title: {
                text: "Revenue (Rs.)",
                style: {
                    fontSize: "14px",
                    color: "#374151",
                },
                offsetX: 9,
            },
            labels: {
                style: {
                    fontSize: "14px",
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: (val) => `₹${val.toLocaleString()}`, // Format the tooltip with "₹"
            },
        },
    };

    const series = [
        {
            data: chartData, // Monthly total values (e.g., sales for each month or week)
        },
    ];

    const currentDate = new Date(selectedDate1);
    const currentWeek = Math.ceil(
        (currentDate.getDate() - currentDate.getDay() + 1) / 7
    );
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [topServices, setTopServices] = useState([]);
    const [period, setPeriod] = useState("Month");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${config.apiUrl}/api/swalook/business-analysis/service/?branch_name=${bid}&week=${currentWeek}&month=${currentMonth}&year=${currentYear}`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();

                if (data?.data?.services_list) {
                    const servicesList = data.data.services_list;

                    // Process services to include both revenue and occurrences
                    const servicesWithDetails = Object.entries(
                        servicesList
                    ).map(([name, { occurrences, revenue }]) => ({
                        name,
                        occurrences,
                        revenue,
                    }));

                    // Sort services by revenue in descending order and slice the top 5
                    const sortedServices = servicesWithDetails
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);

                    setTopServices(sortedServices);
                } else {
                    console.error("Invalid response structure:", data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [token, config.apiUrl, currentWeek, currentMonth, currentYear]);

    const [topCustomers, setTopCustomers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${config.apiUrl}/api/swalook/business-analysis/month-customer/?branch_name=${bid}&month=${currentMonth}&year=${currentYear}`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await response.json();

                if (Array.isArray(data.data)) {
                    const sortedCustomers = data.data
                        .sort((a, b) => b.weekly_total - a.weekly_total)
                        .slice(0, 5);

                    const formattedCustomers = sortedCustomers.map(
                        (customer, index) => ({
                            name: customer.customer_name,
                            revenue: customer.weekly_total,
                        })
                    );

                    setTopCustomers(formattedCustomers);
                } else {
                    console.error("Invalid response structure:", data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [token, config.apiUrl]);

    return (
        <>
            <div className="bg-gray-100">
                <Header />
                <VertNav />
                <div className="bg-gray-100 flex-grow  md:ml-72 p-10">
                    <Status />
                    <Scheduler />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Total Sales Bar Chart */}
                        <div className="col-span-2 bg-white shadow-md p-6 rounded-lg relative">
                            <div className="flex justify-between mb-4">
                                <div className="text-lg font-semibold text-gray-700">
                                    Total Sales
                                </div>
                                <div className="flex items-center space-x-4 relative">
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) =>
                                            setSelectedPeriod(e.target.value)
                                        }
                                        className="border px-3 py-1 rounded-md"
                                    >
                                        {/* <option value="Daily">Daily</option> */}
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="YTD">
                                            Year-To-Date
                                        </option>
                                    </select>

                                    {/* Calendar Component */}
                                    <div className="relative">
                                        <FaCalendar
                                            className="cursor-pointer text-gray-600"
                                            onClick={() =>
                                                setShowCalendar(!showCalendar)
                                            }
                                        />
                                        {showCalendar && (
                                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                                <Calendar
                                                    onChange={(date) =>
                                                        setSelectedDate(date)
                                                    }
                                                    value={selectedDate}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ApexChart Component */}
                            <div className="rounded-lg">
                                <ApexCharts
                                    options={options}
                                    series={series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Mode of Payment Donut Chart */}

                        <ModeOfPayment />
                    </div>

                    {/* Row 3: Sales by Staff, Top 5 Customers, Top 5 Services */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <SalesByStaff />
                        {/* Top 5 Customers */}
                        <div className="bg-white shadow-md p-6 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Top 5 Customers
                                </h3>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
                                >
                                    <option value="Month">Month-to-date</option>
                                </select>
                            </div>
                            {topCustomers.length > 0 ? (
                                <ul>
                                    {topCustomers.map((customer, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between py-2 text-gray-700 border-b last:border-b-0"
                                        >
                                            <span>
                                                {index + 1}. {customer.name}
                                            </span>
                                            <span>
                                                Rs.
                                                {customer.revenue.toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>
                                    {/* Red warning message */}
                                    <p className="text-red-600 font-light mb-2">
                                        *No data available for the selected
                                        period.
                                    </p>
                                    {/* Placeholder rows */}
                                    <ul>
                                        {[1, 2, 3, 4, 5].map((_, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between py-2 text-gray-400 border-b last:border-b-0 italic"
                                            >
                                                <span>
                                                    {index + 1}. Customer
                                                </span>
                                                <span>Rs.__</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Top 5 Services */}
                        <div className="bg-white shadow-md p-6 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Top 5 Services
                                </h3>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="border border-gray-300 text-gray-700 rounded-lg p-1 text-sm"
                                >
                                    <option value="Month">Month-to-date</option>
                                </select>
                            </div>
                            {topServices.length > 0 ? (
                                <ul>
                                    {topServices.map((service, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between py-2 text-gray-700 border-b last:border-b-0"
                                        >
                                            <span>
                                                {index + 1}. {service.name}
                                            </span>
                                            {/* <span>Occured: {service.occurrences.toLocaleString()}</span> */}
                                            <span>
                                                Rs.
                                                {service.revenue.toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>
                                    {/* Red warning message */}
                                    <p className="text-red-600 font-light mb-2">
                                        *No data available for the selected
                                        period.
                                    </p>
                                    {/* Placeholder rows */}
                                    <ul>
                                        {[1, 2, 3, 4, 5].map((_, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between py-2 text-gray-400 border-b last:border-b-0 italic"
                                            >
                                                <span>
                                                    {index + 1}. Service
                                                </span>
                                                <span>Rs.__</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
