import React, { useState } from "react";
import config from "../../config";
import toast from "react-hot-toast";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

const AttendancePopup = ({
    onClose,
    onAttendanceMarked,
    staffId,
    staffName = "this staff",
    staffMobile,
    type = "in",
}) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        // Format date as dd-mm-yyyy
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    });

    const [selectedTime, setSelectedTime] = useState(() => {
        const now = new Date();
        return now.toTimeString().slice(0, 5); // "HH:MM"
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSaveClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");

        try {
            let url = `${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}&staff_id=${staffId}`;
            let method = "POST";
            let body = {
                branch_name: bid,
                staff_id: staffId,
                staff_mobile: staffMobile,
                json_data: [
                    {
                        of_month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        attend: true,
                        leave: false,
                        date: selectedDate, // dd-mm-yyyy format
                        [type === "in" ? "in_time" : "out_time"]: selectedTime,
                    },
                ],
            };

            // For out-time, use PUT method and only send necessary data
            if (type === "out") {
                method = "PUT";
                body = {
                    json_data: [
                        {
                            out_time: selectedTime,
                        },
                    ],
                };
                url = `${config.apiUrl}/api/swalook/staff/attendance/?branch_name=${bid}&staff_id=${staffId}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (
                response.ok &&
                result.message === "staff attendance already exists"
            ) {
                toast.error("Attendance already marked for today.");
            } else if (response.ok) {
                toast.success(
                    `${
                        type === "in" ? "In-time" : "Out-time"
                    } marked successfully!`
                );
                onAttendanceMarked(staffId, type);
                onClose();
            } else {
                const errorMessage =
                    result?.errors?.date ||
                    result?.message ||
                    "Failed to mark attendance";
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Error marking attendance:", error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        onClose();
    };

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2.5rem] p-6 w-[90%] max-w-md shadow-xl relative"
                onClick={handleModalClick}
            >
                <button
                    onClick={onClose}
                    className="absolute top-8 right-4 text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Close"
                >
                    <HighlightOffOutlinedIcon className="text-xl" />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 pr-6">
                    Mark {type === "in" ? "In-time" : "Out-time"} for{" "}
                    {staffName}
                </h2>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="text"
                            value={selectedDate}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {type === "in" ? "In-time" : "Out-time"}
                        </label>
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {showConfirmation ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-[2.5rem] p-4 mt-4">
                            <p className="text-blue-800 font-medium mb-4">
                                Are you sure you want to save this attendance?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-200 text-red-800 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`px-4 py-2 text-white rounded-full transition-colors ${
                                        loading
                                            ? "bg-green-400"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Confirm"
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleSaveClick}
                            disabled={loading}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-full shadow-md transition-all transform hover:scale-[1.02]"
                        >
                            Save Attendance
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendancePopup;
