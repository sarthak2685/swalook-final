import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";

const StaffSetting = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const [monthDays, setMonthDays] = useState({});

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
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [bid, token]);

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
            <Header />
            <VertNav />
            <Helmet>
                <title>Staff Settings</title>
            </Helmet>
            <div className="staff-setting-container bg-white p-4 md:p-10 mx-auto md:ml-72">
                <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                    Staff Settings
                </h2>

                <div className="table-section mb-6 md:mb-10">
                    <h3 className="text-gray-700 text-base md:text-lg font-semibold mb-2 md:mb-4">
                        Number of Days in Each Month
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full styled-table">
                            <thead>
                                <tr>
                                    <th className="bg-gray-200 px-2 md:px-4 py-2">
                                        Month
                                    </th>
                                    <th className="bg-gray-200 px-2 md:px-4 py-2">
                                        Days
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(monthDays).map((month) => (
                                    <tr key={month}>
                                        <td className="border text-center px-2 md:px-4 py-2">
                                            {month}
                                        </td>
                                        <td className="border text-center px-2 md:px-4 py-2">
                                            <input
                                                type="number"
                                                className="input-field text-center w-full"
                                                value={monthDays[month]}
                                                onChange={(e) =>
                                                    handleMonthDaysChange(
                                                        month,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="button-container text-center">
                    <button
                        onClick={handleSaveSettings}
                        className="save-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </>
    );
};

export default StaffSetting;
