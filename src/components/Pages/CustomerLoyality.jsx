import React, { useEffect, useState } from 'react';
import Header from './Header';
import VertNav from './VertNav';
import GroupIcon from '@mui/icons-material/Group';
import { FaInfoCircle } from 'react-icons/fa';
import AddCustomerPopup from './AddCustomerPopup';
import axios from 'axios';
import config from '../../config';


function CustomerLoyality() {
    const [modalData, setModalData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');



    const currentMonth = new Date().getMonth();
    const fetchCustomerData = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            console.log("res", response.data)
            if (response.data.status) {
                setCustomerData(response.data.data);
                // setFilteredData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, []);
    const openModal = (type) => {
        setModalTitle(type === 'birthdays' ? 'Birthdays' : 'Anniversaries');
        setIsModalOpen(true);

        // Fetch data when modal is opened
        if (type === 'birthdays') {
            axios.get(`${config.apiUrl}/api/swalook/loyality_program/birthdays/`,{
                headers: { 'Authorization': `Token ${token}` }
            })
                .then((response) => {
                    setModalData(response.data); // Assuming API returns an array of customer objects
                })
                .catch((error) => {
                    console.error('Error fetching birthdays:', error);
                    setModalData([]);
                });
        } else if (type === 'anniversaries') {
            // Fetch anniversaries if needed
            axios.get(`${config.apiUrl}/api/swalook/loyality_program/anniversaries/`)
                .then((response) => {
                    setModalData(response.data); // Assuming API returns an array of customer objects
                })
                .catch((error) => {
                    console.error('Error fetching anniversaries:', error);
                    setModalData([]);
                });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData([]);
    };



    const [searchQuery, setSearchQuery] = useState('');

    const currentDate = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = monthNames[currentDate.getMonth()];

    const handleSearch = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };
    const filteredCustomers = customerData.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchQuery) ||
            customer.mobile_no.includes(searchQuery)
    );

    const handleAddCustomerClick = () => setIsPopupOpen(true);
    const handleClosePopup = () => setIsPopupOpen(false);


    return (
        <>
            <Header />
            <VertNav />
            <div className="p-6 bg-gray-100 min-h-screen ml-0 md:ml-72">
                <h1 className='text-xl font-bold mb-6'>Customers Loyality Program</h1>
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Card 1 */}
                    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                <GroupIcon className="w-6 h-6" />
                            </div>
                            <h3
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                MTD

                            </h3>

                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500">New Customers</h2>
                                <p className="text-lg font-bold">0</p>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500">Active Memberships</h2>
                                <p className="text-lg font-bold">0</p>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500">Active Coupons</h2>
                                <p className="text-lg font-bold">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                                <GroupIcon className="w-6 h-6" />

                            </div>
                            <div className="text-gray-500 text-left">{currentMonthName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className='flex items-center gap-3'>
                                <h2 className="text-sm font-semibold text-gray-500">Birthdays</h2>
                            <button
                                onClick={() => openModal('birthdays')}
                                className="text-blue-500 hover:underline  space-x-2"
                            >
                                <FaInfoCircle className="text-gray-500 text-lg" />
                            </button>
                        </div>
                        <p className="text-lg font-bold">{modalData.length}</p>
                            </div>
                            <div>
                                <div className='flex items-center gap-3'>
                                <h2 className="text-sm font-semibold text-gray-500">Anniversaries</h2>
                            <button
                                onClick={() => openModal('anniversaries')}
                                className="text-blue-500 hover:underline"
                            >
                                <FaInfoCircle className="text-gray-500 text-lg" />
                            </button>
                        </div>
                        <p className="text-lg font-bold">{modalData.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
                        <div className="overflow-y-auto max-h-96">
                            {modalData.length > 0 ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700">
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">Phone</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modalData.map((customer, index) => (
                                            <tr
                                                key={index}
                                                className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                            >
                                                <td className="px-4 leading-10 py-2">{customer.name}</td>
                                                <td className="px-4 leading-10 py-2">{customer.phone}</td>
                                                <td className="px-4 leading-10 py-2">
                                                    {modalTitle.includes('Birthdays')
                                                        ? customer.birthday
                                                        : customer.anniversary}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No records found.</p>
                            )}
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


                {/* Customers Table */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">All Customers</h2>
                        <div className='flex justify-center items-center gap-8'>
                            <button
                                onClick={handleAddCustomerClick}
                                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                + New Customer
                            </button>
                            {isPopupOpen && <AddCustomerPopup onClose={handleClosePopup} />}
                            <div className="relative custom-search-bar">
                                <input
                                    type="texts"
                                    placeholder="Search customers"
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300 !bg-white !text-black !w-full"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>

                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse text-lg leading-[3rem] mt-11">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700">
                                    <th className="px-4 py-2 text-left">Customer Name</th>
                                    <th className="px-4 py-2 text-left">Phone Number</th>
                                    <th className="px-4 py-2 text-left">Active Membership</th>
                                    <th className="px-4 py-2 text-left">Active Coupons</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
    {filteredCustomers.map((customer, index) => (
        <tr
            key={index}
            className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        >
            <td className="px-4 py-2 relative group">
                <span className="cursor-pointer text-black font-medium">
                    {customer.name}
                </span>
                {/* Hover Box */}
                <div className="absolute left-0 top-full mt-2 w-80 p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-2xl rounded-2xl hidden group-hover:block z-10 border border-blue-300">
                    <h3 className="text-xl font-semibold text-blue-700">{customer.name}</h3>
                    <p className="text-sm text-gray-700 mt-2">
                        <strong className="text-gray-800">Email:</strong> {customer.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        <strong className="text-gray-800">DOB:</strong> {customer.d_o_b || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        <strong className="text-gray-800">DOA:</strong> {customer.d_o_a || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        <strong className="text-gray-800">points:</strong> {customer.loyality_profile.current_customer_points || 'N/A'}
                    </p>
                </div>
            </td>
            <td className="px-4 py-2">{customer.mobile_no}</td>
            <td className="px-4 py-2">{customer.membership || 'None'}</td>
            <td className="px-4 py-2">
  {customer.coupon.length > 0 
    ? customer.coupon.map(c => c.coupon_name.coupon_name).join(', ') 
    : 'None'}
</td>
            <td className="px-4 py-2">{customer.status || '-'}</td>
        </tr>
    ))}
</tbody>


                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CustomerLoyality;
