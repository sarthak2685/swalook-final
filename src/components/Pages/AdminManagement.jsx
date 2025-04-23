import React, { useEffect, useState } from "react";
import AttendancePopup from "./Attendence.js";
import SalarySlipPopup from "./SalarySlipPopup.jsx";
import AddStaffModal from "./AddStaffModal.js";
import config from "../../config.js";
import toast, { Toaster } from "react-hot-toast";
import { IconButton } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import VertNav from "./VertNav.js";
import Header from "./Header.js";
import EditStaff from "./EditStaff.js";

const AdminManagement = () => {
    const [staffData, setStaffData] = useState([]);
    const [showAttendancePopup, setShowAttendancePopup] = useState(false);
    const [showSalarySlipPopup, setShowSalarySlipPopup] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [staffId, setStaffId] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [showEditStaff, setShowEditStaff] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const userType = user.type;

    const getDaysInMonth = (month, year) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const isLeapYear =
            (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        return isLeapYear && month === 1 ? 29 : daysInMonth[month];
    };

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const bid = localStorage.getItem("branch_id");
            try {
                const response = await fetch(
                    `${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                console.log("API Response:", data);

                const attendanceResponse = await fetch(
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
                );

                if (!attendanceResponse.ok)
                    throw new Error("Failed to fetch attendance");
                const attendanceData = await attendanceResponse.json();
                console.log("Attendance Response:", attendanceData);

                const staffArray = Array.isArray(data.table_data)
                    ? data.table_data
                    : [];
                const totalDays = attendanceData.current_month_days;
                console.log("Total Days:", totalDays);
                const attendanceTable = attendanceData.table_data || {};
                console.log("dsbhj", attendanceTable);

                if (staffArray.length === 0) {
                    console.warn("No staff data found in table_date.");
                }
                const formattedData = staffArray.map((staff) => {
                    const attendanceRecord = attendanceTable[
                        staff.mobile_no
                    ] || { number_of_days_present: 0 };
                    console.log("records", attendanceRecord);
                    return {
                        id: staff.id || staff.staff_id || null,
                        name: staff.staff_name || "N/A",
                        role: staff.staff_role || "N/A",
                        mobile: staff.mobile_no || "N/A",
                        salary: parseFloat(staff.staff_salary_monthly) || 0,
                        commission: parseFloat(staff.staff_slab) || 0,
                        attendance: {
                            present: attendanceRecord.number_of_days_present,
                            total: totalDays,
                        },
                        business:
                            parseFloat(staff.business_of_the_current_month) ||
                            0,
                    };
                });

                console.log("Formatted Staff Data:", formattedData);
                setStaffData(formattedData);
            } catch (error) {
                console.error("Error:", error);
                setStaffData([]);
            }
        };

        fetchData();
    }, []);

    const handleEditStaff = (staff) => {
        setSelectedStaff(staff);
        setShowEditStaff(true);
    };

    const handleSaveEditedStaff = (updatedStaff) => {
        setStaffData((prevData) =>
            prevData.map((staff) =>
                staffData.id === selectedStaff.id
                    ? { ...staff, ...updatedStaff }
                    : staff
            )
        );
        toast.success("staff detail updated successfully");
    };

    const handleAttendanceMarked = (staffId, attendanceData) => {
        setStaffData((prevData) =>
            prevData.map((staff) => {
                if (staff.id === staffId) {
                    const updatedAttendance = {
                        ...staff.attendance,
                        present: attendanceData.filter((date) => date.attend)
                            .length,
                    };
                    return { ...staff, attendance: updatedAttendance };
                }
                return staff;
            })
        );
    };

    const openDeleteConfirm = (staffId) => {
        setStaffId(staffId);
        setDeleteConfirmation(true);
    };

    const handleDeleteStaff = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/staff/?id=${staffId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            setStaffData((prevData) =>
                prevData.filter((staff) => staff.id !== staffId)
            );
            setDeleteConfirmation(false);
            toast.success("Staff deleted successfully");
        } catch (error) {
            console.error("Error deleting staff:", error);
            toast.error("Failed to delete staff");
        }
    };

    const openAttendancePopup = (staffId) => {
        setSelectedStaffId(staffId);
        setShowAttendancePopup(true);
    };

    const openSalarySlipPopup = (staffId) => {
        setSelectedStaffId(staffId);
        setShowSalarySlipPopup(true);
    };

    const handleAddStaff = (newStaff) => {
        console.log("Staff added:", newStaff);
    };

    return (
        <>
            <div className="bg-gray-50">
                <Header />
                <VertNav />
                <div className="p-4 md:p-8 md:ml-72">
                    <div className="bg-white shadow-xl rounded-[2.5rem] p-6 md:p-8 mx-auto">
                        <Toaster />

                        {/* Header and Add Button */}
                        <div className="flex justify-between items-center mb-5">
                            <h1 className="text-3xl font-semibold">
                                Staff Management
                            </h1>
                            <button
                                className=" px-4 py-2 rounded-full text-sm shadow-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => setShowAddStaffModal(true)}
                            >
                                + Add Staff
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-y-auto">
                            <table className="w-full bg-white shadow-md p-4 rounded-[2.5rem] overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            "SNo.",
                                            "Staff Name",
                                            "Staff Role",
                                            "Staff Mobile",
                                            "Staff Salary",
                                            "Staff Commission",
                                            "Attendance MTD",
                                            "Business MTD",
                                            "Mark Attendance",
                                            "Salary Slip",
                                            "Edit",
                                            "Delete",
                                        ].map((head, i) => (
                                            <th
                                                key={i}
                                                className="px-4 py-2 text-left border"
                                            >
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffData.map((staff, index) => (
                                        <tr
                                            key={staff.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-2 border text-center">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2 border text-center ">
                                                {staff.name}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {staff.role}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {staff.mobile}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {staff.salary}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {staff.commission}
                                            </td>
                                            <td className="px-6 py-4 text-center border text-sm text-gray-700">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {`${staff.attendance.present}/${staff.attendance.total}`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {staff.business}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <button
                                                    className="w-full px-4 py-2 rounded-full text-sm shadow-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() =>
                                                        openAttendancePopup(
                                                            staff.id
                                                        )
                                                    }
                                                >
                                                    Mark
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <button
                                                    className="w-full px-4 py-2 rounded-full text-sm shadow-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() =>
                                                        openSalarySlipPopup(
                                                            staff.id
                                                        )
                                                    }
                                                >
                                                    Slip
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <IconButton
                                                    onClick={() =>
                                                        userType !== "staff" &&
                                                        handleEditStaff(staff)
                                                    }
                                                    disabled={
                                                        userType === "staff"
                                                    }
                                                    sx={{
                                                        opacity:
                                                            userType === "staff"
                                                                ? 0.5
                                                                : 1,
                                                        cursor:
                                                            userType === "staff"
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <IconButton
                                                    onClick={() =>
                                                        userType !== "staff" &&
                                                        openDeleteConfirm(
                                                            staff.id
                                                        )
                                                    }
                                                    color="error"
                                                    aria-label="delete"
                                                    disabled={
                                                        userType === "staff"
                                                    }
                                                    sx={{
                                                        opacity:
                                                            userType === "staff"
                                                                ? 0.5
                                                                : 1,
                                                        cursor:
                                                            userType === "staff"
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Modals */}
                        {showAttendancePopup && (
                            <AttendancePopup
                                onClose={() => setShowAttendancePopup(false)}
                                onAttendanceMarked={handleAttendanceMarked}
                                staffId={selectedStaffId}
                                initialAttendance={
                                    staffData.find(
                                        (staff) => staff.id === selectedStaffId
                                    )?.attendance
                                }
                            />
                        )}

                        {showSalarySlipPopup && (
                            <SalarySlipPopup
                                onClose={() => setShowSalarySlipPopup(false)}
                                staffId={selectedStaffId}
                            />
                        )}

                        {showAddStaffModal && (
                            <AddStaffModal
                                onClose={() => setShowAddStaffModal(false)}
                                onAddStaff={handleAddStaff}
                            />
                        )}

                        {showEditStaff && (
                            <EditStaff
                                isOpen={showEditStaff}
                                onClose={() => setShowEditStaff(false)}
                                staffData={selectedStaff}
                                onSave={handleSaveEditedStaff}
                            />
                        )}

                        {deleteConfirmation && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-[90%] text-center">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Are you sure you want to delete this
                                        staff member?
                                    </h2>
                                    <div className="flex justify-center gap-4 mt-6">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded transition-colors"
                                            onClick={handleDeleteStaff}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-700 text-white py-2 px-6 rounded transition-colors"
                                            onClick={() =>
                                                setDeleteConfirmation(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminManagement;
