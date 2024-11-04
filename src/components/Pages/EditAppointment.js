import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import '../Styles/EditAppointment.css';
import axios from 'axios';
import Popup from './Popup';
import config from '../../config';

function EditAppointment({ onClose, appointmentId, initialAppointmentName, initialAppointmentPhone }) {
    const navigate = useNavigate();
    const [appointmentName, setAppointmentName] = useState(initialAppointmentName);
    const [appointmentPhone, setAppointmentPhone] = useState(initialAppointmentPhone);
    const [email, setEmail] = useState('');
    const [booking_date, setBookingDate] = useState('');
    const [booking_time, setBookingTime] = useState('');
    const [selectedAMPM, setSelectedAMPM] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [comments, setComments] = useState('');
    const [services, setServices] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const bid = localStorage.getItem('branch_id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch service options
                const servicesResponse = await fetch(`${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const servicesData = await servicesResponse.json();
                setServiceOptions(servicesData.data.map((service) => ({
                    id: service.id,
                    value: service.service,
                    price: service.service_price,
                    duration: service.service_duration
                })));

                // Fetch appointment data
                const appointmentResponse = await fetch(`${config.apiUrl}/api/swalook/get_specific/appointment/${appointmentId}/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const appointmentData = await appointmentResponse.json();
                const appointment = appointmentData.single_appointment_data[0];

                // Set form fields from appointment data
                setEmail(appointment.email);
                setBookingDate(appointment.booking_date);
                setBookingTime(appointment.booking_time);
                setComments(appointment.comment);

                // Set selected services based on appointment data
                const initialServices = appointment.services.split(', ').map(service => {
                    const foundService = serviceOptions.find(option => option.value === service);
                    return foundService ? { id: foundService.id, value: foundService.value } : null;
                }).filter(service => service);
                setServices(initialServices);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
        document.body.classList.add('no-scroll');

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [appointmentId]);

    const handleSelect = (selectedList) => {
        setServices(selectedList);
    };

    const handleTimeChange = (event) => {
        const { id, value } = event.target;

        switch (id) {
            case 'hours':
                setBookingTime(prevTime => `${value || ''}:${prevTime.split(':')[1] || '00'} ${selectedAMPM}`);
                break;
            case 'minutes':
                setBookingTime(prevTime => `${prevTime.split(':')[0] || ''}:${value || '00'} ${selectedAMPM}`);
                break;
            case 'am_pm':
                setSelectedAMPM(value || '');
                setBookingTime(prevTime => `${prevTime.split(':')[0] || ''}:${prevTime.split(':')[1] || '00'} ${value || ''}`);
                break;
            default:
                break;
        }
    };

    const bname = atob(localStorage.getItem('branch_name'));
    const sname = localStorage.getItem('s-name');

    const handleEditAppointment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${config.apiUrl}/api/swalook/edit/appointment/?branch_name=${bid}&id=${appointmentId}`, {
                customer_name: appointmentName,
                mobile_no: appointmentPhone,
                email: email,
                services: services.map(service => service.value).join(', '),
                booking_date: booking_date,
                booking_time: booking_time,
                vendor_branch: bname,
                comment: comments
            }, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setPopupMessage("Appointment edited successfully!");
            setShowPopup(true);
            onClose();
            navigate(`/${sname}/${bname}/dashboard`);
            window.location.reload();
        } catch (err) {
            setPopupMessage("Failed to edit appointment.");
            setShowPopup(true);
            console.error("Error editing appointment:", err);
        }
    };

    return (
        <div>
            <div className="edit_popup_overlay">
                <div className="edit_popup_container">
                    <div className="edit_popup_header">
                        <h3>Edit Appointment</h3>
                        <button className="edit_close_button" onClick={onClose}>X</button>
                    </div>
                    <hr />
                    <form onSubmit={handleEditAppointment}>
                        <div className="edit-appointform-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                className="edit-appoint_input-field"
                                placeholder='Enter Full Name'
                                value={appointmentName}
                                onChange={(e) => setAppointmentName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="edit-appointform-group">
                            <label htmlFor="phone">Phone:</label>
                            <input
                                type="number"
                                id="phone"
                                className="edit-appoint_input-field"
                                placeholder='Enter Mobile Number'
                                value={appointmentPhone}
                                onChange={(e) => setAppointmentPhone(e.target.value)}
                                required
                                maxLength={10}
                            />
                        </div>
                        <div className="edit-appointform-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                className="edit-appoint_input-field"
                                placeholder='Enter Email Address'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <h3 className='sts'>Select the Service</h3>
                        <div className='edit-appoint_select-field-cont'>
                            <Multiselect
                                options={serviceOptions}
                                selectedValues={services}
                                showSearch={true}
                                onSelect={handleSelect}
                                onRemove={handleSelect}
                                displayValue="value"
                                placeholder="Select Services..."
                                className="appoint_select-field"
                                showCheckbox={true}
                            />
                        </div>
                        <div className="edit-appointform-group">
                            <label>Selected Services:</label>
                            <div className="selected-services">
                                {services.map(service => (
                                    <span key={service.id} className="selected-service">{service.value}</span>
                                ))}
                            </div>
                        </div>
                        <div className="edit-appointform-group">
                            <label htmlFor="comment">Comment:</label>
                            <input
                                type="text"
                                id="comment"
                                className="edit-appoint_input-field"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder='Enter Comment'
                            />
                        </div>
                        <h3 className='sch'>Schedule</h3>
                        <div className="edit-schedule_form-group">
                            <label htmlFor="date" className="edit-schedule_date-label">Date:</label>
                            <input
                                type='date'
                                id='date'
                                className='edit-schedule_date-input'
                                value={booking_date}
                                onChange={(e) => setBookingDate(e.target.value)}
                            />
                        </div>
                        <div className="edit-schedule_time-selection">
                            <label htmlFor="hours" className="edit-schedule_time-label">Time:</label>
                            <select id="hours" className="edit-schedule_time-dropdown" onChange={handleTimeChange}>
                                <option value="" disabled>Hours</option>
                                {[...Array(12).keys()].map(hour => (
                                    <option key={hour + 1} value={hour + 1}>{hour + 1}</option>
                                ))}
                            </select>
                            <select id="minutes" className="edit-schedule_time-dropdown" onChange={handleTimeChange}>
                                <option value="" disabled>Minutes</option>
                                <option value="00">00</option>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="45">45</option>
                            </select>
                            <select id="am_pm" className="edit-schedule_time-dropdown" onChange={handleTimeChange}>
                                <option value="" disabled>AM/PM</option>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                        <button type="submit" className="edit-appoint_submit-button">Edit Appointment</button>
                    </form>
                </div>
            </div>
            {showPopup && (
                <Popup message={popupMessage} onClose={() => setShowPopup(false)} />
            )}
        </div>
    );
}

export default EditAppointment;
