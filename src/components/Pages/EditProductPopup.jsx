import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";
import config from "../../config";
import CircularProgress from "@mui/material/CircularProgress";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

function EditProductPopup({ onClose, productData }) {
    const navigate = useNavigate();
    const [product, setProduct] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [sku, setSKU] = useState("");
    const [invent, setInvent] = useState("");
    const [description, setDescription] = useState("");
    const [unit, setUnit] = useState("");
    const [category, setCategory] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const branchName = localStorage.getItem("branch_name");
    console.log("productgfhdf", productData);
    useEffect(() => {
        if (productData) {
            setProduct(productData.product_name || "");
            setProductPrice(productData.product_price || "");
            setSKU(productData.product_id || "");
            setInvent(productData.stocks_in_hand || "");
            setDescription(productData.product_description || "");
            setUnit(productData.unit || "");
            setCategory(productData.category_details || "");
        }
    }, [productData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (parseInt(invent, 10) < 0) {
            setPopupMessage("Quantity cannot be negative.");
            setShowPopup(true);
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/inventory/product/?id=${productData.id}&branch_name=${branchName}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        product_name: product,
                        product_price: productPrice,
                        product_description: description,
                        product_id: sku,
                        stocks_in_hand: parseInt(invent, 10),
                        unit: unit,
                        category: category.id,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                setPopupMessage("Product updated successfully!");
                setShowPopup(true);
                onClose();
                window.location.reload();
            } else {
                setPopupMessage("Failed to update product.");
                setShowPopup(true);
            }
        } catch (error) {
            setPopupMessage("An error occurred.");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Product</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-red-500"
                    >
                        <HighlightOffOutlinedIcon />
                    </button>
                </div>
                <hr className="mb-4" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">
                            Category:
                        </label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                            {category.product_category ||
                                "No Category Assigned"}
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Name:</label>
                        <input
                            type="text"
                            placeholder="Product Name"
                            required
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">SKU:</label>
                        <input
                            type="text"
                            placeholder="Id of product"
                            required
                            value={sku}
                            onChange={(e) => setSKU(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Price:</label>
                        <input
                            type="number"
                            placeholder="Price"
                            required
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">
                            Quantity:
                        </label>
                        <input
                            type="number"
                            placeholder="Quantity"
                            required
                            value={invent}
                            onChange={(e) => setInvent(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Unit:</label>
                        <select
                            required
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                                unit === ""
                                    ? "border-red-500 ring-red-300"
                                    : "border-gray-300 focus:ring-blue-400"
                            }`}
                        >
                            <option value="">Select unit</option>
                            <option value="ml">ml</option>
                            <option value="gm">gm</option>
                        </select>
                        {unit === "" && (
                            <p className="text-sm text-red-600 mt-1">
                                Unit is required
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            Description:
                        </label>
                        <input
                            placeholder="Product Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2"
                        >
                            {loading ? (
                                <CircularProgress size={20} />
                            ) : (
                                "Update Product"
                            )}
                        </button>
                    </div>
                </form>
                {showPopup && (
                    <Popup
                        message={popupMessage}
                        onClose={() => setShowPopup(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default EditProductPopup;
