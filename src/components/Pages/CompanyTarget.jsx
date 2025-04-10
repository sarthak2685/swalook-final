import React, { useState, useEffect } from "react";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";

const CompanyTarget = () => {
    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");
    const userType = "none";

    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Target states
    const [serviceTarget, setServiceTarget] = useState("");
    const [productTarget, setProductTarget] = useState("");
    const [membershipCouponTarget, setMembershipCouponTarget] = useState("");
    const [overallTarget, setOverallTarget] = useState("");
    const [staffTargets, setStaffTargets] = useState([]);

    // Month state
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return today.toISOString().slice(0, 7); // format: YYYY-MM
    });

    // Fetch staff data
    const fetchStaffData = async () => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch staff: ${response.statusText}`
                );
            }

            const result = await response.json();

            if (!result.status || !Array.isArray(result.table_data)) {
                throw new Error("Invalid API response format");
            }

            return result.table_data.map((staff) => ({
                id: staff.id,
                name: staff.staff_name,
                mobile: staff.mobile_no,
                role: staff.staff_role,
            }));
        } catch (error) {
            console.error("Error fetching staff:", error.message);
            return [];
        }
    };

    const parseStaffTargets = (staffTargetsStr) => {
        if (!staffTargetsStr || typeof staffTargetsStr !== "string") return [];

        try {
            let fixedStr = staffTargetsStr
                .replace(/'/g, '"')
                .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
                .replace(/"s\s*taff"/g, '"staff"')
                .replace(/"commis\s*sion_cap"/g, '"commission_cap"');

            if (!fixedStr.endsWith("]")) {
                const lastCompleteIndex = fixedStr.lastIndexOf("}");
                if (lastCompleteIndex > 0) {
                    fixedStr =
                        fixedStr.substring(0, lastCompleteIndex + 1) + "]";
                } else {
                    return [];
                }
            }

            return JSON.parse(fixedStr);
        } catch (e) {
            console.error("Error parsing staff targets:", e);
            return [];
        }
    };
    const [date, setDate] = useState(new Date());

    const formatMonth = (date) => String(date.getMonth() + 1).padStart(2, "0");
    const formatYear = (date) => date.getFullYear();
    const year = formatYear(date);
    const month = formatMonth(date);

    const fetchSalesTargets = async () => {
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/sales-targets/?branch_name=${bid}&type=${userType}&year=${year}&month=${month}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch sales targets: ${response.statusText}`
                );
            }

            const data = await response.json();
            if (data.list && data.list.length > 0) {
                return {
                    ...data.list[0],
                    staff_targets: parseStaffTargets(
                        data.list[0].staff_targets
                    ),
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching sales targets:", error);
            return null;
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);

            const staffData = await fetchStaffData();
            setStaffList(staffData);

            const targetsData = await fetchSalesTargets();

            const targetsMap = {};
            if (targetsData?.staff_targets?.length) {
                targetsData.staff_targets.forEach((target) => {
                    if (target.staff) {
                        targetsMap[target.staff] = {
                            target: target.staff_target || "",
                            commissionCap: target.commission_cap || "",
                        };
                    }
                });
            }

            const updatedStaffTargets = staffData.map((staff) => ({
                id: staff.id,
                staff: staff.id,
                target: targetsMap[staff.id]?.target || "",
                commissionCap: targetsMap[staff.id]?.commissionCap || "",
            }));

            setStaffTargets(updatedStaffTargets);

            if (targetsData) {
                setServiceTarget(targetsData.service_target || "");
                setProductTarget(targetsData.product_target || "");
                setMembershipCouponTarget(
                    targetsData.membership_coupon_target || ""
                );
                setOverallTarget(targetsData.overall_target || "");
            }

            setIsLoading(false);
        };

        initializeData();
    }, [bid, token]);

    useEffect(() => {
        const total =
            Number(serviceTarget || 0) +
            Number(productTarget || 0) +
            Number(membershipCouponTarget || 0);
        setOverallTarget(total);
    }, [serviceTarget, productTarget, membershipCouponTarget]);

    const handleStaffTargetChange = (index, field, value) => {
        const updatedStaffTargets = [...staffTargets];
        updatedStaffTargets[index][field] = value;
        setStaffTargets(updatedStaffTargets);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const payload = {
            year: Number(selectedMonth.split("-")[0]),
            month: Number(selectedMonth.split("-")[1]),
            service_target: serviceTarget || null,
            product_target: productTarget || null,
            membership_coupon_target: membershipCouponTarget || null,
            overall_target: overallTarget || null,
            staff_targets: staffTargets.map((staffTarget) => ({
                staff: staffTarget.id,
                staff_name:
                    staffList.find((staff) => staff.id === staffTarget.id)
                        ?.name || "",
                staff_target: staffTarget.target || null,
                commission_cap: staffTarget.commissionCap || null,
            })),
        };

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/sales-targets/?branch_name=${bid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save targets");
            }

            alert("Targets saved successfully!");
        } catch (error) {
            console.error("Error saving targets:", error);
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <VertNav />
            <div className="max-h-screen mx-auto p-6 bg-gray-50 md:ml-72">
                <form onSubmit={handleSave}>
                    <div className="bg-white shadow-sm rounded-[2.5rem] p-10">
                        <div className="flex justify-between p-4">
                            <h2 className="text-2xl font-bold text-gray-800 text-left mb-6">
                                Sales Target Settings
                            </h2>
                            <div className="flex justify-end mb-4">
                                <label className="text-gray-700 font-medium mr-2 self-center">
                                    Set Target For:
                                </label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                    className="border border-gray-300 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        {/* Main Targets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center">
                            {/* Service Target */}
                            <div className="p-6 mb-6 col-span-1">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Service Target{" "}
                                    <span className="text-red-500">*</span>
                                </h3>
                                <input
                                    type="number"
                                    className="border border-gray-300 rounded-full p-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={serviceTarget}
                                    onChange={(e) =>
                                        setServiceTarget(e.target.value)
                                    }
                                    placeholder="Enter target"
                                    required
                                />
                            </div>

                            {/* Product Target */}
                            <div className="mb-6 p-6 col-span-1">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Product Target
                                </h3>
                                <input
                                    type="number"
                                    className="border border-gray-300 rounded-full p-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={productTarget}
                                    onChange={(e) =>
                                        setProductTarget(e.target.value)
                                    }
                                    placeholder="Enter target"
                                />
                            </div>

                            {/* Membership/Coupon Target */}
                            <div className="mb-6 p-6 col-span-1">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Membership/Coupon Target
                                </h3>
                                <input
                                    type="number"
                                    className="border border-gray-300 rounded-full p-2 w-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={membershipCouponTarget}
                                    onChange={(e) =>
                                        setMembershipCouponTarget(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter target"
                                />
                            </div>
                        </div>

                        {/* Overall Target */}
                        <div className="mb-6 p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Overall Target
                            </h3>
                            <input
                                type="number"
                                className="border border-gray-300 rounded-full p-2 w-full md:w-1/3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={overallTarget}
                                readOnly
                            />
                        </div>

                        {/* Staff Targets */}
                        <div className="mb-6 p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Staff Targets
                            </h3>
                            <table className="w-full mt-4 border-collapse">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border px-4 py-2 text-left">
                                            Staff
                                        </th>
                                        <th className="border px-4 py-2 text-left">
                                            Target
                                        </th>
                                        <th className="border px-4 py-2 text-left">
                                            Commission Cap
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffTargets.map((staffTarget, index) => {
                                        const staff = staffList.find(
                                            (s) => s.id === staffTarget.id
                                        );
                                        return (
                                            <tr
                                                key={staffTarget.id}
                                                className="hover:bg-gray-100"
                                            >
                                                <td className="border px-4 py-2">
                                                    {staff?.name ||
                                                        `Staff ID: ${staffTarget.id}`}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-full p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                        value={
                                                            staffTarget.target
                                                        }
                                                        onChange={(e) =>
                                                            handleStaffTargetChange(
                                                                index,
                                                                "target",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter target"
                                                        required
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-full p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                        value={
                                                            staffTarget.commissionCap
                                                        }
                                                        onChange={(e) =>
                                                            handleStaffTargetChange(
                                                                index,
                                                                "commissionCap",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter commission cap"
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="text-center mt-8">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-8 rounded-full hover:bg-blue-700 transition duration-200"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CompanyTarget;
