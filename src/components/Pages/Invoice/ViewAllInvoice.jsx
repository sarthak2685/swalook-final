import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Header";
import VertNav from "../VertNav";
import config from "../../../config";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";

const ViewAllInvoices = () => {
    const getYesterdayDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split("T")[0];
    };
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(getYesterdayDate());
    const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const userType = user.type;

    const itemsPerPage = 10;

    const fetchInvoices = async (date) => {
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");
        if (!token) {
            setError("Token is missing");
            return;
        }

        try {
            const response = await axios.get(
                `${config.apiUrl}/api/swalook/billing/?branch_name=${bid}&date=${date}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setInvoices(response.data.table_data);
            setFilteredInvoices(response.data.table_data);
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

        const updatedInvoices = invoices.filter(
            (invoice) => invoice.id !== deleteId
        );
        setInvoices(updatedInvoices);
        setFilteredInvoices(updatedInvoices);

        try {
            const response = await axios.delete(
                `${config.apiUrl}/api/swalook/delete/invoice/?id=${deleteId}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setShowModal(false);
                setDeleteId(null);
            } else {
                setError("Unexpected response from server");
                setInvoices(invoices);
                setFilteredInvoices(invoices);
            }
        } catch (err) {
            console.error("Error deleting invoice:", err);
            setError("Error deleting invoice");
            setInvoices(invoices);
            setFilteredInvoices(invoices);
        }
    };

    const handleEdit = (invoice) => {
        const sname = localStorage.getItem("s-name");
        const branchName = localStorage.getItem("branch_name");
        const invoiceUrl = `/${sname}/${branchName}/generatebill`;

        // Parse the services string to array
        const services = JSON.parse(invoice.services || "[]");

        // Process products with proper staff data structure
        const products = (invoice.json_data || []).map((product) => ({
            ...product,
            staff: product.staff ? [{ label: product.staff }] : [], // Convert string staff to array format
        }));

        navigate(invoiceUrl, {
            state: {
                invoiceData: {
                    id: invoice.id,
                    slno: invoice.slno,
                    customerName: invoice.customer_name,
                    phoneNumber: invoice.mobile_no,
                    email: invoice.email,
                    address: invoice.address,
                    services: services,
                    products: products,
                    paymentModes: invoice.new_mode || [],
                    totalAmount: invoice.grand_total,
                    date: invoice.date,
                    staff: services[0]?.Staff || "",
                    comment: invoice.comment,
                    gst_number: invoice.gst_number,
                    isGST: invoice.gst_number ? true : false,
                    discount: invoice.discount || 0,
                },
                isEditMode: true,
            },
        });
    };

    useEffect(() => {
        fetchInvoices(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredInvoices(invoices);
            setCurrentPage(1);
        } else {
            const filtered = invoices.filter(
                (invoice) =>
                    invoice.customer_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    invoice.mobile_no.includes(searchTerm)
            );
            setFilteredInvoices(filtered);
            setCurrentPage(1);
        }
    }, [searchTerm, invoices]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const currentData = filteredInvoices.slice(
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

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <VertNav />
            <div className="flex-grow md:ml-72 p-6">
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
                            All Invoices: {currentDate}
                        </h1>
                        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by name or number..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <span className="font-semibold text-gray-700 whitespace-nowrap">
                                    Select Date:
                                </span>
                                <input
                                    type="date"
                                    className="p-2 border rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Services
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Products
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-center font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentData.length > 0 ? (
                                    currentData.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {invoice.customer_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {invoice.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900">
                                                    {invoice.mobile_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 space-y-1">
                                                    {JSON.parse(
                                                        invoice.services
                                                    ).map((service, i) => (
                                                        <div key={i}>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    {
                                                                        service.Description
                                                                    }
                                                                </span>
                                                                <span>
                                                                    ₹
                                                                    {service.Total_amount.toFixed(
                                                                        2
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Served by:{" "}
                                                                {service.Staff ||
                                                                    "N/A"}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {invoice.json_data &&
                                                invoice.json_data.length > 0 ? (
                                                    <ul className="text-sm space-y-1">
                                                        {invoice.json_data.map(
                                                            (product, i) => (
                                                                <li key={i}>
                                                                    <div className="flex justify-between">
                                                                        <span>
                                                                            {
                                                                                product.name
                                                                            }{" "}
                                                                            (x
                                                                            {
                                                                                product.quantity
                                                                            }
                                                                            )
                                                                        </span>
                                                                        <span>
                                                                            ₹
                                                                            {(
                                                                                product.price *
                                                                                product.quantity
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Sold by:{" "}
                                                                        {product.staff ||
                                                                            "N/A"}
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold">
                                                    ₹
                                                    {parseFloat(
                                                        invoice.grand_total
                                                    ).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {invoice.new_mode &&
                                                invoice.new_mode.length > 0 ? (
                                                    <ul className="text-sm space-y-1">
                                                        {invoice.new_mode.map(
                                                            (mode, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="flex justify-between"
                                                                >
                                                                    <span>
                                                                        {
                                                                            mode.mode
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        ₹
                                                                        {
                                                                            mode.amount
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <a
                                                        href={`${invoice.pdf_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                                                        title="View Invoice"
                                                    >
                                                        <FaEye />
                                                    </a>
                                                    {userType !== "staff" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        invoice
                                                                    )
                                                                }
                                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"
                                                                title="Edit Invoice"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteId(
                                                                        invoice.id
                                                                    );
                                                                    setShowModal(
                                                                        true
                                                                    );
                                                                }}
                                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                                                                title="Delete Invoice"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            {searchTerm.trim() !== ""
                                                ? "No invoices match your search criteria"
                                                : "No invoices found for the selected date"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredInvoices.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-3 sm:space-y-0">
                            <div className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        filteredInvoices.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {filteredInvoices.length}
                                </span>{" "}
                                invoices
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === 1
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                >
                                    Previous
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === totalPages
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this invoice? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
};

export default ViewAllInvoices;
