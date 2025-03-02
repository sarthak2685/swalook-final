import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from "./Popup";
import config from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

function InventoryCategory({ onClose }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState(""); // Category input state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const bid = localStorage.getItem("branch_id");


  const branchName = localStorage.getItem("branch_name");
  const sname = localStorage.getItem("s-name");

  const handleAddCategory = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!category) {
      setPopupMessage("Please enter a category.");
      setShowPopup(true);
      return;
    }

    // API Call to create category
    axios
      .post(
        `${config.apiUrl}/api/swalook/product_category/?branch_name=${bid}`,
        {
            product_category: category,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const newCategoryId = response.data.id; // Assuming the server returns the ID
        console.log("New Category ID:", newCategoryId);
        setPopupMessage("Category added successfully!");
        setShowPopup(true);
        onClose();
        // window.location.reload();
 
    })
    
      .then(() => {
        setPopupMessage("Category added successfully!");
        setShowPopup(true);
        onClose(); // Close the popup

      })
      .catch((err) => {
        console.error("Error adding category:", err);
        setPopupMessage("Failed to create category. Please try again.");
        setShowPopup(true);
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-700">Add Category</h3>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="text-3xl" />
          </button>
        </div>
        <hr className="my-4 border-t border-gray-300" />
        <form onSubmit={handleAddCategory}>
          {/* Category Input Field */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-start text-lg font-medium text-gray-700 mb-2"
            >
              Category:
            </label>
            <input
              type="text"
              id="category"
              name="category"
              placeholder="Category (e.g., Hair, Nail, Massage)"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Popup */}
      {showPopup && (
        <Popup
          message={popupMessage}
          onClose={() => {
            setShowPopup(false);
            if (popupMessage === "Category added successfully!") {
              navigate(`/${sname}/${branchName}/inventory`); 
            }
          }}
        />
      )}

    </div>
  );
}

export default InventoryCategory;
