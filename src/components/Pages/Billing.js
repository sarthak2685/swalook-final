import React, { useState, useEffect } from 'react';
import { Tooltip, CircularProgress, Button, Modal, Box, Typography } from '@mui/material';
import axios from 'axios';
import GenerateInvoice from './GenerateInvoice';
import '../Styles/Billing.css';
import config from '../../config';

const BillingTable = () => {
    const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [mobile_no, setMobileNo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setGet_persent_day_bill(response.data.table_data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewDetailsClick = (item) => {
        setSelectedItem(item);
        setModalOpen(true);  // Open modal when "View Details" is clicked
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedItem(null);  // Reset the selected item when modal is closed
    };

    return (
        <div className="gb_right">
            <h2 className="gb_appoint">Billing:</h2>
            <hr className="gb_hr" />
            <div className="gb_table_wrapper">
                <table className="gb_table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mobile No.</th>
                            <th>Amount</th>
                            <th>Services</th>
                            <th>View</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    <CircularProgress sx={{ color: 'black' }} />
                                </td>
                            </tr>
                        ) : (
                            (mobile_no === '' ? get_persent_day_bill : get_persent_day_bill.filter(item => item.mobile_no === mobile_no)).map((item, index) => (
                                <tr key={index}>
                                    <td>{item.customer_name}</td>
                                    <td>{item.mobile_no}</td>
                                    <td>{item.grand_total}</td>
                                    <td>
                                        {(() => {
                                            try {
                                                const servicesArray = Array.isArray(item.services) ? item.services : JSON.parse(item.services);
                                                return servicesArray.length > 1 ? (
                                                    <select className="status-dropdown">
                                                        {servicesArray.map((service, index) => (
                                                            <option key={index} value={service.Description}>
                                                                {service.Description}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span>{servicesArray[0]?.Description || 'N/A'}</span>
                                                );
                                            } catch (error) {
                                                console.error('JSON parsing error:', error);
                                                return null;
                                            }
                                        })()}
                                    </td>
                                    <td>
                                        <GenerateInvoice onViewDetailsClick={() => handleViewDetailsClick(item)} />
                                    </td>
                                    <td>
                                        <Tooltip title="Delete Invoice">
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => console.log(`Deleting invoice with ID: ${item.id}`)}
                                            >
                                                Delete
                                            </Button>
                                        </Tooltip>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal to display user details */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box className="modal-box">
                    <Typography variant="h6">{selectedItem?.customer_name}</Typography>
                    <Typography><strong>Mobile No.:</strong> {selectedItem?.mobile_no}</Typography>
                    <Typography><strong>Amount:</strong> {selectedItem?.grand_total}</Typography>
                    <Typography><strong>Services:</strong> {JSON.stringify(selectedItem?.services, null, 2)}</Typography>
                    <Button onClick={handleCloseModal} variant="contained" color="primary">Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default BillingTable;
