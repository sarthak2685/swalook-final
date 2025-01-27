import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

function EditServicePopup({ onClose, serviceData }) {
  const [serviceN, setServiceN] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [forMen, setForMen] = useState(false); // Gender state for men
  const [forWomen, setForWomen] = useState(false); // Gender state for women
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [categories, setCategories] = useState([]); // To store fetched categories

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

  // Pre-fill the form with existing service data
  useEffect(() => {
    if (serviceData) {
      setServiceN(serviceData.serviceName);
      setServiceDuration(serviceData.serviceDuration);
      setServicePrice(serviceData.servicePrice);
      setServiceCategory(serviceData.serviceCategory);
      setForMen(serviceData.forMen || false); // Set initial gender values
      setForWomen(serviceData.forWomen || false);
    }
  }, [serviceData]);

  const handleSaveService = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validation for category selection
    if (!serviceCategory) {
      setPopupMessage("Please select a category.");
      setShowPopup(true);
      return;
    }

    // Resolve gender defaults if none are selected
    const resolvedForMen = forMen || (!forMen && !forWomen); // Default to true for men if none are selected
    const resolvedForWomen = forWomen || (!forMen && !forWomen); // Default to true for women if none are selected

    const data = {
      service: serviceN || serviceData.serviceName,
      service_price:
        servicePrice !== "" ? servicePrice : serviceData.service_price,
      service_duration:
        serviceDuration !== "" ? serviceDuration : serviceData.service_duration,
      service_category: serviceCategory || serviceData.serviceCategory,
      for_men: resolvedForMen, // Use resolved gender states
      for_women: resolvedForWomen,
    };

    axios
      .put(
        `${config.apiUrl}/api/swalook/edit/services/?branch_name=${bid}&id=${serviceData.id}`,
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setPopupMessage("Service edited successfully!");
        setShowPopup(true);
        onClose(); // Close the popup after successful editing
        window.location.reload(); // Reload the page to reflect the changes
      })
      .catch((err) => {
        setPopupMessage("Failed to edit service.");
        setShowPopup(true);
        console.error(err);
      });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Edit Service</h3>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-800 transition-colors"
          >
            <FontAwesomeIcon icon={faTimesCircle} className="text-3xl" />
          </button>
        </div>

        <form onSubmit={handleSaveService} className="space-y-4">
          {/* Service Name */}
          <div>
            <label
              htmlFor="service_name"
              className="block text-start text-lg font-medium text-gray-700 mb-4"
            >
              Service Name
            </label>
            <input
              type="text"
              id="service_name"
              name="service_name"
              placeholder="Enter Service Name"
              value={serviceN}
              onChange={(e) => setServiceN(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-start text-lg font-medium text-gray-700 mb-4"
            >
              Duration (min)
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              placeholder="Enter Duration"
              value={serviceDuration}
              onChange={(e) => setServiceDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-start text-lg font-medium text-gray-700 mb-4"
            >
              Price (₹)
            </label>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="Enter Price"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-start text-lg font-medium text-gray-700 mb-4"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={serviceCategory} // Bind the selected category to the state
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select a Category
              </option>
              {categories.map((category, index) => (
                <option
                  key={index}
                  value={category.id}
                  selected={serviceCategory === category.id} // Mark the option as selected
                >
                  {category.service_category}
                </option>
              ))}
            </select>
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
                checked={forMen} // Pre-fill the checkbox for men
                onChange={() => setForMen(!forMen)} // Toggle for men
                className="form-checkbox text-indigo-500"
              />
              <span className="ml-2 text-gray-700">Men</span>
            </label>
            <label className="flex flex-row items-center">
              <input
                type="checkbox"
                name="for_women"
                checked={forWomen} // Pre-fill the checkbox for women
                onChange={() => setForWomen(!forWomen)} // Toggle for women
                className="form-checkbox text-indigo-500"
              />
              <span className="ml-2 text-gray-700">Women</span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>

        {/* Popup Message */}
        {showPopup && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-2">
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="text-gray-500 cursor-pointer"
                onClick={() => setShowPopup(false)}
              />
              <p className="text-gray-800">{popupMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditServicePopup;
