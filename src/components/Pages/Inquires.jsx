import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";
import axios from "axios";

const Inquiries = () => {
    const sname = localStorage.getItem("sname");
    const branchName = localStorage.getItem("branch_name");
    const bid = localStorage.getItem("branch_id");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [inquiry, setInquires] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const itemsPerPage = 20;

    const fetchInquiries = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/enquery/?branch_name=${bid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const { status, data } = await response.json();

            if (status && Array.isArray(data)) {
                setInquiries(data);
            } else {
                setInquiries([]);
            }
        } catch (err) {
            setError("Failed to fetch inquiries. Please try again.");
        } finally {
            setLoading(false);
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
        const updatedInquiry = inquiry.filter(
            (inquiry) => inquiry.id !== deleteId
        );
        setInquires(updatedInquiry);

        try {
            const response = await axios.delete(
                `${config.apiUrl}/api/swalook/enquery/?id=${deleteId}&branch_name=${bid}`,
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
                window.location.reload();
            } else {
                // Handle any unexpected responses
                setError("Unexpected response from server");
                // Revert UI update if necessary
                setInquires(inquiry); // Restore the original state
            }
        } catch (err) {
            console.error("Error deleting invoice:", err);
            setError("Error deleting invoice");
            // Revert UI update on error
            setInquires(inquiry);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [bid, token]);

    const handleNewInquiry = () => {
        navigate(`/${sname}/${branchName}/new-Inquiry`);
    };

    // Function to parse `query_for` field
    const parseQueryFor = (queryFor) => {
        try {
            // Convert single quotes to double quotes (if needed)
            const validJsonString = queryFor.replace(/'/g, '"');

            // Parse string into JSON
            const parsedData = JSON.parse(validJsonString);

            // Extract service and product names
            const services = parsedData?.service?.trim() || "";
            const products = parsedData?.product?.trim() || "";

            // Combine both, return "N/A" if empty
            return [services, products].filter(Boolean).join(", ") || "N/A";
        } catch (error) {
            return "Invalid Data";
        }
    };

    // Filter and paginate data
    const filteredData = inquiries.filter(
        ({ customer_name = "", mobile_no = "" }) =>
            customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mobile_no.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const displayedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-gray-100 min-h-[200vh]">
            <Header />
            <VertNav />
            <div className="p-10 md:ml-72">
                <div className="bg-white shadow-lg rounded-lg p-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Inquiries</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Search (Number/Name)"
                                className="border p-2 rounded-lg text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleNewInquiry}
                            >
                                + New Inquiry
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : inquiries.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No inquiries found.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="w-full text-center bg-white border rounded-lg ">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-2 border border-gray-300">
                                            S. No.
                                        </th>
                                        <th className="p-2 border border-gray-300">
                                            Customer Name
                                        </th>
                                        <th className="p-2 border border-gray-300">
                                            Phone Number
                                        </th>
                                        <th className="p-2 border border-gray-300">
                                            Inquired For
                                        </th>
                                        <th className="p-2 border border-gray-300">
                                            Notes
                                        </th>
                                        <th className="p-2 border border-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedData.map((item, index) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2">
                                                {(currentPage - 1) *
                                                    itemsPerPage +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {item.customer_name || "N/A"}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {item.mobile_no || "N/A"}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {parseQueryFor(item.query_for)}
                                            </td>

                                            <td className="p-2 border border-gray-300">
                                                {item.comment || "N/A"}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(item.id);
                                                        setShowModal(true);
                                                    }}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    className="px-3 py-1 bg-gray-300 rounded-lg disabled:opacity-50"
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 rounded-lg ${
                                            currentPage === i + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-300"
                                        }`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 bg-gray-300 rounded-lg disabled:opacity-50"
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    &gt;
                                </button>
                            </div>
                            {/* Delete Confirmation Modal */}
                            {showModal && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                        <h2 className="text-xl font-semibold mb-4">
                                            Confirm Delete
                                        </h2>
                                        <p>
                                            Are you sure you want to delete this
                                            inquirey?
                                        </p>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2"
                                                onClick={() =>
                                                    setShowModal(false)
                                                }
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
