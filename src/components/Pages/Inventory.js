import React, { useState, useEffect } from 'react';
import '../Styles/Inventory.css';
import Header from './Header';
import { Helmet } from 'react-helmet';
import AddProductPopup from './AddProductPopup';
import DeleteProductPopup from './DeleteProductPopup';
import EditProductPopup from './EditProductPopup';
import config from '../../config';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VertNav from './VertNav';

function Inventory() {
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editProductData, setEditProductData] = useState(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [deleteProductData, setDeleteProductData] = useState(null); 
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const bid = localStorage.getItem('branch_id');

    const AddtogglePopup = () => {
        setIsAddPopupOpen(!isAddPopupOpen);
    };

    const EdittogglePopup = (product) => {
        setEditProductData(product);
        setIsEditPopupOpen(!isEditPopupOpen);
    };

    const handleDeleteClick = (item) => {
        setDeleteProductData(item); 
        setIsConfirmDialogOpen(true);   
    };

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem('token');
        const productId = deleteProductData.id;  

        if (!productId) {
            console.error("Product ID is missing or invalid.");
            return;
        }

        try {
            const response = await fetch(`${config.apiUrl}/api/swalook/inventory/product/?id=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Product deleted successfully');
                setInventoryData(inventoryData.filter(item => item.product_id !== productId));
                window.location.reload();
            } else {
                console.error('Failed to delete product:', response.statusText);
            }
        } catch (error) {
            console.error(`Error deleting product with ID ${productId}:`, error);
        }
        setIsConfirmDialogOpen(false); 
    };

    const handleCancelDelete = () => {
        setIsConfirmDialogOpen(false); 
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Token is missing.');
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
                setInventoryData(data.data);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='admin_inventory_container'>
            <Helmet>
                <title>Inventory</title>
            </Helmet>
            <div className='c_header'>
                <Header />
            </div>
            <VertNav />
            <div className="inventory_details_header">
                <h1>Inventory Details</h1>
                <div>
                    <button className="add_inventory_button" onClick={AddtogglePopup}>Add</button>
                </div>
            </div>
           
            <div className="horizontal_line_container">
                <hr className="horizontal_line" />
            </div>
            
            <div className='update'>
                <div className="admin_inventory_table_container">
                    <table className="admin_inventory_table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.map((item, index) => (
                                <tr key={item.product_id}>
                                    <td>{index + 1}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_id}</td>
                                    <td>{item.stocks_in_hand}</td>
                                    <td>{item.product_price}</td>
                                    <td>
                                        <EditIcon onClick={() => EdittogglePopup(item)} style={{ cursor: 'pointer' }} />
                                    </td>
                                    <td>
                                        <DeleteIcon 
                                            onClick={() => handleDeleteClick(item)} 
                                            style={{ cursor: 'pointer', color: 'black' }} // Changed color to black
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> 

            {isAddPopupOpen && <AddProductPopup onClose={AddtogglePopup} />}
            {isEditPopupOpen && <EditProductPopup productData={editProductData} onClose={EdittogglePopup} />}
            {isConfirmDialogOpen && (
                <DeleteProductPopup
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete the product "${deleteProductData?.product_name}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}

export default Inventory;
