import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from './Header';
import VertNav from './VertNav';
import AddProductPopup from './AddProductPopup';
import DeleteProductPopup from './DeleteProductPopup';
import EditProductPopup from './EditProductPopup';
import config from '../../config';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Category from "./InventoryCategory";

function Inventory() {
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editProductData, setEditProductData] = useState(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [deleteProductData, setDeleteProductData] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isAddPopupOpen2, setIsAddPopupOpen2] = useState(false);


    const bid = localStorage.getItem('branch_id');

    const AddtogglePopup = () => setIsAddPopupOpen(!isAddPopupOpen);
    const AddtogglePopup2 = () => setIsAddPopupOpen2((prev) => !prev);

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

        if (!productId) return;

        try {
            const response = await fetch(`${config.apiUrl}/api/swalook/inventory/product/?id=${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setInventoryData(inventoryData.filter(item => item.product_id !== productId));
                window.location.reload();
            }
        } catch (error) {
            console.error(`Error deleting product:`, error);
        }
        setIsConfirmDialogOpen(false);
    };

    const handleCancelDelete = () => setIsConfirmDialogOpen(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    }
                });

                const data = await response.json();
                setInventoryData(data.data);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            }
        };
        fetchData();
    }, []);

    const groupedInventory = inventoryData.reduce((acc, item) => {
        const category = item.category_details?.product_category || 'Uncategorized';
        console.log("h",category);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <>
            <Helmet><title>Inventory</title></Helmet>
            <Header />
            <VertNav />

            <div className="p-4 md:p-8  min-h-screen">
                <div className="flex flex-wrap justify-between items-center my-6 ml-0 md:ml-[19rem]">
                    <h1 className="text-2xl font-bold">Inventory Details</h1>
                    <div className="flex space-x-4">
                        <button
              className="bg-indigo-500 text-white items-center mb-4 my-6 px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={AddtogglePopup2}
            >
              Add Category
            </button>   
            <button onClick={AddtogglePopup} className="bg-indigo-500 text-white items-center mb-4 my-6 px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Add</button>
            </div>
                </div>

                <div className="overflow-x-auto ml-0 md:ml-[19rem]">
                    {Object.keys(groupedInventory).map((category) => (
                        <div key={category} className="mb-8">
                            <h2 className="text-xl font-semibold  py-2 px-4 rounded-t-lg">{category}</h2>
                            <table className="min-w-full bg-white rounded-b-lg ">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="py-2 px-4 border">S.No</th>
                                        <th className="py-2 px-4 border">Name</th>
                                        <th className="py-2 px-4 border">SKU</th>
                                        <th className="py-2 px-4 border">Quantity</th>
                                        <th className="py-2 px-4 border">Price</th>
                                        <th className="py-2 px-4 border">Edit</th>
                                        <th className="py-2 px-4 border">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedInventory[category].map((item, index) => (
                                        <tr key={item.product_id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 text-center border">{index + 1}</td>
                                            <td className="py-2 px-4 text-center border">{item.product_name}</td>
                                            <td className="py-2 px-4 text-center border">{item.product_id}</td>
                                            <td className="py-2 px-4 text-center border ">{item.stocks_in_hand}</td>
                                            <td className="py-2 px-4 text-center border">₹{item.product_price}</td>
                                            <td className="py-2 px-4 text-center border">
                                                <EditIcon onClick={() => EdittogglePopup(item)} className="text-blue-500 cursor-pointer" />
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                <DeleteIcon onClick={() => handleDeleteClick(item)} className="text-red-500 cursor-pointer" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                {isAddPopupOpen && <AddProductPopup onClose={AddtogglePopup} />}
                {isAddPopupOpen2 && <Category onClose={AddtogglePopup2} />}
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
        </>
    );
}

export default Inventory;
