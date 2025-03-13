import React, { useState, useEffect } from "react";
import { FaCalendar } from "react-icons/fa";
import ApexCharts from "react-apexcharts";
import config from "../../../config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const TotalSales = () => {
    const [chartData, setChartData] = useState([]);
    const [xAxisCategories, setXAxisCategories] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
    const [dateRange, setDateRange] = useState([new Date(), new Date()]); // For weekly date range
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Function to calculate the start and end dates of the week
    const getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Start of the week (Sunday)
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() + (6 - date.getDay())); // End of the week (Saturday)
        return [startOfWeek, endOfWeek];
    };

    // Function to get the first day of the month
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // Function to get the first day of the year
    const getFirstDayOfYear = (date) => {
        return new Date(date.getFullYear(), 0, 1);
    };

    // Set default date range based on the selected period
    useEffect(() => {
        const currentDate = new Date();
        switch (selectedPeriod) {
            case "Weekly":
                setDateRange(getWeekRange(currentDate));
                setSelectedDate(currentDate);
                break;
            case "Monthly":
                setSelectedDate(getFirstDayOfMonth(currentDate));
                break;
            case "YTD":
                setSelectedDate(getFirstDayOfYear(currentDate));
                break;
            default:
                break;
        }
    }, [selectedPeriod]);

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
                const [startOfWeek, endOfWeek] = dateRange; // Use dateRange for weekly period
                apiData = `${
                    config.apiUrl
                }/api/swalook/business-analysis/week/?branch_name=${bid}&start_date=${formatDate(
                    startOfWeek
                )}&end_date=${formatDate(endOfWeek)}`;
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
            let weeks = [];
            let weeklyTotals = [];

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

                weeks = weekDays;
                weeklyTotals = weeklySales;
            } else if (selectedPeriod === "Monthly" && responseData.data2) {
                // Handle monthly data with weeks
                responseData.data2.forEach((item) => {
                    weeks.push(item.week); // Add week label (e.g., "Week 1", "Week 2")
                    weeklyTotals.push(item.weekly_total || 0); // Add weekly total
                });
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

                weeks = allMonths;
                weeklyTotals = yearSales;
            }

            setChartData(weeklyTotals);
            setXAxisCategories(weeks);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    };

    // Add dateRange as a dependency to useEffect
    useEffect(() => {
        fetchChartData();
    }, [selectedPeriod, selectedDate, dateRange]); // Add dateRange here

    const options = {
        chart: {
            type: "bar",
            height: 350,
        },
        colors: ["#42a0fc"],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "60%",
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    horizontal: true,
                    formatter: (val) => `₹${val.toLocaleString()}`,
                    style: {
                        colors: ["#fff"],
                        fontSize: "14px",
                        fontWeight: "bold",
                        transform: "rotate(0deg)",
                    },
                    offsetX: 0,
                    offsetY: 0,
                },
            },
        },
        stroke: {
            show: true,
            width: 5,
            colors: ["#328cd2"],
        },
        xaxis: {
            categories: xAxisCategories,
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
                formatter: (val) => `₹${val.toLocaleString()}`,
            },
        },
    };

    const series = [
        {
            data: chartData,
        },
    ];

    // Function to handle calendar date change
    const handleDateChange = (date) => {
        if (selectedPeriod === "Weekly") {
            setDateRange(date); // Set date range for weekly period
        } else if (selectedPeriod === "Monthly") {
            // For monthly period, set the selected date to the first day of the selected month
            setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
        } else if (selectedPeriod === "YTD") {
            // For YTD period, set the selected date to the first day of the selected year
            setSelectedDate(new Date(date.getFullYear(), 0, 1));
        }
        setShowCalendar(false); // Close the calendar after selection
    };

    // Function to handle active start date change
    const handleActiveDateChange = ({ activeStartDate, view }) => {
        if (selectedPeriod === "Monthly" && view === "year") {
            // When in "year" view and the period is "Monthly", set the selected date to the first day of the year
            setSelectedDate(new Date(activeStartDate.getFullYear(), 0, 1));
        } else if (selectedPeriod === "YTD" && view === "decade") {
            // When in "decade" view and the period is "YTD", set the selected date to the first day of the decade
            setSelectedDate(new Date(activeStartDate.getFullYear(), 0, 1));
        }
    };

    return (
        <div className="col-span-2 bg-white shadow-md p-6 rounded-lg relative">
            <div className="flex justify-between mb-4">
                <div className="text-lg font-semibold text-gray-700">
                    Total Sales
                </div>
                <div className="flex items-center space-x-4 relative">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border px-3 py-1 rounded-md"
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="YTD">Year-To-Date</option>
                    </select>

                    {/* Calendar Component */}
                    <div className="relative">
                        <FaCalendar
                            className="cursor-pointer text-gray-600"
                            onClick={() => setShowCalendar(!showCalendar)}
                        />
                        {showCalendar && (
                            <div className="absolute top-10 right-0 bg-white shadow-lg rounded-lg z-20">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={
                                        selectedPeriod === "Weekly"
                                            ? dateRange
                                            : selectedDate
                                    }
                                    selectRange={selectedPeriod === "Weekly"}
                                    view={
                                        selectedPeriod === "YTD"
                                            ? "decade"
                                            : selectedPeriod === "Monthly"
                                            ? "year"
                                            : "month"
                                    }
                                    onActiveStartDateChange={
                                        handleActiveDateChange
                                    }
                                    onClickMonth={(value) => {
                                        if (selectedPeriod === "Monthly") {
                                            // Handle month selection explicitly in the year view
                                            setSelectedDate(
                                                new Date(
                                                    value.getFullYear(),
                                                    value.getMonth(),
                                                    1
                                                )
                                            );
                                            setShowCalendar(false); // Close the calendar after selection
                                        }
                                    }}
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
    );
};

export default TotalSales;
