import React, { useState, useEffect } from "react";
import {
    format,
    parseISO,
    addDays,
    isWithinInterval,
    isSameDay,
} from "date-fns";
import config from "../../config";

const AttendancePopup = ({ onClose, staffName, staffId }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedRange, setSelectedRange] = useState({
        start: null,
        end: null,
    });
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [timeEntries, setTimeEntries] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userType = localStorage.getItem("type");

    // Fetch attendance data
    useEffect(() => {
        const fetchAttendance = async () => {
            const token = localStorage.getItem("token");
            const bid = localStorage.getItem("branch_id");

            try {
                const response = await fetch(
                    `${
                        config.apiUrl
                    }/api/swalook/staff/attendance/?branch_name=${bid}&staff_id=${staffId}&month=${
                        currentMonth + 1
                    }&year=${currentYear}`,
                    { headers: { Authorization: `Token ${token}` } }
                );

                if (!response.ok) throw new Error("Failed to fetch attendance");

                const { table_data } = await response.json();
                const data = {};

                Object.values(table_data).forEach((staff) => {
                    staff.present_dates.forEach((dateStr) => {
                        const date = parseISO(dateStr);
                        data[format(date, "yyyy-MM-dd")] = {
                            status: "present",
                            inTime: "09:00",
                            outTime: "18:00",
                        };
                    });
                });

                setAttendanceData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [currentMonth, currentYear, staffId]);

    // Handle date selection
    const handleDateClick = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        if (date > new Date()) return;

        // If no range selected or both dates selected, start new range
        if (!selectedRange.start || selectedRange.end) {
            setSelectedRange({ start: date, end: null });
        }
        // If only start date selected
        else {
            // If clicked date is before start date, make it the new start
            if (date < selectedRange.start) {
                setSelectedRange({ start: date, end: selectedRange.start });
            }
            // If clicked date is after start date, make it the end
            else {
                setSelectedRange((prev) => ({ ...prev, end: date }));
            }
        }
    };

    // Prepare time entries when range is selected
    const prepareTimeEntries = () => {
        if (!selectedRange.start) return;

        // If only start date is selected, treat as single day
        const endDate = selectedRange.end || selectedRange.start;

        const entries = [];
        let currentDate = selectedRange.start;

        while (currentDate <= endDate) {
            const dateKey = format(currentDate, "yyyy-MM-dd");
            entries.push({
                date: dateKey,
                inTime: attendanceData[dateKey]?.inTime || "09:00",
                outTime: attendanceData[dateKey]?.outTime || "18:00",
                existing: !!attendanceData[dateKey],
            });
            currentDate = addDays(currentDate, 1);
        }

        setTimeEntries(entries);
        setShowTimeModal(true);
    };

    // Handle time input changes
    const handleTimeChange = (index, field, value) => {
        const updatedEntries = [...timeEntries];
        updatedEntries[index][field] = value;
        setTimeEntries(updatedEntries);
    };

    // Save attendance data
    const saveAttendance = async () => {
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");

        const attendanceData = timeEntries.map((entry) => ({
            date: entry.date,
            in_time: entry.inTime,
            out_time: entry.outTime,
            attend: "True",
            leave: "False",
            of_month: currentMonth + 1,
            year: currentYear,
            id: staffId,
        }));

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}&staff_id=${staffId}&type=${userType}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ json_data: attendanceData }),
                }
            );

            if (!response.ok) throw new Error("Failed to save attendance");

            onClose();
        } catch (error) {
            console.error("Error saving attendance:", error);
            setError(error.message);
        }
    };

    // Month navigation
    const changeMonth = (increment) => {
        setCurrentMonth((prev) => {
            const newMonth = prev + increment;
            if (newMonth < 0) {
                setCurrentYear((prevYear) => prevYear - 1);
                return 11;
            }
            if (newMonth > 11) {
                setCurrentYear((prevYear) => prevYear + 1);
                return 0;
            }
            return newMonth;
        });
    };

    // Check if a date is selected (in range or single date)
    const isDateSelected = (date) => {
        if (!selectedRange.start) return false;

        const endDate = selectedRange.end || selectedRange.start;
        return isWithinInterval(date, {
            start:
                selectedRange.start < endDate ? selectedRange.start : endDate,
            end: selectedRange.start < endDate ? endDate : selectedRange.start,
        });
    };

    // Render calendar
    const renderCalendar = () => {
        const daysInMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();
        const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
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
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        &lt;
                    </button>
                    <h2 className="text-lg font-semibold">
                        {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        &gt;
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {Array(firstDayOfWeek)
                        .fill()
                        .map((_, i) => (
                            <div key={`empty-${i}`} className="h-8"></div>
                        ))}

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                        (day) => {
                            const date = new Date(
                                currentYear,
                                currentMonth,
                                day
                            );
                            const dateKey = format(date, "yyyy-MM-dd");
                            const isToday = isSameDay(date, new Date());
                            const isFuture = date > new Date();
                            const isSelected = isDateSelected(date);
                            const isStartDate =
                                selectedRange.start &&
                                isSameDay(date, selectedRange.start);
                            const isEndDate =
                                selectedRange.end &&
                                isSameDay(date, selectedRange.end);
                            const isPresent =
                                attendanceData[dateKey]?.status === "present";

                            let cellClass =
                                "h-8 w-8 flex items-center justify-center rounded-full text-xs mx-auto relative";

                            if (isToday) cellClass += " border border-blue-500";

                            // Selected range styling
                            if (isSelected) {
                                cellClass += " bg-blue-100";

                                // Start and end date styling
                                if (isStartDate || isEndDate) {
                                    cellClass +=
                                        " bg-blue-600 text-white font-bold";
                                }

                                // For dates in between
                                else {
                                    cellClass += " bg-blue-200";
                                }
                            }

                            // Present but not selected
                            else if (isPresent) {
                                cellClass += " bg-green-100 text-green-800";
                            }

                            // Absent but not selected
                            else if (!isFuture) {
                                cellClass += " bg-red-100 text-red-800";
                            }

                            // Future dates
                            if (isFuture) {
                                cellClass +=
                                    " bg-gray-100 text-gray-400 cursor-not-allowed";
                            } else {
                                cellClass +=
                                    " cursor-pointer hover:bg-gray-100";
                            }

                            return (
                                <div
                                    key={day}
                                    className={cellClass}
                                    onClick={() => handleDateClick(day)}
                                >
                                    {day}
                                    {(isStartDate || isEndDate) && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400"></span>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>

                {(selectedRange.start || selectedRange.end) && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={prepareTimeEntries}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                            {selectedRange.end
                                ? "Set Times for Selected Range"
                                : "Set Time for Selected Date"}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold">
                        Mark Attendance: {staffName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-4 md:p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading attendance data...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center p-4">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {renderCalendar()}
                        </div>
                    )}
                </div>
                {showTimeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-10">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="border-b p-4">
                                <h3 className="text-lg font-semibold">
                                    Enter Time Details
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {timeEntries.map((entry, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="font-medium mb-3 text-center md:text-left">
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={entry.date}
                                                        className="w-full p-2 border rounded-md"
                                                        readOnly
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        In-Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={entry.inTime}
                                                        onChange={(e) =>
                                                            handleTimeChange(
                                                                index,
                                                                "inTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">
                                                        Out-Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={entry.outTime}
                                                        onChange={(e) =>
                                                            handleTimeChange(
                                                                index,
                                                                "outTime",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded-md"
                                                    />
                                                </div>
                                            </div>
                                            {entry.existing && (
                                                <div className="text-xs text-green-600 mt-2 text-center">
                                                    Existing entry will be
                                                    updated
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t p-4 flex justify-end gap-4">
                                <button
                                    onClick={() => setShowTimeModal(false)}
                                    className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 min-w-[80px]"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={saveAttendance}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 min-w-[80px]"
                                >
                                    Save All
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendancePopup;
