import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { json, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import "../../Styles/Invoice.css";
import Logo1 from "../../../assets/S_logo.png";
import numberToWords from "../NumberToWords";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Popup from "../Popup";
import { Helmet } from "react-helmet";
import config from "../../../config";
import { CircularProgress } from "@mui/material";
import { storage } from "../../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from "react-select";

import {
    pdf,
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

function Invoice() {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    // const [membershipPrice, setMembershipPrice] = useState(0);
    const [invoiceDate, setInvoiceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const bid = localStorage.getItem("branch_id");
    const user = JSON.parse(localStorage.getItem("user"));
    const userType = user.type;

    const location = useLocation();
    const getCurrentDate = () => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const currentDate = new Date();
        const month = months[currentDate.getMonth()];
        const day = currentDate.getDate();
        const year = currentDate.getFullYear();

        return `${month} ${day}, ${year}`;
    };
    const uuid = location.state.uuid;
    console.log("uuid", uuid);
    const isEditMode = location.state.isEditMode;

    const customer_name = location.state.customer_name;
    const mobile_no = location.state.mobile_no;
    const email = location.state.email;
    const services = location.state.GBselectedServices;
    const product = location.state.productData;
    console.log("product ho tum", product);

    console.log("service ho tum", services);

    // console.log("anaf",services)
    const isGST = services.length > 0 && services[0].gst === "Exclusive";

    // console.log("servicessdklfjjka", isGST)

    const address = location.state.address;
    const service_by = location.state.GBselectedServices;
    const discount = location.state.discount;
    console.log("discout h ye fgchvjk", discount);
    const gst_number = location.state.gst_number;
    const comments = location.state.comments;
    const invoiceId = location.state.InvoiceId;
    const payment_mode = location.state.paymentModes;
    const membership_points = location.state.deductedPoints || 0;
    const coupon_points = location.state.valueDeductedPoints || 0;

    console.log("payment mode   xjkbdwbekul", payment_mode);
    const sname = localStorage.getItem("s-name");
    const [deductedPoint, setDeductedPoint] = useState(0);

    const initialPrices = services.map((service) =>
        parseFloat(service.finalPrice || service.inputFieldValue.price)
    );
    const [prices, setPrices] = useState(initialPrices);
    const initialQuantity = services.map((service) =>
        parseFloat(service.inputFieldValue.quantity)
    );
    const [quantities, setQuantities] = useState(initialQuantity);

    const token = localStorage.getItem("token");
    const coupon = location.state.selectedCoupons;
    // console.log("coupon", coupon)

    // const [discounts, setDiscounts] = useState(
    //     Array(services.length).fill(discount)
    // );
    const [taxes, setTaxes] = useState(Array(services.length).fill(0));
    const [cgst, setCGST] = useState(
        Array(location.state.GBselectedServices.length).fill(0)
    );
    const [sgst, setSGST] = useState(
        Array(location.state.GBselectedServices.length).fill(0)
    );
    const [totalAmts, setTotalAmts] = useState(
        Array(location.state.GBselectedServices.length).fill(0)
    );

    const [total_prise, setTotalPrice] = useState(0);
    const [total_quantity, setTotalQuantity] = useState(0);
    const [total_discount, setTotalDiscount] = useState(0);
    const [total_tax, setTotalTax] = useState(0);
    const [total_cgst, setTotalCGST] = useState(0);
    const [total_sgst, setTotalSGST] = useState(0);
    const [grand_total, setGrandTotal] = useState(0);

    const [invoice, setInvoice] = useState([]);
    const [productPrice, setProductPrice] = useState(0);
    const [productDetails, setProductDetails] = useState([]);
    const [producData, setProductData] = useState(
        location.state?.productData || []
    ); // Default to empty array if not set
    console.log(
        "qerwtyuiop[sdfghjklzxcvbnm,wertyuiopxfcfghvjb vbn",
        productDetails
    );

    const serviceDiscounts = services.map((item) =>
        parseFloat(item.discount || item.Discount || 0)
    );

    const productDiscountsvalue = product.map((item) => {
        const discount = item.discountValue || item.discount || 0;
        return typeof discount === "string" ? discount : String(discount);
    });

    const [discounts, setDiscounts] = useState(serviceDiscounts);
    const [productDiscounts, setProductDiscounts] = useState(
        productDiscountsvalue
    );
    const [productDiscountPercentages, setProductDiscountPercentages] =
        useState(
            product.map((item) => {
                const price = item.price;
                const discount = parseFloat(
                    item.discount || item.discountValue || 0
                );
                const percent = price
                    ? ((discount / price) * 100).toFixed(2)
                    : "";
                return percent !== "0.00" ? percent : "";
            })
        );

    // For Products
    const handleProductDiscountPercentageChange = (index, value) => {
        const percentValue = parseFloat(value) || 0;
        const price =
            productDetails[index]?.price || producData[index]?.price || 0;
        const calculatedFlat = ((percentValue / 100) * price).toFixed(2);

        // Update percentage discounts
        const newPercentages = [...productDiscountPercentages];
        newPercentages[index] = value;
        setProductDiscountPercentages(newPercentages);

        // Update flat discounts
        const newDiscounts = [...productDiscounts];
        newDiscounts[index] = parseFloat(calculatedFlat);
        setProductDiscounts(newDiscounts);
    };


    const staffNames = service_by
        .map(
            (service) => service.staff.map((staffMember) => staffMember.label) // Returns an array of staff names
        )
        .flat();

    // console.log("staff name", staffNames);

    const GST_RATE = 0.18; // 18% GST
    const CGST_RATE = GST_RATE / 2; // 9% CGST
    const SGST_RATE = GST_RATE / 2; // 9% SGST
    const roundToTwoDecimals = (num) => {
        if (isNaN(num) || num === undefined || num === null) {
            return 0;
        }
        return Number(num).toFixed(2); // Ensure num is a number and round to two decimals
    };
    // Your calculation functions
    const calculateTax = (price) => roundToTwoDecimals(price * GST_RATE);
    const calculateCGST = (price) => roundToTwoDecimals(price * CGST_RATE);
    const calculateSGST = (price) => roundToTwoDecimals(price * SGST_RATE);

    const apipoint = `${config.apiUrl}/api/swalook/inventory/product/?branch_name=${bid}`;

    const [rawProductData, setRawProductData] = useState([]);

    const productsWithStaff = product.map((item, index) => {
        const baseProduct = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            discount: String(productDiscounts[index] || "0"),
            discountPercentage: String(
                productDiscountPercentages[index] || "0"
            ), // Add this line

            note: item.note || "No notes added",
            category: item.category,
            expiryDate: item.expiryDate,
            unit: item.unit,
            stock: item.stock,
        };

        // Handle staff - convert array to comma-separated string
        if (item.staff && Array.isArray(item.staff)) {
            return {
                ...baseProduct,
                staff: item.staff
                    .map((staffMember) =>
                        staffMember?.label ? String(staffMember.label) : ""
                    )
                    .filter((name) => name)
                    .join(", "),

            };
        }

        return {
            ...baseProduct,
            staff: "",

        };
    });

    // 1. Fetch product data from API
    useEffect(() => {
        const fetchProductData = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await axios.get(apipoint, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                });

                const productDatas = response?.data?.data || [];

                if (Array.isArray(productDatas)) {
                    setRawProductData(productDatas); // 👈 Store raw product data
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching product data:", error);
            }
        };

        fetchProductData();
    }, [apipoint]);

    // 2. Recalculate product details whenever productDiscounts or producData changes
    useEffect(() => {
        const updatedDetails = producData
            .map((pd, index) => {
                const product = rawProductData.find((p) => p.id === pd.id);
                if (product) {
                    const price = Number(product.product_price) || 0;
                    const quantity = Number(pd.quantity) || 0;
                    const tax = Number(calculateTax(price)) || 0;
                    const cgst = Number(calculateCGST(price)) || 0;
                    const sgst = Number(calculateSGST(price)) || 0;
                    const Discounts = productDiscounts[index] || 0;

                    const total = price * quantity + tax + cgst + sgst;

                    return {
                        name: product.product_name,
                        price: roundToTwoDecimals(price),
                        quantity,
                        Discounts,
                        tax: roundToTwoDecimals(tax),
                        cgst: roundToTwoDecimals(cgst),
                        sgst: roundToTwoDecimals(sgst),
                        total: roundToTwoDecimals(total),
                    };
                }
                return null;
            })
            .filter(Boolean);

        setProductDetails(updatedDetails);
    }, [
        rawProductData,
        producData,
        productDiscounts,
        productDiscountPercentages,
    ]); // Add productDiscountPercentages to dependencies

    // Removed token from dependencies as it’s defined inside useEffect

    // Add dependencies for useEffect

    const Memebrship = location.state?.selectMembership;
    const membershipPrice = Memebrship.price || 0;
    const membership_name = Memebrship.program_type;
    const membergst = Memebrship.gst;
    const branchId = localStorage.getItem("branch_id");
    // const couponPrice = coupon.coupon_price || 0;
    // const coupon_name = coupon.coupon_name;
    // const couponTax = 0
    const isCouponGst = coupon.length > 0 && coupon[0].gst === "Exclusive";
    const quantity = coupon.length || 0;
    const totalCouponTax = coupon.reduce((acc, coupon) => {
        let couponTax = 0;
        if (coupon.gst === "Exclusive") {
            const couponCGST = coupon.coupon_price * CGST_RATE;
            const couponSGST = coupon.coupon_price * SGST_RATE;
            couponTax = couponCGST + couponSGST;
        }
        return acc + couponTax;
    }, 0);
    const coupon_tax = totalCouponTax / 2;
    const totalCouponGrandTotal = coupon.reduce((acc, coupon) => {
        let couponTax = 0;
        let couponTotal = coupon.coupon_price || 0;

        if (coupon.gst === "Exclusive") {
            const couponCGST = coupon.coupon_price * CGST_RATE;
            const couponSGST = coupon.coupon_price * SGST_RATE;
            couponTax = couponCGST + couponSGST;
            couponTotal += couponTax;
        }

        return acc + couponTotal;
    }, 0);
    const totalCouponPrice = coupon.reduce((acc, coupon) => {
        return acc + (coupon.coupon_price || 0);
    }, 0);

    // console.log("kjfdsfhsj", coupon_tax)
    // const couponCGST = 0
    // const couponTotal = 0;
    // const couponSGST = 0;
    // if (coupongst === "Exclusive") {
    //    couponCGST = couponPrice * CGST_RATE;
    //    couponSGST = couponPrice * SGST_RATE;
    //   couponTax = couponCGST + couponSGST;
    //   couponTotal = couponPrice + couponTax;
    //   // // console.log("sahil",membershipSGST,membershipCGST);
    // }

    useEffect(() => {
        const GST_RATE = 0.18;
        const CGST_RATE = GST_RATE / 2;
        const SGST_RATE = GST_RATE / 2;

        // Check if any service has "No GST"
        const noGSTApplied = services.some(
            (service) => service.gst === "No GST"
        );

        // Calculate taxes for services
        const updatedServiceTaxes = prices.map((price, index) => {
            const amountBeforeTax =
                price * quantities[index] - discounts[index];
            let taxAmount = 0;
            let cgstValue = 0;
            let sgstValue = 0;

            // Apply GST only if service does not have "No GST"
            if (services[index].gst !== "No GST") {
                taxAmount = amountBeforeTax * GST_RATE;
                cgstValue = taxAmount / 2;
                sgstValue = taxAmount / 2;
            }

            const totalAmt = parseFloat(
                (amountBeforeTax + taxAmount).toFixed(2)
            );

            return {
                taxAmount: parseFloat(taxAmount.toFixed(2)),
                cgstValue: parseFloat(cgstValue.toFixed(2)),
                sgstValue: parseFloat(sgstValue.toFixed(2)),
                totalAmt,
            };
        });

        const updatedProductTaxes = productDetails.map((product) => {
            const amountBeforeTax = product.price * product.quantity;
            let taxAmount = 0;
            let cgstValue = 0;
            let sgstValue = 0;
            let totalAmt = 0;

            // Apply taxes only if GST is applicable
            if (isGST) {
                taxAmount = amountBeforeTax * GST_RATE;
                cgstValue = taxAmount / 2;
                sgstValue = taxAmount / 2;
                totalAmt = amountBeforeTax + taxAmount;
            } else {
                taxAmount = 0;
                cgstValue = 0;
                sgstValue = 0;
                totalAmt = amountBeforeTax;
            }
            // console.log("dvkdbv", totalAmt);
            // Total amount includes base price + tax if applicable
            return {
                taxAmount: parseFloat(taxAmount.toFixed(2)),
                cgstValue: parseFloat(cgstValue.toFixed(2)),
                sgstValue: parseFloat(sgstValue.toFixed(2)),
                totalAmt: parseFloat(totalAmt.toFixed(2)),
            };
        });

        let membershipTotal = Memebrship.price || 0;
        let membershipTax = 0;
        let membershipCGST = 0;
        let membershipSGST = 0;
        const isMemGst = membergst === "Exclusive";
        // Calculate GST values only if GST is applied
        if (membergst === "Exclusive") {
            const membershipCGST = Memebrship.price * CGST_RATE;
            const membershipSGST = Memebrship.price * SGST_RATE;
            membershipTax = membershipCGST + membershipSGST;
            membershipTotal = Memebrship.price + membershipTax;
            // // console.log("sahil",membershipSGST,membershipCGST);
        }
        // Aggregate totals for services and products
        const totalServicePrices = prices.reduce(
            (acc, price, index) =>
                acc + (price * quantities[index] - discounts[index]),
            0
        );
        const totalServiceQuantity = quantities.reduce(
            (acc, quantity) => acc + quantity,
            0
        );
        const totalServiceDiscount = discounts.reduce(
            (acc, discount) => acc + discount,
            0
        );

        // Calculate totals for products
        const totalProductPrices = productDetails.reduce(
            (acc, product, index) => acc + product.price * product.quantity,
            0
        );
        const totalProductQuantity = productDetails.reduce(
            (acc, product) => acc + product.quantity,
            0
        );

        // Membership quantity to be added here
        const membershipQuantity = 1; // Change this to the actual membership quantity value
        const totalQuantity =
            totalServiceQuantity + totalProductQuantity + membershipQuantity;

        // Service totals
        const totalServiceTax = updatedServiceTaxes.reduce(
            (acc, { taxAmount }) => acc + taxAmount,
            0
        );
        const totalServiceCGST = updatedServiceTaxes.reduce(
            (acc, { cgstValue }) => acc + cgstValue,
            0
        );
        const totalServiceSGST = updatedServiceTaxes.reduce(
            (acc, { sgstValue }) => acc + sgstValue,
            0
        );
        const totalServiceGrandTotal = updatedServiceTaxes.reduce(
            (acc, { totalAmt }) => acc + totalAmt,
            0
        );
        // console.log("false", isGST, isMemGst, isCouponGst)

        // Product totals
        const totalProductTax = updatedProductTaxes.reduce(
            (acc, { taxAmount }) => acc + taxAmount,
            0
        );
        const totalProductCGST = updatedProductTaxes.reduce(
            (acc, { cgstValue }) => acc + cgstValue,
            0
        );
        const totalProductSGST = updatedProductTaxes.reduce(
            (acc, { sgstValue }) => acc + sgstValue,
            0
        );
        const totalProductGrandTotal = updatedProductTaxes
            .map((item, i) => {
                const discount = productDiscounts[i] || 0;
                return item.totalAmt - discount;
            })
            .reduce((acc, val) => acc + val, 0);

        const productDiscount = Array.isArray(productDiscounts)
            ? productDiscounts.reduce((acc, d) => acc + (parseFloat(d) || 0), 0)
            : 0;

        // Final totals including membership
        const finalTotalPrice =
            totalServicePrices +
            totalProductPrices +
            membershipPrice +
            totalCouponPrice;
        const finalGrandTotal =
            totalServiceGrandTotal +
            totalProductGrandTotal +
            membershipTotal +
            totalCouponGrandTotal;

        // Update states
        setTotalPrice(finalTotalPrice.toFixed(2));
        setTotalQuantity(totalQuantity); // Updated with membership quantity
        setTotalDiscount(totalServiceDiscount + productDiscount);
        setTotalTax(
            (
                totalServiceTax +
                totalProductTax +
                membershipTax +
                totalCouponTax
            ).toFixed(2)
        );
        setTotalCGST(
            (totalServiceCGST + totalProductCGST + coupon_tax).toFixed(2)
        );
        setTotalSGST(
            (totalServiceSGST + totalProductSGST + coupon_tax).toFixed(2)
        );
        setGrandTotal(finalGrandTotal.toFixed(2));
        setTaxes(
            updatedServiceTaxes
                .map((t) => t.taxAmount)
                .concat(updatedProductTaxes.map((t) => t.taxAmount))
        );
        setCGST(
            updatedServiceTaxes
                .map((t) => t.cgstValue)
                .concat(updatedProductTaxes.map((t) => t.cgstValue))
        );
        setSGST(
            updatedServiceTaxes
                .map((t) => t.sgstValue)
                .concat(updatedProductTaxes.map((t) => t.sgstValue))
        );
        setTotalAmts(
            updatedServiceTaxes
                .map((t) => t.totalAmt)
                .concat(updatedProductTaxes.map((t) => t.totalAmt))
        );
    }, [
        prices,
        quantities,
        discounts,
        services,
        productDetails,
        Memebrship.price,
    ]);

    const handlePriceBlur = (index, value) => {
        const newPrices = [...prices];
        newPrices[index] = parseFloat(value);
        setPrices(newPrices);
    };

    const handleQuantityBlur = (index, value) => {
        const newQuantities = [...quantities];
        newQuantities[index] = parseFloat(value);
        setQuantities(newQuantities);
    };
    const [discountPercentages, setDiscountPercentages] = useState(
        services.map((item) => {
            const price = item.price;
            const discount = parseFloat(item.discount || item.Discount || 0);
            const percent = price ? ((discount / price) * 100).toFixed(2) : "";
            return percent !== "0.00" ? percent : "";
        })
    );

    const handleDiscountBlur = (index, value) => {

        const discountValue =
            value === null || value === undefined ? 0 : parseFloat(value);
        const newDiscounts = [...discounts];
        newDiscounts[index] = discountValue;
        setDiscounts(newDiscounts);

        const price = services[index]?.price || 0;
        const percent = price ? ((discountValue / price) * 100).toFixed(2) : "";
        const newPercentages = [...discountPercentages];
        newPercentages[index] = percent;
        setDiscountPercentages(newPercentages);
    };
    // For Services
    const handleDiscountPercentageChange = (index, value) => {
        const percentValue = parseFloat(value) || 0;
        const price = services[index]?.price || 0;
        const calculatedFlat = ((percentValue / 100) * price).toFixed(2);

        // Update percentage discounts
        const newPercentages = [...discountPercentages];
        newPercentages[index] = value;
        setDiscountPercentages(newPercentages);

        // Update flat discounts
        const newDiscounts = [...discounts];
        newDiscounts[index] = parseFloat(calculatedFlat);
        setDiscounts(newDiscounts);
    };
    const handleDiscountProduct = (index, value) => {
        const discountValue = parseFloat(value) || 0;
        const price =
            productDetails[index]?.price || producData[index]?.price || 0;
        const percent = price ? ((discountValue / price) * 100).toFixed(2) : "";

        setProductDiscounts((prev) => {
            const newDiscounts = [...prev];
            newDiscounts[index] = discountValue;
            return newDiscounts;
        });

        setProductDiscountPercentages((prev) => {
            const newPercentages = [...prev];
            newPercentages[index] = percent;
            return newPercentages;
        });
    };

    console.log("productDiscounts", productDiscounts);

    const handleTaxBlur = (index, value) => {
        const newTaxes = [...taxes];
        newTaxes[index] = parseFloat(value);
        setTaxes(newTaxes);
    };

    const handleCGSTBlur = (index, value) => {
        const newCGST = [...cgst];
        newCGST[index] = parseFloat(value);
        setCGST(newCGST);
    };

    const handleSGSTBlur = (index, value) => {
        const newSGST = [...sgst];
        newSGST[index] = parseFloat(value);
        setSGST(newSGST);
    };

    const handleTotalAmtBlur = (index, value) => {
        const newTotalAmts = [...totalAmts];
        newTotalAmts[index] = parseFloat(value);
        setTotalAmts(newTotalAmts);
    };

    const [Minimum, setMinimum] = useState(0);

    useEffect(() => {
        const fetchAmount = async () => {
            const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/get_minimum_value/?branch_name=${bid}`;
            try {
                const response = await axios.get(apiEndpoint, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });
                if (response.data.status) {
                    setMinimum(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchAmount();
    }, []);

    const bname = localStorage.getItem("branch_name");

    const final_price = Math.ceil(
        parseFloat(grand_total) -
            parseFloat(membership_points) -
            parseFloat(coupon_points)
    );

    const grandTotalInWords = numberToWords(
        final_price - membership_points - coupon_points
    );

    const [invoiceGenerated, setInvoiceGenerated] = useState(false);

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (invoiceGenerated && totalPayment === final_price) {
            setPopupMessage(
                isEditMode
                    ? "Invoice has already been updated"
                    : "Invoice has already been generated"
            );
            setShowPopup(true);
            return;
        }

        setLoading(true);

        // Prepare services data
        const newInvoice = services.map((service, index) => ({
            Description: service.name,
            category: service.category,
            Price: prices[index],
            Quantity: quantities[index],
            Discount: discounts[index],
            DiscountPercentage: discountPercentages[index] || 0, // Added discount percentage

            Tax_amt: taxes[index],
            Staff: staffNames[index],
            CGST: cgst[index],
            SGST: sgst[index],
            Total_amount: totalAmts[index],
        }));

        // Prepare products data
        const productInvoice = productDetails.map((product, index) => ({

            Description: product.name,
            Price: product.price,
            Quantity: product.quantity,
            Discount: product.Discounts || 0,
            DiscountPercentage: productDiscountPercentages[index] || 0, // Add this line

            Tax_amt: product.tax,
            CGST: product.cgst,
            SGST: product.sgst,
            Total_amount: product.total - product.cgst - product.sgst,
        }));

        setInvoice(newInvoice);

        // Prepare payload
        const payload = {
            customer_name: customer_name,
            mobile_no: mobile_no,
            email: email,
            services: JSON.stringify(newInvoice),
            address: address,
            service_by: "",
            total_prise: total_prise,
            total_quantity: total_quantity,
            total_discount: total_discount,
            total_tax: total_tax,
            grand_total: final_price,
            total_cgst: total_cgst,
            total_sgst: total_sgst,
            gst_number: gst_number,
            comment: comments,
            slno: invoiceId,
            json_data: productsWithStaff,
            loyalty_points_deducted: deductedPoint,
            coupon_points_deducted: coupon,
            membership: Memebrship,
            coupon: coupon,
            new_mode: Object.keys(paymentModes).map((mode) => ({
                mode: mode,
                amount: paymentModes[mode],
            })),
            date: invoiceDate, // Add this line
        };

        try {
            let response;
            const endpoint = `${config.apiUrl}/api/swalook/billing/`;

            if (isEditMode) {
                // PATCH request for update
                response = await axios.put(
                    `${endpoint}?branch_name=${bid}&id=${uuid}`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${token}`,
                        },
                    }
                );
            } else {
                // POST request for create
                response = await axios.post(
                    `${endpoint}?branch_name=${bid}`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${token}`,
                        },
                    }
                );
            }

            // Handle success
            if (response.status >= 200 && response.status < 300) {
                await handlePrint();
                setPopupMessage(
                    isEditMode
                        ? "Invoice updated successfully"
                        : "Invoice generated successfully"
                );
                setShowPopup(true);
                setInvoiceGenerated(true);
            }
        } catch (error) {
            setPopupMessage(
                isEditMode
                    ? "Error updating invoice"
                    : "Error generating invoice"
            );
            setShowPopup(true);
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // console.log("service", service_by);

    const [getInvoiceId, setInvoiceId] = useState(invoiceId);

    const [getSaloonName, setSaloonName] = useState("");
    useEffect(() => {
        setSaloonName(localStorage.getItem("saloon_name"));
    });

    const branchName = localStorage.getItem("branch_name");
    // Calculate taxes and totals for the membership
    let membershipTotal = Memebrship.price;
    let membershipTax = 0;
    let cgsts = 0;
    let sgsts = 0;
    const isMemGst = membergst === "Exclusive";

    // Calculate GST values only if GST is applied
    if (membergst === "Exclusive") {
        cgsts = Memebrship.price * CGST_RATE;
        sgsts = Memebrship.price * SGST_RATE;
        membershipTax = cgsts + sgsts;
        membershipTotal = Memebrship.price + membershipTax;
        // console.log("shjbfhbhgbefbehjbfhjdb", cgsts, sgsts);
    }

    // const handlePrint = async () => {
    //   const capture = document.querySelector('.invoice_main');

    //   html2canvas(capture).then(async (canvas) => {
    //     const imgData = canvas.toDataURL('image/jpeg', 0.7);

    //     const pdf = new jsPDF('l', 'mm', 'a4');
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = pdf.internal.pageSize.getHeight();

    //     const padding = 10;
    //     const margin = 10;
    //     const availableWidth = pdfWidth - 2 * margin;
    //     const availableHeight = pdfHeight - 2 * margin;
    //     const imgWidth = availableWidth - 2 * padding;
    //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //     const posX = margin + padding;
    //     const posY = margin + padding;

    //     pdf.addImage(imgData, 'JPEG', posX, posY, imgWidth, imgHeight);
    //     pdf.compress = true;
    //     pdf.save(`Invoice-${getInvoiceId}.pdf`);

    //     const pdfBlob = pdf.output('blob');

    //     // Initialize formData
    //     const pdfRef = ref(storage, `invoices/Invoice-${getInvoiceId}.pdf`);
    //     await uploadBytes(pdfRef, pdfBlob);

    //     // Get download URL
    //     const downloadURL = await getDownloadURL(pdfRef);

    //     // Create WhatsApp link
    //     const phoneNumber = `+91${mobile_no}`; // Replace with the customer's phone number
    //     const message = `Hi ${customer_name}!\nWe hope you had a pleasant experience at ${atob(branchName)}.\nWe are looking forward to servicing you again, attached is the invoice.\nThanks and Regards,\nTeam ${atob(branchName)}\n\nClick on the link to download:: ${downloadURL}`;
    //     const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    //     // Open WhatsApp link
    //     window.open(whatsappLink, '_blank');

    //     const token = localStorage.getItem('token');
    //     const formData = new FormData();
    //     formData.append('file', pdfBlob, `Invoice-${getInvoiceId}.pdf`);
    //     formData.append('customer_name', customer_name);
    //     formData.append('mobile_no', mobile_no);
    //     formData.append('email', email);
    //     formData.append('vendor_branch_name', bname);
    //     formData.append('invoice', getInvoiceId);

    //     // Call the function to send invoice
    //     await handleSendInvoice(formData);
    //   });
    // };

    const [paymentModes, setPaymentModes] = useState({});

    useEffect(() => {
        if (location.state?.paymentModes) {
            setPaymentModes(location.state.paymentModes);
        }
    }, [location.state]);

    const [selectedPayments, setSelectedPayments] = useState([]);
    const [amounts, setAmounts] = useState({});
    const options = [
        { value: "cash", label: "Cash" },
        { value: "upi", label: "UPI" },
        { value: "card", label: "Card" },
        { value: "net_banking", label: "Net Banking" },
        { value: "other", label: "Other" },
    ];

    const handleSelectChange = (selectedOptions) => {
        const updatedPayments = {};
        selectedOptions.forEach((option) => {
            updatedPayments[option.value] = paymentModes[option.value] || ""; // Preserve existing amount
        });
        setPaymentModes(updatedPayments);
    };
    const handleAmountChange = (mode, value) => {
        setPaymentModes((prev) => ({
            ...prev,
            [mode]: value, // Update the amount for the selected mode
        }));
    };

    const totalPayment = Object.values(paymentModes).reduce(
        (sum, amount) => sum + (parseFloat(amount) || 0),
        0
    );
    const handleSendInvoice = async (formData) => {
        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `${config.apiUrl}/api/swalook/save-pdf/`,
                formData,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            // console.log("PDF saved successfully", response.data);
        } catch (error) {
            console.error("Error saving PDF:", error);
        }
    };

    const handlePrint = async () => {
        const styles = StyleSheet.create({
            invoiceContainer: {
                padding: 20,
                margin: 15,
                backgroundColor: "#fff",
            },

            section: {
                marginBottom: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
            },

            sectionColumn: {
                flex: 1,
                marginHorizontal: 10,
                gap: 5,
                fontSize: 14,
            },

            invoiceHeader: {
                textAlign: "center",
                fontSize: 26,
                fontWeight: "bold",
                marginBottom: 20,
            },

            table: {
                width: "100%",
                marginTop: 20,
                borderWidth: 1, // Border for the entire table
                borderColor: "#ccc",
                borderRadius: 5,
            },

            tableHeader: {
                flexDirection: "row",
                backgroundColor: "#ddd",
                borderBottomWidth: 1,
                borderBottomColor: "#bbb",
                fontSize: 11,
                fontWeight: "bold",
                paddingVertical: 8,
                paddingHorizontal: 5,
            },

            tableRow: {
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                fontSize: 11,
                paddingVertical: 10,
            },

            tableCell: {
                flex: 1,
                textAlign: "center",
                padding: 6,
                borderRightWidth: 1, // Add borders to table cells for structure
                borderRightColor: "#ddd",
            },

            totalRow: {
                flexDirection: "row",
                backgroundColor: "#eaeaea",
                borderTopWidth: 1,
                borderTopColor: "#ccc",
                fontWeight: "bold",
                paddingVertical: 12,
                fontSize: 12,
                marginTop: 10,
            },

            footer: {
                marginTop: 20,
                paddingHorizontal: 10,
            },

            footerRow: {
                flexDirection: "column",
            },

            footerText: {
                fontWeight: "bold",
                fontSize: 13,
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
            },

            footerValue: {
                fontWeight: "600",
                textAlign: "right",
            },

            paymentTitle: {
                fontWeight: "bold",
                fontSize: 15,
                marginBottom: 6,
            },

            paymentText: {
                fontSize: 12,
                marginBottom: 3,
            },

            bold: {
                fontWeight: "bold",
            },
        });

        const invoiceData = {
            sname,
            customer_name,
            address,
            email,
            mobile_no,
            paymentModes,
            getInvoiceId,
            getCurrentDate,
            isGST,
            gst_number,
            services,
            // staff,
            membership_name,
            membershipTax,
            cgsts,
            sgsts,
            membershipTotal,
            total_prise,
            total_quantity,
            total_discount,
            total_tax,
            total_cgst,
            total_sgst,
            grand_total,
            grandTotalInWords,
            final_price,
            comments,
            membership_points,
            coupon_points,
            isCouponGst,
            isMemGst,
            coupon,
            quantity,
            user,
        };

        const InvoiceDocument = () => (
            <Document>
                <Page style={styles.invoiceContainer}>
                    <Text style={styles.invoiceHeader}>{sname}</Text>

                    {/* Header and Customer Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionColumn}>
                            <Text style={styles.fieldName}>
                                Invoice To: {customer_name}
                            </Text>
                            <Text>{address}</Text>
                            <Text>{email}</Text>
                            <Text>{mobile_no}</Text>
                            <Text style={styles.paymentTitle}>
                                Payment Mode:
                            </Text>
                            {Object.keys(paymentModes).map((mode) => (
                                <Text key={mode} style={styles.paymentText}>
                                    <Text style={styles.bold}>{mode}:</Text>{" "}
                                    {paymentModes[mode]}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.sectionColumn}>
                            <Text>Date of Invoice: {invoiceDate}</Text>
                            <Text>Invoice Id: {getInvoiceId}</Text>
                            {isGST && <Text>GST Number: {gst_number}</Text>}
                            <Text>Contact Number: {user.user}</Text>
                        </View>
                    </View>

                    {/* Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, { width: "5%" }]}>
                                S. No.
                            </Text>
                            <Text style={[styles.tableCell, { width: "25%" }]}>
                                DESCRIPTION
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                PRICE
                            </Text>
                            <Text style={[styles.tableCell, { width: "5%" }]}>
                                QTY
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                DISCOUNT (RS.)
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                DISCOUNT (%)
                            </Text>
                            {isGST || isMemGst || isCouponGst ? (
                                <>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        TAX AMT
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        CGST
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        SGST
                                    </Text>
                                </>
                            ) : null}
                            <Text style={[styles.tableCell, { width: "15%" }]}>
                                TOTAL AMT
                            </Text>
                        </View>

                        {/* Service Rows */}
                        {services.map((service, index) => (
                            <View style={styles.tableRow} key={index}>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}
                                >
                                    {index + 1}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "25%" }]}
                                >
                                    {service.category}: {service.name}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {service.price || "N/A"}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}
                                >
                                    {service.inputFieldValue.quantity || "N/A"}
                                </Text>

                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {discounts[index] || 0}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {discountPercentages[index] || 0}
                                </Text>
                                {isGST || isMemGst || isCouponGst ? (
                                    <>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {taxes[index] || "N/A"}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {cgst[index] || "N/A"}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {sgst[index] || "N/A"}
                                        </Text>
                                    </>
                                ) : null}

                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {totalAmts[index] || "N/A"}
                                </Text>
                            </View>
                        ))}

                        {/* Membership Row */}
                        {membership_name && membership_name !== "None" && (
                            <View style={styles.tableRow}>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}

                                >
                                    {services.length + 1}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "25%" }]}

                                >
                                    {membership_name}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}

                                >
                                    {membershipPrice}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}
                                >
                                    1
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    0

                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    0
                                </Text>
                                {isGST || isMemGst || isCouponGst ? (
                                    <>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {membershipTax}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {cgsts}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {sgsts}
                                        </Text>
                                    </>
                                ) : null}

                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {membershipTotal}
                                </Text>
                            </View>
                        )}

                        {/* Coupon Rows */}
                        {coupon.map((couponItem, index) => {
                            const couponPrice = couponItem.coupon_price || 0;
                            const isCouponExclusive =
                                couponItem.gst === "Exclusive";

                            // Calculate tax values if GST is exclusive
                            let couponCGST = 0;
                            let couponSGST = 0;
                            let couponTax = 0;
                            let couponTotal = couponPrice;


                            if (isCouponExclusive) {
                                couponCGST = couponPrice * CGST_RATE;
                                couponSGST = couponPrice * SGST_RATE;
                                couponTax = couponCGST + couponSGST;
                                couponTotal = couponPrice + couponTax;
                            }


                            return (
                                <View style={styles.tableRow} key={index}>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "5%" },
                                        ]}
                                    >
                                        {services.length +
                                            (membership_name ? 2 : 1) +
                                            index}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "25%" },
                                        ]}
                                    >
                                        {couponItem.coupon_name}

                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        {couponPrice.toFixed(2)}

                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "5%" },
                                        ]}
                                    >
                                        {quantity}

                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        0.00

                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        0.00
                                    </Text>

                                    {isGST || isMemGst || isCouponGst ? (
                                        <>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {couponTax.toFixed(2)}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {couponCGST.toFixed(2)}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {couponSGST.toFixed(2)}
                                            </Text>
                                        </>
                                    ) : null}

                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {couponTotal.toFixed(2)}

                                    </Text>
                                </View>
                            );
                        })}

                        {/* Product Rows */}
                        {productDetails.map((product, index) => (
                            <View style={styles.tableRow} key={index}>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}
                                >
                                    {services.length +
                                        (membership_name ? 1 : 0) +
                                        coupon.length +
                                        index +
                                        1}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "25%" }]}

                                >
                                    {product.name}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}

                                >
                                    {product.price}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "5%" }]}
                                >
                                    {product.quantity}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {productDiscounts[index] || 0}

                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {productDiscountPercentages[index] || 0}
                                </Text>
                                {isGST || isMemGst || isCouponGst ? (
                                    <>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {product.tax}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {product.cgst}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                { width: "10%" },
                                            ]}
                                        >
                                            {product.sgst}
                                        </Text>
                                    </>
                                ) : null}
                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {product.total -
                                        product.cgst -
                                        product.sgst}
                                </Text>
                            </View>
                        ))}

                        {/* Total Row */}
                        <View style={[styles.tableRow, styles.totalRow]}>
                            <Text
                                style={[styles.tableCell, { width: "5%" }]}
                            ></Text>
                            <Text style={[styles.tableCell, { width: "25%" }]}>
                                TOTAL
                            </Text>
                            <Text
                                style={[styles.tableCell, { width: "10%" }]}
                            ></Text>
                            <Text style={[styles.tableCell, { width: "5%" }]}>
                                {total_quantity +
                                    (membership_name ? 1 : 0) +
                                    coupon.length}
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                {total_discount}
                            </Text>
                            <Text
                                style={[styles.tableCell, { width: "10%" }]}
                            ></Text>
                            {isGST || isMemGst || isCouponGst ? (

                                <>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        {total_tax}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        {total_cgst}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        {total_sgst}
                                    </Text>
                                </>
                            ) : null}
                            <Text style={[styles.tableCell, { width: "15%" }]}>
                                {grand_total}
                            </Text>
                        </View>

                    </View>
                    {comments ? <Text>Comments: {comments}</Text> : null}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            {membership_points > 0 && (
                                <Text style={styles.footerText}>
                                    Membership Discount:
                                    <Text style={styles.footerValue}>
                                        {" "}
                                        {membership_points} Rupees Only
                                    </Text>
                                </Text>
                            )}
                            {coupon_points > 0 && (
                                <Text style={styles.footerText}>
                                    Coupon Discount:
                                    <Text style={styles.footerValue}>
                                        {" "}
                                        {coupon_points} Rupees Only
                                    </Text>
                                </Text>
                            )}
                            <Text style={styles.footerText}>
                                Amount in Words:
                                <Text style={styles.footerValue}>
                                    {" "}
                                    {grandTotalInWords} Rupees Only
                                </Text>
                            </Text>
                            <Text style={styles.footerText}>
                                FINAL VALUE:
                                <Text style={styles.footerValue}>
                                    {" "}
                                    Rs {final_price}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </Page>
            </Document>
        );
        try {
            const blob = await pdf(<InvoiceDocument />).toBlob();

            if (blob) {
                // Save PDF locally
                saveAs(blob, `Invoice-${invoiceData.getInvoiceId}.pdf`);

                // Upload to Firebase Storage
                const pdfRef = ref(
                    storage,
                    `invoices/Invoice-${invoiceData.getInvoiceId}.pdf`
                );
                await uploadBytes(pdfRef, blob);

                // Get download URL
                const downloadURL = await getDownloadURL(pdfRef);

                // Create WhatsApp link
                const phoneNumber = `+91${mobile_no}`;
                const message = `Hi ${customer_name}!\nWe hope you had a pleasant experience at ${sname}.\nYour total bill amount is: *Rs.${final_price}*\nWe are looking forward to servicing you again, attached is the invoice.\nThanks and Regards,\nTeam ${sname}\n\nClick on the link to download:: ${downloadURL}`;
                const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                    message
                )}`;

                // Open WhatsApp link
                window.open(whatsappLink, "_blank");

                // Prepare formData with only essential details
                const formData = new FormData();
                formData.append(
                    "file",
                    blob,
                    `Invoice-${invoiceData.getInvoiceId}.pdf`
                );
                formData.append("invoice", invoiceData.getInvoiceId);
                formData.append("customer_name", customer_name);
                formData.append("mobile_no", mobile_no);
                formData.append("email", email);
                formData.append("branch_name", sname);
                formData.append("pdf_url", downloadURL);
                formData.append("whatsapp_link", whatsappLink);
                formData.append("grand_total", grand_total);
                formData.append("invoice_date", invoiceData.getCurrentDate());

                // Call handleSendInvoice with essential data only
                await handleSendInvoice(formData);
            } else {
                console.error("Failed to create PDF blob");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        }

        // const blob = await pdf(<InvoiceDocument />).toBlob();

        // // Save PDF locally
        // saveAs(blob, `Invoice-${invoiceData.getInvoiceId}.pdf`);

        // // Initialize formData for uploading the PDF
    };

    return (
        <div className="invoice_container">
            <Helmet>
                <title>Invoice</title>
            </Helmet>

            <div className="bg-white p-6 shadow-lg rounded-3xl max-w-6xl mx-auto my-6">
                <form onSubmit={handleGenerateInvoice} className="space-y-6">
                    {/* Header Section */}
                    <div className="border-b-2 border-gray-200 pb-6">
                        <div className="text-3xl font-bold text-gray-800 text-center">
                            {sname}
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Info */}
                        <div className="bg-white p-6 rounded-3xl shadow-md w-full md:w-1/2 space-y-3">
                            <h3 className="font-bold text-lg text-gray-900">
                                Invoice To:
                            </h3>
                            <div className="space-y-1 text-gray-700">
                                <p>{customer_name}</p>
                                <p>{address}</p>
                                <p>{email}</p>
                                <p>{mobile_no}</p>
                            </div>
                            <p className="font-semibold pt-2">Payment Mode:</p>
                            <div className="space-y-1">
                                {Object.entries(paymentModes).map(
                                    ([mode, amount]) => (
                                        <p key={mode}>
                                            <span className="font-semibold">
                                                {mode}:
                                            </span>{" "}
                                            {amount}
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Right Info */}
                        <div className="bg-white p-6 rounded-3xl shadow-md w-full md:w-1/2 space-y-4">
                            <div>
                                <p className="font-semibold">Invoice Id:</p>
                                <p>{getInvoiceId}</p>
                            </div>
                            <div>
                                <p className="font-semibold">
                                    Date of Invoice:
                                </p>
                                {userType !== "staff" && (
                                    <>
                                        <input
                                            type="date"
                                            value={invoiceDate}
                                            onChange={(e) =>
                                                setInvoiceDate(e.target.value)
                                            }
                                            className="border border-gray-300 rounded-full px-4 py-2 w-full"
                                        />
                                    </>
                                )}
                            </div>
                            {isGST && (
                                <div>
                                    <p className="font-semibold">
                                        GST Number:{" "}
                                        <span className="font-normal">
                                            {gst_number}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full border border-gray-200 rounded-3xl overflow-hidden">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="p-3 border">S. No.</th>
                                    <th className="p-3 border">DESCRIPTION</th>
                                    <th className="p-3 border">PRICE</th>
                                    <th className="p-3 border">QUANTITY</th>
                                    <th className="p-3 border">DISCOUNT</th>
                                    {(isGST || isMemGst || isCouponGst) && (
                                        <>
                                            <th className="p-3 border">
                                                TAX AMT (18%)
                                            </th>
                                            <th className="p-3 border">
                                                CGST (9%)
                                            </th>
                                            <th className="p-3 border">
                                                SGST (9%)
                                            </th>
                                        </>
                                    )}
                                    <th className="p-3 border bg-blue-700">
                                        TOTAL AMT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let currentSerial = 1;

                                    return (
                                        <>
                                            {/* Services */}
                                            {services.map((service, index) => (
                                                <tr
                                                    key={`service-${index}`}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="border p-3">
                                                        {currentSerial++}
                                                    </td>
                                                    <td className="border p-3">
                                                        {service.category}:{" "}
                                                        {service.name}
                                                    </td>
                                                    <td className="border p-3">
                                                        <input
                                                            type="number"
                                                            className="w-full p-1 border rounded-full text-center"
                                                            value={
                                                                prices[index]
                                                            }
                                                            readOnly
                                                            onChange={(e) =>
                                                                handlePriceBlur(
                                                                    index,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-3">
                                                        <input
                                                            type="number"
                                                            className="w-full p-1 border rounded-full text-center"
                                                            value={
                                                                quantities[
                                                                    index
                                                                ]
                                                            }
                                                            readOnly
                                                            onBlur={(e) =>
                                                                handleQuantityBlur(
                                                                    index,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-3">
                                                        <div className="flex gap-2">
                                                            {/* Flat ₹ input */}
                                                            <input
                                                                type="number"
                                                                className="w-full p-1 border rounded-full text-center"
                                                                value={
                                                                    discounts[
                                                                        index
                                                                    ] || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const value =
                                                                        e.target
                                                                            .value;
                                                                    const newDiscounts =
                                                                        [
                                                                            ...discounts,
                                                                        ];
                                                                    newDiscounts[
                                                                        index
                                                                    ] =
                                                                        value ===
                                                                        ""
                                                                            ? 0
                                                                            : parseFloat(
                                                                                  value
                                                                              );
                                                                    setDiscounts(
                                                                        newDiscounts
                                                                    );

                                                                    // Calculate percentage when flat value changes
                                                                    const price =
                                                                        services[
                                                                            index
                                                                        ]
                                                                            ?.price ||
                                                                        0;
                                                                    const percent =
                                                                        price
                                                                            ? (
                                                                                  (newDiscounts[
                                                                                      index
                                                                                  ] /
                                                                                      price) *
                                                                                  100
                                                                              ).toFixed(
                                                                                  2
                                                                              )
                                                                            : "0";
                                                                    const newPercentages =
                                                                        [
                                                                            ...discountPercentages,
                                                                        ];
                                                                    newPercentages[
                                                                        index
                                                                    ] = percent;
                                                                    setDiscountPercentages(
                                                                        newPercentages
                                                                    );
                                                                }}
                                                                placeholder="₹"
                                                            />
                                                            {/* Percentage input */}
                                                            <input
                                                                type="number"
                                                                className="w-full p-1 border rounded-full text-center"
                                                                value={
                                                                    discountPercentages[
                                                                        index
                                                                    ] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleDiscountPercentageChange(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="%"
                                                            />
                                                        </div>
                                                    </td>


                                                    {(isGST ||
                                                        isMemGst ||
                                                        isCouponGst) && (
                                                        <>
                                                            <td className="border p-3">
                                                                {taxes[index]}
                                                            </td>
                                                            <td className="border p-3">
                                                                {cgst[index]}
                                                            </td>
                                                            <td className="border p-3">
                                                                {sgst[index]}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="border p-3 font-semibold">
                                                        {totalAmts[index]}
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Membership */}
                                            {Memebrship &&
                                                membership_name !== "None" && (
                                                    <tr className="hover:bg-gray-50">
                                                        <td className="border p-3">
                                                            {currentSerial++}
                                                        </td>
                                                        <td className="border p-3">
                                                            {membership_name}
                                                        </td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="number"
                                                                className="w-full p-1 border rounded-full text-center"
                                                                value={
                                                                    membershipPrice
                                                                }
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="border p-3">
                                                            1
                                                        </td>
                                                        <td className="border p-3">
                                                            0
                                                        </td>
                                                        {(isGST ||
                                                            isMemGst ||
                                                            isCouponGst) && (
                                                            <>
                                                                <td className="border p-3">
                                                                    {
                                                                        membershipTax
                                                                    }
                                                                </td>
                                                                <td className="border p-3">
                                                                    {cgsts}
                                                                </td>
                                                                <td className="border p-3">
                                                                    {sgsts}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="border p-3 font-semibold">
                                                            {isGST ||
                                                            isMemGst ||
                                                            isCouponGst
                                                                ? membershipTotal
                                                                : membershipTotal -
                                                                  membershipTax}
                                                        </td>
                                                    </tr>
                                                )}

                                            {/* Coupons */}
                                            {coupon.map((couponItem, index) => {
                                                const couponPrice =
                                                    couponItem.coupon_price ||
                                                    0;
                                                const coupon_name =
                                                    couponItem.coupon_name;
                                                let couponCGST = 0,
                                                    couponSGST = 0,
                                                    couponTax = 0,
                                                    couponTotal = couponPrice;
                                                if (
                                                    couponItem.gst ===
                                                    "Exclusive"
                                                ) {
                                                    couponCGST =
                                                        couponPrice * CGST_RATE;
                                                    couponSGST =
                                                        couponPrice * SGST_RATE;
                                                    couponTax =
                                                        couponCGST + couponSGST;
                                                    couponTotal =
                                                        couponPrice + couponTax;
                                                }
                                                return (
                                                    <tr
                                                        key={`coupon-${index}`}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="border p-3">
                                                            {currentSerial++}
                                                        </td>
                                                        <td className="border p-3">
                                                            {coupon_name}
                                                        </td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="number"
                                                                className="w-full p-1 border rounded-full text-center"
                                                                value={
                                                                    couponPrice
                                                                }
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="border p-3">
                                                            {quantity}
                                                        </td>
                                                        <td className="border p-3">
                                                            0
                                                        </td>
                                                        {(isGST ||
                                                            isMemGst ||
                                                            isCouponGst) && (
                                                            <>
                                                                <td className="border p-3">
                                                                    {couponTax.toFixed(
                                                                        2
                                                                    )}
                                                                </td>
                                                                <td className="border p-3">
                                                                    {couponCGST.toFixed(
                                                                        2
                                                                    )}
                                                                </td>
                                                                <td className="border p-3">
                                                                    {couponSGST.toFixed(
                                                                        2
                                                                    )}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="border p-3 font-semibold">
                                                            {isGST ||
                                                            membergst ||
                                                            couponItem.gst ===
                                                                "Exclusive"
                                                                ? couponTotal.toFixed(
                                                                      2
                                                                  )
                                                                : (
                                                                      couponTotal -
                                                                      couponTax
                                                                  ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Products */}
                                            {productDetails.map(
                                                (product, index) => (
                                                    <tr
                                                        key={`product-${index}`}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="border p-3">
                                                            {currentSerial++}
                                                        </td>
                                                        <td className="border p-3">
                                                            {product.name}
                                                        </td>
                                                        <td className="border p-3">
                                                            <input
                                                                type="number"
                                                                className="w-full p-1 border rounded-full text-center"
                                                                value={
                                                                    product.price
                                                                }
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="border p-3 text-center">
                                                            {product.quantity}
                                                        </td>
                                                        <td className="border p-3">
                                                            <div className="flex gap-2">
                                                                {/* Flat ₹ input */}
                                                                <input
                                                                    type="number"
                                                                    className="w-full p-1 border rounded-full text-center"
                                                                    value={
                                                                        productDiscounts[
                                                                            index
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        const newDiscounts =
                                                                            [
                                                                                ...productDiscounts,
                                                                            ];
                                                                        newDiscounts[
                                                                            index
                                                                        ] =
                                                                            value ===
                                                                            ""
                                                                                ? 0
                                                                                : parseFloat(
                                                                                      value
                                                                                  );
                                                                        setProductDiscounts(
                                                                            newDiscounts
                                                                        );

                                                                        // Calculate percentage when flat value changes
                                                                        const price =
                                                                            productDetails[
                                                                                index
                                                                            ]
                                                                                ?.price ||
                                                                            producData[
                                                                                index
                                                                            ]
                                                                                ?.price ||
                                                                            0;
                                                                        const percent =
                                                                            price
                                                                                ? (
                                                                                      (newDiscounts[
                                                                                          index
                                                                                      ] /
                                                                                          price) *
                                                                                      100
                                                                                  ).toFixed(
                                                                                      2
                                                                                  )
                                                                                : "0";
                                                                        const newPercentages =
                                                                            [
                                                                                ...productDiscountPercentages,
                                                                            ];
                                                                        newPercentages[
                                                                            index
                                                                        ] =
                                                                            percent;
                                                                        setProductDiscountPercentages(
                                                                            newPercentages
                                                                        );
                                                                    }}
                                                                    placeholder="₹"
                                                                />
                                                                {/* Percentage input */}
                                                                <input
                                                                    type="number"
                                                                    className="w-full p-1 border rounded-full text-center"
                                                                    value={
                                                                        productDiscountPercentages[
                                                                            index
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleProductDiscountPercentageChange(
                                                                            index,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                            </div>

                                                        </td>
                                                        {(isGST ||
                                                            isMemGst ||
                                                            isCouponGst) && (
                                                            <>
                                                                <td className="border p-3">
                                                                    {
                                                                        product.tax
                                                                    }
                                                                </td>
                                                                <td className="border p-3">
                                                                    {
                                                                        product.cgst
                                                                    }
                                                                </td>
                                                                <td className="border p-3">
                                                                    {
                                                                        product.sgst
                                                                    }
                                                                </td>
                                                            </>
                                                        )}
                                                        <td className="border p-3 font-semibold">
                                                            {isGST || membergst
                                                                ? (
                                                                      product.total -
                                                                      product.cgst -
                                                                      product.sgst
                                                                  ).toFixed(2)
                                                                : (
                                                                      product.total -
                                                                      product.tax -
                                                                      product.cgst -
                                                                      product.sgst -
                                                                      productDiscounts[
                                                                          index
                                                                      ]
                                                                  ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )
                                            )}

                                            {/* Total Row */}
                                            <tr className="bg-blue-50 font-semibold">
                                                <td
                                                    colSpan="2"
                                                    className="border p-3 text-blue-700 text-center"
                                                >
                                                    TOTAL
                                                </td>
                                                <td className="border p-3"></td>
                                                <td className="border p-3 text-center">
                                                    {Memebrship
                                                        ? total_quantity +
                                                          quantity
                                                        : total_quantity +
                                                          quantity -
                                                          1}
                                                </td>
                                                <td className="border p-3 text-center">
                                                    {total_discount}
                                                </td>
                                                {(isGST ||
                                                    isMemGst ||
                                                    isCouponGst) && (
                                                    <>
                                                        <td className="border p-3">
                                                            {total_tax}
                                                        </td>
                                                        <td className="border p-3">
                                                            {total_cgst}
                                                        </td>
                                                        <td className="border p-3 ">
                                                            {total_sgst}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="border p-3 text-blue-800 text-center">
                                                    ₹ {grand_total}
                                                </td>
                                            </tr>
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* Comments */}
                    {comments && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                            <h4 className="font-semibold text-gray-800">
                                Comments:
                            </h4>
                            <p className="mt-1 text-gray-700">{comments}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 mt-8">
                        <div className="space-y-3">
                            {membership_points > 0 && (
                                <h4 className="font-semibold text-emerald-700">
                                    Membership Points Discount:
                                </h4>
                            )}
                            {coupon_points > 0 && (
                                <h4 className="font-semibold text-emerald-700">
                                    Coupon Points Discount:
                                </h4>
                            )}
                            <h4 className="font-semibold text-gray-800">
                                Amount in Words:
                            </h4>
                            <p className="text-gray-700">
                                {grandTotalInWords} Rupees Only
                            </p>
                        </div>
                        <div className="space-y-3 text-right">
                            {membership_points > 0 && (
                                <p className="text-red-500 font-bold">
                                    - {membership_points} Points
                                </p>
                            )}
                            {coupon_points > 0 && (
                                <p className="text-red-500 font-bold">
                                    - {coupon_points} Points
                                </p>
                            )}
                            <h4 className="font-semibold text-gray-800">
                                FINAL VALUE:
                            </h4>
                            <p className="text-2xl font-bold text-gray-900">
                                Rs {final_price}
                            </p>
                        </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="mt-8">
                        <label className="block font-semibold mb-2">
                            Mode of Payment
                        </label>
                        <Select
                            isMulti
                            isSearchable={false}
                            options={options}
                            className="w-full md:w-1/2"
                            onChange={handleSelectChange}
                            placeholder="Select Payment Mode"
                            required
                        />
                    </div>

                    {/* Payment Table */}
                    {Object.keys(paymentModes).length > 0 && (
                        <div className="mt-6">
                            <table className="w-full md:w-1/2 border border-gray-200 rounded-[2.5rem] overflow-hidden">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="p-3 border text-left">
                                            Payment Mode
                                        </th>
                                        <th className="p-3 border text-left">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(paymentModes).map(
                                        ([mode, amount]) => (
                                            <tr
                                                key={mode}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="p-3 border text-center">
                                                    {mode}
                                                </td>
                                                <td className="p-3 border ">
                                                    <input
                                                        type="number"
                                                        placeholder="Enter Amount"
                                                        value={amount}
                                                        onChange={(e) =>
                                                            handleAmountChange(
                                                                mode,
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        className="w-full border text-center border-gray-300 rounded-full px-4 py-2"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-blue-50 font-semibold">
                                        <td className="p-3 border text-blue-700 text-left">
                                            Total Payment
                                        </td>
                                        <td className="p-3 border text-blue-700">
                                            Rs {final_price}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            {totalPayment !== final_price && (
                                <p className="mt-2 text-red-600 font-medium">
                                    Error: Payment total (
                                    {totalPayment.toFixed(2)}) does not match
                                    the Grand Total ({final_price.toFixed(2)})!
                                </p>
                            )}
                        </div>
                    )}
                </form>
            </div>

            <div className="flex items-center justify-center mt-8">
                <button
                    type="submit"
                    onClick={handleGenerateInvoice}
                    disabled={
                        totalPayment !== final_price ||
                        loading ||
                        invoiceGenerated
                    }
                    className={`py-2 px-12 bg-blue-500 text-xl text-white font-semibold rounded-[2.5rem] ${
                        totalPayment !== final_price
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : isEditMode ? (
                        "Update Final Invoice"
                    ) : (
                        "Generate Final Invoice"
                    )}
                </button>
            </div>
            {showPopup && (
                <Popup
                    message={popupMessage}
                    onClose={() => {
                        setShowPopup(false);
                        navigate(`/${sname}/${branchName}/dashboard`);
                    }}
                />
            )}
        </div>
    );
}

export default Invoice;
