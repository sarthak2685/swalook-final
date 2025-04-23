import React, { useEffect, useState } from "react";
import AttendancePopup from "./AttendancePopup";
import config from "../../config";
import toast, { Toaster } from "react-hot-toast";
import VertNav from "./VertNav";
import Header from "./Header";
import { Helmet } from "react-helmet";

const StaffManagement = () => {
    const [showInTimePopup, setShowInTimePopup] = useState(false);
    const [showOutTimePopup, setShowOutTimePopup] = useState(false);
    const [currentStaffId, setCurrentStaffId] = useState(null);
    const [currentStaffName, setCurrentStaffName] = useState("");
    const [currentStaffMobile, setCurrentStaffMobile] = useState("");
    const [staffData, setStaffData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [universalTimes, setUniversalTimes] = useState({
        inTime: "09:00",
        outTime: "17:00",
    });
    const [workingDays, setWorkingDays] = useState(0);

    const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const calculateTimeDifference = (staffTime, universalTime) => {
        if (!staffTime || staffTime === "") return null;

        const [staffHours, staffMins] = staffTime.split(":").map(Number);
        const [uniHours, uniMins] = universalTime.split(":").map(Number);

        const staffTotalMins = staffHours * 60 + staffMins;
        const uniTotalMins = uniHours * 60 + uniMins;

        return staffTotalMins - uniTotalMins; // Positive = late, Negative = early
    };

    const fetchStaffData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");

        if (!token || !bid) {
            toast.error("Authentication required");
            setIsLoading(false);
            return;
        }

        try {
            const [staffResponse, attendanceResponse] = await Promise.all([
                fetch(
                    `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                ),
                fetch(
                    `${
                        config.apiUrl
                    }/api/swalook/staff/attendance/?branch_name=${bid}&month=${
                        new Date().getMonth() + 1
                    }`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                ),
            ]);

            if (!staffResponse.ok || !attendanceResponse.ok) {
                throw new Error("Failed to fetch data");
            }

            const staffData = await staffResponse.json();
            const attendanceData = await attendanceResponse.json();
            const attendanceTable = attendanceData.table_data || {};

            setUniversalTimes({
                inTime: attendanceData.in_time || "09:00",
                outTime: attendanceData.out_time || "17:00",
            });
            setWorkingDays(attendanceData.current_month_days || 0);

            const staffArray = Array.isArray(staffData.table_data)
                ? staffData.table_data
                : [];

            const formattedData = staffArray.map((staff) => {
                const attendanceRecord = attendanceTable[staff.mobile_no] || {};
                const presentDates = attendanceRecord.present_dates || [];
                const inTimes = attendanceRecord.in_time || [];
                const outTimes = attendanceRecord.out_time || [];

                // Find today's attendance record
                const todayIndex = presentDates.findIndex(
                    (date) =>
                        date.includes(todayDate) || date.startsWith(todayDate)
                );
                const isTodayPresent = todayIndex !== -1;

                // Get today's times if present
                const todayInTime =
                    isTodayPresent && inTimes[todayIndex]
                        ? inTimes[todayIndex]
                        : null;
                const todayOutTime =
                    isTodayPresent && outTimes[todayIndex]
                        ? outTimes[todayIndex]
                        : null;

                // Check if attendance is marked (date present, regardless of time value)
                const isAttendanceMarked = isTodayPresent;
                const isInTimeMarked = isTodayPresent && todayInTime !== null;
                const isOutTimeMarked = isTodayPresent && todayOutTime !== null;

                // Calculate time difference
                const timeDifference = todayInTime
                    ? calculateTimeDifference(
                          todayInTime,
                          attendanceData.in_time || "09:00"
                      )
                    : null;

                return {
                    id: staff.id || null,
                    name: staff.staff_name || "N/A",
                    role: staff.staff_role || "N/A",
                    mobile: staff.mobile_no || "N/A",
                    salary: parseFloat(staff.staff_salary_monthly) || 0,
                    commission: parseFloat(staff.staff_commision_cap) || 0,
                    joiningDate: staff.staff_joining_date || "N/A",
                    attendance: {
                        present: attendanceRecord.number_of_days_present || 0,
                        total: attendanceData.current_month_days || 0,
                    },
                    business:
                        parseFloat(staff.business_of_the_current_month) || 0,
                    isAttendanceMarked, // New field to track if date is present
                    inTimeMarked: isInTimeMarked,
                    outTimeMarked: isOutTimeMarked,
                    inTime: todayInTime,
                    outTime: todayOutTime,
                    inTimeDelay: timeDifference,
                };
            });

            setStaffData(formattedData);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to fetch staff data");
            setStaffData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    const handleMarkTime = (staffId, staffName, staffMobile, isInTime) => {
        if (!staffId) {
            toast.error("Invalid staff ID");
            return;
        }

        const staff = staffData.find((s) => s.id === staffId);

        // Prevent marking if already marked
        if (isInTime) {
            if (staff?.isAttendanceMarked) {
                toast.error("Attendance already marked for today");
                return;
            }
        } else {
            if (!staff?.inTimeMarked) {
                toast.error("Please mark In-time first");
                return;
            }
            if (staff?.outTimeMarked) {
                toast.error("Out-time already marked for today");
                return;
            }
        }

        setCurrentStaffId(staffId);
        setCurrentStaffName(staffName);
        setCurrentStaffMobile(staffMobile);

        if (isInTime) {
            setShowInTimePopup(true);
        } else {
            setShowOutTimePopup(true);
        }
    };

    const handleTimeMarked = (staffId, markType) => {
        fetchStaffData(); // Refresh data after marking
        toast.success(
            `Successfully marked ${markType === "in" ? "In-time" : "Out-time"}`
        );
    };

    return (
        <>
            <Helmet>
                <title>Staff Management</title>
            </Helmet>
            <div className="bg-gray-50 min-h-full">
                <Header />
                <VertNav />
                <div className="p-4 md:p-8 md:ml-72">
                    <div className="bg-white shadow-xl rounded-[2.5rem] p-6 md:p-8 mx-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                            Staff Attendance
                        </h1>

                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="mt-2 text-gray-600">
                                    Loading staff data...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-sm">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    S.No.
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Staff Name
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Staff Role
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Attendance MTD
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    In-Time
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Out-Time
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Short by (min)
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Joining Date
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {staffData.map((staff, index) => (
                                                <tr
                                                    key={staff.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.role}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {`${staff.attendance.present}/${staff.attendance.total}`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.inTime || "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.outTime || "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.inTimeDelay !=
                                                        null ? (
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                    staff.inTimeDelay >
                                                                    0
                                                                        ? "bg-red-100 text-red-800"
                                                                        : "bg-green-100 text-green-800"
                                                                }`}
                                                            >
                                                                {staff.inTimeDelay >
                                                                0
                                                                    ? `+${staff.inTimeDelay}`
                                                                    : staff.inTimeDelay}{" "}
                                                                min
                                                            </span>
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        {staff.joiningDate}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                                        <div className="flex flex-row gap-2 items-center">
                                                            {/* In-time Button */}
                                                            <button
                                                                onClick={() =>
                                                                    handleMarkTime(
                                                                        staff.id,
                                                                        staff.name,
                                                                        staff.mobile,
                                                                        true
                                                                    )
                                                                }
                                                                disabled={
                                                                    staff.isAttendanceMarked
                                                                }
                                                                className={`flex-1 px-4 py-2 rounded-full text-sm shadow-md font-medium transition-colors ${
                                                                    staff.isAttendanceMarked
                                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                                }`}
                                                            >
                                                                {staff.isAttendanceMarked
                                                                    ? "✓ In"
                                                                    : "In"}
                                                            </button>

                                                            {/* Out-time Button */}
                                                            <button
                                                                onClick={() =>
                                                                    handleMarkTime(
                                                                        staff.id,
                                                                        staff.name,
                                                                        staff.mobile,
                                                                        false
                                                                    )
                                                                }
                                                                disabled={
                                                                    !staff.inTimeMarked ||
                                                                    staff.outTimeMarked
                                                                }
                                                                className={`flex-1 px-4 py-2 rounded-full text-sm shadow-md font-medium transition-colors ${
                                                                    !staff.inTimeMarked
                                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                        : staff.outTimeMarked
                                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                                        : "bg-green-600 hover:bg-green-700 text-white"
                                                                }`}
                                                            >
                                                                {staff.outTimeMarked
                                                                    ? "✓ Out"
                                                                    : "Out"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {staffData.length === 0 && !isLoading && (
                                    <div className="text-center py-8 text-gray-500">
                                        No staff members found
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {showInTimePopup && (
                    <AttendancePopup
                        type="in"
                        staffId={currentStaffId}
                        staffName={currentStaffName}
                        staffMobile={currentStaffMobile}
                        onClose={() => setShowInTimePopup(false)}
                        onAttendanceMarked={(id, type) =>
                            handleTimeMarked(id, type)
                        }
                    />
                )}

                {showOutTimePopup && (
                    <AttendancePopup
                        type="out"
                        staffId={currentStaffId}
                        staffName={currentStaffName}
                        staffMobile={currentStaffMobile}
                        onClose={() => setShowOutTimePopup(false)}
                        onAttendanceMarked={(id, type) =>
                            handleTimeMarked(id, type)
                        }
                    />
                )}

                <Toaster position="top-right" />
            </div>
        </>
    );
};

export default StaffManagement;
