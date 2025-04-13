import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/PersonalInformation.css';
import Header from './Header';
import PI from '../../assets/PI.png';
import config from '../../config';
import VertNav from './VertNav';

function PersonalInformation() {
  const [P, setPI] = useState({});
  const [on, setOn] = useState('');
  const [e, setE] = useState('');
  const [gn, setGn] = useState('');
  const [pn, setPn] = useState('');
  const [p, setP] = useState('');

  const no = atob(localStorage.getItem('number'));
  const bid = localStorage.getItem('branch_id');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(P.profile_pic || "");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/api/swalook/get_current_user/?id=${no}&branch_name=${bid}`, {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        const userData = response.data.current_user_data;
        setPI(userData);
        localStorage.setItem("profile_pic", userData.profile_pic);
        localStorage.setItem("mobile_no", userData.mobile_no);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [no]);

  useEffect(() => {
    if (P) {
      setOn(P.owner_name || '');
      setE(P.email || '');
      setGn(P.gst_number || '');
      setPn(P.pan_number || '');
      setP(P.pincode || '');
    }
  }, [P]);

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("owner_name", on);
      formData.append("email", e);
      formData.append("gst_number", gn);
      formData.append("pan_number", pn);
      formData.append("pincode", p);
      if (logoFile) {
        formData.append("profile_pic", logoFile); // ✅ append file properly
      }
  
      console.log("Updating profile...", logoFile);
  
      await axios.put(
        `${config.apiUrl}/api/swalook/edit/profile/?id=${no}`,
        formData,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            // ❌ DO NOT set Content-Type manually when using FormData
          },
        }
      );
  
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update profile");
    }
  };
  

  return (
    <>
    <Header />
    <VertNav />
    <div className='personal_information_container'>
      <div className='pi_main'>
        <div className="pi_horizontal_container">
          <div className="pi_horizontal_item">
            <img src={PI} alt="PI Image" />
          </div>
          <div className="pi_horizontal_item">
            <h2>Personal Details</h2>
            <hr />
            <div className="pi_input_container">
              <label htmlFor="saloonName">Saloon Name:</label>
              <input type="text" value={P.salon_name} id="saloonName" readOnly />
            </div>
            <div className="pi_input_container">
              <label htmlFor="ownerName">Owner Name:</label>
              <input type="text" value={on} id="ownerName" onChange={(e) => setOn(e.target.value)} />
            </div>
            <div className="pi_input_container">
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input type="tel" value={P.mobile_no} id="phoneNumber" readOnly />
            </div>
            <div className="pi_input_container">
              <label htmlFor="emailId">Email Id:</label>
              <input type="email" value={e} id="emailId" onChange={(e) => setE(e.target.value)} />
            </div>
            <div className="pi_input_container">
              <label htmlFor="gstNumber">GST Number:</label>
              <input type="text" value={gn} id="gstNumber" onChange={(e) => setGn(e.target.value)} />
            </div>
            <div className="pi_input_container">
              <label htmlFor="panNumber">PAN Number:</label>
              <input type="text" value={pn} id="panNumber" onChange={(e) => setPn(e.target.value)} />
            </div>
            <div className="pi_input_container">
              <label htmlFor="pincode">Pincode:</label>
              <input type="number" value={p} id="pincode" onChange={(e) => setP(e.target.value)} />
            </div>
            <div className="pi_input_container">
  <label htmlFor="logoUpload">Salon Logo:</label>
  <input
    type="file"
    accept="image/*"
    id="logoUpload"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      }
    }}
  />
  {logoPreview && (
    <img
      src={logoPreview}
      alt="Logo Preview"
      className="mt-2 rounded border w-24 h-24 object-cover"
    />
  )}
</div>

            <div className='pi_up_container'>
              <button className="pi_update_button" onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PersonalInformation;
