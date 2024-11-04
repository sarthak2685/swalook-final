// CLP_Setting.js
import React, { useState, useEffect } from 'react';
import '../Styles/CLP_Setting.css';
import Header from './Header';
import CLP from '../../assets/crm.png';
import { Helmet } from 'react-helmet';
import AddIcon from '@mui/icons-material/Add';
import config from '../../config';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import Modal from './Modal';
import VertNav from './VertNav';

function CLP_Setting() {
  const [fetchedRows, setFetchedRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(null);
  const [editValues, setEditValues] = useState({ type: '', points: '', expiry: '', charges: '' });
  const bid = localStorage.getItem('branch_id');

  useEffect(() => {
    const fetchData = async () => {
      const branchName = localStorage.getItem('branch_name');
      const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${bid}`;
      
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        });
        console.log("responseeee--",response.data.data)
        if (response.data.status) {
          setFetchedRows(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    };

    fetchData();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedNewRows = [...newRows];
    updatedNewRows[index] = { ...updatedNewRows[index], [field]: value };
    setNewRows(updatedNewRows);
  };

  const handleThresholdChange = (e) => {
    setThreshold(Number(e.target.value));
  };

  const handleAddRow = () => {
    setNewRows([...newRows, { type: '', points: '', expiry: '', charges: '' }]);
  };

  const handleSave = async () => {
    const branchName = localStorage.getItem('branch_name');
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?branch_name=${bid}`;

    setLoading(true);

    try {
      if (newRows.length > 0) {
        const response = await axios.post(apiEndpoint, {
          json_data: newRows,
          branch_name: atob(branchName),
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        });

        console.log('Success:', response.data);
        console.log('Error:', newRows)
        setNewRows([]); // Clear new rows after save
      } else {
        console.log('No new rows to save.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?id=${id}`;
    
    try {
      await axios.delete(apiEndpoint, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      setFetchedRows(fetchedRows.filter(row => row.id !== id));
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };
  const [Minimum , setMinimum] = useState(0);

  useEffect(() => {
    const fetchAmount = async () => {
      const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/get_minimum_value/?branch_name=${bid}`;
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        });
        if (response.data.status) {
          setMinimum(response.data.data);
          setThreshold(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    }
    fetchAmount();
  }, []);
  
  const handleThresholdSave = async () => {
    setLoading(true);
    handleSave();
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/get_minimum_value/?branch_name=${bid}`;
  
    try {
      const response = await axios.post(apiEndpoint, {
        minimum_amount: threshold, 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
  
      console.log('Threshold saved successfully:', response.data);
      setThreshold(response.data.minimum_amount); 
      window.location.reload();
  
    } catch (error) {
      console.error('Error saving threshold:', error);
    } finally {
      setLoading(false); 
    }
  };
  

  const handleEditClick = (row) => {
    setEdit(row.id);
    setEditValues({
      type: row.program_type,
      points: row.points_hold,
      expiry: row.expiry_duration,
      charges: row.price,
    });
  };

  const handleEditSave = async (id) => {
    if (!editValues.type || !editValues.points || !editValues.expiry || !editValues.charges) {
      alert('Please fill all fields.');
      return;
    }
  
    setLoading(true);
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/?id=${id}&branch_name=${bid}`;
    
  
    const newRows = [
      {
        type: editValues.type,
        points: editValues.points,
        expiry: editValues.expiry,
        charges: editValues.charges,
      }
    ];
    console.log('editValues.charges:', editValues.charges); 

  
    try {
      console.log('Sending data to API:', newRows);  
  
      const response = await axios.put(apiEndpoint, {
        json_data: newRows,  
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
  
      setNewRows([]);  
      console.log('Edit success:', response.data);
  
      // Update the fetchedRows state with the updated row
      setFetchedRows(fetchedRows.map(row => (row.id === id ? response.data : row)));
  
      setEdit(null);
    } catch (error) {
      console.error('Error updating data:', error);  // Debugging log
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleInputChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: value,
    });
  };

  return (
    <div className='clp_setting_container'>
      <Helmet>
        <title>CLP Settings</title>
      </Helmet>
      <Header />
      <VertNav/>
      <div className='clp_main'>
        <div className='clp_settings_content'>
          <h1 className='clp_settings_heading'>Customer Loyalty Programme Settings</h1>
          <hr className='clp_divider' />
          <div className='clp_settings_body'>
            <div className='clps_table_container'>
              <table>
                <thead>
                  <tr>
                    <th>Membership Type</th>
                    <th>Point balance added per Rs.100</th>
                    <th>Expiry (months)</th>
                    <th>Charges</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedRows.map((row) => (
                    row.program_type === 'None'?null:(
                    <tr key={row.id}>
                      <td>{row.program_type}</td>
                      <td>{row.points_hold}</td>
                      <td>{row.expiry_duration}</td>
                      <td>{row.price}</td>
                      <td>
                        <DeleteIcon 
                          onClick={() => handleDelete(row.id)} 
                          style={{ cursor: 'pointer' }} 
                        />
                      </td>
                      <td>
                        <EditIcon 
                          onClick={() => handleEditClick(row)} 
                          style={{ cursor: 'pointer' }} 
                        />
                      </td>
                    </tr>
                    )
                  ))}
                  {newRows.map((row, index) => (
                    <tr key={`new-${index}`}>
                      <td
                        contentEditable
                        onBlur={(e) => handleInputChange(index, 'type', e.target.innerText)}
                      >
                        {row.type}
                      </td>
                      <td
                        contentEditable
                        onBlur={(e) => handleInputChange(index, 'points', e.target.innerText)}
                      >
                        {row.points}
                      </td>
                      <td
                        contentEditable
                        onBlur={(e) => handleInputChange(index, 'expiry', e.target.innerText)}
                      >
                        {row.expiry}
                      </td>
                      <td
                        contentEditable
                        onBlur={(e) => handleInputChange(index, 'charges', e.target.innerText)}
                      >
                        {row.charges}
                      </td>
                      <td>
                        {
                          loading ? <CircularProgress size={24} /> :
                          <SaveIcon onClick={handleSave} style={{ cursor: 'pointer' }} />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='clp_add_row' style={{ cursor: 'pointer' }} onClick={handleAddRow}>
                <AddIcon />
                <span>Add Row</span>
              </div>
              <div className='clp_threshold_container'>
                <label htmlFor='threshold'>Set Minimum Amount:</label>
                <input
                  type='number'
                  id='threshold'
                  value={threshold}
                  onChange={handleThresholdChange}
                  className='clp_threshold_input'
                  placeholder='Enter amount'
                />
              </div>
              <button className='save_button' onClick={handleThresholdSave}>
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={edit !== null} onClose={() => setEdit(null)}>
        {/* <h2>Edit Row</h2> */}
        <label>
          Membership Type:
          <input 
            type='text' 
            name='type' 
            value={editValues.type} 
            onChange={handleInputChangeEdit} 
          />
        </label>
        <label>
          Point balance added per Rs.100:
          <input 
            type='text' 
            name='points' 
            value={editValues.points} 
            onChange={handleInputChangeEdit} 
          />
        </label>
        <label>
          Expiry (months):
          <input 
            type='text' 
            name='expiry' 
            value={editValues.expiry} 
            onChange={handleInputChangeEdit} 
          />
        </label>
        <label>
          Charges:
          <input 
            type='text' 
            name='charges' 
            value={editValues.charges} 
            onChange={handleInputChangeEdit} 
          />
        </label>
        <button onClick={() => handleEditSave(edit)}>Save Changes</button>
        <button onClick={() => setEdit(null)}>Cancel</button>
      </Modal>
    </div>
  );
}

export default CLP_Setting;
