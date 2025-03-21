import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";
function AllAppointment() {
    const getYesterdayDate = () => {
        const date = new Date();
        date.setDate(date.getDate());
        return date.toISOString().split("T")[0];
    };

    const [currentDate, setCurrentDate] = useState(getYesterdayDate());
    const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [appointment, setAppointment] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null); // ID of the invoice to delete

    const itemsPerPage = 10;
    const user = JSON.parse(localStorage.getItem('user'));
    const userType = user.type;

    const fetchappointment = async (date) => {
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");
        if (!token) {
            setError("Token is missing");
            return;
        }

        try {
            const response = await axios.get(
                `${config.apiUrl}/api/swalook/preset-day-appointment/?branch_name=${bid}&date=${date}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("response", response.data);
            setAppointment(response.data.table_data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error fetching data");
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token || !deleteId) {
            setError("Token or Invoice ID is missing");
            setShowModal(false);
            return;
        }

        // Optimistically update the UI
        const updatedappointment = appointment.filter(
            (appointment) => appointment.id !== deleteId
        );
        setAppointment(updatedappointment);

        try {
            const response = await axios.delete(
                `${config.apiUrl}/api/swalook/delete/appointment/?id=${deleteId}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setShowModal(false); // Close the modal
                setDeleteId(null); // Reset the delete ID
            } else {
                // Handle any unexpected responses
                setError("Unexpected response from server");
                // Revert UI update if necessary
                setAppointment(appointment); // Restore the original state
            }
        } catch (err) {
            console.error("Error deleting invoice:", err);
            setError("Error deleting invoice");
            // Revert UI update on error
            setAppointment(appointment);
        }
    };

    useEffect(() => {
        fetchappointment(selectedDate);
    }, [selectedDate]);

    const totalPages = Math.ceil(appointment.length / itemsPerPage);
    const currentData = appointment.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDateChange = (event) => {
        const selected = event.target.value;
        setSelectedDate(selected);
        setCurrentDate(
            new Date(selected).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />
            <VertNav />
            <div className="bg-white flex-grow md:ml-72 p-10">
                <div className="flex justify-between">
                    <h1 className="text-3xl font-bold mb-10 text-gray-800">
                        All Appointment of: {currentDate}
                    </h1>
                    <div className="flex flex-row space-x-1 items-baseline">
                        <span className="font-semibold text-xl">
                            Select Date:
                        </span>
                        <input
                            type="date"
                            className="p-1 border rounded-xl transition-colors duration-300"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="sticky top-0 bg-blue-600 text-white">
                            <tr>
                                <th className="border px-4 py-2">
                                    Customer Name
                                </th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Mobile No</th>
                                <th className="border px-4 py-2">Services</th>
                                <th className="border px-4 py-2">Served By</th>
                                <th className="border px-4 py-2">
                                    Booking Time
                                </th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((appointment, index) => (
                                <tr
                                    key={appointment.id}
                                    className={`${
                                        index % 2 === 0
                                            ? "bg-gray-100"
                                            : "bg-white"
                                    } hover:bg-gray-200`}
                                >
                                    <td className="border px-4 py-2">
                                        {appointment.customer_name}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {appointment.email}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {appointment.mobile_no}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {JSON.parse(appointment.services).map(
                                            (service, i) => (
                                                <div key={i}>
                                                    {service.name} - Rs.{" "}
                                                    {service.price}
                                                </div>
                                            )
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {appointment.service_by}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {appointment.booking_time}
                                    </td>

                                    <td className="border px-4 py-2">
                                    <button
                                    onClick={() => {
                                        if (userType !== "staff") {
                                        setDeleteId(appointment.id);
                                        setShowModal(true);
                                        }
                                    }}
                                    disabled={userType === "staff"}
                                    className={`px-4 py-2 rounded-lg ${
                                        userType === "staff"
                                            ? "bg-red-500 text-white hover:bg-red-600 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                    >
                                    Delete
                                    </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">
                            Confirm Delete
                        </h2>
                        <p>Are you sure you want to delete this invoice?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllAppointment;
