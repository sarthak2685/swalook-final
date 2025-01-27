import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Popup from "./Popup";
import config from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Category } from "@mui/icons-material";

function AddServicePopup({ onClose }) {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [service_price, setServicePrice] = useState("");
  const [service_duration, setServiceDuration] = useState("");
  const [category, setCategory] = useState(); // Now stores only the selected category ID
  const [categories, setCategories] = useState([]); // To store fetched categories
  const [forMen, setForMen] = useState(false); // Gender state for men
  const [forWomen, setForWomen] = useState(false); // Gender state for women
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const branchName = localStorage.getItem("branch_name");
  const sname = localStorage.getItem("s-name");
  const bid = localStorage.getItem("branch_id");

  // Fetch categories on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(
        `${config.apiUrl}/api/swalook/service_category/?branch_name=${bid}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
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

  const handleAddService = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    // Validation for category selection
    if (!category) {
      setPopupMessage("Please select a category.");
      setShowPopup(true);
      return;
    }
  
    // Default gender assignment if none are selected
    const resolvedForMen = forMen || (!forMen && !forWomen); // True if men is selected or none are selected
    const resolvedForWomen = forWomen || (!forMen && !forWomen); // True if women is selected or none are selected
  
    // Prepare the payload
    const payload = {
      service: service,
      service_price: service_price,
      service_duration: service_duration,
      for_men: resolvedForMen,
      for_women: resolvedForWomen,
      category: category,
    };
  
    // Send API request
    axios
      .post(
        `${config.apiUrl}/api/swalook/add/services/?branch_name=${bid}`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        setPopupMessage("Service added successfully!");
        setShowPopup(true);
        onClose();
        // window.location.reload(); // Uncomment if you want to reload the page
      })
      .catch((err) => {
        console.error("Error adding service:", err);
        setPopupMessage("Failed to add service.");
        setShowPopup(true);
      });
  };
  

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-700">Add Service</h3>
          <button className="text-red-500 hover:text-red-700" onClick={onClose}>
            <FontAwesomeIcon icon={faTimesCircle} className="text-3xl" />
          </button>
        </div>
        <hr className="my-4 border-t border-gray-300" />
        <form onSubmit={handleAddService}>
          <div className="mb-4">
            <label
              htmlFor="service_name"
              className="block text-start text-lg font-medium text-gray-700 mb-2"
            >
              Service Name:
            </label>
            <input
              type="text"
              id="service_name"
              name="service_name"
              placeholder="Service Name"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setService(e.target.value)}
            />
          </div>
          {/* Category dropdown */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-start text-lg font-medium text-gray-700 mb-2"
            >
              Category:
            </label>
            <select
              id="category"
              name="category"
              value={category || ""} // Directly store the ID
              onChange={(e) => setCategory(e.target.value)} // Set only the ID
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.service_category}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="duration"
              className="block text-start text-lg font-medium text-gray-700 mb-2"
            >
              Duration:
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              placeholder="Duration (min)"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setServiceDuration(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-start text-lg font-medium text-gray-700 mb-2"
            >
              Price:
            </label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder="Price"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setServicePrice(e.target.value)}
            />
          </div>

          {/* Gender Selection */}
          <div className="mb-4">
            <span className="block text-lg font-medium text-gray-700 mb-2">
              Available For:
            </span>
            <label className="flex flex-row items-center mr-4">
              <input
                type="checkbox"
                name="for_men"
                checked={forMen}
                onChange={() => setForMen(!forMen)} // Toggle for men
                className="form-checkbox text-indigo-500"
              />
              <span className="ml-2 text-gray-700">Men</span>
            </label>
            <label className="flex flex-row items-center">
              <input
                type="checkbox"
                name="for_women"
                checked={forWomen}
                onChange={() => setForWomen(!forWomen)} // Toggle for women
                className="form-checkbox text-indigo-500"
              />
              <span className="ml-2 text-gray-700">Women</span>
            </label>
          </div>

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
            navigate(`/${sname}/${branchName}/service`);
          }}
        />
      )}
    </div>
  );
}

export default AddServicePopup;
