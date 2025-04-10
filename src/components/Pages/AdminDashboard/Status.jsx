import React, { useState, useEffect, useMemo } from "react";

import config from "../../../config";
import { BiBarChartSquare } from "react-icons/bi";
const Status = () => {
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
    const [appointmentsToday, setAppointmentsToday] = useState(0);
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const fetchStaffData = async () => {
        try {
            const apiUrl = `${config.apiUrl}/api/swalook/revenue-analysis/?branch_name=${bid}`;

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

            setTodayRevenue(data.today_revenue || 0);
            setYesterdayRevenue(data.previous_day_rev || 0);
            setAppointmentsToday(data.today_no_of_app || 0);
        } catch (error) {
            console.error("Error fetching staff data:", error);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    return (
        <div className="bg-white shadow-md px-4 py-12 rounded-[2.5rem] my-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Today's Revenue */}
                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        Today's Revenue
                    </div>
                    <div
                        className="text-2xl font-bold"
                        style={{ color: "#42a0fc" }}
                    >
                        Rs. {todayRevenue.toLocaleString("en-IN")}/-
                    </div>
                </div>

                {/* Previous Day's Revenue */}
                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        Previous Day's Revenue
                    </div>
                    <div
                        className="text-2xl font-bold"
                        style={{ color: "#42a0fc" }}
                    >
                        Rs. {yesterdayRevenue.toLocaleString("en-IN")}/-
                    </div>
                </div>

                {/* Appointments Today */}
                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        No. of Appointments Today
                    </div>
                    <div
                        className="text-2xl font-bold"
                        style={{ color: "#42a0fc" }}
                    >
                        {appointmentsToday}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Status;
