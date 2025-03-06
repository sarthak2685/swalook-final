import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import VertNav from "./VertNav";

const inquiriesData = [
    {
        date: "15/02/24",
        name: "Debashish",
        phone: "9876543210",
        inquiredFor: "Haircut",
        notes: "Asked about discounts...",
    },
    {
        date: "10/01/24",
        name: "Karan",
        phone: "9123456789",
        inquiredFor: "Hair Spa",
        notes: "Wanted an appointment...",
    },
    {
        date: "05/03/24",
        name: "Sarthak",
        phone: "8765432109",
        inquiredFor: "Beard Trim",
        notes: "Requested stylist info...",
    },
    {
        date: "22/02/24",
        name: "Bijit",
        phone: "7654321098",
        inquiredFor: "Facial",
        notes: "Asked about organic products...",
    },
    {
        date: "28/01/24",
        name: "Hritik",
        phone: "6543210987",
        inquiredFor: "Hair Color",
        notes: "Requested price list...",
    },
    {
        date: "18/03/24",
        name: "Promoth",
        phone: "5432109876",
        inquiredFor: "Hair Wash",
        notes: "Asked about timings...",
    },
    {
        date: "07/02/24",
        name: "Archisman",
        phone: "4321098765",
        inquiredFor: "Scalp Treatment",
        notes: "Inquired about ingredients...",
    },
    {
        date: "25/03/24",
        name: "Debashish",
        phone: "3210987654",
        inquiredFor: "Shaving",
        notes: "Wanted express service...",
    },
];

const Inquiries = () => {
    const sname = localStorage.getItem("sname");
    const branchName = localStorage.getItem("branch_name");
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleNewInquiry = () => {
        navigate(`/${sname}/${branchName}/new-Inquiry`);
    };

    const filteredData = inquiriesData.filter(
        ({ name, phone, date }) =>
            (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                phone.includes(searchTerm)) &&
            (selectedMonth ? date.includes(selectedMonth) : true)
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
                            <select
                                className="border p-2 rounded-lg text-sm"
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                            >
                                <option value="">All Months</option>
                                <option value="01/24">January '24</option>
                                <option value="02/24">February '24</option>
                                <option value="03/24">March '24</option>
                            </select>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleNewInquiry}
                            >
                                + New Inquiry
                            </button>
                        </div>
                    </div>
                    <table className="w-full text-center bg-white border rounded-lg">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2">S. No.</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Phone Number</th>
                                <th className="p-2">Inquired For</th>
                                <th className="p-2">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedData.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">
                                        {(currentPage - 1) * itemsPerPage +
                                            index +
                                            1}
                                    </td>
                                    <td className="p-2">{item.date}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">{item.phone}</td>
                                    <td className="p-2">{item.inquiredFor}</td>
                                    <td className="p-2">{item.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            className="px-3 py-1 bg-gray-300 rounded-lg disabled:opacity-50"
                            onClick={() => setCurrentPage(currentPage - 1)}
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
