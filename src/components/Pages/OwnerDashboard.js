import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header.js';
import '../../components/Styles/OwnerDashboard.css';
import { Helmet } from 'react-helmet';
import Cookies from 'js-cookie';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import VertNav from './VertNav.js';
function OwnerDashboard() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [pickedDate, setPickedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const salonName = Cookies.get('salonName');

  useEffect(() => {
    const fetchBranches = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get("https://api.crm.swalook.in/api/swalook/salonbranch/", {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setBranches(res.data.table_data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranches();
  }, []);

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleDateChange = (e) => {
    setPickedDate(e.target.value);
  };

  const handleSearch = async () => {
    if (!selectedBranch) {
      alert('Please select a branch');
      return;
    }

    const token = localStorage.getItem('token');
    const date = pickedDate || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    console.log(date);
    console.log(selectedBranch);
    try {
      const res = await axios.get(`https://api.crm.swalook.in/api/swalook/get_branch_data/${selectedBranch}/${date}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      // console.log(res.data);
      setAppointments(res.data.appointment || []);
      setBilling(res.data.invoices || []);
    } catch (err) {
      console.error(err);
    }
  };

  console.log(billing);

  const handleShowInvoice = (id) => {
    const sname  = Cookies.get('salonName');
    navigate(`/${sname}/${selectedBranch}/viewinvoice/${id}`);
  };

  return (
    <div className="owner-dashboard">
      <Helmet>
        <title>Owner Dashboard</title>
      </Helmet>
      <Header />
      <VertNav/>
      <div className='owner-main'>
        <div className="owner-content-header">
          <h1 className="owner-gradient-heading">Welcome Owner!</h1>
          <div className="owner-controls">
            <select className="owner-dropdown-menu" value={selectedBranch} onChange={handleBranchChange}>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.branch_name}>{branch.branch_name}</option>
              ))}
            </select>
            <input type="date" className="owner-date-picker" value={pickedDate} onChange={handleDateChange} />
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
        </div>
        <h2 className="center-text owner-table-heading">Booked Appointment</h2>
        <div className="owner-data-table">
          <table className="owner-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Services</th>
                <th>Mobile No</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td className="center-text">{appointment.customer_name}</td>
                  <td className="center-text">{appointment.booking_date}</td>
                  {/* <td className="center-text">{appointment.services}</td> */}
                    <td className="center-text">
                        {appointment.services.split(',').length > 1 ? (
                        <select className='status-dropdown'>
                            {appointment.services.split(',').map((service, index) => (
                            <option key={index} value={service}>{service}</option>
                            ))}
                        </select>
                        ) : appointment.services.split(',')[0]}
                    </td>
                  <td className="center-text">{appointment.mobile_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="center-text billing-table-heading">Billing Table</h2>
        <div className="billing-data-table">
          <table className="billing-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile No</th>
                <th>Billing Amount</th>
                <th>Date</th>
                <th>Services</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {billing.map(bill => (
                <tr key={bill.id}>
                  <td className="center-text">{bill.customer_name}</td>
                  <td className="center-text">{bill.mobile_no}</td>
                  <td className="center-text">{bill.total_prise - bill.total_discount}</td>
                  <td className="center-text">{bill.date}</td>
                  <td className="center-text">
  {(() => {
    try {
      const servicesArray = JSON.parse(bill.services);
      if (servicesArray.length > 1) {
        return (
          <select className='status-dropdown'>
            {servicesArray.map((service, index) => (
              <option key={index} value={service.Description}>{service.Description}</option>
            ))}
          </select>
        );
      } else if (servicesArray.length === 1) {
        return <span className="center-text">{servicesArray[0].Description}</span>;
      } else {
        return null;
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  })()}
</td>

                  {/* <td className="center-text"><button onClick={() => handleShowInvoice(bill.id)}>View</button></td> */}
                  <td>
                    <PictureAsPdfIcon onClick={() => handleShowInvoice(bill.id)} style={{cursor:"pointer"}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
