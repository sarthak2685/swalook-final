import React,{useState , useEffect} from 'react'
import '../Styles/DeleteServicePopup.css'
import Multiselect from 'multiselect-react-dropdown';
import axios from 'axios';
import Popup from './Popup';
import config from '../../config';
function DeleteServicePopup({onClose}) { 
  const [deleteSelectedServices, setDeleteSelectedServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false); 
  const [popupMessage, setPopupMessage] = useState('');

  const bid = localStorage.getItem('branch_id');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((response) => {
      console.log(response); // Log the full response
      if (response && response.data && Array.isArray(response.data)) {
        setServiceOptions(
          response.data.map((service) => {
            return { id: service.id, value: service.service };
          })
        );
      } else {
        console.log("Service data is not available or in unexpected format");
      }
    })
    .catch((err) => {
      console.error('Fetch error:', err);
    });
  }, [bid]);
  
  
  

  const handleSelect = (selectedList) => {
    setDeleteSelectedServices(selectedList);
   
  };


  const handleDelete = () => {
    if (deleteSelectedServices.length === 0) {
      alert("Please select services to delete.");
      return;
    }
  
    const token = localStorage.getItem('token');
    
    Promise.all(deleteSelectedServices.map(service => {
      console.log(`Deleting service with ID ${service.id}.`);
      return axios.delete(`${config.apiUrl}/api/swalook/delete/services/?id=${service.id}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }))
      .then((responses) => {
        // Check if all requests were successful
        const allSuccess = responses.every(response => response.status === 200);
        
        if (allSuccess) {
          setPopupMessage("All services deleted successfully!");
          setShowPopup(true);
          onClose();
          window.location.reload(); // Refresh the page to reflect deletions
        } else {
          setPopupMessage("Some services could not be deleted.");
          setShowPopup(true);
        }
      })
      .catch(error => {
        console.error("Error deleting services:", error);
        setPopupMessage("An error occurred while deleting services.");
        setShowPopup(true);
      });
  };
  

  
  return (
    <div className='DS_overlay'>
        <div className='DS_container'>
        <div className="DS_header">
        <div className='DSh3'>
        <h3>Delete Service</h3>
        </div>
            <button className="close_button" onClick={onClose}>X</button>
        </div>
        <hr></hr>
        <form onSubmit={handleDelete}>
        <div className="DS_dropdown-container">
          <Multiselect
              options={serviceOptions}
              showSearch={true}
              onRemove={handleSelect }
              onSelect={handleSelect}
              displayValue="value"
              placeholder="Select Services...."
              className="DS_select"
              showCheckbox={true}
            />
        </div>
        <button className="delete_button">Delete</button>
        </form>
        </div>
        {showPopup && <Popup message={popupMessage} onClose={() => {setShowPopup(false)}} />}
    </div>
  )
}

export default DeleteServicePopup