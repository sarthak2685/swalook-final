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
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
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
          category: service.category?.service_category || "Uncategorized",
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

  const AddtogglePopup = () => setIsAddPopupOpen((prev) => !prev);
  const AddtogglePopup2 = () => setIsAddPopupOpen2((prev) => !prev);

  const EdittogglePopup = (id, serviceName, serviceDuration, servicePrice, category) => {
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
      await axios.delete(`${config.apiUrl}/api/swalook/delete/services/?id=${serviceToDelete.id}`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFetchService((prevServices) => prevServices.filter(service => service.id !== serviceToDelete.id));
      setIsDeleteConfirmationOpen(false); // Close the confirmation modal after deletion
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  return (
    <>
      <Header />
      <VertNav />
      <div className="md:ml-72 p-10">
        <Helmet>
          <title>Services</title>
        </Helmet>
        <div className="flex flex-row justify-between items-center my-6">
          <h1 className="text-2xl font-bold text-gray-700">Service Details</h1>
          <div className="justify-between space-x-4">
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={AddtogglePopup}
          >
            Add Service
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={AddtogglePopup2}
          >
            Add Category
          </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-full mx-auto bg-white rounded-lg shadow-md">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Service Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Duration</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-center">Edit</th>
                <th className="py-3 px-4 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    <CircularProgress />
                  </td>
                </tr>
              ) : fetchService.length > 0 ? (
                fetchService.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <td className="py-3 px-4">{service.service}</td>
                    <td className="py-3 px-4">{service.category}</td>
                    <td className="py-3 px-4">{service.service_duration}</td>
                    <td className="py-3 px-4">{service.service_price}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-600">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* In-line confirmation modal */}
        {isDeleteConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Are you sure you want to delete this service?</h3>
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

        {isAddPopupOpen && <AddServicePopup onClose={AddtogglePopup} />}
        {isAddPopupOpen2 && <AddCategoryPopup onClose={AddtogglePopup2} />}

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
