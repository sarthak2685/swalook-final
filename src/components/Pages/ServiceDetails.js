import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../Styles/ServiceDetails.css';
import Header from './Header';
import AddServicePopup from './AddServicePopup';
import DeleteServicePopup from './DeleteServicePopup';
import EditServicePopup from './EditServicePopup';
import { Helmet } from 'react-helmet';
import config from '../../config';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import VertNav from './VertNav';

function ServiceDetails() {
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [fetchService, setFetchService] = useState([]);
    const [loading, setLoading] = useState(true);
    const bid = localStorage.getItem('branch_id');
    const [editServiceData, setEditServiceData] = useState(null);
    const hasFetched = useRef(false);  // <-- Track if data is already fetched

    useEffect(() => {
        if (!hasFetched.current && fetchService.length === 0) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`, {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    setFetchService(response.data.data.map(service => ({
                        id: service.id,
                        service: service.service,
                        service_duration: service.service_duration,
                        service_price: service.service_price
                    })));
                    hasFetched.current = true;  // <-- Mark as fetched
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [bid]);  // Fetch only when `bid` changes

    const AddtogglePopup = () => setIsAddPopupOpen(prev => !prev);
    const DeletetogglePopup = () => setIsDeletePopupOpen(prev => !prev);
    const EdittogglePopup = (id, serviceName, serviceDuration, servicePrice) => {
        setIsEditPopupOpen(prev => !prev);
        setEditServiceData({ id, serviceName, serviceDuration, servicePrice });
    };

    return (
        <>
         <Header />
         <VertNav />
        <div className='admin_service_container'>
            <Helmet>
                <title>Services</title>
            </Helmet>               
            <div className="service_details_header">
                <h1 className='text-3xl font-bold '>Service Details</h1>
                <div className='flex flex-row gap-8 md:gap-5 sm:ml-[30rem]'>
                    <buttons className="add_service_button" onClick={AddtogglePopup}>Add</buttons>
                    <buttons className="delete_service_button" onClick={DeletetogglePopup}>Delete</buttons>
                </div>
            </div>
            <div className="admin_service_table_container">
                <table className="admin_service_table">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th>Edit Service</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4"><CircularProgress /></td></tr>
                        ) : (
                            fetchService.length > 0 && fetchService.map((ser) => (
                                <tr key={ser.id}>
                                    <td>{ser.service}</td>
                                    <td>{ser.service_duration}</td>
                                    <td>{ser.service_price}</td>
                                    <td>
                                        <EditIcon
                                            onClick={() => EdittogglePopup(ser.id, ser.service, ser.service_duration, ser.service_price)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isAddPopupOpen && <AddServicePopup onClose={AddtogglePopup} />}
            {isDeletePopupOpen && <DeleteServicePopup onClose={DeletetogglePopup} />}
            {isEditPopupOpen && <EditServicePopup serviceData={editServiceData} onClose={EdittogglePopup} />}
        </div>
        </>
    );
}

export default ServiceDetails;
