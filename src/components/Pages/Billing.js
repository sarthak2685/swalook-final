import React, { useState, useEffect } from 'react';  // Import useEffect
import { Tooltip, CircularProgress, Button } from '@mui/material';
import axios from 'axios'; // Import axios to make API calls
import GenerateInvoice from './GenerateInvoice';  // Import the child component
import '../Styles/Billing.css'; // Styles for the component
import config from '../../config';

const BillingTable = () => {
    const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null); // For displaying item details
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [mobile_no, setMobileNo] = useState(''); 
  
    // Fetch billing data when component mounts
    useEffect(() => {
      const bid = localStorage.getItem('branch_id'); // Get branch id from local storage
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
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
    }, []);  // Empty dependency array ensures this runs once after component mounts
  
    // Handle "View Details" button click
    const handleViewDetailsClick = (item) => {
        console.log('View Details clicked for item:', item);
      if (selectedItem === item) {
        setDropdownVisible(!dropdownVisible);
      } else {
        setSelectedItem(item);
        setDropdownVisible(true);
      }
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
                          if (servicesArray.length > 1) {
                            return (
                              <select className="status-dropdown">
                                {servicesArray.map((service, index) => (
                                  <option key={index} value={service.Description}>
                                    {service.Description}
                                  </option>
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
                      <GenerateInvoice onViewDetailsClick={() => handleViewDetailsClick(item)} /> {/* Passing function as a prop */}
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
  
        {/* Conditional Rendering of Dropdown */}
        {dropdownVisible && selectedItem && (
          <div className="details-dropdown">
            <div className="details-content">
              <h3>{selectedItem.customer_name}</h3>
              <p><strong>Mobile No.:</strong> {selectedItem.mobile_no}</p>
              <p><strong>Amount:</strong> {selectedItem.grand_total}</p>
              <p><strong>Services:</strong> {selectedItem.services}</p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default BillingTable;
