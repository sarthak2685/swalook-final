import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import '../Styles/Appointment.css'; // Adjust styling here
import Header from './Header';
import VertNav from './VertNav';
import AdminPanelSettingsIcon from '@mui/icons-material/PeopleOutlined';
import Popup from './Popup';
import { Helmet } from 'react-helmet';
import config from '../../config';
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
  const [bookingTime, setBookingTime] = useState(''); // Time format: HH:MM AM/PM
  const [selectedHour, setSelectedHour] = useState(''); // New state for selected hour
  const [selectedMinute, setSelectedMinute] = useState('00'); // New state for selected minute
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
  const [staffData, setStaffData] = useState([]);
  const [service_by, setServiceBy] = useState([]);
  const [userExists, setUserExists] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const[api, setAPI] = useState(null);
  const [hasFetchedServices, setHasFetchedServices] = useState(false);


  const currentDate = getCurrentDate();
  const bid = localStorage.getItem('branch_id');
  const navigate = useNavigate();
  const fetchServiceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log("data",response.data)
  
      setServiceOptions(data.data.map((service) => ({
        key: service.id,
        value: service.service,
        price: service.service_price,
        gst: ''
      })));
  
      // Set flag to true to prevent future calls
      setHasFetchedServices(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleSelect = selectedList => setServices(selectedList);


  const handleServiceClick = () => {
    console.log('Fetching data')
    if (!hasFetchedServices) {
      fetchServiceData();
      console.log('Fetching data')
    }
  };
  

  const handleTimeChange = event => {
    const { id, value } = event.target;

    switch (id) {
      case 'hours':
        setSelectedHour(value); // Update selectedHour state
        setBookingTime(`${value || ''}:${selectedMinute} ${selectedAMPM}`);
        break;
      case 'minutes':
        setSelectedMinute(value); // Update selectedMinute state
        setBookingTime(`${selectedHour}:${value || '00'} ${selectedAMPM}`);
        break;
      case 'am_pm':
        setSelectedAMPM(value || '');
        setBookingTime(`${selectedHour}:${selectedMinute} ${value || ''}`);
        break;
      default:
        break;
    }
  };
  const [apiCalled, setApiCalled] = useState(false); 

  const fetchStaffData = async () => {
    const token = localStorage.getItem('token');
    try {
      const staffResponse = await fetch(`${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!staffResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const staffData = await staffResponse.json();
      const staffArray = Array.isArray(staffData.table_data) ? staffData.table_data : [];

      // Format the options
      const formattedOptions = staffArray.map(staff => {
        const hasSpaceInName = typeof staff.staff_name === 'string' && /\s/.test(staff.staff_name);
        return {
          labels: `${staff.staff_name} (${staff.staff_role})`
        };
      });

      setStaffData(formattedOptions);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaffData([]);
    }
  };

  const handleDropdownClick = () => {
    if (!apiCalled) {
      fetchStaffData();
      setApiCalled(true); // Mark API as called
    }
  };

  const handleServedSelect = (selectedList) => {
    setServiceBy(selectedList);
  }


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

  const handlePhoneBlur = async () => {
    try {
      const branchName = localStorage.getItem('branch_id');

      const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchName}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("kya ua response", response);

      if (response.data.status) {
        // User exists, populate membership details


        // Fetch additional user details
        const userDetailsResponse = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${branchName}&mobile_no=${mobileNo}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (userDetailsResponse.data) {
          const userData = userDetailsResponse.data.data;
          setUserExists(true);
          setCustomerName(userData.name);
          setEmail(userData.email);
        }
      } else {
        // User does not exist, clear membership details and fetch membership options
        setUserExists(false);
        // setMembershipType('None');
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
    }

    try {
      const branchName = localStorage.getItem('branch_id');

      const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchName}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("kya ua response", response);

      if (response.data.status) {
        // User exists, populate membership details


        // Fetch additional user details
        const userDetailsResponse = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${branchName}&mobile_no=${mobileNo}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const userDataArray = userDetailsResponse.data.data;
        console.log("User Data Array:", userDataArray);

        if (Array.isArray(userDataArray) && userDataArray.length > 0) {
          const userData = userDataArray[0]; // Access the first object in the array
          console.log("Setting Name:", userData.name);
          console.log("Setting Email:", userData.email);

          setUserExists(true);
          setCustomerName(userData.name || ""); // Safely assign name
          setEmail(userData.email || "");       // Safely assign email
          setCustomerData(userData);           // Populate other fields
        }

        // if (userDetailsResponse.data) {
        //   const userData = userDetailsResponse.data.data;
        //   setUserExists(true);
        //   (userData.name);
        //   setEmail(userData.email);
        // }
      } else {
        // User does not exist, clear membership details and fetch membership options
        setUserExists(false);
        // setMembershipType('None');
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
    }

  };



  // useEffect(() => {
  //   const fetchPresetAppointments = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get(`${config.apiUrl}/api/swalook/preset-day-appointment/?branch_name=${bid}`, {
  //         headers: {
  //           'Authorization': `Token ${token}`,
  //           'Content-Type': 'application/json',
  //         }
  //       });
  //       setPresetAppointments(response.data.table_data);
  //     } catch (error) {
  //       console.error('Error fetching preset appointments:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPresetAppointments();
  // }, [bid]);

  const handleDeleteClick = id => {
    setDeleteInvoiceId(id);
    setShowDeletePopup(true);
  };


  // const fetchCustomerData = async () => {
  //   try {
  //     const token = localStorage.getItem('token');

  //     const response = await axios.get(`${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobileNo}`, {
  //       headers: {
  //         'Authorization': `Token ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     setCustomerId(response.data);
  //     console.log("hey",response.data)
  //   } catch (error) {
  //     console.error('Error fetching customer data:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchCustomerData();
  // }, [mobileNo]);

  const [customerId, setCustomerId] = useState('');

  const fetchCustomerData = async () => {
    try {
      if (mobileNo.length === 10) {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobileNo}`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setCustomerId(response.data);
        console.log('Fetched data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };


  // Debounced effect
  useEffect(() => {
    if (mobileNo.length === 10) {
      // Ensure a valid 10-digit number
      const timeoutId = setTimeout(() => {
        fetchCustomerData();
      }, 500); // Debounce time

      return () => clearTimeout(timeoutId); // Cleanup timeout on input change
    }
  }, [mobileNo]);


  const handleViewDetailsClick = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobileNo}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
      );

      setCustomerData(response.data);
      console.log("user data:", response.data);

      setIsPopupVisible(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleClosePopup = () => {
    setIsPopupVisible(false);
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


  return (
    <>
     <Header />
     <VertNav />
      <div className="filters-wrapper">
       
        <div className="appointment-dashboard">
          {userExists && (
            <header className="headers-container">
              {customerId && (
                <div className="overview-stats">
                  <div className="stat-card">
                    <p>Business</p>
                    <h3>
                      Rs. {customerId.total_billing_amount} 
                    </h3>
                  </div>
                  <div className="stat-card">
                    <p>Number of Appointments</p>
                    <h3>
                      {customerId.total_appointment} 
                    </h3>
                  </div>
                  <div className="stat-card">
                    <p>Number of Invoices</p>
                    <h3>
                      {customerId.total_invoices} 
                    </h3>
                  </div>
                  <div className="user-info-appn">
                    <button
                      className="edit-details-btn"
                      onClick={handleViewDetailsClick}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </header>
          )}

          {isPopupVisible && (
            <div className="popups">
              <div className="popups-content">
                <buttons id="close-invoice-btns" onClick={handleClosePopup}>
                  X
                </buttons>
                <h2>Customer Appointment Data</h2>
                {customerData ? (
                  <div className="table-container">
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Mobile No</th>
                          <th>Time</th>
                          <th>Date</th>
                          <th>Services</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerData.previous_appointments &&
                          customerData.previous_appointments.length > 0 ? (
                          customerData.previous_appointments.map(
                            (item, index) => (
                              <tr key={index}>
                                <td>{customerData.customer_name}</td>
                                <td>{customerData.customer_mobile_no}</td>
                                <td>{item.time}</td>
                                <td>{item.Date}</td>
                                <td>
                                  {JSON.parse(item.services).map(
                                    (service, idx) => (
                                      <div key={idx}>
                                        {service.Description}
                                      </div>
                                    )
                                  )}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td colSpan="5">No invoices available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Loading data...</p>
                )}
              </div>
            </div>
          )}

          <div className="new-appointment-wrapper">
            <h2 className="appnt-heading font-bold">Appointment</h2>
            <form
              onSubmit={handleAddAppointment}
              className="new-appointment-form"
            >
              <div className="forms-sections">
                <labels>Customer Details:</labels>
                <div className="customer-details">
                  <div className="form-groups">
                    <input
                      type="text"
                      placeholder="Phone Number*"
                      required
                      onBlur={handlePhoneBlur}
                      onChange={(e) => setMobileNo(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <div className="form-groups">
                    <input
                      type="text"
                      placeholder="Name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="form-groups">
                    <input
                      type="email"
                      placeholder="Email ID"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="forms-groups-appn " onClick={handleServiceClick}>
                <labels>Select Services</labels>
                <Multiselect
                  options={serviceOptions}
                  showSearch={true}
                  onSelect={handleSelect}
                  onRemove={handleSelect}
                  displayValue="value"
                  placeholder="Select Service"
                  className="custom-multiselect "
                />
              </div>

              <div className="forms-groups-appn ">
                <labels>To be Served by:</labels>
                <select
                  onClick={handleDropdownClick} // Trigger API call on click
                  onChange={(e) => setServiceBy([{ labels: e.target.value }])}
                  className="custom-select "
                >
                  <option value="" disabled selected>
                    Select Served By
                  </option>
                  {staffData.map((staff, index) => (
                    <option key={index} value={staff.labels}>
                      {staff.labels}
                    </option>
                  ))}
                </select>
              </div>

              <div className="forms-groups-appn">
                <labels>Schedule:</labels>
                <div className="schedule-section">
                  <div className="appointform-groups">
                    <input
                      type="date"
                      id="date"
                      className="schedule_date-input"
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                    <select
                      id="hours"
                      className="schedule_time-dropdown"
                      onChange={handleTimeChange}
                      value={selectedHour}
                    >
                      <option value="" disabled>
                        Select Hour
                      </option>
                      {[...Array(12).keys()].map((hour) => (
                        <option key={hour + 1} value={hour + 1}>
                          {hour + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      id="minutes"
                      className="schedule_time-dropdown"
                      onChange={handleTimeChange}
                      value={selectedMinute}
                    >
                      <option value="" disabled>
                        Select Minutes
                      </option>
                      {["00", "15", "30", "45"].map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <select
                      id="am_pm"
                      className="schedule_time-dropdown"
                      onChange={handleTimeChange}
                      value={selectedAMPM}
                    >
                      <option value="" disabled>
                        Select AM/PM
                      </option>
                      {["AM", "PM"].map((ampm) => (
                        <option key={ampm} value={ampm}>
                          {ampm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="forms-groups-appn">
                <labels>Comments:</labels>
                <input
                  id="inputss"
                  type="text"
                  placeholder="Comments"
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <div className="appoint-button-containers">
              <button
                  type="submit"
                  className="submits-buttons flex items-center justify-center px-6 py-2 text-white 
              bg-blue-500 rounded-md hover:bg-blue-600 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                  disabled={bookAppointment}
                >
                  {bookAppointment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Create Appointment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Appointment;
