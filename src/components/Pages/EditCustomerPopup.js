import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/EditCustomerPopup.css';
import Popup from './Popup';
import CircularProgress from '@mui/material/CircularProgress';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'; // Import the icon
import config from '../../config';

function EditCustomerPopup({ customer, onClose }) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loyaltyProgram, setLoyaltyProgram] = useState('');
  const [points, setPoints] = useState(0);
  const [expiryDays, setExpiryDays] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const branchName = localStorage.getItem('branch_name');
  const sname = localStorage.getItem('s-name');
  const [programTypes, setProgramTypes] = useState([]);

  useEffect(() => {
    // Fetch customer data
    if (customer) {
      setCustomerName(customer.name);
      setCustomerNumber(customer.mobile_no);
      setEmail(customer.email || ''); // Handle optional email
      setLoyaltyProgram(customer.membership || '');
      setPoints(customer.loyality_profile.current_customer_points || 0);
      setExpiryDays(customer.expiry_days || '');
    }
  }, [customer]);

  const bid = localStorage.getItem('branch_id');

  useEffect(() => {
    const fetchProgramTypes = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        setProgramTypes(response.data.data.map(program => ({
          id: program.id,
          type: program.program_type
        })));
      } catch (error) {
        console.error('An error occurred while fetching program types:', error);
      }
    };

    fetchProgramTypes();
  }, [branchName]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${bid}&id=${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          name: customerName,
          mobile_no: customerNumber,
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPopupMessage('Customer updated successfully!');
        setShowPopup(true);
        onClose();  
        window.location.reload();
      } else {
        setPopupMessage('Failed to update customer.');
        setShowPopup(true);
      }
    } catch (error) {
      setPopupMessage('An error occurred.');
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ec_popup_overlay">
      <div className="ec_popup_container">
        <div className="ec_popup_header">
          <div className='ec_popup_title'>
            <h3>Edit Customer</h3>
          </div>
          <button className="ec_close_button" onClick={onClose}>
            <HighlightOffOutlinedIcon /> {/* Replace the "X" with the icon */}
          </button>
        </div>
        <hr className="ec_divider"/>
        <form onSubmit={handleSubmit}>
          <div className="ec_field">
            <label htmlFor="customer_name">Name:</label>
            <input 
              type="text" 
              id="customer_name" 
              name="customer_name" 
              placeholder='Customer Name' 
              required 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="ec_field">
            <label htmlFor="customer_number">Number:</label>
            <input 
              type="text" 
              id="customer_number" 
              name="customer_number" 
              placeholder="Customer Number" 
              required 
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
            />
          </div>
          <div className="ec_field">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="ec_button_container">
            <button className="ec_save_button">
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      {showPopup && <Popup message={popupMessage} onClose={() => { setShowPopup(false); navigate(`/${sname}/${branchName}/clp`); }} />}
    </div>
  );
}

export default EditCustomerPopup;
