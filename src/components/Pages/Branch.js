import React, { useState, useEffect, useRef } from 'react';
import Logo1 from '../../assets/S_logo.png';
import AddBranchPopup from '../Pages/AddBranchPopup';
import EditBranchPopup from './EditBranchPopup';
import '../Styles/Branch.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Helmet } from 'react-helmet';


function Branch() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [branch, setBranch] = useState([]);
  const [sname, setSname] = useState(localStorage.getItem('s-name'))
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef([]);
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState('');


  // here i want if local storage is empty then it value take from cookies or elsr it take from local storage
  useEffect(() => {
    if (!sname) {
      setSname(Cookies.get('salonName'));
    }
  }, [sname]);


  const handleEditClick = (branchId , branchName) => {
    setIsEditPopupOpen(true);
    setBranchId({ id: branchId, name: branchName });
    setActiveDropdown(null);
  };

  const handleClickOutside = (event) => {
    if (!dropdownRefs.current.some(ref => ref && ref.contains(event.target))) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get("https://api.crm.swalook.in/api/swalook/salonbranch/", {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setBranch(res.data.table_data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranches();
  }, []);

  const handleDeleteClick = async (branchId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.get(`https://api.crm.swalook.in/api/swalook/delete/salonbranch/${branchId}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setBranch(branch.filter(branch => branch.id !== branchId));
    } catch (err) {
      console.error(err);
    }
  }

  const handleDashboardClick = () => {
    navigate(`/${sname}/owner`);
  };

  return (
    <div className={`main-branch-container ${isAddPopupOpen || isEditPopupOpen ? 'blur-background' : ''}`}>
        <Helmet>
        <title>Branch</title>
      </Helmet>
      <div className="top-container">
        <img src={Logo1} alt="Logo" className="logo" />
      </div>
      <hr className="horizontal-line" />
      <div className="bottom-container">
        <div className="content">
          <h1 className="title">Add Branch for {sname}</h1>
          <p className="description">Here you can create a branch or select an existing branch.</p>
        </div>
        <div className="glassy-background">
          {branch.map((branch, index) => (
            <div className="card" key={branch.id}>
              <div className="header">
                <div className="branch-name">{branch.branch_name}</div>
                <div
                  className="more-options"
                  onClick={() => setActiveDropdown(branch.id)}
                  ref={(el) => (dropdownRefs.current[index] = el)}
                  style={{ zIndex: 1 }}
                >
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                {activeDropdown === branch.id && (
                  <div className="dropdown-menu" style={{ zIndex: 10 }}>
                    <div className="dropdown-item" onClick={() => handleEditClick(branch.id, branch.branch_name)}>Edit</div>
                    <div className="dropdown-item" onClick={() => handleDeleteClick(branch.id)}>Delete</div>
                  </div>
                )}
              </div>
              <hr className="horizontal-line" />
              <div className="initial-circle">{branch.branch_name.charAt(0)}</div>
              <div className="buttons">
                {/* <button className="admin-button" onClick={() => navigate(`/${sname}/${branch.branch_name}/admin`)}>Admin</button> */}
                {/* <button className="staff-button" onClick={() => navigate(`/${sname}/${branch.branch_name}/staff`)}>Staff</button> */}
              </div>
              <hr className="horizontal-line" />
              <small>Admin Pass: {branch.admin_password}</small>
            </div>
          ))}
          <div className="add_card" onClick={() => setIsAddPopupOpen(true)}>
            <div className="add-branch">
              <div className="plus-circle">
                <div className="plus">+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="quarter-circle"></div> */}
      <div className='b-button-cont'>
        <button className='b-dash-button' onClick={handleDashboardClick}>Go to Dashboard &rarr;</button>
      </div>
      {isAddPopupOpen && <AddBranchPopup isOpen={isAddPopupOpen} onClose={() => setIsAddPopupOpen(false)} />}
      {isEditPopupOpen && <EditBranchPopup isOpen={isEditPopupOpen} branchId={branchId.id} branchName={branchId.name} onClose={() => setIsEditPopupOpen(false)} />}
    </div>
  );
}

export default Branch;
