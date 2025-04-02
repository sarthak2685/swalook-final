import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AddProductPopup.css";
import Popup from "./Popup";
import config from "../../config";
import CircularProgress from "@mui/material/CircularProgress";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import axios from "axios";

function AddProductPopup({ onClose }) {
    const navigate = useNavigate();
    const [product, setProduct] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [sku, setSKU] = useState("");
    const [invent, setInvent] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("");
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState();
    const [categories, setCategories] = useState([]);
    const [expiryDate, setExpiryDate] = useState("");
    const branchName = localStorage.getItem("branch_name");
    const sname = localStorage.getItem("s-name");
    const bid = localStorage.getItem("branch_id");

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(
                `${config.apiUrl}/api/swalook/product_category/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                console.log("cat", response.data.data);
                if (response.data.status) {
                    setCategories(response.data.data); // Populate categories from API response
                } else {
                    setPopupMessage("Failed to fetch categories.");
                    setShowPopup(true);
                }
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setPopupMessage("Failed to fetch categories.");
                setShowPopup(true);
            });
    }, [bid]);

    const formatDate = (dateString) => {
        let parts;

        // Detect delimiter and split
        if (dateString.includes("/")) {
            parts = dateString.split("/");
        } else if (dateString.includes("-")) {
            parts = dateString.split("-");
        } else {
            return "Invalid Date"; // Handle unexpected cases
        }

        // Ensure three parts exist
        if (parts.length !== 3) return "Invalid Date";

        let [part1, part2, year] = parts.map((num) => parseInt(num, 10));

        // Determine format
        if (part1 > 12) {
            // If the first part is greater than 12, assume DD/MM/YYYY
            return `${year}-${String(part2).padStart(2, "0")}-${String(
                part1
            ).padStart(2, "0")}`;
        } else {
            // Otherwise, assume MM/DD/YYYY
            return `${year}-${String(part1).padStart(2, "0")}-${String(
                part2
            ).padStart(2, "0")}`;
        }
    };

    // Example usage:
    const expiryDates = formatDate(expiryDate);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        const bid = localStorage.getItem("branch_id");
        if (!category) {
            setPopupMessage("Please select a category.");
            setShowPopup(true);
            return;
        }

        const payload = {
            product_name: product,
            product_price: parseFloat(productPrice),
            product_description: description || "",
            product_id: sku || "",
            stocks_in_hand: parseInt(invent, 10),
            unit: unit,
            category: category,
            expiry_date: expiryDate,
        };

        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (response.ok) {
                setPopupMessage("Product added successfully!");
                onClose();
                window.location.reload();
            } else {
                setPopupMessage(result.message || "Failed to add product.");
                console.error("API Error:", result);
            }
        } catch (error) {
            console.error("Network Error:", error);
            setPopupMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setShowPopup(true);
        }
    };
    console.log("i", categories);
    return (
        <div className="ad_p_popup_overlay">
            <div className="ad_p_popup_container">
                <div className="ad_p_popup_header">
                    <h3 className="ad_p_pph3">Add Product</h3>
                    <button className="close_button" onClick={onClose}>
                        <HighlightOffOutlinedIcon />
                    </button>
                </div>
                <hr className="divider" />
                <form onSubmit={handleSubmit}>
                    <div className="adp1">
                        <label htmlFor="product_name">Name:</label>
                        <input
                            type="text"
                            id="product_name"
                            name="product_name"
                            placeholder="Product Name"
                            required
                            onChange={(e) => setProduct(e.target.value)}
                        />
                    </div>
                    <div className="mb-4 flex gap-12">
                        <label
                            htmlFor="category"
                            className="block text-start text-sm font-medium text-gray-700 mb-2"
                        >
                            Category:
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category || ""}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="text-leftw-52 ml-4 px-4 py-2 border text-gray-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="" disabled>
                                Select a Category
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.product_category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="adp2">
                        <label htmlFor="sku">SKU:</label>
                        <input
                            type="text"
                            id="sku"
                            name="sku"
                            placeholder="Id of product"
                            required
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
                            onChange={(e) => setInvent(e.target.value)}
                        />
                    </div>
                    <div className="adp4">
                        <label htmlFor="unit">Unit:</label>
                        <select
                            id="unit"
                            className="text-left text-gray-400"
                            name="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            <option value="">Select Unit</option>
                            <option value="ml">ml</option>
                            <option value="gm">gm</option>
                        </select>
                    </div>
                    <div className="adp4 text-gray-400">
                        <label htmlFor="expiry">Expiry Date:</label>
                        <input
                            type="date"
                            id="expiry"
                            name="expiry"
                            required
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>
                    <div className="adp4">
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            placeholder="Description"
                            required
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="ad_p_button_container">
                        <button
                            className="ad_p_save_button items-center"
                            type="submit"
                        >
                            {loading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {showPopup && (
                <Popup
                    message={popupMessage}
                    onClose={() => {
                        setShowPopup(false);
                        navigate(`/${sname}/${branchName}/inventory`);
                    }}
                />
            )}
        </div>
    );
}

export default AddProductPopup;
