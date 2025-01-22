import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import config from '../../config';
import Header from './Header';
import VertNav from './VertNav';


function CLP_Setting() {
  const [fetchedRows, setFetchedRows] = useState([]);
  const [couponRows, setCouponRows] = useState([]);
  const bid = localStorage.getItem('branch_id');

  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    membershipName: "",
    charges: "",
    expiry: "",
    benefit: "",
    isActive: false,
  });

  const [couponFormData, setCouponFormData] = useState({
    couponName: "",
    charges: "",
    balance: "",
    isActive: false,
  });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    console.log("Form Data:", formData);
    setModalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${bid}`;
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        });
        if (response.data.status) {
          setFetchedRows(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [bid]);

  const [showCouponModal, setShowCouponModal] = useState(false);

  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
  };

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
  };

  useEffect(() => {
    const fetchCouponData = async () => {
      const apiEndpoint = `${config.apiUrl}/api/swalook/coupon/?branch_name=${bid}`;
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        });
        if (response.data.status) {
          setCouponRows(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching coupon data:', error);
      }
    };

    fetchCouponData();
  }, [bid]);

  const handleSaveMembership = async () => {
    const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/`;
    const payload = {
      program_type: formData.membershipName,
      price: formData.charges,
      expiry_duration: formData.expiry,
      benefits: formData.benefit,
      active: formData.isActive,
      branch_id: bid,
    };

    try {
      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.status) {
        setFetchedRows((prev) => [...prev, response.data.data]);
        setModalOpen(false);
        setFormData({
          membershipName: "",
          charges: "",
          expiry: "",
          benefit: "",
          isActive: false,
        });
      }
    } catch (error) {
      console.error('Error saving membership:', error);
    }
  };

  const handleSaveCoupon = async () => {
    const apiEndpoint = `${config.apiUrl}/api/swalook/coupon/`;
    const payload = {
      coupon_name: couponFormData.couponName,
      charges: couponFormData.charges,
      balance: couponFormData.balance,
      active: couponFormData.isActive,
      branch_id: bid,
    };

    try {
      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.status) {
        setCouponRows((prev) => [...prev, response.data.data]);
        setShowCouponModal(false);
        setCouponFormData({
          couponName: "",
          charges: "",
          balance: "",
          isActive: false,
        });
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };


  return (
    <>
      <Header />
      <VertNav />

      <div className="flex min-h-screen">
        <div className="flex-1 bg-gray-100 p-6 md:ml-72 ml-0">
          <Helmet>
            <title>CLP Settings</title>
          </Helmet>

          <div className="mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-0">
                Memberships
              </h1>
              <button
                onClick={handleOpenModal}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                + New Membership
              </button>

            </div>
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Membership</h2>
                    <button onClick={handleCloseModal} className="text-5xl hover:text-black text-red-700">
                      &times;
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      name="membershipName"
                      value={formData.membershipName}
                      onChange={handleInputChange}
                      placeholder="Membership Name"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      name="charges"
                      value={formData.charges}
                      onChange={handleInputChange}
                      placeholder="Charges"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="Expiry (in Months)"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <select
                      name="benefit"
                      value={formData.benefit}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select Benefit</option>
                      <option value="Points Balance">Points Balance per Rs. 100</option>
                      <option value="Discount">Discount & Limit</option>
                    </select>
                    {formData.benefit === "Points Balance" && (
                      <input
                        type="number"
                        name="pointsBalance"
                        value={formData.pointsBalance || ""}
                        onChange={handleInputChange}
                        placeholder="Points per Rs. 100 spent"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    )}
                    {formData.benefit === "Discount" && (
                      <>
                        <input
                          type="number"
                          name="discountPercentage"
                          value={formData.discountPercentage || ""}
                          onChange={handleInputChange}
                          placeholder="Discount %"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                        <input
                          type="number"
                          name="limit"
                          value={formData.limit || ""}
                          onChange={handleInputChange}
                          placeholder="Limit"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </>
                    )}
                    <label className="flex flex-row text-xl space-x-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="form-checkbox text-blue-600"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveMembership}
                    className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-600">
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      Membership Name
                    </th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      Expiry (in Months)
                    </th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      Charges
                    </th>
                    {/* <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      GST %
                    </th> */}
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      Benefits
                    </th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedRows.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-3 px-4 text-xs sm:text-xl font-semibold text-gray-700">
                        {row.program_type}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        {row.expiry_duration}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        Rs. {row.price}
                      </td>
                      {/* <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        {row.gst || '-'}
                      </td> */}
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        {row.benefits}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl">
                        <span
                          className={`inline-block w-20 px-3 py-1 border rounded-lg text-xs font-medium text-white text-center ${row.active ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'
                            }`}
                        >
                          {row.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2 sm:mb-0">
                Coupons
              </h1>
              <button
                onClick={handleOpenCouponModal}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                + New Coupons
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-600">
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Coupon Name</th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Expiry (in Months)</th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Charges</th>
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Balance</th>
                    {/* <th className="py-3 px-4 font-semibold text-xs sm:text-xl">GST %</th> */}
                    <th className="py-3 px-4 font-semibold text-xs sm:text-xl">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {couponRows.map((coupon) => (
                    <tr key={coupon.id} className="border-b">
                      <td className="py-3 px-4 text-xs sm:text-xl font-semibold text-gray-700">
                        {coupon.coupon_name}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        {coupon.expiry_duration}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        Rs. {coupon.charges}
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        Rs. {coupon.balance}
                      </td>
                      {/* <td className="py-3 px-4 text-xs sm:text-xl text-gray-700">
                        {coupon.gst || '-'}
                      </td> */}
                      <td className="py-3 px-4 text-xs sm:text-xl">
                        <span
                          className={`inline-block w-20 px-3 py-1 border rounded-lg text-xs font-medium text-white text-center ${coupon.active ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'
                            }`}
                        >
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showCouponModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                    <button
                      className="absolute top-4 right-4 text-5xl hover:text-black text-red-700"
                      onClick={handleCloseCouponModal}
                    >
                      &times;
                    </button>
                    <h3 className="text-xl font-semibold mb-4 text-center">Coupon</h3>
                    <form>
                      <div className="mb-4">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                          placeholder="Enter coupon name"
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                          placeholder="Enter charges"
                          onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))}
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-blue-500"
                          placeholder="Enter balance"
                          onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))}
                        />
                      </div>
                      <div className="mb-6 flex items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                          id="activeCheckbox"
                        />
                        <label
                          htmlFor="activeCheckbox"
                          className="ml-2 text-gray-700 font-medium text-xl"
                        >
                          Active
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                        onClick={handleSaveCoupon}
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CLP_Setting;
