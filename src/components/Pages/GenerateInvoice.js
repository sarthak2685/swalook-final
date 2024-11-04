import React , {useState , useEffect} from 'react'
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
   const [customer_name , setCustomer_Name] = useState('');
   const [email , setEmail] = useState('');
   const [mobile_no , setMobileNo] = useState(0);
   const [address , setAddress] = useState('');
   const [GBselectedServices, GBsetSelectedServices] = useState([]);
    const [value , selectedValues] = useState([]);
    const [service_by, setServiceBy] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [isGST, setIsGST] = useState(false);
    const [gst_number, setGSTNumber] = useState('');
    const [comments, setComments] = useState('');
    const [servicesTableData, setServicesTableData] = useState([]); 
    const [inputFieldValue, setInputFieldValue] = useState('');
    const [loading, setLoading] = useState(true);


    const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
    const [dialogTitle, setDialogTitle] = useState(''); // State for dialog title
    const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message

    const branchName = localStorage.getItem('branch_name');
    const sname = localStorage.getItem('s-name');
console.log(sname);
    const [InvoiceId , setInvoiceId] = useState('');
    const [inventoryData, setInventoryData] = useState([]);
    const [pq , setPQ] = useState('');
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

    const bid = localStorage.getItem('branch_id');

    useEffect(() => {
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

      fetchData();
  }, []);


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

  useEffect(() => {
    fetchStaffData();
  }, []);
  
    useEffect(() => {
      const fetchData = async () => {
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
          //console.log(data.table_data);
    
          setServiceOptions(data.data.map((service) => ({
            key: service.id,
            value: service.service,
            price: service.service_price,
            gst:''
          })));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();

    }, []);
    
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


    /*const branchoption = {
      'Simply Divine Unisex Beauty Salon': [
        { key: 'Rajni', value: 'Rajni' },
        { key: 'Manju', value: 'Manju' },
        { key: 'Pooja', value: 'Pooja' },
        { key: 'Seela', value: 'Seela' },
        { key: 'Minakshi', value: 'Minakshi' },
        { key: 'Zainab', value: 'Zainab' },
        { key: 'Manoj', value: 'Manoj' }
      ],
      'Simply Divine Salon' : [
        { key: 'Zishan', value: 'Zishan' },
        { key: 'Raman', value: 'Raman' },
        { key: 'Renu', value: 'Renu' },
        { key: 'Mohan', value: 'Mohan' },
        { key: 'Sahib', value: 'Sahib' },
        { key: 'Piyush', value: 'Piyush' },
        { key: 'Bhim', value: 'Bhim' },
        { key: 'Nidhi', value: 'Nidhi' },
        { key:'Tanu ', value: 'Tanu' },
      ],
      'Test Salon':[
        { key: 'sarthak', value: 'Sarthak' },
        { key: 'devashish', value:'devashish' },
      ],
      'Ads Beauty Salon':[
        { key: 'Tara Sonar', value: 'Tara Sonar' },
        { key: 'Moni Das', value: 'Moni Das' },
        { key: 'Ansh', value: 'Ansh' },
        { key: 'Imran', value: 'Imran' },
        { key: 'Bhoirobi Saikia', value: 'Bhoirobi Saikia' },
        { key: 'Sonali Kumari', value: 'Sonali Kumari' },
        { key: 'Niki Sonowal', value: 'Niki Sonowal' },
        { key: 'Junaki Hazorika', value: 'Junaki Hazorika'},
      ],
      'AB Unisex Salon': [
        { key: ' Gobinda Dey', value: 'Gobinda Dey' },
        { key: 'JATIN BASFOR', value: 'JATIN BASFOR' },
        { key: 'NEELAM TAMANG', value: 'NEELAM TAMANG' },
        { key: 'SILPA LAMA ', value: 'SILPA LAMA ' },
             ]
    }*/
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
    

    const handleGenerateInvoice = () => {


      // if(GBselectedServices.length === 0){
      //   setDialogTitle('Error');
      //   setDialogMessage('Please select services!');
      //   setDialogOpen(true);

      //   return;
      // }

      // if(service_by.length === 0){
      //   setDialogTitle('Error');
      //   setDialogMessage('Please select service by!');
      //   setDialogOpen(true);
      //   return;
      // }

      const mobileNoPattern = /^[0-9]{10}$/;
      if (!mobileNoPattern.test(mobile_no)) {
        setDialogTitle('Error');
        setDialogMessage('Please enter a valid mobile number!');
        setDialogOpen(true);
        return;
      }

    

      for(let i = 0; i < servicesTableData.length; i++){
        if(servicesTableData[i].inputFieldValue === ''){
          setDialogTitle('Error');
          setDialogMessage('Please enter quantity for selected services!');
          setDialogOpen(true);
          return;
        }
      }

      for (let i = 0; i < servicesTableData.length; i++) {
        if (servicesTableData[i].gst === '') {
          setDialogTitle('Error');
          setDialogMessage('Please select GST for all services!');
          setDialogOpen(true);
          return;
        }
      }

      for(let i = 0; i < productData.length; i++){
        if(productData[i].quantity === ''){
          setDialogTitle('Error');
          setDialogMessage('Please enter quantity for selected products!');
          setDialogOpen(true);
          return;
        }
      }
      navigate(`/${sname}/${branchName}/${InvoiceId}/invoice`,{
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
        }
      }); 
      
    };

  const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setGet_persent_day_bill(response.data.table_data);
        // //console.log(response.data.current_user_data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

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
  const [selectMembership, setSelectMembership] = useState('');

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
    if (mobile_no) {
      //console.log('Checking membership status...', mobile_no);
      
      try {
        const branchName = localStorage.getItem('branch_name');
        const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/verify/?branch_name=${bid}&customer_mobile_no=${mobile_no}`,{
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        if (response.data.status) {
          // Successful response handling
          setUserExists(true);
          setMembershipStatus(true);
          setMembershipType(response.data.membership_type);
          setUserPoints(response.data.points);
          console.log('User exists, membership details:', response.data);
      
  
          // Fetch additional user details
          const userDetailsResponse = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/customer/get_details/?branch_name=${bid}&mobile_no=${mobile_no}`,{
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          });
  
          if (userDetailsResponse.data) {
            setCustomer_Name(userDetailsResponse.data.data.name);
            // console.log("customer name", userDetailsResponse.data.data.name );
            setEmail(userDetailsResponse.data.data.email);
            // setAddress(userDetailsResponse.data.address);
            // console.log("user detaial:", userDetailsResponse.data);
          }
        } else {
          // Handle case where user does not exist
          setUserExists(false);
          console.log();
          setMembershipStatus(false);
          setMembershipType('');
          await fetchMembershipOptions(); // Ensure this is awaited if it returns a promise
          console.log('User does not exist, fetching membership options...');
        }
  
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }
  };

 


  const handleSubmit = async ()=> {
    setLoading(true);
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');
    console.log('Selected Membership:', selectMembership);
    console.log('Posting data:', {
      name: customer_name,
      mobile_no: mobile_no,
      email: email,
      membership: selectMembership
    });
    
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
        console.log('Customer added successfully!');
        // onClose();  
        window.location.reload();
      } else {
        setPopupMessage('Failed to add customer.');
        setShowPopup(true);
        console.log('Failed to add customer:', result.message || 'No additional information');
      }
    } catch (error) {
      setPopupMessage('An error occurred.');
      setShowPopup(true);
      console.error('Error:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };
  

const handleMembershipChange = async (selectMembership) => {
  console.log('swalook Membership:', selectMembership);
  setSelectMembership(selectMembership);
  if (selectMembership) {
    // console.log('swalook Membership:', selectMembership);
    // await handleSubmit(); 
    setLoading(true);
    const token = localStorage.getItem('token');
    const bid = localStorage.getItem('branch_id');
    console.log('Selected Membership:', selectMembership);
    console.log('Posting data:', {
      name: customer_name,
      mobile_no: mobile_no,
      email: email,
      membership: selectMembership
    });
    
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
        console.log('Customer added successfully!');
        // onClose();  
        window.location.reload();
      } else {
        setPopupMessage('Failed to add customer.');
        setShowPopup(true);
        console.log('Failed to add customer:', result.message || 'No additional information');
      }
    } catch (error) {
      setPopupMessage('An error occurred.');
      setShowPopup(true);
      console.error('Error:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };
  

const handleMembershipChange = async (selectMembership) => {
  console.log('swalook Membership:', selectMembership);
  setSelectMembership(selectMembership);
  if (selectMembership) {
    console.log('swalook Membership:', selectMembership);
    await handleSubmit(); 
  }
  }
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
  
  // const handleMembershipChange = async(selectedValue) => {
  //   setSelectMembership(selectedValue);
  //   if (selectedValue) {
  //     await handleSubmit();  
  //   }
  // };


  return (
    <div className='gb_dash_main'>
      <Helmet>
        <title>Generate Invoice</title>
      </Helmet>
        <Header />
        <div className='gb_horizontal'>
        <div className='gb_h1'>
        <div className='gb_ver_nav'>
          <VertNav />
        </div>
        </div>
        
        <div className='gb_h2'>
            <div className='gb_left'>
                <h2 className='GI'>Generate Invoice</h2>
                <hr className='gb_hr'/>
                <div className='gi_con'>
                <h3 className='cd'>Customer Details</h3>
                <div className="gbform-groups">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" className="gb_input-field" placeholder='Enter Full Name' value={customer_name} required onChange={(e) => setCustomer_Name(e.target.value)}/>
                </div>
                <div className="gbform-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" className="gb_input-fields" placeholder='Enter Email Address'  value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="gbform-group">
                <label htmlFor="phone">Phone:</label>
                <input type="number" id="phone" className="gb_input-fields" placeholder='Enter Mobile Number' required onBlur={handlePhoneBlur} onChange={(e)=>setMobileNo(e.target.value)}/>
                </div>
                <div className="gbform-groups">
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" className="gb_input-field" placeholder='Enter Address' value={address} rows={3} onChange={(e)=>setAddress(e.target.value)}></input>
                </div>
                {userExists && membershipType !== 'None'  ? (
  <div className='services-table'>
    <table className='services-table-content'>
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
)  :(mobile_no.length === 10 || mobile_no.length === 12 ? (
    <div className="membership-container">
            <label className="membership-label" htmlFor="membership">Select Membership Plan</label>
            <select
              id="membership"
              value={selectMembership}
              onChange={(e) => handleMembershipChange(e.target.value)}
              className="membership-select"
            >
              <option value="">Select a plan</option>
              {membershipOptions.length > 0 ? (
                membershipOptions.map((option) => (
                  <option key={option.program_type} value={option.program_type}>
                    {option.program_type}
                  </option>
                ))
              ) : (
                <option value="" disabled>No membership options available</option>
              )}
            </select>
          </div>
) : null )}


  


                {/* {!userExists && membershipOptions.length > 0 && (  
      <div className="membership-container">
        <label className="membership-label" htmlFor="membership">Select Membership Plan</label>
        <select
          id="membership"
          value={selectMembership}
          onChange={(e) => handleMembershipChange(e.target.value)}
          className="membership-select"
        >
          <option value="">Select a plan</option>
          {membershipOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    )} */}
                
                {/* {membershipStatus && (
                  <>
                   <div className='services-table'>
                   <table className='services-table-content'>
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
                 </>
              )} */}

<h3 className='sb'>Served By:</h3>
                <div className='gb_select-field-cont'>
                <Multiselect
                options={staffData}
                showSearch={true}
                onSelect={handleServedSelect}
                onRemove={handleServedSelect}
                displayValue="label"                placeholder="Select Served By"
                className="gb_select-field"
                />
                </div>
          
                {/* {userExists && mobile_no.length === 10 && (
      <div className="membership-container">
        <label className="membership-label" htmlFor="membership">
          Upgrade Membership Plan
        </label>
        <select
          id="membership"
          value={selectMembership}
          onChange={(e) => handleMembershipChange(e.target.value)}
          className="membership-select"
        >
          <option value="">Select a plan</option>
          {membershipOptions.length > 0 ? (
            membershipOptions.map((option) => (
              <option key={option.id} value={option.id}>
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
    )} */}
                <h3 className='sts'>Select Services</h3>
                <div className='gb_select-field-cont'>
                <Multiselect
                options={serviceOptions}
                showSearch={true}
                onSelect={handleServiceSelect}
                onRemove={handleServiceSelect}
                displayValue="value"
                placeholder="Select Service "
                className="gb_select-field"
                showCheckbox={true}
                selectedValues={value}
                />
                </div>

                {value.length > 0 && (
                  <div className='services-table'>
                    <table className='services-table-content'>
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
                            <td><input type='number' className="service-table-field" placeholder='Enter Quantity' required onChange={handleInputChange}/></td>
                            <td className='service_dp'>
                              <select className='status-dropdowns' required onChange={(e) => handleGST(e, index)}>
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
                                <>{(service.price)}</>
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

                <h3 className='sts'>Select Product</h3>
                <div className='gb_select-field-cont'>
                <Multiselect
                options={inventoryData}
                showSearch={true}
                displayValue="value"
                onSelect={handleProductSelect}
                onRemove={handleProductSelect}
                placeholder="Select Product "
                className="gb_select-field"
                showCheckbox={true}
                selectedValues={product_value}
                />
                </div>

                {product_value.length > 0 && (
                  <div className='services-table'>
                    <table className='services-table-content'>
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          <th>unit</th>
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
                      className="service-table-field"
                      placeholder='Enter Quantity in ml/gm'
                      required
                      onChange={(e) => handleProductInputChange(index, e.target.value)}
                      style={{ borderColor: product.quantity === 0 ? 'red' : 'black' }}

                    />
                  </td>
                  <td>
                    {product.unit}
                  </td>
                  <td>
                    {product.quantity}
                  </td>
                </tr>
              ))}
                      </tbody>
                    </table>
                  </div>
                )}



                {membershipStatus && (
                  <div className="gbform-group">
                    <label htmlFor="points">Points:</label>
                    <input type="number" id="points" className="gb_input-field" placeholder='Enter Points' onChange={(e) => setDeductedPoints(e.target.value)} />
                  </div>
                )}

                <div className="gbform-group" style={{ marginTop: '10px' }}>
                    <label htmlFor="comments">Comment:</label>
                <input id="comments" type='text' className="gb_input-field" placeholder='Enter Comment' onChange={(e) => setComments(e.target.value)}></input>
                 </div>
                {/* <div className="gbform-group-radio radio_gi">
                            <input type="radio" id="gstYes" name="gst" value="Yes" onChange={handleGSTChange} />
                            <label>GST Number?</label>
                        </div> */}
                        {isGST && (
                            <div className="gbform-group">
                                <label htmlFor="gstNumber" style={{marginRight:'25px'}}>GST No:</label>
                                <input type="text" id="gstNumber" className="gb_input-field" placeholder='Enter GST Number' required onChange={(e)=>setGSTNumber(e.target.value)} />
                            </div>
                        )}
                        </div>
                <div className='gb_btn_contain'>
                <button className='gb_button' onClick={handleGenerateInvoice}>Generate Invoice</button>
                </div>
            </div>
            <div className='gb_right'>
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
</div>

        </div>

        </div>

        {showDeletePopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this invoice?</p>
            <div className="popup-buttons">
              <button onClick={handleDeleteConfirm}>Yes</button>
              <button onClick={() => setShowDeletePopup(false)}>No</button>
            </div>
          </div>
        </div>
      )}

<CustomDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogTitle}
        message={dialogMessage}
      />
    </div>
  )
}

export default GenerateInvoice



