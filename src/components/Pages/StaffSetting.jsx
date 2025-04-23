import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";

const StaffSetting = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [monthDays, setMonthDays] = useState({});
    const [attendanceTimings, setAttendanceTimings] = useState({
        inTime: "09:00",
        outTime: "17:00",
    });
    const [workingHours, setWorkingHours] = useState("8 Hours");

    // Full month names mapping
    const monthNames = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December",
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${config.apiUrl}/api/swalook/staff/setting/?branch_name=${bid}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                if (data.month_days) {
                    const updatedMonthDays = {
                        Jan: data.month_days["1"],
                        Feb: data.month_days["2"],
                        Mar: data.month_days["3"],
                        Apr: data.month_days["4"],
                        May: data.month_days["5"],
                        Jun: data.month_days["6"],
                        Jul: data.month_days["7"],
                        Aug: data.month_days["8"],
                        Sep: data.month_days["9"],
                        Oct: data.month_days["10"],
                        Nov: data.month_days["11"],
                        Dec: data.month_days["12"],
                    };
                    setMonthDays(updatedMonthDays);
                }

                if (data.attendance_timings) {
                    setAttendanceTimings({
                        inTime: data.attendance_timings.in_time || "09:00",
                        outTime: data.attendance_timings.out_time || "17:00",
                    });
                    calculateWorkingHours(
                        data.attendance_timings.in_time || "09:00",
                        data.attendance_timings.out_time || "17:00"
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [bid, token]);

    const calculateWorkingHours = (inTime, outTime) => {
        if (!inTime || !outTime) {
            setWorkingHours("0 Hours");
            return;
        }

        const [inHours, inMinutes] = inTime.split(":").map(Number);
        const [outHours, outMinutes] = outTime.split(":").map(Number);

        let totalHours = outHours - inHours;
        let totalMinutes = outMinutes - inMinutes;

        if (totalMinutes < 0) {
            totalHours -= 1;
            totalMinutes += 60;
        }

        setWorkingHours(`${totalHours}.${totalMinutes} Hours`);
    };

    const handleTimeChange = (e) => {
        const { name, value } = e.target;
        setAttendanceTimings((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Calculate working hours when both times are set
        if (name === "inTime" && attendanceTimings.outTime) {
            calculateWorkingHours(value, attendanceTimings.outTime);
        } else if (name === "outTime" && attendanceTimings.inTime) {
            calculateWorkingHours(attendanceTimings.inTime, value);
        }
    };

    const handleMonthDaysChange = (month, newValue) => {
        setMonthDays((prev) => ({
            ...prev,
            [month]: parseInt(newValue) || 0,
        }));
    };

    const handleSaveSettings = async () => {
        const jsonData = {
            1: monthDays["Jan"],
            2: monthDays["Feb"],
            3: monthDays["Mar"],
            4: monthDays["Apr"],
            5: monthDays["May"],
            6: monthDays["Jun"],
            7: monthDays["Jul"],
            8: monthDays["Aug"],
            9: monthDays["Sep"],
            10: monthDays["Oct"],
            11: monthDays["Nov"],
            12: monthDays["Dec"],
        };

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/setting/?branch_name=${bid}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        json_data: jsonData,
                        in_time: attendanceTimings.inTime,
                        out_time: attendanceTimings.outTime,
                    }),
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Settings updated successfully", result);

                if (result.status) {
                    const updatedMonthDays = {
                        Jan: result.data.json_data["1"],
                        Feb: result.data.json_data["2"],
                        Mar: result.data.json_data["3"],
                        Apr: result.data.json_data["4"],
                        May: result.data.json_data["5"],
                        Jun: result.data.json_data["6"],
                        Jul: result.data.json_data["7"],
                        Aug: result.data.json_data["8"],
                        Sep: result.data.json_data["9"],
                        Oct: result.data.json_data["10"],
                        Nov: result.data.json_data["11"],
                        Dec: result.data.json_data["12"],
                    };
                    setMonthDays(updatedMonthDays);

                    if (result.data.json_data.attendance_timings) {
                        setAttendanceTimings({
                            inTime: result.data.json_data.attendance_timings
                                .in_time,
                            outTime:
                                result.data.json_data.attendance_timings
                                    .out_time,
                        });
                        calculateWorkingHours(
                            result.data.json_data.attendance_timings.in_time,
                            result.data.json_data.attendance_timings.out_time
                        );
                    }

                    localStorage.setItem(
                        "monthDays",
                        JSON.stringify(updatedMonthDays)
                    );
                }
            } else {
                const errorData = await response.json();
                console.error("Failed to update settings:", errorData.error);
            }
        } catch (error) {
            console.error("Error while saving settings:", error);
        }
    };

    useEffect(() => {
        const savedMonthDays = localStorage.getItem("monthDays");
        if (savedMonthDays) {
            setMonthDays(JSON.parse(savedMonthDays));
        }
    }, []);

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <VertNav />
                <Helmet>
                    <title>Staff Settings</title>
                </Helmet>
                <div className="p-4 md:p-8 md:ml-72">
                    <div className="bg-white shadow-xl rounded-3xl p-6 md:p-8 mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                            Staff Settings
                        </h2>

                        {/* Attendance Timings Section */}
                        <div className="mb-8 bg-gray-50 p-6 rounded-2xl">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                                Attendance Timings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-600">
                                        In-time
                                    </label>
                                    <input
                                        type="time"
                                        name="inTime"
                                        value={attendanceTimings.inTime}
                                        onChange={handleTimeChange}
                                        className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Out-time
                                    </label>
                                    <input
                                        type="time"
                                        name="outTime"
                                        value={attendanceTimings.outTime}
                                        onChange={handleTimeChange}
                                        className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Working Hours
                                    </label>
                                    <div className="bg-gray-100 px-4 py-2 rounded-full text-gray-800 font-medium text-center">
                                        {workingHours}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Month Days Section */}
                        <div className="mb-8">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                                Number of Days in Each Month
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-center text-lg font-semibold uppercase tracking-wider">
                                                Month
                                            </th>
                                            <th className="px-6 py-3 text-center text-lg font-semibold uppercase tracking-wider">
                                                Days
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.keys(monthDays).map((month) => (
                                            <tr
                                                key={month}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 text-center">
                                                    {monthNames[month]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <input
                                                        type="number"
                                                        className="w-24 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mx-auto text-center"
                                                        value={monthDays[month]}
                                                        onChange={(e) =>
                                                            handleMonthDaysChange(
                                                                month,
                                                                e.target.value
                                                            )
                                                        }
                                                        min="1"
                                                        max="31"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleSaveSettings}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-md transition duration-200 transform hover:scale-105"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffSetting;
