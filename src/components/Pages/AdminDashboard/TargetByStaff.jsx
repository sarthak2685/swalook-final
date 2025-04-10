import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import config from "../../../config";
import { ChevronDown } from "lucide-react";

const StaffTargets = () => {
    const token = localStorage.getItem("token") || "";
    const bid = localStorage.getItem("branch_id") || "";
    const userType = localStorage.getItem("type") || "none";

    const [date, setDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [targetData, setTargetData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openBranches, setOpenBranches] = useState({});

    const formatMonth = (date) => String(date.getMonth() + 1).padStart(2, "0");
    const formatYear = (date) => date.getFullYear();

    const fetchTargetData = async () => {
        setLoading(true);
        setError(null);
        try {
            const year = formatYear(date);
            const month = formatMonth(date);

            const apiUrl = `${config.apiUrl}/api/swalook/sales-targets/?branch_name=${bid}&type=${userType}&year=${year}&month=${month}`;
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

            if (userType === "admin") {
                const processed = processAdminData(data);
                setTargetData(processed);
            } else {
                const processed = processUserData(data);
                setTargetData(processed);
            }
        } catch (error) {
            console.error("Error fetching target data:", error);
            setError("Failed to load staff targets. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleBranch = (branchName) => {
        setOpenBranches((prev) => ({
            ...prev,
            [branchName]: !prev[branchName],
        }));
    };

    const processUserData = (data) => {
        const branches = data.list || [];
        const revenueBranches = data.staff_revenue?.branches || [];

        return branches.map((branchData) => {
            const branchId = branchData.vendor_branch_id;
            const branchName =
                revenueBranches.find((b) => b.branch_name)?.branch_name || // Prefer revenue data name
                branchData.branch_name ||
                branchData.vendor_branch__branch_name ||
                "This Branch";

            let staffTargets = [];

            try {
                staffTargets = JSON.parse(
                    branchData.staff_targets?.replace(/'/g, '"') || "[]"
                );
            } catch (e) {
                console.error("User JSON parse error:", branchName, e);
            }

            // Get matching revenue staff data for this branch
            const revenueBranch = revenueBranches.find(
                (b) => b.branch_name === branchName
            );
            const staffRevenueData = revenueBranch?.staff_data || [];

            const staffList = staffTargets.map((target) => {
                const targetValue = parseFloat(target.staff_target) || 0;

                // Match revenue staff by cleaned-up name
                const revenue = staffRevenueData.find(
                    (r) =>
                        r.staff_name
                            ?.replace(/\)/g, "")
                            .trim()
                            .toLowerCase() ===
                        target.staff_name?.trim().toLowerCase()
                );

                const achieved = parseFloat(revenue?.total_sales) || 0;
                const invoices = parseInt(revenue?.total_invoices) || 0;

                return {
                    id: target.staff,
                    name: target.staff_name,
                    target: targetValue,
                    commissionCap: parseFloat(target.commission_cap) || 0,
                    achieved,
                    invoices,
                    remaining: Math.max(targetValue - achieved, 0),
                };
            });

            return {
                branchName,
                staff: staffList,
            };
        });
    };

    const processAdminData = (apiData) => {
        if (!apiData?.staff_targets_by_branch) return [];

        const branches = apiData.staff_targets_by_branch;
        const revenueBranches = apiData.staff_revenue?.branches ?? [];

        const normalizeName = (name) =>
            name
                ?.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

        return branches.map((branchData) => {
            const branchName =
                branchData.vendor_branch__branch_name || "Unnamed Branch";
            let staffTargets = [];

            try {
                staffTargets = JSON.parse(
                    branchData.staff_targets?.replace(/'/g, '"') || "[]"
                );
            } catch (e) {
                console.error("Admin JSON parse error:", branchName, e);
            }

            const revenueBranch = revenueBranches.find(
                (b) =>
                    normalizeName(b.branch_name) === normalizeName(branchName)
            );

            const achievementsMap = new Map();
            if (revenueBranch?.staff_data) {
                revenueBranch.staff_data.forEach((staff) => {
                    const key = normalizeName(staff.staff_name);
                    achievementsMap.set(key, {
                        achieved: staff.total_sales || 0,
                        invoices: staff.total_invoices || 0,
                    });
                });
            }

            const staffList = staffTargets.map((target) => {
                const key = normalizeName(target.staff_name);
                const achievement = achievementsMap.get(key) || {
                    achieved: 0,
                    invoices: 0,
                };

                const targetValue = parseFloat(target.staff_target) || 0;

                return {
                    id: target.staff,
                    name: target.staff_name,
                    target: targetValue,
                    commissionCap: parseFloat(target.commission_cap) || 0,
                    achieved: achievement.achieved,
                    invoices: achievement.invoices,
                    remaining: Math.max(0, targetValue - achievement.achieved),
                };
            });

            return {
                branchName,
                staff: staffList,
            };
        });
    };

    useEffect(() => {
        fetchTargetData();
    }, [date]);

    useEffect(() => {
        if (targetData.length > 0) {
            setOpenBranches({ [targetData[0].branchName]: true });
        }
    }, [targetData]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setShowCalendar(false);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(date);
        if (direction === "prev") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setDate(newDate);
    };

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const currentMonthLabel = `${
        monthNames[date.getMonth()]
    } ${date.getFullYear()}`;

    return (
        <div className="bg-white shadow-md p-6 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Staff Targets & Performance
                </h3>
                <div className="flex items-center space-x-4 relative">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigateMonth("prev")}
                            className="p-1 text-gray-600 hover:text-blue-500"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="px-3 py-1 border border-gray-300 rounded-[2.5rem] text-sm font-medium hover:bg-gray-100"
                        >
                            {currentMonthLabel}
                        </button>
                        <button
                            onClick={() => navigateMonth("next")}
                            className="p-1 text-gray-600 hover:text-blue-500"
                        >
                            <FaChevronRight />
                        </button>
                    </div>

                    {showCalendar && (
                        <div className="absolute top-10 right-0 bg-white shadow-lg rounded-[2.5rem] z-20">
                            <Calendar
                                onChange={handleDateChange}
                                value={date}
                                view="year"
                                onClickMonth={(value) =>
                                    handleDateChange(value)
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <p className="text-gray-500">Loading staff targets...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 rounded-[2.5rem] p-3 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && targetData.length > 0
                ? targetData.map((branch, i) => (
                      <div key={i} className="mb-6">
                          <div
                              onClick={() => toggleBranch(branch.branchName)}
                              className={`cursor-pointer flex items-center justify-between px-6 py-4 rounded-[2.5rem] transition-all duration-200 ${
                                  openBranches[branch.branchName]
                                      ? "bg-white shadow-sm border"
                                      : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                              <h4 className="text-md font-semibold text-gray-800">
                                  {branch.branchName}
                              </h4>
                              <ChevronDown
                                  className={`transition-transform duration-300 ${
                                      openBranches[branch.branchName]
                                          ? "rotate-180"
                                          : ""
                                  }`}
                                  size={20}
                              />
                          </div>

                          {openBranches[branch.branchName] && (
                              <div className="overflow-x-auto rounded-[2.5rem] p-4 shadow-inner bg-gray-50 mt-2 transition-all duration-300">
                                  <table className="w-full">
                                      <thead>
                                          <tr className="text-left text-sm font-medium text-gray-500 border-b">
                                              <th className="pb-3 pl-4">
                                                  Staff Member
                                              </th>
                                              <th className="pb-3 text-right">
                                                  Target (₹)
                                              </th>
                                              <th className="pb-3 text-right">
                                                  Achieved (₹)
                                              </th>
                                              <th className="pb-3 text-right">
                                                  Remaining (₹)
                                              </th>
                                              <th className="pb-3 text-right pr-4">
                                                  Invoices
                                              </th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {branch.staff.length > 0 ? (
                                              branch.staff.map((staff, idx) => (
                                                  <tr
                                                      key={staff.id || idx}
                                                      className="hover:bg-gray-100 transition-colors"
                                                  >
                                                      <td className="py-3 pl-4 flex items-center">
                                                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mr-2">
                                                              {staff.name
                                                                  ? staff
                                                                        .name[0]
                                                                  : "S"}
                                                          </div>
                                                          <span className="text-sm font-medium">
                                                              {staff.name}
                                                          </span>
                                                      </td>
                                                      <td className="py-3 text-right text-sm font-medium">
                                                          {staff.target.toFixed(
                                                              2
                                                          )}
                                                      </td>
                                                      <td className="py-3 text-right text-sm">
                                                          <span
                                                              className={`font-medium ${
                                                                  staff.achieved >=
                                                                  staff.target
                                                                      ? "text-green-600"
                                                                      : "text-orange-500"
                                                              }`}
                                                          >
                                                              {staff.achieved.toFixed(
                                                                  2
                                                              )}
                                                          </span>
                                                      </td>
                                                      <td className="py-3 text-right text-sm font-medium">
                                                          {staff.remaining.toFixed(
                                                              2
                                                          )}
                                                      </td>
                                                      <td className="py-3 text-right pr-4 text-sm">
                                                          {staff.invoices}
                                                      </td>
                                                  </tr>
                                              ))
                                          ) : (
                                              <tr>
                                                  <td
                                                      colSpan="5"
                                                      className="py-4 text-center text-sm text-gray-500"
                                                  >
                                                      No staff data available
                                                      for this branch.
                                                  </td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                  ))
                : !loading &&
                  !error && (
                      <p className="text-center text-sm text-gray-500">
                          No staff target data available for the selected month.
                      </p>
                  )}
        </div>
    );
};

export default StaffTargets;
