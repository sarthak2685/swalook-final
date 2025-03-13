import React, { useState, useEffect, useMemo } from "react";
import Header from "../Header";
import VertNav from "../VertNav";
import config from "../../../config";
import "react-calendar/dist/Calendar.css";
import Scheduler from "./Scheduler";
import Status from "./Status";
import SalesByStaff from "./SalesByStaff";
import ModeOfPayment from "./ModeOfPayment";
import TotalSales from "./TotalSales";

const AdminDashboard = () => {
    const [selectedDate1, setSelectedDate1] = useState(new Date());
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

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

                        <TotalSales />
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
