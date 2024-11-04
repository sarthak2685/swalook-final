import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import '../Styles/Appointment.css';
import Header from './Header';
import VertNav from './VertNav';
import Popup from './Popup';
import { Helmet } from 'react-helmet';
import config from '../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import CustomDialog from './CustomDialog';

function getCurrentDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function Appointment() {
  const [services, setServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedAMPM, setSelectedAMPM] = useState('');
  const [presetAppointments, setPresetAppointments] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookAppointment, setBookAppointment] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);
  const sname = localStorage.getItem("sname");
const branchName = localStorage.getItem("branch_name");


  const currentDate = getCurrentDate();
  const bid = localStorage.getItem('branch_id');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setServiceOptions(data.data.map(service => ({ key: service.id, value: service.service })));
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, [bid]);

  const handleSelect = selectedList => setServices(selectedList);

  const handleTimeChange = event => {
    const { id, value } = event.target;
    const prevTime = bookingTime.split(':');
    const hour = prevTime[0] || '';
    const minute = prevTime[1] || '00';
    const ampm = selectedAMPM;

    switch (id) {
      case 'hours':
        setBookingTime(`${value || ''}:${minute} ${ampm}`);
        break;
      case 'minutes':
        setBookingTime(`${hour}:${value || '00'} ${ampm}`);
        break;
      case 'am_pm':
        setSelectedAMPM(value || '');
        setBookingTime(`${hour}:${minute} ${value || ''}`);
        break;
      default:
        break;
    }
  };

  const handleAddAppointment = async e => {
    e.preventDefault();
    setBookAppointment(true);
    
    let errorMessage = 'Please fix the following issues:\n';
    if (services.length === 0) errorMessage += ' - Select at least one service.\n';
    if (!bookingTime) errorMessage += ' - Select a time.\n';
    if (!bookingDate) errorMessage += ' - Select a date.\n';
    if (!/^(\+91)?[0-9]{10}$/.test(mobileNo)) errorMessage += ' - Enter a valid mobile number.\n';
    
    if (errorMessage !== 'Please fix the following issues:\n') {
      setDialogTitle('Error');
      setDialogMessage(errorMessage);
      setDialogOpen(true);
      setBookAppointment(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${config.apiUrl}/api/swalook/appointment/?branch_name=${bid}`, {
        customer_name: customerName,
        mobile_no: mobileNo,
        email: email,
        services: services.map(service => service.value).toString(),
        booking_time: bookingTime,
        booking_date: bookingDate,
        comment: comments,
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        setPopupMessage("Appointment added successfully!");
        setShowPopup(true);
        const phoneNumber = `+91${mobileNo}`;
        const serviceNames = services.map(service => service.value).join(', ');
        const message = `Hi ${customerName}!\nYour appointment is booked for: ${bookingTime} | ${bookingDate}\nServices: ${serviceNames}\nSee you soon!`;
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      setPopupMessage(`Failed to add appointment: ${errorMessage}`);
      setShowPopup(true);
      console.error('Failed to add appointment:', error);
    } finally {
      setBookAppointment(false);
    }
  };

  useEffect(() => {
    const fetchPresetAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/api/swalook/preset-day-appointment/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });
        setPresetAppointments(response.data.table_data);
      } catch (error) {
        console.error('Error fetching preset appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresetAppointments();
  }, [bid]);

  const handleDeleteClick = id => {
    setDeleteInvoiceId(id);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${config.apiUrl}/api/swalook/delete/appointment/?id=${deleteInvoiceId}&branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setShowDeletePopup(false);
    }
  };
  // Add this before `return` in your component
const handleArrowClick = (appointment) => {
  console.log("Generate invoice for appointment:", appointment);
  // Add logic for generating invoice, if needed
};



  return (
    <div className='appoint_dash_main'>
      <Helmet>
        <title>Book Appointment</title>
      </Helmet>
      <Header />
      <div className='appoint_horizontal'>
        <div className='appoint_h1'>
          <div className='appoint_ver_nav'>
            <VertNav />
          </div>
        </div>
        <div className='appoint_h2'>
          <div className='appoint_left'>
            <form onSubmit={handleAddAppointment}>
              <h2 className='h_appoint'>Book Appointment</h2>
              <hr className='appoint_hr' />
              <div className='ba_con'>
                <h3 className='cd'>Customer Details</h3>
                <div className='app'>
                  <div className="appointform-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" className="appoint_input" placeholder='Enter Full Name' required onChange={e => setCustomerName(e.target.value)} />
                  </div>
                  <div className="appointform-groups">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" className="appoint_input-s" placeholder='Enter Email Address' onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="appointform-groups">
                    <label htmlFor="phone">Phone:</label>
                    <input type="number" id="phone" className="appoint_input-s" placeholder='Enter Mobile Number' required onChange={e => setMobileNo(e.target.value)} maxLength={10} />
                  </div>
                </div>
                <h3 className='sts'>Select Service</h3>
                <div className='appoint_select-field-cont'>
                  <Multiselect
                    options={serviceOptions}
                    showSearch={true}
                    onSelect={handleSelect}
                    onRemove={handleSelect}
                    displayValue="value"
                    placeholder="Select Service"
                    className="appoint_select-field"
                    showCheckbox={true}
                  />
                </div>
                <div className="appointform-group" style={{ marginTop: '10px' }}>
                  <label htmlFor="comments">Comment:</label>
                  <input id="comments" type='text' className="appoint_inputs" placeholder='Enter Comment' onChange={e => setComments(e.target.value)} />
                </div>
                <h3 className='sch'>Schedule</h3>
              </div>
              <div className='ap-p-parent'>
                <div className='ap-p'>
                  <div className="appointform-groups">
                    <label htmlFor="date" className="schedule_date-label">Date:</label>
                    <input type='date' id='date' className='schedule_date-input' onChange={e => setBookingDate(e.target.value)} />
                  </div>
                  <div className="schedule_time-selection">
                    <label htmlFor="hours" className="schedule_time-label">Time:</label>
                    <select id="hours" className="schedule_time-dropdown" onChange={handleTimeChange}>
                      <option value="" disabled selected>Hours</option>
                      {[...Array(12).keys()].map(hour => (
                        <option key={hour + 1} value={hour + 1}>{hour + 1}</option>
                      ))}
                    </select>
                    <select id="minutes" className="schedule_time-dropdown" onChange={handleTimeChange}>
                      <option value="" disabled selected>Minutes</option>
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                    <select id="am_pm" className="schedule_time-dropdown" onChange={handleTimeChange}>
                      <option value="" disabled selected>AM/PM</option>
                      {['AM', 'PM'].map(ampm => (
                        <option key={ampm} value={ampm}>{ampm}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="appoint-button-container">
                <button className="appoint_submit-button" disabled={bookAppointment}>
                  {bookAppointment ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
          <div className='appoint_right'>
            <h2 className='h_appoint'>Booked Appointment: ({currentDate})</h2>
            <hr className='appoint_hr' />
            <div className='appoint_table_wrapper'>
              <table className='appoint_table'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile No.</th>
                    <th>Time</th>
                    <th>Services</th>
                    <th>Status</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        <CircularProgress />
                      </td>
                    </tr>
                  ) : presetAppointments.map(row => (
                    <tr key={row.id}>
                      <td>{row.customer_name}</td>
                      <td>{row.mobile_no}</td>
                      <td>{row.booking_time}</td>
                      <td>
                        {row.services.split(',').length > 1 ? (
                          <select className='status-dropdown'>
                            {row.services.split(',').map((service, index) => (
                              <option key={index} value={service}>{service}</option>
                            ))}
                          </select>
                        ) : row.services.split(',')[0]}
                      </td>
                      <td>
                        <select className="status-dropdown">
                          <option value="pending" selected>Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <Tooltip title="Delete Appointment" arrow>
                          <DeleteIcon onClick={() => handleDeleteClick(row.id)} style={{ cursor: "pointer" }} />
                        </Tooltip>
                      </td>
                      <td>
                        <Tooltip title="Generate Invoice">
                          <ArrowCircleRightIcon onClick={() => handleArrowClick(row)} style={{ cursor: "pointer" }} />
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showPopup && <Popup message={popupMessage} onClose={() => { setShowPopup(false); navigate(`/${sname}/${branchName}/dashboard`); }} />}
      {showDeletePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this appointment?</p>
            <div className="popup-buttons">
              <button onClick={handleDeleteConfirm}>Yes</button>
              <button onClick={() => setShowDeletePopup(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      <CustomDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={dialogTitle} message={dialogMessage} />
    </div>
  );
}

export default Appointment;
