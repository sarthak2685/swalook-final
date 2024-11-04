import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/EditProductPopup.css';
import Popup from './Popup';
import config from '../../config';
import CircularProgress from '@mui/material/CircularProgress';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'; // Import the icon

function EditProductPopup({ onClose, productData }) {
    const navigate = useNavigate();
    const [product, setProduct] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [sku, setSKU] = useState('');
    const [invent, setInvent] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const branchName = localStorage.getItem('branch_name');
    const sname = localStorage.getItem('s-name');

    useEffect(() => {
        if (productData) {
            setProduct(productData.product_name || '');
            setProductPrice(productData.product_price || '');
            setSKU(productData.product_id || '');
            setInvent(productData.stocks_in_hand || '');
            setDescription(productData.product_description || '');
            setUnit(productData.unit || '');
        }
    }, [productData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (parseInt(invent, 10) < 0) {
            setPopupMessage('Quantity cannot be negative.');
            setShowPopup(true);
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${config.apiUrl}/api/swalook/inventory/product/?id=${productData.id}&branch_name=${branchName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_name: product,
                    product_price: productPrice,
                    product_description: description,
                    product_id: sku,
                    stocks_in_hand: parseInt(invent, 10),
                    unit: unit
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setPopupMessage('Product updated successfully!');
                setShowPopup(true);
                onClose();
                window.location.reload();
            } else {
                setPopupMessage('Failed to update product.');
                setShowPopup(true);
            }
        } catch (error) {
            setPopupMessage('An error occurred.');
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ad_p_popup_overlay">
            <div className="ad_p_popup_container">
                <div className="ad_p_popup_header">
                    <div className='ad_p_pph3'>
                        <h3>Edit Product</h3>
                    </div>
                    <button className="close_button" onClick={onClose}>
                        <HighlightOffOutlinedIcon /> {/* Use the icon here */}
                    </button>
                </div>
                <hr />
                <form onSubmit={handleSubmit}>
                    <div className="adp1">
                        <label htmlFor="product_name">Name:</label>
                        <input
                            type="text"
                            id="product_name"
                            name="product_name"
                            placeholder='Product Name'
                            required
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                        />
                    </div>
                    <div className="adp2">
                        <label htmlFor="sku">SKU:</label>
                        <input
                            type="text"
                            id="sku"
                            name="sku"
                            placeholder="Id of product"
                            required
                            value={sku}
                            onChange={(e) => setSKU(e.target.value)}
                        />
                    </div>
                    <div className="adp3">
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            placeholder="Price"
                            required
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                        />
                    </div>
                    <div className="adp4">
                        <label htmlFor="invent">Quantity:</label>
                        <input
                            type="number"
                            id="invent"
                            name="invent"
                            placeholder="Quantity"
                            required
                            value={invent}
                            onChange={(e) => setInvent(e.target.value)}
                        />
                    </div>
                    <div className="adp4">
                        <label htmlFor="unit">Unit:</label>
                        <select
                            className={`status-dropdown ${unit === "" ? "error" : ""}`}
                            id="unit"
                            name="unit"
                            required
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            <option value="">Select unit</option>
                            <option value="ml">ml</option>
                            <option value="gm">gm</option>
                        </select>
                        {unit === "" && <span className="error-message">Unit is required</span>}
                    </div>
                    <div className="adp4">
                        <label htmlFor="description">Description:</label>
                        <input
                            id="description"
                            name="description"
                            placeholder="Product Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                    </div>
                    <div className="adp6">
                        <button type="submit" className="submit_button">
                            {loading ? <CircularProgress size={24} /> : 'Update Product'}
                        </button>
                    </div>
                </form>
                {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
            </div>
        </div>
    );
}

export default EditProductPopup;
