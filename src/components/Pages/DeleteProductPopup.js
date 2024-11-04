import React,{useState , useEffect} from 'react'
import '../Styles/DeleteProductPopup.css'
import Popup from './Popup';
import Multiselect from 'multiselect-react-dropdown';
import config from '../../config';
import CustomDialog from './CustomDialog';

// function DeleteProductPopup({onClose}) {
//     const [deleteSelectedProducts, setDeleteSelectedProducts] = useState([]);
//     const [showPopup, setShowPopup] = useState(false); 
//     const [popupMessage, setPopupMessage] = useState('');
//     const [productOptions, setProductOptions] = useState([]);

//     const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
//     const [dialogTitle, setDialogTitle] = useState(''); // State for dialog title
//     const [dialogMessage, setDialogMessage] = useState(''); // State for dialog message

//     const bid = localStorage.getItem('branch_id');

//     useEffect(() => {

//         const token = localStorage.getItem('token');
//         const branchName = localStorage.getItem('branch_name');
//         fetch(`${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`,{
//           headers:{
//             "Authorization": `Token ${token}`,
//             "Content-Type": "application/json"
//           }
//         })
//         .then((res)=>{
//           return res.json();
//         })
//         .then((data)=>{
//           console.log(data.data);
//           setProductOptions(data.data.map((product) => {
//             return {id: product.id, value: product.product_name}
//           }
//           ));
//         })
//         .catch((err)=>{
//           console.log(err);
//         })
//       },[]);

//     const handleSelect = (selectedList) => {
//         setDeleteSelectedProducts(selectedList);
       
//       };

//     const handleDelete = () => {
//         if(deleteSelectedProducts.length === 0){
//           setDialogTitle('Error');
//           setDialogMessage('Please select products to delete.');
//           setDialogOpen(true);
//           return;
//         }
    
//         const token = localStorage.getItem('token');
//         deleteSelectedProducts.forEach(product => {
//           try {
//             const response = fetch(`${config.apiUrl}/api/swalook/inventory/product/?id=${product.id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Token ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
    
//             if (response.ok) {  
//                 onClose();
//             } 
//         } catch (error) {
//             setPopupMessage('An error occurred.');
//             setShowPopup(true);
//         }
//         });
//     }  

//   return (
//     <div className='DP_overlay'>
//     <div className='DP_container'>
//     <div className="DP_header">
//     <div className='DPh3'>
//     <h3>Delete Products</h3>
//     </div>
//         <button className="close_button" onClick={onClose}>X</button>
//     </div>
//     <hr></hr>
//     <form onSubmit={handleDelete}>
//     <div className="DP_dropdown-container">
//       <Multiselect
//           options={productOptions}
//           showSearch={true}
//           onRemove={handleSelect }
//           onSelect={handleSelect}
//           displayValue="value"
//           placeholder="Select Products...."
//           className="DP_select"
//           showCheckbox={true}
//         />
//     </div>
//     <button className="delete_button">Delete</button>
//     </form>
//     </div>
//     {showPopup && <Popup message={popupMessage} onClose={() => {setShowPopup(false)}} />}
//     <CustomDialog
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         title={dialogTitle}
//         message={dialogMessage}
//       />
// </div>
//   )
// }

function DeleteProductPopup({ title, message, onConfirm, onCancel }) {
  return (
      <div className="confirm-dialog-overlay">
          <div className="confirm-dialog-box">
              <h3>{title}</h3>
              <p>{message}</p>
              <div className="confirm-dialog-buttons">
                  <button onClick={onConfirm} className="confirm-button">Yes</button>
                  <button onClick={onCancel} className="cancel-button">No</button>
              </div>
          </div>
      </div>
  );
}

export default DeleteProductPopup