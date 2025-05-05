import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import config from "../../../config";

const CustomerSummary = ({ dataPromise, mobile_no, bid }) => {
    const [customerData, setCustomerData] = useState(null);
    const [popupData, setPopupData] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (dataPromise) {
            dataPromise
                .then((data) => {
                    setCustomerData(data);
                })
                .catch((err) => {
                    console.error("Error fetching customer data:", err);
                });
        }
    }, [dataPromise]);

    const handleViewDetailsClick = async () => {
        const token = localStorage.getItem("token");
        if (!token) return console.error("Token is missing");
        if (!mobile_no || mobile_no.length !== 10)
            return console.error("Invalid mobile number");

        try {
            const response = await axios.get(
                `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}&branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setPopupData(response.data);
            setFilteredData(response.data.previous_invoices || []);
            setIsPopupVisible(true);
        } catch (error) {
            console.error("Error fetching popup data:", error);
        }
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false);
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        if (popupData?.previous_invoices) {
            const filtered = popupData.previous_invoices.filter((invoice) => {
                const services = JSON.parse(invoice.services);
                return services.some(
                    (service) =>
                        service.Description.toLowerCase().includes(value) ||
                        service.Staff.toLowerCase().includes(value)
                );
            });
            setFilteredData(filtered);
            setCurrentPage(1);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (!customerData)
        return <div className="text-center py-8">Loading...</div>;

    return (
        <>
            <div className="bg-white shadow-md px-4 py-8 my-10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        Business
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                        Rs {customerData.total_billing_amount}
                    </div>
                </div>

                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        Number of Appointments
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                        {customerData.total_appointment}
                    </div>
                </div>

                <div className="text-center">
                    <div className="font-semibold text-gray-900 text-xl">
                        Number of Invoices
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                        {customerData.total_invoices}
                    </div>
                </div>

                <div className="text-center p-4 flex items-center justify-center">
                    <button
                        onClick={handleViewDetailsClick}
                        className="text-blue-500 hover:underline hover:cursor-pointer font-semibold"
                    >
                        View Details
                    </button>
                </div>
            </div>

            {isPopupVisible && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 transition-opacity duration-300"
                    onClick={handleClosePopup}
                >
                    <div
                        className="bg-white rounded-[2.5rem] shadow-lg p-6 w-4/5 md:w-1/2 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()} // Stop closing when clicking inside popup
                    >
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white border-0 py-1 px-3 rounded-full cursor-pointer"
                        >
                            <FaTimes />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Customer Bill Data
                        </h2>

                        {/* Search Box */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search service or staff..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        {popupData ? (
                            <div className="max-h-screen my-10 transition-all duration-500">
                                <table className="table-auto w-full border border-gray-300 rounded-[2.5rem] overflow-hidden">
                                    <thead className="bg-blue-500 text-white">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">
                                                Mobile No
                                            </th>
                                            <th className="px-4 py-3">
                                                Billing Amount
                                            </th>
                                            <th className="px-4 py-3">
                                                Services
                                            </th>
                                            <th className="px-4 py-3">
                                                Service by
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`${
                                                        index % 2 === 0
                                                            ? "bg-gray-100"
                                                            : "bg-white"
                                                    } transition-all duration-300`}
                                                >
                                                    <td className="border px-4 py-2 text-center">
                                                        {
                                                            popupData.customer_name
                                                        }
                                                    </td>
                                                    <td className="border px-4 py-2 text-center">
                                                        {
                                                            popupData.customer_mobile_no
                                                        }
                                                    </td>
                                                    <td className="border px-4 py-2 text-center">
                                                        Rs {item.grand_total}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {JSON.parse(
                                                            item.services
                                                        ).map(
                                                            (service, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="text-center"
                                                                >
                                                                    {
                                                                        service.Description
                                                                    }
                                                                </div>
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {JSON.parse(
                                                            item.services
                                                        ).map(
                                                            (service, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="text-center"
                                                                >
                                                                    {
                                                                        service.Staff
                                                                    }
                                                                </div>
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center px-4 py-6 text-gray-500"
                                                >
                                                    No invoices available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {filteredData.length > itemsPerPage && (
                                    <div className="flex items-center justify-center mt-6 space-x-4">
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition"
                                        >
                                            Prev
                                        </button>
                                        <span className="font-semibold text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 hover:bg-blue-600 transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">
                                Loading data...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerSummary;
