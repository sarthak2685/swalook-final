import React , {useState , useEffect} from 'react'
import axios from 'axios';
import { useNavigate , useLocation } from 'react-router-dom';
import '../Styles/GenerateInvoice.css'
import Multiselect from 'multiselect-react-dropdown';
import Header from './Header'
import VertNav from './VertNav'
import invoiceImg from '../../assets/invoice.png'
import {Link} from 'react-router-dom'
import { Helmet } from 'react-helmet';
import config from '../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CircularProgress from '@mui/material/CircularProgress';
import CustomDialog from './CustomDialog';

function getCurrentDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function AppointAsInv() {
  const navigate = useNavigate();
    const currentDate = getCurrentDate();
    const location = useLocation();
    const bid = localStorage.getItem('branch_id');

    const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
    const [dialogTitle, setDialogTitle] = useState(''); // State for dialog title
    const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message

    const initialState = location.state || {};
    const initialRowData = initialState.rowData || {};
    // const initialSelectedServices = Array.isArray(initialRowData.services) ? initialRowData.services : [initialRowData.services || []];

    const initialSelectedServices = Array.isArray(initialRowData.services)
    ? initialRowData.services
    : initialRowData.services.split(',').map(service => service.trim());

  const [serviceOptions, setServiceOptions] = useState([]);
  const [customer_name, setCustomerName] = useState(initialRowData.customer_name || '');
  const [email, setEmail] = useState(initialRowData.email || '');
  const [mobile_no, setMobileNo] = useState(initialRowData.mobile_no || '');
  const [address, setAddress] = useState(initialRowData.address || '');
  const [GBselectedServices, GBsetSelectedServices] = useState(initialSelectedServices);
  


  const [get_branch , setGetBranch] = useState(GBselectedServices)
//    const [serviceOptions, setServiceOptions] = useState([]);
//    const [customer_name , setCustomerName] = useState('');
//    const [email , setEmail] = useState('');
//    const [mobile_no , setMobileNo] = useState('');
//    const [address , setAddress] = useState('');
//     const [GBselectedServices, GBsetSelectedServices] = useState([]);
    const [service_by, setServiceBy] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [isGST, setIsGST] = useState(false);
    const [gst_number, setGSTNumber] = useState('');
    const [comments, setComments] = useState('');
    const [servicesTableData, setServicesTableData] = useState([]); 
    const [inputFieldValue, setInputFieldValue] = useState('');
    const [loading, setLoading] = useState(true);

    const branchName = localStorage.getItem('branch_name');
    const sname = localStorage.getItem('s-name');

    const [inventoryData, setInventoryData] = useState([]);
    const [pq , setPQ] = useState('');
    const [product_value, setProductValue] = useState([]);
    const [productData, setProductData] = useState([]);
    


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
          console.log(data.table_data);
    
          setServiceOptions(data.data.map((service) => ({
            key: service.id,
            value: service.service,
            price: service.service_price
          })));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
    }, []);

    const handleProductSelect = (selectedList) => {
      setProductValue(selectedList);
      console.log(selectedList, "selectedList");
      
      // Initialize productData with the selected products
      setProductData(selectedList.map(product => ({
        id: product.key,
        quantity: '',
        unit: product.unit
      })));
    };
  
    console.log(productData , "productData");
    
    const handleProductInputChange = (index, value) => {
      const updatedProductData = [...productData];
      updatedProductData[index].quantity = value;
      setProductData(updatedProductData);
    };
    
    const handleServiceSelect = (selectedList) => {
      GBsetSelectedServices(selectedList);
    };

    
    const servedByOptions = [
      { key: 'John', value: 'John' },
      { key: 'Ron', value: 'Roh' } ,
  ];


    const handleServedSelect = (selectedList) => {
        setServiceBy(selectedList);
    }

    const handleGSTChange = (event) => {
        setIsGST(true);
    }

    const selectedServiceDetails = GBselectedServices.map((serviceName) => {
        const serviceDetail = serviceOptions.find(service => service.value === serviceName);
        return serviceDetail || { key: null, value: serviceName, price: null };
      });

      console.log(selectedServiceDetails, 'selectedServiceDetails');
      const [value , selectedValues] = useState([]);
      console.log(value , 'value');
    
      const handleGST = (e, index) => {
        const updatedValues = [...selectedServiceDetails];
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
          gst: service.gst || 'No GST',
          inputFieldValue: inputValue // Add the new input field value here
        }));
        setServicesTableData(newTableData);
      };

      console.log(servicesTableData, 'servicesTableData');

      const [InvoiceId , setInvoiceId] = useState('');
    useEffect(() => {
      axios.get(`${config.apiUrl}/api/swalook/get_specific_slno/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log(response.data);
          setInvoiceId(response.data.slno);
        })
        .catch(error => {
          console.error('Error fetching invoice id:', error);
        });
    }
    , []);

    const handleGenerateInvoice = () => {
      if(GBselectedServices.length === 0){
        setDialogTitle('Error');
        setDialogMessage('Please select services!');
        setDialogOpen(true);

        return;
      }

      if(service_by.length === 0){
        setDialogTitle('Error');
        setDialogMessage('Please select service by!');
        setDialogOpen(true);
        return;
      }

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
          deductedPoints
        }
      }); 
     
  };

  const [get_persent_day_bill, setGet_persent_day_bill] = useState([]);
  const [deductedPoints, setDeductedPoints] = useState('');

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
  
        // Assuming res.data.current_user_data is the correct property to set
        setGet_persent_day_bill(response.data.table_data);
        // console.log(response.data.current_user_data);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      const res = await axios.get(`${config.apiUrl}/api/swalook/delete/invoice/?id=${id}&branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteInvoiceId(id);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${config.apiUrl}/api/swalook/delete/invoice/?id=${deleteInvoiceId}&branch_name=${bid}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data);
      window.location.reload();
    } catch (err) {
      console.log(err);
    } finally {
      setShowDeletePopup(false);
    }
  };

  const [membershipStatus, setMembershipStatus] = useState(false);
  const [membershipType, setMembershipType] = useState('');
  const [userPoints, setUserPoints] = useState('');



  const handlePhoneBlur = async () => {
    if (mobile_no) {
      console.log('Checking membership status...', mobile_no);
      
      try {
        const branchName = localStorage.getItem('branch_name');
        const response = await axios.get(`${config.apiUrl}/api/swalook/loyality_program/verify/?branch_name=${bid}&customer_mobile_no=${mobile_no}`,{
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status) {
          setMembershipStatus(true);
          setMembershipType(response.data.membership_type);
          setUserPoints(response.data.points);
        } else {
          setMembershipStatus(false);
          setMembershipType('');
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    }
  };

  useEffect(() => {
    if (mobile_no) {
      handlePhoneBlur();
    }
  }, [mobile_no]);

  

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
                <div className="gbform-group gb-name">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" className="gb_input-field" placeholder='Enter Full Name' required value={customer_name} onChange={(e) => setCustomerName(e.target.value)}/>
                </div>
                <div className="gbform-group gb-email">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" className="gb_input-field email_gi" placeholder='Enter Email Address' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="gbform-group gb-phone">
                <label htmlFor="phone">Phone:</label>
                <input type="number" id="phone" className="gb_input-field" placeholder='Enter Mobile Number' required value={mobile_no} onChange={(e)=>setMobileNo(e.target.value)}/>
                </div>
                <div className="gbform-group add_c">
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" className="gb_input-field address_gi" placeholder='Enter Address' rows={3} value={address}  onChange={(e)=>setAddress(e.target.value)}></input>
                </div>
                {membershipStatus && (
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
              )}
                <h3 className='sb'>Served By:</h3>
                <div className='gb_select-field-cont'>
                    <Multiselect
                    options={servedByOptions}
                    showSearch={true}
                    onSelect={handleServedSelect}
                    onRemove={handleServedSelect}
                    displayValue="value"
                    placeholder="Select Served By"
                    className="gb_select-field"
                    showCheckbox={true}
                />
                </div>

                {/* <h3 className='sts'>Select Services</h3> */}
                <div className='gb_select-field-cont serv_gb'>
                  <label htmlFor="services" style={{marginRight:"10px"}}>Services:</label>
                    {/* <Multiselect
                    options={serviceOptions}
                    showSearch={true}
                    displayValue="value"
                    placeholder="Select Services"
                    className="gb_select-field"
                    showCheckbox={true}
                    /> */}
                    <select className='gbform-group a status-dropdown'>
                      {selectedServiceDetails.map((service, index) => (
                        <option key={index} value={service.value}>{service.value}</option>
                      ))}
                    </select>
                </div>
                
                {selectedServiceDetails.length > 0 && (
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
                        {selectedServiceDetails.map((service, index) => (
                          <tr key={index}>
                            <td>{service.value}</td>
                            <td><input type='number' className="service-table-field" placeholder='Enter Quantity' required onChange={handleInputChange}/></td>
                            <td>
                              <select className='status-dropdown' onChange={(e) => handleGST(e, index)}>
                                <option value=''>Select GST</option>
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
                placeholder="Select Services "
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

                <div className="gbform-group" style={{marginTop:'10px'}}>
                <label htmlFor="discount" >Discount:</label>
                <input type="number" id="discount" className="gb_input-field" placeholder='Discount (In Rupees)' onChange={(e)=>setDiscount(e.target.value)}/>
                </div>

                {membershipStatus && (
                  <div className="gbform-group">
                    <label htmlFor="points">Points:</label>
                    <input type="number" id="points" className="gb_input-field" placeholder='Enter Points' onChange={(e) => setDeductedPoints(e.target.value)} />
                  </div>
                )}

                <div className="gbform-group" style={{ marginTop: '10px' }}>
                    <label htmlFor="comments">Comment:</label>
                <input id="comments" type='text' className="gb_input-field" placeholder='Enter Comments' onChange={(e) => setComments(e.target.value)}></input>
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
            <hr className='gb_hr'/>
            <div class='gb_table_wrapper'>
        <table class='gb_table'>
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
            {get_persent_day_bill.map((item, index) => (
                        <tr key={index}>
                            <td>{item.customer_name}</td>
                            <td>{item.mobile_no}</td>
                            <td>{item.grand_total}</td>
                
                            <td>
                            {/* {item.services.split(',').length > 1 ? (
                            <select className='status-dropdown'>
                              {item.services.split(',').map((service, index) => (
                                <option key={index} value={service}>{service}</option>
                              ))}
                            </select>
                          ) : item.services.split(',')[0]} */}

                          
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
                            {/* <td><button onClick={() => handleShowInvoice(item.id)}>View</button></td> */}
                            <td><PictureAsPdfIcon onClick={() => handleShowInvoice(item.id)} style={{cursor:"pointer"}}/></td>
                            {/* <td><DeleteIcon onClick={() => handleDeleteInvoice(item.id)} style={{cursor:"pointer"}}/></td> */}
                            <td><DeleteIcon onClick={() => handleDeleteClick(item.id)} style={{cursor:"pointer"}}/></td>
                        </tr>
                    ))}
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

export default AppointAsInv