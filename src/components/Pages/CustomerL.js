import React, { useState, useEffect } from 'react'; 
import '../Styles/CustomerL.css';
import Header from './Header';
import AddCustomerPopup from './AddCustomerPopup';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import config from '../../config';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import EditCustomerPopup from './EditCustomerPopup';
import VertNav from './VertNav';
import DeleteProductPopup from './DeleteProductPopup';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { FaSearch } from 'react-icons/fa'; // Import search icon

function CustomerL() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null); 

    const fetchCustomerData = async () => {
        const bid = localStorage.getItem('branch_id');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            if (response.data.status) {
                setCustomerData(response.data.data);
                setFilteredData(response.data.data);
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

    useEffect(() => {
        const search = searchQuery.toLowerCase();
        const filtered = customerData.filter(customer =>
            customer.name.toLowerCase().includes(search) || customer.mobile_no.includes(search)
        );
        setFilteredData(filtered);
    }, [searchQuery, customerData]);

    const handleAddCustomerClick = () => setIsPopupOpen(true);
    const handleClosePopup = () => setIsPopupOpen(false);

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setIsEditPopupOpen(true);
    };

    const handleEditPopupClose = () => {
        setIsEditPopupOpen(false);
        setSelectedCustomer(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${config.apiUrl}/api/swalook/loyality_program/customer/?id=${selectedCustomerId}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                },
            });

            const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${localStorage.getItem('branch_id')}`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                },
            });

            if (response.data.status) {
                setCustomerData(response.data.data);
                setFilteredData(response.data.data);
            }

            setShowPopup(false);
            setSelectedCustomerId(null);
        } catch (error) {
            console.error('An error occurred while deleting customer data:', error);
        }
    };

    const handleCancelDelete = () => {
        setShowPopup(false);
        setSelectedCustomerId(null);
    };

    const handleDeleteClick = (id) => {
        setSelectedCustomerId(id);
        setShowPopup(true);
    };

    return (
        <div className='cl_container'>
            <Helmet>
                <title>Customer Loyalty</title>
            </Helmet>
            <Header />
            <div className='cl_main'>
                <div className='update'>
                    <div className='gb_h9'>
                        <div className='gb_ver_nav1'>
                            <VertNav />
                        </div>
                    </div>
                    <div className='cl_tableContainer'>               
                        <div className='cl_headerContainer'>
                            <h2 className='cl_heading'>Customer Details</h2>
                        </div>
                        <div className='cl_headerActions'>
                            <div className='cl_searchContainer'>
                                <FaSearch className='cl_searchIcon' />
                                <input
                                    className='cl_searchBar'
                                    placeholder='Search Customer'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className='cl_card cl_add' onClick={handleAddCustomerClick}>
                                <PersonAddIcon style={{ fontSize: "24px", marginRight: "8px" }} />
                                Add Customer
                            </button>
                        </div>
                        <hr className='cl_divider'/> 

                        <div className='cl_table_wrapper'>
                            <table className='cl_table'>
                                <thead>
                                    <tr>
                                        <th>Sl.No.</th>
                                        <th>Customer Name</th>
                                        <th>Customer Number</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5">Loading...</td>
                                        </tr>
                                    ) : filteredData.length > 0 ? (
                                        filteredData.map((customer, index) => (
                                            <tr key={customer.id}>
                                                <td>{index + 1}</td>
                                                <td>{customer.name}</td>
                                                <td>{customer.mobile_no}</td>
                                                <td>
                                                    <EditIcon style={{ cursor: 'pointer' }} onClick={() => handleEditClick(customer)} />
                                                </td>
                                                <td>
                                                    <DeleteIcon 
                                                        style={{ cursor: 'pointer', color: 'black' }} 
                                                        onClick={() => handleDeleteClick(customer.id)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {isPopupOpen && <AddCustomerPopup onClose={handleClosePopup} />}
                {isEditPopupOpen && (
                    <EditCustomerPopup
                        customer={selectedCustomer}
                        onClose={handleEditPopupClose}
                    />
                )}
                {showPopup && (
                    <DeleteProductPopup
                        title="Delete Customer"
                        message="Are you sure you want to delete this customer?"
                        onConfirm={handleDelete} 
                        onCancel={handleCancelDelete} 
                    />
                )}
            </div>
        </div>
    );
}

export default CustomerL;
