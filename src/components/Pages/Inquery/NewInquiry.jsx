import React, { useState, useRef, useEffect } from "react";
import Header from "../Header";
import VertNav from "../VertNav";
import config from "../../../config";
import { FaTimes } from "react-icons/fa";
import { Multiselect } from "multiselect-react-dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
const NewInquiry = () => {
    const [customerName, setCustomerName] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [comments, setComments] = useState("");
    const [services, setServices] = useState([]);
    const [inquiry, setInquiry] = useState([]);
    const [categoryServices, setCategoryServices] = useState([]);
    const [hasFetchedServicesCategory, setHasFetchedServicesCategory] =
        useState(false);
    const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedServiceValues, setSelectedServiceValues] = useState([]);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const modalRef = useRef(null);
    const [inventoryData, setInventoryData] = useState([]);
    const [product_value, setProductValue] = useState([]);
    const [productData, setProductData] = useState([]);
    const [apiCalled, setApiCalled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [genderFilter, setGenderFilter] = useState([]);
    const [selectedList, setSelectedList] = useState([]);
    const [selectedList2, setSelectedList2] = useState([]);

    const bid = localStorage.getItem("branch_id");
    const [productCategory, setProductCategory] = useState([]);

    const handleClosePopup = () => setIsPopupVisible(false);

    const handleServiceCategoryClick = () => {
        if (!hasFetchedServicesCategory) fetchServiceCategoryData();
    };

    const fetchServiceCategoryData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${config.apiUrl}/api/swalook/table/services/?branch_name=${bid}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok)
                throw new Error(
                    `Failed to fetch categories: ${response.statusText}`
                );
            const result = await response.json();
            if (!result.status || !Array.isArray(result.data))
                throw new Error("Invalid API response format");

            const categoryMap = new Map();
            result.data.forEach((service) => {
                const categoryName =
                    service.category_details?.service_category ||
                    "Uncategorized";
                if (!categoryMap.has(categoryName))
                    categoryMap.set(categoryName, {
                        key: categoryName,
                        value: categoryName,
                        services: [],
                    });
                categoryMap.get(categoryName).services.push({
                    id: service.id,
                    name: service.service || "Unnamed Service",
                    price: service.service_price || 0,
                    duration: service.service_duration || 0,
                    for_men: service.for_men,
                    for_women: service.for_women,
                    quantity: 1,
                    staff: [],
                    note: "No notes added",
                    category: categoryName,
                });
            });

            const categories = Array.from(categoryMap.values());
            setCategoryServices(categories);
            setHasFetchedServicesCategory(true);
        } catch (error) {
            console.error("Error fetching categories:", error.message);
        }
    };

    const fetchData = async () => {
        try {
            if (apiCalled) return; // Prevent duplicate API calls

            const branchName = localStorage.getItem("branch_name");
            const token = localStorage.getItem("token");

            if (!branchName || !token) {
                console.error("Branch name or token is missing.");
                return;
            }

            const response = await fetch(
                `${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch products: ${response.statusText}`
                );
            }

            const result = await response.json();

            console.log("API Response Data: ", result);

            if (!result.status || !Array.isArray(result.data)) {
                throw new Error("Invalid API response format");
            }

            // Transform API response into a structured category-product map
            const categoryMap = new Map();

            result.data.forEach((product) => {
                const categoryName =
                    product.category_details?.product_category ||
                    "Uncategorized";

                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, {
                        key: categoryName,
                        value: categoryName,
                        products: [],
                    });
                }
                // console.log("check", categoryMap,product)
                categoryMap.get(categoryName).products.push({
                    id: product.id,
                    name: product.product_name || "Unnamed Product",
                    price: product.product_price || 0,
                    quantity: 1,
                    staff: [],
                    note: "No notes added",
                    category: categoryName,
                });
            });

            const categories = Array.from(categoryMap.values());

            console.log("Structured Categories: ", categories);

            setProductCategory(categories);
            setHasFetchedProducts(true);
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    };

    const handleGenderFilterToggle = (gender, isChecked) => {
        setGenderFilter((prevFilter) =>
            isChecked
                ? [...prevFilter, gender]
                : prevFilter.filter((g) => g !== gender)
        );
    };

    const filteredCategories = categoryServices.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.services.some((service) =>
                service.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const finalizeSelection = () => {
        setServices(selectedList.map((service) => service.name).join(", "));
        setProductData(selectedList2.map((product) => product.name).join(", "));
        console.log("Selected Services:", selectedList[0].name);
        console.log("Selected Products:", selectedList2);
    };

    const toggleServiceSelection = (service) => {
        if (selectedList.some((s) => s.id === service.id))
            handleServiceSelect(
                selectedList.filter((s) => s.id !== service.id)
            );
        else handleServiceSelect([...selectedList, service]);
    };

    const handleServiceSelect = (selected) => {
        setSelectedServiceValues(selected);
        const updatedServiceList = selected.map((service) => ({
            ...service,
            staff: service.staff || [],
            note: service.note || "No notes added",
            category: service.category,
        }));
        setSelectedList(updatedServiceList);
    };

    const handleProductSelect = (selectedList2) => {
        setProductValue(selectedList2);
        setProductData(
            selectedList2.map((product) => ({
                id: product.key,
                quantity: "",
                unit: product.unit,
                available: product.available || 0,
            }))
        );
    };

    const handleProductInputChange = (index, value) => {
        const updatedProductData = [...productData];
        updatedProductData[index].quantity = value;
        setProductData(updatedProductData);
    };

    const handleProduct_Select = () => setProductModalOpen(false);

    const filteredproduct = productCategory.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.product.some((product) =>
                product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const toggleProductSelection = (product) => {
        setSelectedList2((prevSelected) => {
            const isAlreadySelected = prevSelected.some(
                (p) => p.id === product.id
            );
            return isAlreadySelected
                ? prevSelected.filter((p) => p.id !== product.id)
                : [...prevSelected, product];
        });
    };

    const handleSubmit = async (e) => {
        await addCustomer();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User not authenticated");
            return;
        }
        try {
            const response = await fetch(
                `${config.apiUrl}/api/swalook/enquery/?branch_name=${bid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        customer_name: customerName,
                        mobile_no: mobileNo,
                        comment: comments,
                        query_for: {
                            service: services,
                            product: productData,
                        },
                    }),
                }
            );
            if (!response.ok)
                throw new Error(
                    `Failed to create inquiry: ${response.statusText}`
                );
            toast.success("Inquiry created successfully!");
        } catch (error) {
            console.error("Error creating inquiry:", error.message);
        }
    };

    const addCustomer = async () => {
        const token = localStorage.getItem("token");
        const branchId = localStorage.getItem("branch_id");

        try {
            const response = await axios.post(
                `${config.apiUrl}/api/swalook/loyality_program/customer/?branch_name=${branchId}`,
                {
                    name: customerName,
                    mobile_no: mobileNo,
                    email: " ",
                    membership: "",
                    d_o_b: "",
                    d_o_a: "",
                    coupon: [],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            const { status, data } = response;
            console.log("API Response:", data);

            if (status >= 200 && status < 300 && data.success) {
                return true; // Indicate success
            } else {
                throw new Error(data.message || "Failed to add customer.");
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "An error occurred.";

            console.error("Error:", error.response?.data || error.message);
            return false; // Indicate failure
        }
    };

    return (
        <div className="bg-gray-100">
            <Header />
            <VertNav />
            <ToastContainer />
            <div className="min-h-[150vh] md:ml-72 p-10">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white shadow-lg rounded-[2.5rem] p-6 w-full">
                        <h2 className="text-2xl font-bold mb-4">New Inquiry</h2>

                        <div className="mb-4">
                            <h3 className="font-semibold text-xl mb-2">
                                Customer Details:
                            </h3>
                            <div className="grid-cols-1 md:grid-cols-3 grid md:space-x-2">
                                <input
                                    type="text"
                                    placeholder="Phone Number*"
                                    className="border p-2 rounded-full col-span-1"
                                    value={mobileNo}
                                    onChange={(e) =>
                                        setMobileNo(e.target.value)
                                    }
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="border p-2 rounded-full col-span-1"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-xl mb-2">
                                Inquired About:
                            </h3>
                            <div className="flex-wrap space-x-2">
                                <button
                                    type="button" // Ensure this is type="button"
                                    className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
                                    onClick={() => {
                                        setServiceModalOpen(true);
                                        fetchServiceCategoryData();
                                    }}
                                >
                                    Add Services
                                </button>
                                <button
                                    type="button" // Ensure this is type="button"
                                    className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
                                    onClick={async () => {
                                        await fetchData();
                                        setProductModalOpen(true);
                                    }}
                                >
                                    Add Products
                                </button>
                            </div>
                        </div>

                        {isServiceModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                <div className="bg-white rounded-[2.5rem] p-6 w-4/5 max-w-4xl overflow-y-auto max-h-[90vh]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span></span>
                                        <FaTimes
                                            size={24}
                                            className="text-red-500 cursor-pointer hover:text-red-700"
                                            aria-label="Close Modal"
                                            onClick={() =>
                                                setServiceModalOpen(false)
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                        <h3 className="text-2xl font-bold">
                                            Select Services
                                        </h3>
                                        <input
                                            type="text"
                                            placeholder="Search services or categories..."
                                            className="border border-gray-300 rounded-full px-4 py-2 w-full md:w-1/3"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex mb-4 items-center gap-4">
                                        {["Male", "Female"].map((gender) => (
                                            <label
                                                key={gender}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={genderFilter.includes(
                                                        gender
                                                    )}
                                                    onChange={(e) =>
                                                        handleGenderFilterToggle(
                                                            gender,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                <span>{gender}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredCategories.map((category) => (
                                            <div
                                                key={category.key}
                                                className="bg-gray-100 p-4 rounded-2xl border"
                                            >
                                                <h4 className="text-lg font-semibold mb-4">
                                                    {category.value}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {category.services
                                                        .filter((service) => {
                                                            if (
                                                                genderFilter.length ===
                                                                0
                                                            )
                                                                return true;
                                                            if (
                                                                genderFilter.includes(
                                                                    "Male"
                                                                ) &&
                                                                genderFilter.includes(
                                                                    "Female"
                                                                )
                                                            )
                                                                return true;
                                                            else if (
                                                                genderFilter.includes(
                                                                    "Male"
                                                                )
                                                            )
                                                                return service.for_men;
                                                            else if (
                                                                genderFilter.includes(
                                                                    "Female"
                                                                )
                                                            )
                                                                return service.for_women;
                                                            return false;
                                                        })
                                                        .map((service) => (
                                                            <li
                                                                key={service.id}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <label className="flex items-center gap-3 cursor-pointer">
                                                                    <div className="flex gap-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedList.some(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.id ===
                                                                                    service.id
                                                                            )}
                                                                            onChange={() =>
                                                                                toggleServiceSelection(
                                                                                    service
                                                                                )
                                                                            }
                                                                            className="h-4 w-4"
                                                                        />
                                                                        <p className="font-medium">
                                                                            {
                                                                                service.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </label>
                                                                <p className="text-base font-semibold text-gray-700">
                                                                    ₹
                                                                    {
                                                                        service.price
                                                                    }
                                                                </p>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-semibold">
                                                Selected:{" "}
                                                {selectedList
                                                    .map((s) => s.name)
                                                    .join(", ") || "None"}
                                            </p>
                                            <button
                                                type="button" // Ensure this is type="button"
                                                className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                                                onClick={() => {
                                                    finalizeSelection(
                                                        selectedList
                                                    );
                                                    setServiceModalOpen(false);
                                                }}
                                            >
                                                Add Service
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isProductModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                <div className="bg-white rounded-[2.5rem] p-6 w-4/5 max-w-4xl overflow-y-auto max-h-[90vh]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span></span>
                                        <FaTimes
                                            size={24}
                                            className="text-red-500 cursor-pointer hover:text-red-700"
                                            aria-label="Close Modal"
                                            onClick={() =>
                                                setProductModalOpen(false)
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                        <h3 className="text-2xl font-bold">
                                            Select Products
                                        </h3>
                                        <input
                                            type="text"
                                            placeholder="Search products or categories..."
                                            className="border border-gray-300 rounded-full px-4 py-2 w-full md:w-1/3"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                    {filteredproduct.length === 0 ? (
                                        <p className="text-center text-gray-500">
                                            No products available
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filteredproduct.map((category) => (
                                                <div
                                                    key={category.key}
                                                    className="bg-gray-100 p-4 rounded-full border"
                                                >
                                                    <h4 className="text-lg font-semibold mb-4">
                                                        {category.value}
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {category.products.map(
                                                            (product) => (
                                                                <li
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <label className="flex flex-row items-center gap-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedList2.some(
                                                                                (
                                                                                    p
                                                                                ) =>
                                                                                    p.id ===
                                                                                    product.id
                                                                            )}
                                                                            onChange={() =>
                                                                                toggleProductSelection(
                                                                                    product
                                                                                )
                                                                            }
                                                                            className="h-4 w-4"
                                                                        />
                                                                        <p className="font-medium">
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </p>
                                                                    </label>
                                                                    <p className="text-base font-semibold text-gray-700">
                                                                        ₹
                                                                        {
                                                                            product.price
                                                                        }
                                                                    </p>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-semibold">
                                                Selected:{" "}
                                                {selectedList2
                                                    .map((p) => p.name)
                                                    .join(", ") || "None"}
                                            </p>
                                            <button
                                                type="button" // Ensure this is type="button"
                                                className="bg-blue-500 text-white px-6 py-2 rounded-full"
                                                onClick={() => {
                                                    finalizeSelection(
                                                        selectedList2
                                                    );
                                                    setProductModalOpen(false);
                                                }}
                                            >
                                                Add Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="font-semibold text-xl mb-2">
                                Comments:
                            </h3>
                            <textarea
                                placeholder="Comments"
                                className="border p-4 rounded-2xl w-full h-20"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit" // Ensure this is type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-full"
                            >
                                Create Inquiry
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewInquiry;
