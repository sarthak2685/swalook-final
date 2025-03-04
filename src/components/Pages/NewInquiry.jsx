import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import VertNav from "./VertNav";
import config from "../../config";
import { FaTimes } from "react-icons/fa";
import { Multiselect } from "multiselect-react-dropdown";

const NewInquiry = () => {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [comments, setComments] = useState("");
    const [services, setServices] = useState([]);
    const [inquiry, setInquiry] = useState([]);
    const [categoryServices, setCategoryServices] = useState([]);
    const [hasFetchedServicesCategory, setHasFetchedServicesCategory] =
        useState(false);
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
    const bid = localStorage.getItem("branch_id");
    const [productCategory, setProductCategory] = useState([]);

    // Update appointment state when services change
    useEffect(() => {
        const NewInquiry = [
            ...services.map((service) => ({
                name: service.name,
                category: service.category,
                price: service.price,
                staff: service.service_by,
            })),
        ];
        setInquiry(NewInquiry);
    }, [services]);

    // Handle close popup
    const handleClosePopup = () => {
        setIsPopupVisible(false);
    };

    // Fetch service category data
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

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch categories: ${response.statusText}`
                );
            }

            const result = await response.json();

            if (!result.status || !Array.isArray(result.data)) {
                throw new Error("Invalid API response format");
            }

            // Transform API response into a structured category-service map
            const categoryMap = new Map();

            result.data.forEach((service) => {
                const categoryName =
                    service.category_details?.service_category ||
                    "Uncategorized";

                if (!categoryMap.has(categoryName)) {
                    categoryMap.set(categoryName, {
                        key: categoryName,
                        value: categoryName,
                        services: [],
                    });
                }

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
            if (apiCalled) return; // Prevent redundant API calls

            const branchName = localStorage.getItem("branch_name");
            const token = localStorage.getItem("token");

            // Validate necessary data
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
                console.error(
                    `API Error: ${response.status} - ${response.statusText}`
                );
                return;
            }

            const data = await response.json();

            // Transform and set inventory data
            const formattedData =
                data.data?.map((product) => ({
                    key: product.id,
                    value: product.product_name,
                    unit: product.unit,
                    quantity: product.stocks_in_hand,
                })) || [];

            setInventoryData(formattedData);
            setApiCalled(true); // Mark API as called
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        }
    };
    // Handle gender filter toggle
    const handleGenderFilterToggle = (gender, isChecked) => {
        setGenderFilter((prevFilter) => {
            if (isChecked) {
                return [...prevFilter, gender];
            } else {
                return prevFilter.filter((g) => g !== gender);
            }
        });
    };

    // Filtered categories based on search and gender filter
    const filteredCategories = categoryServices.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.services.some((service) =>
                service.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    // Finalize service selection
    const finalizeSelection = () => {
        setServices(selectedList); // Correcting the variable
        console.log("Selected Services:", selectedList);
    };

    // Toggle service selection
    const toggleServiceSelection = (service) => {
        if (selectedList.some((s) => s.id === service.id)) {
            handleServiceSelect(
                selectedList.filter((s) => s.id !== service.id)
            );
        } else {
            handleServiceSelect([...selectedList, service]);
        }
    };

    // Handle service selection
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

    console.log("Inquiry", inquiry);

    const handleProductSelect = (selectedList) => {
        setProductValue(selectedList);
        // Initialize productData with the selected products and reset quantities
        setProductData(
            selectedList.map((product) => ({
                id: product.key,
                quantity: "", // Initialize with empty quantity
                unit: product.unit,
                available: product.available || 0, // Assuming product has available stock
            }))
        );
    };

    const handleProductInputChange = (index, value) => {
        const updatedProductData = [...productData];
        updatedProductData[index].quantity = value;
        setProductData(updatedProductData);
    };

    console.log(productData);

    const handleProduct_Select = () => {
        // Action after selecting products
        setProductModalOpen(false);
    };

    const filteredproduct = productCategory.filter(
        (category) =>
            category.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.product.some((product) =>
                product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );
    const toggleProductSelection = (product) => {
        setSelectedList((prevSelected) => {
            const isAlreadySelected = prevSelected.some(
                (p) => p.id === product.id
            );

            if (isAlreadySelected) {
                return prevSelected.filter((p) => p.id !== product.id);
            } else {
                return [...prevSelected, product];
            }
        });
    };

    return (
        <div className="bg-gray-100">
            <Header />
            <VertNav />
            <div className=" min-h-screen flex-grow md:ml-72 p-10">
                <div className="bg-white shadow-lg rounded-lg p-6 w-full">
                    <h2 className="text-xl font-bold mb-4">New Inquiry</h2>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">
                            Customer Details:
                        </h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Phone Number*"
                                className="border p-2 rounded-lg flex-1"
                                value={phone}
                                onChange={(e) => setMobileNo(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Name"
                                className="border p-2 rounded-lg flex-1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Inquired About:</h3>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                                onClick={() => {
                                    setServiceModalOpen(true); // Open the modal
                                    fetchServiceCategoryData(); // Fetch category data
                                }}
                                required
                            >
                                Add Services
                            </button>
                            <button
                                type="button"
                                className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition duration-300"
                                onClick={async () => {
                                    await fetchData(); // Wait for data to load
                                    setProductModalOpen(true); // Open modal AFTER data is fetched
                                }}
                                required
                            >
                                Add Products
                            </button>
                            <button className="border px-4 py-2 rounded-lg">
                                Add Membership/Coupon
                            </button>
                        </div>
                    </div>
                    {isServiceModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white rounded-xl p-6 w-4/5 max-w-4xl overflow-y-auto max-h-[90vh]">
                                {/* Close Button */}
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

                                {/* Header Section */}
                                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                    <h3 className="text-2xl font-bold">
                                        Select Services
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Search services or categories..."
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Gender Filter */}
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

                                {/* Service Categories Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCategories.map((category) => (
                                        <div
                                            key={category.key}
                                            className="bg-gray-100 p-4 rounded-lg border"
                                        >
                                            <h4 className="text-lg font-semibold mb-4">
                                                {category.value}
                                            </h4>
                                            <ul className="space-y-2">
                                                {category.services
                                                    .filter((service) => {
                                                        // Show all if no filter is applied
                                                        if (
                                                            genderFilter.length ===
                                                            0
                                                        )
                                                            return true;

                                                        // Show services based on gender selection
                                                        if (
                                                            genderFilter.includes(
                                                                "Male"
                                                            ) &&
                                                            genderFilter.includes(
                                                                "Female"
                                                            )
                                                        ) {
                                                            return true; // Show all if both are selected
                                                        } else if (
                                                            genderFilter.includes(
                                                                "Male"
                                                            )
                                                        ) {
                                                            return service.for_men;
                                                        } else if (
                                                            genderFilter.includes(
                                                                "Female"
                                                            )
                                                        ) {
                                                            return service.for_women;
                                                        }

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
                                                                ₹{service.price}
                                                            </p>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold">
                                            Selected:{" "}
                                            {selectedList
                                                .map((s) => s.name)
                                                .join(", ") || "None"}
                                        </p>
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                                            onClick={() => {
                                                finalizeSelection(selectedList);
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

                    {/* Product Modal */}
                    {isProductModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white rounded-xl p-6 w-4/5 max-w-4xl overflow-y-auto max-h-[90vh]">
                                {/* Close Button */}
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
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                {console.log(
                                    "Filtered Categories:",
                                    filteredproduct
                                )}

                                {filteredproduct.length === 0 ? (
                                    <p className="text-center text-gray-500">
                                        No products available
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredproduct.map((category) => (
                                            <div
                                                key={category.key}
                                                className="bg-gray-100 p-4 rounded-lg border"
                                            >
                                                <h4 className="text-lg font-semibold mb-4">
                                                    {category.value}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {category.products.map(
                                                        (product) => (
                                                            <li
                                                                key={product.id}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <label className="flex flex-row items-center gap-3 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedList.some(
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

                                {/* Footer */}
                                <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t mt-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold">
                                            Selected:{" "}
                                            {selectedList
                                                .map((p) => p.name)
                                                .join(", ") || "None"}
                                        </p>
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                                            onClick={() => {
                                                finalizeSelection(selectedList);
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
                        <h3 className="font-semibold mb-2">Comments:</h3>
                        <textarea
                            placeholder="Comments"
                            className="border p-2 rounded-lg w-full"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                            Create Inquiry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewInquiry;
