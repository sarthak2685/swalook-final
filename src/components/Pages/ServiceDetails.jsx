import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "./Header";
import AddServicePopup from "./AddServicePopup";
import AddCategoryPopup from "./AddCategoryPopup";
import EditServicePopup from "./EditServicePopup";
import { Helmet } from "react-helmet";
import config from "../../config";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import VertNav from "./VertNav";

function ServiceDetails() {
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isAddPopupOpen2, setIsAddPopupOpen2] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [fetchService, setFetchService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editServiceData, setEditServiceData] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const hasFetched = useRef(false);
  const bid = localStorage.getItem("branch_id");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const services = response.data.data.map((service) => ({
          id: service.id,
          service: service.service,
          service_duration: service.service_duration,
          service_price: service.service_price,
          category:
            service.category_details?.service_category || "Uncategorized",
        }));

        setFetchService(services);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetched.current) fetchData();
  }, [bid]);

  function groupByCategory(services) {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
  }

  const AddtogglePopup = () => setIsAddPopupOpen((prev) => !prev);
  const AddtogglePopup2 = () => setIsAddPopupOpen2((prev) => !prev);

  const EdittogglePopup = (
    id,
    serviceName,
    serviceDuration,
    servicePrice,
    category
  ) => {
    setIsEditPopupOpen((prev) => !prev);
    setEditServiceData({
      id,
      serviceName,
      serviceDuration,
      servicePrice,
      category,
    });
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${config.apiUrl}/api/swalook/delete/services/?id=${serviceToDelete.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFetchService((prevServices) =>
        prevServices.filter((service) => service.id !== serviceToDelete.id)
      );
      setIsDeleteConfirmationOpen(false); // Close the confirmation modal after deletion
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const filteredServices = fetchService.filter(
    (service) =>
      service.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />
      <VertNav />
      <div className="md:ml-72 p-10">
        <Helmet>
          <title>Services</title>
        </Helmet>
        {/* Add Service, Add Category, and Search Bar */}
        <div className="flex flex-wrap justify-between items-center my-6">
          <h1 className="text-2xl font-bold text-gray-700">Service Details</h1>
          <div className="flex flex-row items-center justify-end space-x-4">
            <input
              type="text"
              className="border border-gray-300 rounded-md items-center mx-2 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Search services or categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="bg-indigo-500 text-white items-center mb-4 my-6 px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={AddtogglePopup2}
            >
              Add Category
            </button>
            <button
              className="bg-indigo-500 text-white items-center mb-4 my-6 px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={AddtogglePopup}
            >
              Add Service
            </button>
          </div>
        </div>

        {/* Display tables for each category */}
        {loading ? (
          <div className="text-center py-6">
            <CircularProgress />
          </div>
        ) : (
          Object.entries(groupByCategory(filteredServices)).map(
            ([category, services]) => (
              <div key={category} className="mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full justify-between bg-white rounded-lg shadow-md">
                    <thead className="py-3 px-4 text-left text-xl font-bold text-gray-700 mb-4">
                      <th>{category}</th>
                    </thead>
                    <thead className="bg-gray-100 text-gray-600 text-sm">
                      <tr>
                        <th className="py-3 px-4 text-left">Service Name</th>
                        <th className="py-3 px-4 text-left">Duration</th>
                        <th className="py-3 px-4 text-left">Price</th>
                        <th className="py-3 px-4 text-center">Edit</th>
                        <th className="py-3 px-4 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services
                        .sort((a, b) => a.service_price - b.service_price)
                        .map((service) => (
                          <tr
                            key={service.id}
                            className="hover:bg-gray-50 border-b border-gray-200"
                          >
                            <td className="py-3 px-4">{service.service}</td>
                            <td className="py-3 px-4">
                              {service.service_duration} min
                            </td>
                            <td className="py-3 px-4">
                              Rs. {service.service_price}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <EditIcon
                                onClick={() =>
                                  EdittogglePopup(
                                    service.id,
                                    service.service,
                                    service.service_duration,
                                    service.service_price,
                                    service.category
                                  )
                                }
                                className="text-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <DeleteIcon
                                onClick={() => {
                                  setServiceToDelete(service);
                                  setIsDeleteConfirmationOpen(true);
                                }}
                                className="text-red-500 cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )
        )}

        {/* Delete confirmation modal */}
        {isDeleteConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Are you sure you want to delete this service?
              </h3>
              <div className="flex justify-end">
                <button
                  className="mr-2 text-gray-500"
                  onClick={() => setIsDeleteConfirmationOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  onClick={handleDeleteService}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Service and Add Category popups */}
        {isAddPopupOpen && <AddServicePopup onClose={AddtogglePopup} />}
        {isAddPopupOpen2 && <AddCategoryPopup onClose={AddtogglePopup2} />}

        {/* Edit Service popup */}
        {isEditPopupOpen && (
          <EditServicePopup
            serviceData={editServiceData}
            onClose={EdittogglePopup}
          />
        )}
      </div>
    </>
  );
}

export default ServiceDetails;
