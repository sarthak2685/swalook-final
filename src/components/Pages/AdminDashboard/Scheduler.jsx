import React, { useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import config from "../../../config";

const Scheduler = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
    const [staffData, setStaffData] = useState("");
    const [selectedStaff, setSelectedStaff] = useState(null); // Initialize as null
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [view, setView] = useState("weekly");
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    const token = localStorage.getItem("token");
    const bid = localStorage.getItem("branch_id");

    const fetchAppointmentData = async (staffName = "") => {
        if (!selectedDate) return;

        const currentDate = new Date(selectedDate);
        const currentWeek = Math.ceil(currentDate.getDate() / 7); // Correct week calculation
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let apiData;

        switch (selectedPeriod) {
            case "today":
                apiData = `${config.apiUrl}/api/swalook/appointment/daily/?branch_name=${bid}&staff_name=${staffName}`;
                break;
            case "Weekly":
                apiData = `${config.apiUrl}/api/swalook/appointment/current-week/?branch_name=${bid}&staff_name=${staffName}`;
                break;
            case "previous-week":
                apiData = `${config.apiUrl}/api/swalook/appointment/previous-week/?branch_name=${bid}&staff_name=${staffName}`;
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
            console.log("Response Data:", responseData);

            // Ensure data is in array format
            if (!Array.isArray(responseData)) {
                throw new Error(
                    "Invalid API response format: Expected an array"
                );
            }

            const formattedAppointments = responseData.map((appointment) => {
                let bookingHour = 0;
                if (appointment.booking_time) {
                    let timeParts = appointment.booking_time.split(":");
                    if (timeParts.length === 2) {
                        let hour = parseInt(timeParts[0], 10);
                        let meridiem = appointment.booking_time.toLowerCase();
                        if (meridiem.includes("pm") && hour !== 12) {
                            hour += 12;
                        } else if (meridiem.includes("am") && hour === 12) {
                            hour = 0;
                        }
                        bookingHour = hour;
                    }
                }
                console.log(
                    "Parsed bookingHour:",
                    bookingHour,
                    "Original time:",
                    appointment.booking_time
                );

                return {
                    id: appointment.id,
                    customerName: appointment.customer_name,
                    services: JSON.parse(appointment.services || "[]"),
                    d_o_a: appointment.d_o_a || "N/A",
                    d_o_b: appointment.d_o_b || "N/A",
                    date: appointment.booking_date,
                    time: appointment.booking_time, // Keep the original time string
                    booking_time: bookingHour, // Add a parsed booking_time as a number
                    phoneNumber: appointment.mobile_no,
                    staff: appointment.service_by,
                    email: appointment.email,
                    vendorBranch: appointment.vendor_branch,
                    comment: appointment.comment,
                };
            });

            setAppointments(formattedAppointments);
        } catch (error) {
            console.error("Error fetching appointment data:", error);
        }
    };

    const fetchStaffData = async () => {
        const token = localStorage.getItem("token");
        try {
            const staffResponse = await fetch(
                `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!staffResponse.ok) {
                throw new Error("Network response was not ok");
            }

            const staffData = await staffResponse.json();
            const staffArray = Array.isArray(staffData.table_data)
                ? staffData.table_data.map((staff) => staff.staff_name)
                : [];

            console.log("staffArray", staffArray);

            // Convert the array to a comma-separated string
            const staffString = staffArray.join(", ");
            setStaffData(staffString);
        } catch (error) {
            console.error("Error fetching staff data:", error);
            setStaffData(""); // maintain as string
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    useEffect(() => {
        if (staffData) {
            const staffArray = staffData.split(", ");
            if (staffArray.length > 0) {
                setSelectedStaff(staffArray[0]);
                fetchAppointmentData(staffArray[0]);
            }
        }
    }, [staffData]);

    useEffect(() => {
        if (selectedStaff) {
            fetchAppointmentData(selectedStaff);
        }
    }, [selectedPeriod, selectedDate, selectedStaff]);

    console.log("Updated selectedStaff:", selectedStaff);

    const getCurrentWeekDates = (startDate) => {
        const weekStart = new Date(startDate);
        weekStart.setDate(
            startDate.getDate() -
                startDate.getDay() +
                (startDate.getDay() === 0 ? -6 : 1)
        ); // Adjust to Monday

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            return {
                day: date.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue, etc.
                date: date.getDate(), // Numeric date
            };
        });
    };

    const weekDates = getCurrentWeekDates(currentWeekStart);

    const timeSlots = Array.from({ length: 24 }, (_, index) => {
        const hour = index;
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return {
            label: `${
                formattedHour < 10 && hour < 12
                    ? "0" + formattedHour
                    : formattedHour
            }:00 ${period}`,
            value: hour,
        };
    });

    const handlePreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    const handleNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    const sname = localStorage.getItem("s-name");
    const branchName = localStorage.getItem("branch_name");
    const navigate = useNavigate();

    const handleCreateInvoice = () => {
        if (selectedAppointment) {
            // Construct the invoice page URL dynamically
            const invoiceUrl = `/${sname}/${branchName}/generatebill`;
            // Redirect to the invoice page with the selected appointment data
            navigate(invoiceUrl, {
                state: { appointment: selectedAppointment },
            });
        }
    };

    const filteredAppointments = appointments.filter(
        (appointment) => appointment.staff === selectedStaff
    );

    return (
        <div className="bg-white shadow-md p-6 rounded-[2.5rem] mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Appointment Details Section */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-[2.5rem]">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Appointment
                </h2>
                {selectedAppointment ? (
                    <div className="flex flex-col items-center">
                        <div
                            className={`mt-4 p-6 rounded-[2.5rem] shadow-md w-full ${
                                selectedAppointment.color || "bg-orange-200"
                            }`}
                        >
                            <p className="text-gray-700">
                                <strong className="font-semibold text-lg">
                                    Services:{" "}
                                </strong>
                                {selectedAppointment.services.map(
                                    (service, index) => (
                                        <span
                                            key={index}
                                            className="text-gray-700 inline-block"
                                        >
                                            {service.name}
                                            {index <
                                            selectedAppointment.services
                                                .length -
                                                1
                                                ? ", "
                                                : ""}
                                        </span>
                                    )
                                )}
                            </p>
                            <p className="text-gray-700">
                                <strong>Customer:</strong>{" "}
                                {selectedAppointment.customerName}
                            </p>
                            <p className="text-gray-700">
                                <strong>Date Of Aniversary:</strong>{" "}
                                {selectedAppointment.d_o_a}
                            </p>
                            <p className="text-gray-700">
                                <strong>Date Of Birth:</strong>{" "}
                                {selectedAppointment.d_o_b}
                            </p>
                            <p className="text-gray-700">
                                <strong>Phone Number:</strong>{" "}
                                {selectedAppointment.phoneNumber}
                            </p>
                            <p className="text-gray-700 break-all w-full sm:w-auto">
                                <strong>Email:</strong>{" "}
                                {selectedAppointment.email}
                            </p>
                            <p className="text-gray-700">
                                <strong>Schedule Date:</strong>{" "}
                                {selectedAppointment.date}
                            </p>
                            <p className="text-gray-700">
                                <strong>Schedule Time:</strong>{" "}
                                {selectedAppointment.time}
                            </p>
                            <p className="text-gray-700">
                                <strong>Staff:</strong>{" "}
                                {selectedAppointment.staff}
                            </p>
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleCreateInvoice}
                                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                            >
                                Create Invoice
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Click on a schedule to see details.
                    </p>
                )}
            </div>

            {/* Schedule Section */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-white p-4 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-600">
                        {selectedStaff || "staff"}'s Schedule
                    </h3>
                    <div className="flex flex-row gap-4">
                        <select
                            className="p-2 border rounded-[2.5rem]"
                            value={view}
                            onChange={(e) => setView(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>

                {view === "today" ? (
                    <div className="w-full overflow-x-auto">
                        <div className="flex w-max text-center text-sm font-semibold">
                            {timeSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    className="border border-orange-100 py-2 px-4 text-gray-700 min-w-[120px] md:min-w-[150px] text-center"
                                >
                                    {slot.label}
                                </div>
                            ))}
                        </div>
                        <div className="relative min-h-[400px] w-max">
                            {filteredAppointments.map((appointment, index) => {
                                const leftPosition =
                                    appointment.booking_time * 120;

                                const appointmentColors = [
                                    "bg-blue-200",
                                    "bg-green-200",
                                    "bg-yellow-200",
                                    "bg-purple-200",
                                    "bg-indigo-200",
                                    "bg-pink-200",
                                    "bg-teal-200",
                                    "bg-orange-200",
                                    "bg-lime-200",
                                ];
                                const appointmentColor =
                                    appointmentColors[
                                        index % appointmentColors.length
                                    ];

                                appointment.color = appointmentColor;

                                return (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            setSelectedAppointment(appointment)
                                        }
                                        className={`absolute ${appointmentColor} p-2 m-1 rounded-full text-sm text-center min-w-[100px] md:min-w-[140px] cursor-pointer hover:bg-opacity-80 transition`}
                                        style={{
                                            left: `${leftPosition}px`,
                                            top: "10px",
                                        }}
                                    >
                                        {appointment.services.length > 0 && (
                                            <p>
                                                {appointment.services[0].name}
                                                {appointment.services.length >
                                                    1 &&
                                                    ` +${
                                                        appointment.services
                                                            .length - 1
                                                    } more`}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="flex w-max text-center font-semibold text-sm">
                            {weekDates.map((dayObj, index) => (
                                <div
                                    key={index}
                                    className="border border-orange-100 py-2 px-4 min-w-[120px] md:min-w-[150px] text-center"
                                >
                                    <div className="text-gray-700">
                                        {dayObj.day}
                                    </div>
                                    <div className="text-gray-700">
                                        {dayObj.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative min-h-[300px] flex w-max">
                            {weekDates.map((dayObj, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className="min-h-[100px] py-2 px-4 border-orange-100 border rounded-[2.5rem] min-w-[120px] md:min-w-[150px] flex flex-col"
                                >
                                    {filteredAppointments
                                        .filter((appointment) => {
                                            const appointmentDate = new Date(
                                                appointment.date
                                            );
                                            return (
                                                appointmentDate.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "short",
                                                    }
                                                ) === dayObj.day
                                            );
                                        })
                                        .map((schedule, index) => {
                                            const scheduleColors = [
                                                "bg-blue-200",
                                                "bg-green-200",
                                                "bg-yellow-200",
                                                "bg-purple-200",
                                                "bg-indigo-200",
                                                "bg-pink-200",
                                                "bg-teal-200",
                                                "bg-orange-200",
                                                "bg-lime-200",
                                            ];
                                            const scheduleColor =
                                                scheduleColors[
                                                    index %
                                                        scheduleColors.length
                                                ];

                                            schedule.color = scheduleColor;

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedAppointment(
                                                            schedule
                                                        )
                                                    }
                                                    className={`${scheduleColor} p-2 rounded-full text-sm text-center cursor-pointer hover:bg-opacity-80 transition mb-2`}
                                                >
                                                    <p className="font-semibold">
                                                        {schedule.time}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Staff Selection Section */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-[2.5rem]">
                <h3 className="text-md font-semibold text-gray-600 mb-2">
                    Select Staff
                </h3>
                <div className="grid grid-cols-2 gap-2 overflow-auto">
                    {staffData.split(", ").map((staff, index) => {
                        // Generate a unique color for each staff member
                        const staffColors = [
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-yellow-500",
                            "bg-purple-500",
                            "bg-indigo-500",
                            "bg-pink-500",
                            "bg-teal-500",
                            "bg-orange-500",
                            "bg-lime-500",
                        ];
                        const staffColor =
                            staffColors[index % staffColors.length]; // Cycle through colors

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setSelectedStaff(staff);
                                    setSelectedAppointment(null);
                                    fetchAppointmentData(staff);
                                }}
                                className={`p-2 rounded-full text-sm w-full text-center transition duration-200 ${
                                    selectedStaff === staff
                                        ? `${staffColor} text-white`
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                {staff}
                            </button>
                        );
                    })}{" "}
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
