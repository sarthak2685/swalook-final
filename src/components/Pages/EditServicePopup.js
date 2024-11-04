import React, { useEffect, useState } from 'react';
import '../Styles/EditServicePopup.css';
import axios from 'axios';
import Popup from './Popup';
import config from '../../config';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';

function EditServicePopup({ onClose, serviceData }) {
    const [serviceN, setServiceN] = useState(''); 
    const [serviceDuration, setServiceDuration] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [showPopup, setShowPopup] = useState(false); 
    const [popupMessage, setPopupMessage] = useState('');

    const bid = localStorage.getItem('branch_id');

    useEffect(() => {
        if (serviceData) {
            setServiceN(serviceData.serviceName);
            setServiceDuration(serviceData.serviceDuration);
            setServicePrice(serviceData.servicePrice);
        }
    }, [serviceData]);
    console.log('Service', serviceData);

    const handleSaveService = (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        const data = {
            service: serviceN || serviceData.serviceName,
            service_price: servicePrice !== '' ? servicePrice : serviceData.service_price,
            service_duration: serviceDuration !== '' ? serviceDuration : serviceData.service_duration
        };
    
        axios.put(`${config.apiUrl}/api/swalook/edit/services/?branch_name=${bid}&id=${serviceData.id}`, data, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            setPopupMessage("Service edited successfully!");
            setShowPopup(true);
            onClose(); // Close the popup after successful editing
            window.location.reload(); // Reload the page to reflect the changes
        })
        .catch((err) => {
            setPopupMessage("Failed to edit service.");
            setShowPopup(true);
            console.log(err);
        });
    };
    
    return (
        <div className="popup_overlay">
            <div className="popup_container">
                <div className="popup_header">
                    <h3>Edit Service</h3>
                    <button className="close_buttons" onClick={onClose}>
                        <HighlightOffOutlinedIcon />
                    </button>
                </div>
                <hr></hr>
                <form onSubmit={handleSaveService}>
                    <div className="sn1">
                        <label htmlFor="service_name">Service Name:</label>
                        <input 
                            type="text" 
                            id="service_name" 
                            name="service_name" 
                            placeholder="Service Name" 
                            value={serviceN} 
                            onChange={(e) => setServiceN(e.target.value)} 
                        />
                    </div>
                    <div className="sn2">
                        <label htmlFor="duration">Duration:</label>
                        <input 
                            type="text" 
                            id="duration" 
                            name="duration" 
                            placeholder="Duration (min)" 
                            value={serviceDuration} 
                            onChange={(e) => setServiceDuration(e.target.value)} 
                        />
                    </div>
                    <div className="sn3">
                        <label htmlFor="price">Price:</label>
                        <input 
                            type="text" 
                            id="price" 
                            name="price" 
                            placeholder="Price" 
                            value={servicePrice} 
                            onChange={(e) => setServicePrice(e.target.value)} 
                        />
                    </div>
                    <div className="sn_button_container">
                        <button type="submit" className="sn_save_button">Save</button>
                    </div>
                </form>
            </div>
            {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
        </div>
    );
}

export default EditServicePopup;
