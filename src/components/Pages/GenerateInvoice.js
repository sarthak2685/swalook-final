import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/GenerateInvoice.css'
import Multiselect from 'multiselect-react-dropdown';
import Header from './Header'
import VertNav from './VertNav'
import { Helmet } from 'react-helmet';
import config from '../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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

function GenerateInvoice() {
  const navigate = useNavigate();
  const [serviceOptions, setServiceOptions] = useState([]);
  const [customer_name, setCustomer_Name] = useState('');
  const [email, setEmail] = useState('');
  const [mobile_no, setMobileNo] = useState(0);
  const [address, setAddress] = useState('');
  const [GBselectedServices, GBsetSelectedServices] = useState([]);
  const [value, selectedValues] = useState([]);
  const [service_by, setServiceBy] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [PaymentMode, setPaymentMode] = useState();
  const [isGST, setIsGST] = useState(false);
  const [gst_number, setGSTNumber] = useState('');
  const [comments, setComments] = useState('');
  const [servicesTableData, setServicesTableData] = useState([]);
  const [inputFieldValue, setInputFieldValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasFetchedServices, setHasFetchedServices] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
  const [dialogTitle, setDialogTitle] = useState(''); // State for dialog title
  const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message

  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');
  console.log(sname);
  const [InvoiceId, setInvoiceId] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [pq, setPQ] = useState('');
  const [product_value, setProductValue] = useState([]);
  const [productData, setProductData] = useState([]);

  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  //  const [email, setEmail] = useState('');
  const [loyaltyProgram, setLoyaltyProgram] = useState('');
  const [points, setPoints] = useState(0);
  const [expiryDays, setExpiryDays] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [staffData, setStaffData] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  const bid = localStorage.getItem('branch_id');


  const fetchData = async () => {
    try {
      const branchName = localStorage.getItem('branch_name');
      const token = localStorage.getItem('token');
  
      if (!branchName || !token) {
        throw new Error('Branch name or token is missing.');
      }
  
      const response = await fetch(`${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
  
      const data = await response.json();
      setInventoryData(data.data.map((product) => ({
        key: product.id,
        value: product.product_name,
        unit: product.unit,
        quantity: product.stocks_in_hand
      })));
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };


  const fetchStaffData = async () => {
    const token = localStorage.getItem('token');
    try {
      const staffResponse = await fetch(`${config.apiUrl}/api/swalook/staff/?branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // console.log('kya hau', )
      if (!staffResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const staffData = await staffResponse.json();
      const staffArray = Array.isArray(staffData.table_data) ? staffData.table_data : [];

      // Check if any staff name has a space and format accordingly
      const formattedOptions = staffArray.map(staff => {
        const hasSpaceInName = typeof staff.staff_name === 'string' && /\s/.test(staff.staff_name);
        return {
          label: hasSpaceInName
            ? `${staff.staff_name} (${staff.staff_role})` // Format for names with spaces
            : `${staff.staff_name} (${staff.staff_role})`       // Format for names without spaces
        };
      });

      console.log(staffData);
      console.log(staffArray);
      console.log("Formatted Options:", formattedOptions);

      setStaffData(formattedOptions);


    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaffData([]);
    }
  };



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
  
  const handleServiceClick = () => {
    console.log('Fetching data')
    if (!hasFetchedServices) {
      fetchServiceData();
      console.log('Fetching data')
    }
  };
  


  const handleProductSelect = (selectedList) => {
    setProductValue(selectedList);
    //console.log(selectedList, "selectedList");

    // Initialize productData with the selected products
    setProductData(selectedList.map(product => ({
      id: product.key,
      quantity: '',
      unit: product.unit
    })));
  };

  //console.log(productData , "productData");

  const handleProductInputChange = (index, value) => {
    const updatedProductData = [...productData];
    updatedProductData[index].quantity = value;
    setProductData(updatedProductData);
  };


  //console.log(productData);



  const handleServiceSelect = (selectedList) => {
    GBsetSelectedServices(selectedList);
    selectedValues(selectedList);
    updateServicesTableData(selectedList, inputFieldValue);
  };

  const handleGST = (e, index) => {
    const updatedValues = [...value];
    updatedValues[index].gst = e.target.value; 
    selectedValues(updatedValues);
    updateServicesTableData(updatedValues, inputFieldValue);

    if (e.target.value === 'No GST') {
      setIsGST(false);
    } else {
      setIsGST(true);
    }
  };

  const handleInputChange = (e) => {
    setInputFieldValue(e.target.value);
    updateServicesTableData(value, e.target.value);
  };

  const updateServicesTableData = (updatedValues, inputValue) => {
    const newTableData = updatedValues.map(service => ({
      ...service,
      finalPrice: service.gst === 'Inclusive' ? (service.price / 1.18).toFixed(2) : service.gst === 'Exclusive' ? service.price : service.price,
      gst: service.gst || '',
      inputFieldValue: inputValue // Add the new input field value here
    }));
    setServicesTableData(newTableData);
  };



  console.log('Selected salon:', sname);
  console.log(staffData)



  const handleServedSelect = (selectedList) => {
    setServiceBy(selectedList);
  }

  const handleGSTChange = (event) => {
    setIsGST(true);
  }

  const [deductedPoints, setDeductedPoints] = useState('');

  useEffect(() => {
    axios.get(`${config.apiUrl}/api/swalook/get_specific_slno/`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        //console.log(response.data);
        setInvoiceId(response.data.slno);
      })
      .catch(error => {
        console.error('Error fetching invoice id:', error);
      });
  }
    , []);


  //console.log(servicesTableData, "servicesTableData");

  const handleGenerateInvoice = async () => {
    // Validate services and service_by selections
    if (GBselectedServices.length === 0) {
      setDialogTitle('Error');
      setDialogMessage('Please select services!');
      setDialogOpen(true);
      return;
    }

    if (service_by.length === 0) {
      setDialogTitle('Error');
      setDialogMessage('Please select service by!');
      setDialogOpen(true);
      return;
    }

    // Validate mobile number
    const mobileNoPattern = /^[0-9]{10}$/;
    if (!mobileNoPattern.test(mobile_no)) {
      setDialogTitle('Error');
      setDialogMessage('Please enter a valid mobile number!');
      setDialogOpen(true);
      return;
    }

    // Validate services table data
    for (let i = 0; i < servicesTableData.length; i++) {
      if (servicesTableData[i].inputFieldValue === '') {
        setDialogTitle('Error');
        setDialogMessage('Please enter quantity for selected services!');
        setDialogOpen(true);
        return;
      }
      if (servicesTableData[i].gst === '') {
        setDialogTitle('Error');
        setDialogMessage('Please select GST for all services!');
        setDialogOpen(true);
        return;
      }
    }

    // Validate product data
    for (let i = 0; i < productData.length; i++) {
      if (productData[i].quantity === '') {
        setDialogTitle('Error');
        setDialogMessage('Please enter quantity for selected products!');
        setDialogOpen(true);
        return;
      }
    }

    // If user does not exist, call handleSubmit to add the user
    let submitResult = null;
    if (!userExists) {
      try {
        submitResult = handleSubmit(); // Add user only if user doesn't exist
      } catch (error) {
        console.error('Error during user submission:', error);
        setDialogTitle('Error');
        setDialogMessage('An error occurred while adding user details. Please try again.');
        setDialogOpen(true);
        return;
      }
    }

    // Proceed to navigate regardless of handleSubmit result (or if user exists)
    try {
      await Promise.all([
        submitResult,  // Only call submitResult if user doesn't exist
        navigate(`/${sname}/${branchName}/${InvoiceId}/invoice`, {
          state: {
            customer_name,
            email,
            mobile_no,
            address,
            GBselectedServices: servicesTableData,
            service_by,
            discount,
            isGST,
            gst_number,
            comments,
            InvoiceId,
            productData,
            deductedPoints,
            selectMembership,
            PaymentMode
          }
        })
      ]);
    } catch (error) {
      console.error('Error navigating:', error);
      setDialogTitle('Error');
      setDialogMessage('An error occurred while navigating. Please try again.');
      setDialogOpen(true);
    }
  };
  


  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}`,
        {
          name: customer_name,
          mobile_no: mobile_no,
          email: email,
          membership: selectMembership
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );

      const result = response.data;
      console.log('API Response:', result);

      if (response.status >= 200 && response.status < 300 && result.success) {
        setPopupMessage('Customer added successfully!');
        setShowPopup(true);
      } else {
        setPopupMessage('Failed to add customer.');
        setShowPopup(true);
        return false;  // Indicate failure
      }
    } catch (error) {
      setPopupMessage('An error occurred.');
      setShowPopup(true);
      console.error('Error:', error.response ? error.response.data : error.message);
      return false;  // Indicate error
    } finally {
      setLoading(false);
    }
  };


  const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.get(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, {
  //         headers: {
  //           'Authorization': `Token ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       });
  //       setGet_persent_day_bill(response.data.table_data);
  //       // //console.log(response.data.current_user_data);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);


  const handleShowInvoice = (id) => {
    navigate(`/${sname}/${branchName}/viewinvoice/${id}`);
  };

  const handleDeleteInvoice = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${config.apiUrl}/api/swalook/delete/invoice/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      //console.log(res.data);
      window.location.reload();
    } catch (err) {
      //console.log(err);
    }
  };

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);


  const [userExists, setUserExists] = useState(null);
  const [membershipOptions, setMembershipOptions] = useState(false);
  const [selectMembership, setSelectMembership] = useState('None');

  const handleDeleteClick = (id) => {
    setDeleteInvoiceId(id);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`${config.apiUrl}/api/swalook/delete/invoice/?id=${deleteInvoiceId}&branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      //console.log(res.data);
      window.location.reload();
    } catch (err) {
      //console.log(err);
    } finally {
      setShowDeletePopup(false);
    }
  };

  const [membershipStatus, setMembershipStatus] = useState(false);
  const [membershipType, setMembershipType] = useState('');
  const [userPoints, setUserPoints] = useState('');



  const handlePhoneBlur = async () => {
    if (mobile_no && (mobile_no.length === 10 || mobile_no.length === 12)) {
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
          const userDetailsResponse = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${branchName}&mobile_no=${mobile_no}`, {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          });

          if (userDetailsResponse.data) {
            const userData = userDetailsResponse.data.data;
            setUserExists(true);
            setMembershipStatus(true);
            setCustomer_Name(userData.name);
            setEmail(userData.email);
            setMembershipType(userData.membership);
            setUserPoints(userData.loyality_profile.current_customer_points);
          }
        } else {
          // User does not exist, clear membership details and fetch membership options
          setUserExists(false);
          setMembershipStatus(false);
          // setMembershipType('None');
          await fetchMembershipOptions();
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }
  };
  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCustomerData(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [mobile_no]); // Dependency on mobile_no to refetch data when it changes

  const handleViewDetailsClick = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${config.apiUrl}/api/swalook/get-customer-bill-app-data/?mobile_no=${mobile_no}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
      );

      // Store the retrieved data
      setCustomerData(response.data);
      console.log("user data:", response.data);

      // Show the popup
      setIsPopupVisible(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };



  const handleMembershipChange = async (selectMembership) => {
    console.log('swalook Membership:', selectMembership);
    setSelectMembership(selectMembership);

  };





  const fetchMembershipOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const membershipResponse = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      // Check if the response contains data and status is true
      if (membershipResponse.data.status && Array.isArray(membershipResponse.data.data)) {
        setMembershipOptions(membershipResponse.data.data);
      } else {
        console.error('Unexpected response format or no data:', membershipResponse.data);
        setMembershipOptions([]); // Ensure to clear options if the format is not as expected
      }
    } catch (error) {
      console.error('Error fetching membership options:', error);
    }
  };


  useEffect(() => {
    if (mobile_no.length === 10) {
      fetchMembershipOptions();
    }
  }, [mobile_no]);






  return (
    <>
      <Header />
      <div className='gb_h1'>
        <div className='gb_ver_nav'>
          <VertNav />
        </div>
      </div>
      <div className='gb_dash_main'>
        <Helmet>
          <title>Generate Invoice</title>
        </Helmet>
        <div className='gb_horizontal'>
          <div className='gb_h2'>
            {/* User Info Section */}
            {/* <div className='user-info'>
            <div className='user-stats'>
              <div className='stat-item'>
                <span>Business</span>
                <h2>Rs. 15,000 <small>+0.00%</small></h2>
                
              </div>
              <div className='stat-item'>
                <span>Number of Appointments</span>
                <h2>15 <small>+0.00%</small></h2>
                
              </div>
              <div className='stat-item'>
                <span>Number of Invoices</span>
                <h2>12  <small>+0.00%</small></h2>
               
              </div>
              <div className='stat-item'>
              <button className='edit-button'>View Details</button>
              </div>
            </div>
          </div> */}
            {userExists ? (

              <div className='user-info'>
                {customerData && (
                  <div className='user-stats'>
                    <div className='stat-item'>
                      <span>Business</span>
                      <h2>Rs {customerData.total_billing_amount} <small>+0.00%</small></h2>
                    </div>
                    <div className='stat-item'>
                      <span>Number of Appointments</span>
                      <h2>{customerData.total_appointment} <small>+0.00%</small></h2>
                    </div>
                    <div className='stat-item'>
                      <span>Number of Invoices</span>
                      <h2>{customerData.total_invoices}  <small>+0.00%</small></h2>
                    </div>
                    <div className='stat-item'>
                      <button
                        variant="outlined"
                        onClick={handleViewDetailsClick}
                        className='edit-button'>
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {isPopupVisible && (
              <div className="popups">
                <div className="popups-content">
                  <buttons id="close-btns" onClick={handleClosePopup}>X</buttons>
                  <h2>Customer Bill Data</h2>
                  {customerData ? (
                    <div className="table-container">
                      <table className="responsive-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Mobile No</th>
                            <th>Billing Amount</th>
                            <th>Served By</th>
                            <th>Services</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerData.previous_invoices && customerData.previous_invoices.length > 0 ? (
                            customerData.previous_invoices.map((item, index) => (
                              <tr key={index}>
                                <td>{customerData.customer_name}</td>
                                <td>{customerData.customer_mobile_no}</td>
                                <td>{item.grand_total}</td>
                                <td>{item.service_by}</td>
                                <td>
                                  {JSON.parse(item.services).map((service, idx) => (
                                    <div key={idx}>
                                      {service.Description}
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))
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




            {/* Invoice Form Section */}
            <div className='invoice-section'>
              <h2 className='section-titles'>Invoice</h2>
              <div className='form-container'>
                {/* Customer Details */}
                <div className='form-section'>
                  <h3 id='form-titles'>Customer Details</h3>
                  <div className='form-row'>
                    <div className='form-groups'>
                      <input type="number" id="phone" placeholder='Phone Number' required onBlur={handlePhoneBlur} onChange={(e) => setMobileNo(e.target.value)} />
                    </div>
                    <div className='form-groups'>
                      <input type="text" id="name" placeholder='Full Name' value={customer_name} readOnly={userExists} required onChange={(e) => setCustomer_Name(e.target.value)

                      } />
                    </div>

                    <div className='form-groups'>
                      <input type="email" id="email" placeholder='Email Address' value={email} readOnly={userExists} required onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>

                {userExists && membershipType !== 'None' ? (
                  <div className="gb_services-table">
                    <table className="gb_services-table-content" id="memebership_points">
                      <thead>
                        <tr>
                          <th>Membership Type</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{membershipType}</td>
                          <td>{userPoints}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : mobile_no.length === 10 || mobile_no.length === 12 ? (
                  <div className="gb_membership-container">
                    <label className="gb_membership-label" htmlFor="membership">
                      Select Membership Plan
                    </label>
                    <select
                      id="membership"
                      value={selectMembership || 'None'}
                      onChange={(e) => handleMembershipChange(e.target.value)}
                      className="gb_membership-select"
                    >
                      <option value="None" disabled={selectMembership === 'None'}>
                        Select a plan
                      </option>
                      {membershipOptions.length > 0 ? (
                        membershipOptions.map((option) => (
                          <option key={option.program_type} value={option.program_type}>
                            {option.program_type}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No membership options available
                        </option>
                      )}
                    </select>
                  </div>
                ) : null}

                {/* Service/Product Selection */}
                <div className='form-section'>
                  <div className='form-row'>
                    <div className='forms-groups'  onClick={handleServiceClick}>
                      <label>Select Services:</label>
                      <Multiselect
                        options={serviceOptions}
                        showSearch={true}
                        onSelect={handleServiceSelect}
                        onRemove={handleServiceSelect}
                        displayValue="value"
                        placeholder="Select Service"
                        showCheckbox={true}
                        selectedValues={value}
                      />
                    </div>
                    <div className='forms-groups' onClick={fetchData}>
                      <label>Select Products:</label>
                      <Multiselect
                        options={inventoryData}
                        showSearch={true}
                        onSelect={handleProductSelect}
                        onRemove={handleProductSelect}
                        displayValue="value"
                        placeholder="Select Product"
                        showCheckbox={true}
                        selectedValues={product_value}
                        className='sar-product'
                      />
                    </div>
                  </div>
                </div>

                {value.length > 0 && (
                  <div className='gb_services-table'>
                    <table className='gb_services-table-content'>
                      <thead>
                        <tr>
                          <th>Service Name</th>
                          <th>Quantity</th>
                          <th>GST</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((service, index) => (
                          <tr key={index}>
                            <td>{service.value}</td>
                            <td>
                              <input
                                type='number'
                                className="gb_service-table-field"
                                placeholder='Enter Quantity'
                                required
                                onChange={handleInputChange}
                              />
                            </td>
                            <td className='gb_service_dp'>
                              <select
                                className='gb_status-dropdowns'
                                required
                                onChange={(e) => handleGST(e, index)}
                              >
                                <option value="">Select GST</option>
                                <option value='No GST'>No GST</option>
                                <option value='Inclusive'>Inclusive</option>
                                <option value='Exclusive'>Exclusive</option>
                              </select>
                            </td>
                            <td>
                              {service.gst === 'Inclusive' ? (
                                <>{(service.price / 1.18).toFixed(2)}</>
                              ) : service.gst === 'Exclusive' ? (
                                <>{service.price}</>
                              ) : (
                                <>{service.price}</>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {product_value.length > 0 && (
                  <div className='gb_services-table'>
                    <table className='gb_services-table-content'>
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product_value.map((product, index) => (
                          <tr key={index}>
                            <td>{product.value}</td>
                            <td>
                              <input
                                type='number'
                                className="gb_service-table-field"
                                placeholder='Enter Quantity in ml/gm'
                                required
                                onChange={(e) => handleProductInputChange(index, e.target.value)}
                                style={{ borderColor: product.quantity === 0 ? 'red' : 'black' }}
                              />
                            </td>
                            <td>{product.unit}</td>
                            <td>{product.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}



                {/* Served By, Schedule, Discounts, Comments */}
                <div className='form-section'>
                  <div className='form-row'>
                    <div className='forms-groups' onClick={fetchStaffData}>
                      <label>Served By:</label>
                      <Multiselect
                        options={staffData}
                        showSearch={true}
                        onSelect={handleServedSelect}
                        onRemove={handleServedSelect}
                        displayValue="label"
                        placeholder="Select Served By"
                      />
                    </div>
                  </div>

                  {/* Points Input Field */}
                  {membershipStatus && (
                    <div className="gbform-group">
                      <label htmlFor="points">Points:</label>
                      <input
                        type="number"
                        id="points"
                        className="gb_input-field"
                        placeholder='Enter Points'
                        onChange={(e) => setDeductedPoints(e.target.value)}
                      />
                    </div>
                  )}
                  <div className='form-row'>
                    <div className='form-groups'>
                      <label>Mode of Payment</label>
                      <select onChange={(e) => setPaymentMode(e.target.value)}>
                        <option value="">Select Payment Mode</option>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="net_banking">Net Banking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className='form-groups'>
                    <label>Discount</label>
                    <input type="number" placeholder='Enter Discount' onChange={(e) => setDiscount(e.target.value)} />
                  </div>
                    <div className='form-groups'>
                      <label>Comments</label>
                      <input type="text" placeholder='Enter Comments' onChange={(e) => setComments(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              {isGST && (
                <div className="gbform-group">
                  <label htmlFor="gstNumber" style={{ marginRight: '25px' }}>GST No:</label>
                  <input
                    type="text"
                    id="gstNumber"
                    className="gb_input-field"
                    placeholder='Enter GST Number'
                    required
                    onChange={(e) => setGSTNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Generate Invoice Button */}
              <div className='button-row'>
                <button className='generate-button-invoice' onClick={handleGenerateInvoice}>Create Invoice</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );


}



export default GenerateInvoice



{/* <div className='gb_right'>
<h2 className='gb_appoint'>Billing:</h2>
<hr className='gb_hr' />
<div className='gb_table_wrapper'>
  <table className='gb_table'>
    <thead>
      <tr>
        <th>Name</th>
        <th>Mobile No.</th>
        <th>Amount</th>
        <th>Services</th>
        <th>View</th>
        <th></th>
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
        // Ensure get_persent_day_bill is an array and has data
        (mobile_no === '' ? get_persent_day_bill : get_persent_day_bill.filter(item => item.mobile_no === mobile_no)).map((item, index) => (
          <tr key={index}>
            <td>{item.customer_name}</td>
            <td>{item.mobile_no}</td>
            <td>{item.grand_total}</td>
            <td>
              {(() => {
                try {
                  const servicesArray = JSON.parse(item.services);
                  if (servicesArray.length > 1) {
                    return (
                      <select className='status-dropdown'>
                        {servicesArray.map((service, index) => (
                          <option key={index} value={service.Description}>{service.Description}</option>
                        ))}
                      </select>
                    );
                  } else if (servicesArray.length === 1) {
                    return <span>{servicesArray[0].Description}</span>;
                  } else {
                    return null;
                  }
                } catch (error) {
                  console.error('JSON parsing error:', error);
                  return null;
                }
              })()}
            </td>
            <td>
              <Tooltip title="View Invoice">
                <PictureAsPdfIcon style={{ cursor: "pointer" }} onClick={() => handleShowInvoice(item.id)} />
              </Tooltip>
            </td>
            <td>
              <Tooltip title="Delete Invoice">
                <DeleteIcon style={{ cursor: "pointer" }} onClick={() => handleDeleteClick(item.id)} />
              </Tooltip>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
</div> */}


// {showDeletePopup && (
//   <div className="popup">
//     <div className="popup-content">
//       <h3>Confirm Delete</h3>
//       <p>Are you sure you want to delete this invoice?</p>
//       <div className="popup-buttons">
//         <button onClick={handleDeleteConfirm}>Yes</button>
//         <button onClick={() => setShowDeletePopup(false)}>No</button>
//       </div>
//     </div>
//   </div>
// )}

// <CustomDialog
//   open={dialogOpen}
//   onClose={() => setDialogOpen(false)}
//   title={dialogTitle}
//   message={dialogMessage}
// />