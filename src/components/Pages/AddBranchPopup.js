import React , {useState , useEffect} from 'react';
import '../Styles/AddBranchPopip.css'; 
import axios from 'axios';
import Popup from './Popup';


function AddBranchPopup({ isOpen, onClose }) {
  const [staff_name, setStaffName] = useState('');
  const [branch_name, setBranchName] = useState('');
  const [password, setPassword] = useState('');
  const salon_name = localStorage.getItem('s-name');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); 
 
  const handleAddBranch = async(e) => {
    e.preventDefault();
    console.log(staff_name , branch_name , password);
    const token = localStorage.getItem('token');

    
    await axios.post("https://api.crm.swalook.in/api/swalook/salonbranch/",{
      staff_name: staff_name,
      branch_name: branch_name,
      password: password,
      staff_url:"",
      admin_url:"",
    },{
      headers:{
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      console.log(res.data.status);
      setPopupMessage(res.data.status);
      setShowPopup(true);
      onClose();
      
    })
    .catch((err) => {
      console.log(err);
    })
  }
 
 
  if (!isOpen) return null;


  return (
    <div className="branch-popup_overlay">
    <div className="branch-popup_container">
      <div className="branch-popup_header">
       <div className='branch-pph3'>
       <h3>Add Branch</h3>
       </div>
        <button className="close_button" onClick={onClose}>X</button>
      </div>
      <hr></hr>
      <form onSubmit={handleAddBranch}>
      <div className="branch-sn1">
          <label htmlFor="saloon_name">Saloon Name:</label>
          <input type="text" id="saloon_name" name="saloon_name" value={salon_name} disabled required />
      </div>
      <div className="branch-sn2">
          <label htmlFor="duration">Staff Username:</label>
          <input type="text" id="st-username" name="staff_name" placeholder="Staff Username" required  onChange={(e)=>setStaffName(e.target.value)} />
      </div>
      <div className="branch-sn4">
          <label htmlFor="branch_name">Branch Name:</label>
          <input type="text" id="branch_name" name="branch_name" onChange={(e)=>setBranchName(e.target.value)} placeholder='Branch Name' required />
      </div>
      <div className="branch-sn3">
          <label htmlFor="price">Password:</label>
          <input type="password" id="password" name="password" onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required />
      </div>
      <div className="branch-sn_button_container">
          <button type='submit' className="sn_save_button">Save</button>
        </div>
      </form>
    </div>
    {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
  </div>
  );
}

export default AddBranchPopup;
