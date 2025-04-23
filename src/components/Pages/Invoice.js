import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { json, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import "../Styles/Invoice.css";
import Logo1 from "../../assets/S_logo.png";
import numberToWords from "../Pages/NumberToWords";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Popup from "./Popup";
import { Helmet } from "react-helmet";
import config from "../../config";
import { CircularProgress } from "@mui/material";
import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const bid = localStorage.getItem("branch_id");
    const user = JSON.parse(localStorage.getItem("user"));

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

    const customer_name = location.state.customer_name;
    const mobile_no = location.state.mobile_no;
    const email = location.state.email;
    const services = location.state.GBselectedServices;
    const product = location.state.productData;
    console.log("product ho tum", product);
    console.log("service  ho tum", services);

    // console.log("anaf",services)
    const isGST = services.length > 0 && services[0].gst === "Exclusive";

    // console.log("servicessdklfjjka", isGST)

    const address = location.state.address;
    const service_by = location.state.GBselectedServices;
    const discount = location.state.discount;
    const gst_number = location.state.gst_number;
    const comments = location.state.comments;
    const invoiceId = location.state.InvoiceId;
    const payment_mode = location.state.paymentModes;
    const membership_points = location.state.deductedPoints || 0;
    const coupon_points = location.state.valueDeductedPoints || 0;
    // console.log("payment mode", membership_points,coupon_points);
    const sname = localStorage.getItem("s-name");
    const [deductedPoint, setDeductedPoint] = useState(0);

    const initialPrices = services.map((service) =>
        parseFloat(service.finalPrice)
    );
    const [prices, setPrices] = useState(initialPrices);
    const initialQuantity = services.map((service) =>
        parseFloat(service.inputFieldValue.quantity)
    );
    const [quantities, setQuantities] = useState(initialQuantity);

    const token = localStorage.getItem("token");
    const coupon = location.state.selectedCoupons;
    // console.log("coupon", coupon)

    const [discounts, setDiscounts] = useState(
        services.map((service) => service.discountValue || 0)
    );

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

    const filteredProducts = product.map(({ staff, ...rest }) => rest);
    const [productDiscounts, setProductDiscounts] = useState([]);

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
                console.log("product", producData);
                if (product) {
                    const price = Number(product.product_price) || 0;
                    const quantity = Number(pd.quantity) || 0;
                    const tax = Number(calculateTax(price)) || 0;
                    const cgst = Number(calculateCGST(price)) || 0;
                    const sgst = Number(calculateSGST(price)) || 0;
                    const discount = Number(pd.discountValue) || 0;

                    const total =
                        price * quantity + tax + cgst + sgst - discount;

                    return {
                        name: product.product_name,
                        price: roundToTwoDecimals(price),
                        quantity,
                        Discounts: discount,
                        tax: roundToTwoDecimals(tax),
                        cgst: roundToTwoDecimals(cgst),
                        sgst: roundToTwoDecimals(sgst),
                        total: roundToTwoDecimals(total),
                    };
                }
                return null;
            })
            .filter(Boolean);
        console.log("productDetails", updatedDetails);

        setProductDetails(updatedDetails); // ✅ always reflects latest discounts
    }, [rawProductData, producData, productDiscounts]);
    // Removed token from dependencies as it’s defined inside useEffect
    useEffect(() => {
        if (producData.length) {
            const initialDiscounts = producData.map((product) => ({
                id: product.id,
                discountValue: product.discountValue || 0, // fallback if undefined
            }));
            setProductDiscounts(initialDiscounts);
        }
    }, [producData]);

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
        const totalProductGrandTotal = updatedProductTaxes.reduce(
            (acc, item, i) => {
                const discount =
                    typeof productDiscounts[i]?.discountValue === "number"
                        ? productDiscounts[i].discountValue
                        : parseFloat(productDiscounts[i]?.discountValue) || 0;
                return acc + (item.totalAmt - discount);
            },
            0
        );

        const productDiscount = Array.isArray(productDiscounts)
            ? parseFloat(
                  productDiscounts
                      .reduce(
                          (acc, d) => acc + (parseFloat(d.discountValue) || 0),
                          0
                      )
                      .toFixed(2)
              )
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

    const handleDiscountBlur = (index, value) => {
        // If the value is null or undefined, set it to 0
        const discountValue =
            value === null || value === undefined ? 0 : parseFloat(value);
        const newDiscounts = [...discounts];
        newDiscounts[index] = discountValue;
        setDiscounts(newDiscounts);
    };
    const handleDiscountProduct = (index, value) => {
        const discountValue =
            value === null || value === undefined ? 0 : parseFloat(value);

        setProductDiscounts((prevDiscounts) => {
            const newDiscounts = [...prevDiscounts];

            // Fill missing indexes with 0
            while (newDiscounts.length <= index) {
                newDiscounts.push(0);
            }

            newDiscounts[index] = discountValue;
            console.log("newDiscounts", newDiscounts);

            return newDiscounts;
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
        if (invoiceGenerated) {
            setPopupMessage("Invoice has already been generated");
            setShowPopup(true);
            return;
        }
        setLoading(true);

        // Map over services to create the newInvoice array
        const newInvoice = [
            ...services.map((service, index) => ({
                Description: service.name,
                category: service.category,
                Price: prices[index],
                Quantity: quantities[index],
                Discount: discounts[index],
                Tax_amt: taxes[index],
                Staff: staffNames[index],
                CGST: cgst[index],
                SGST: sgst[index],
                Total_amount: totalAmts[index],
            })),
            // ...productDetails.map((product, index) => {
            //   const adjustedIndex = index + services.length;
            //   // console.log("producttttttttt", product);

            //   if (isGST) {
            //     return {
            //       Description: product.name,
            //       Price: product.price,
            //       Quantity: product.quantity,
            //       Discount: 0,
            //       Tax_amt: product.tax, // Return tax amount when GST is applied
            //       CGST: product.cgst, // Return CGST when GST is applied
            //       SGST: product.sgst, // Return SGST when GST is applied
            //       Total_amount: product.total - product.cgst - product.sgst, // Total including taxes
            //     };
            //   } else {
            //     // Return a different structure when GST is not applied
            //     return {
            //       Description: product.name,
            //       Price: product.price,
            //       Quantity: product.quantity,
            //       Discount: 0,
            //       Tax_amt: 0, // No tax applied
            //       CGST: 0, // No CGST applied
            //       SGST: 0, // No SGST applied
            //       Total_amount: product.price * product.quantity,
            //     };
            //   }
            // }),

            // membership && {
            //   Description: membership,
            //   Price: membershipPrice,
            //   Quantity: 1,
            //   Discount: 0,
            //   Tax_amt: membershipTax,
            //   CGST: cgsts,
            //   SGST: sgsts,
            //   Total_amount: membershipTotal,
            // },
        ];
        const productInvoice = productDetails.map((product) => {
            if (isGST) {
                return {
                    Description: product.name,
                    Price: product.price,
                    Quantity: product.quantity,
                    Discount: 0,
                    Tax_amt: product.tax,
                    CGST: product.cgst,
                    SGST: product.sgst,
                    Total_amount: product.total - product.cgst - product.sgst,
                };
            } else {
                return {
                    Description: product.name,
                    Price: product.price,
                    Quantity: product.quantity,
                    Discount: 0,
                    Tax_amt: 0,
                    CGST: 0,
                    SGST: 0,
                    Total_amount: product.price * product.quantity,
                };
            }
        });

        // Now, you have two separate arrays: serviceInvoice and productInvoice
        // console.log("Product Invoice:", productInvoice,productDetails);
        setInvoice(newInvoice);

        const data = {
            customer_name: customer_name,
            mobile_no: mobile_no,
            email: email,
            services: JSON.stringify(newInvoice),
            address: address,
            service_by: "", // Assuming you will fill this value later
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
            json_data: filteredProducts,
            loyalty_points_deducted: deductedPoint,
            coupon_points_deducted: coupon,
            membership: Memebrship,
            coupon: coupon,
            // If payment_mode is an object, convert it to a list of dictionaries
            new_mode:
                Object.keys(payment_mode).length > 0
                    ? Object.keys(payment_mode).map((mode) => ({
                          mode: mode,
                          amount: payment_mode[mode],
                      }))
                    : [{ mode: "cash", amount: total_prise }], // Default to cash if payment_mode is empty
        };

        try {
            // Make the POST request
            const response = await axios.post(
                `${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            // Handle success
            if (response.status === 201) {
                await handlePrint();
                setPopupMessage("Invoice generated successfully");
                setShowPopup(true);
                setInvoiceGenerated(true);

                // handleInvoiceSend();
            }
        } catch (error) {
            // Handle error
            setPopupMessage("Error generating invoice");
            setShowPopup(true);
            console.error("Error generating invoice:", error);
        } finally {
            setLoading(false); // Set loading to false when API call finishes
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
            payment_mode,
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
                            {Object.keys(payment_mode).map((mode) => (
                                <Text key={mode} style={styles.paymentText}>
                                    <Text style={styles.bold}>{mode}:</Text>{" "}
                                    {payment_mode[mode]}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.sectionColumn}>
                            <Text>Date of Invoice: {getCurrentDate()}</Text>
                            <Text>Invoice Id: {getInvoiceId}</Text>
                            {isGST && <Text>GST Number: {gst_number}</Text>}
                            <Text>Contact Number: {user.user}</Text>
                        </View>
                    </View>

                    {/* Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                S. No.
                            </Text>
                            <Text style={[styles.tableCell, { width: "30%" }]}>
                                DESCRIPTION
                            </Text>
                            <Text style={[styles.tableCell, { width: "15%" }]}>
                                PRICE
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                QUANTITY
                            </Text>
                            <Text style={[styles.tableCell, { width: "10%" }]}>
                                DISCOUNT
                            </Text>
                            {isGST ||
                                isMemGst ||
                                (isCouponGst && (
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
                                ))}
                            <Text style={[styles.tableCell, { width: "15%" }]}>
                                TOTAL AMT
                            </Text>
                        </View>
                        {/* Table Rows */}
                        {services.map((service, index) => (
                            <View style={styles.tableRow} key={index}>
                                {/* Display Row Number */}
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {index + 1}
                                </Text>

                                {/* Display Category and Name */}
                                <Text
                                    style={[styles.tableCell, { width: "30%" }]}
                                >
                                    {service.category}: {service.name}
                                </Text>

                                {/* Display Price */}
                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {service.price ? service.price : "N/A"}
                                </Text>

                                {/* Display Input Field Value */}
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {service.inputFieldValue.quantity || "N/A"}
                                </Text>

                                {/* Display Discount */}
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {service.discountValue || 0}
                                </Text>

                                {/* Check if GST fields should be displayed */}
                                {isGST ||
                                    isMemGst ||
                                    (isCouponGst && (
                                        <>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {service.gst || "N/A"}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {service.cgst || "N/A"}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    { width: "10%" },
                                                ]}
                                            >
                                                {service.sgst || "N/A"}
                                            </Text>
                                        </>
                                    ))}

                                {/* Display Total Amount */}
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
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {services.length + 1}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "30%" }]}
                                >
                                    {membership_name}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {membershipPrice}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    1
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    0
                                </Text>
                                {isGST ||
                                    isMemGst ||
                                    (isCouponGst && (
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
                                    ))}
                                {isGST || isMemGst || isCouponGst ? (
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {membershipTotal}
                                    </Text>
                                ) : (
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {membershipTotal - membershipTax}
                                    </Text>
                                )}
                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {membershipTotal}
                                </Text>
                            </View>
                        )}
                        {coupon.map((coupon, index) => {
                            const couponPrice = coupon.coupon_price || 0;
                            const couponName = coupon.coupon_name;
                            const isCouponExclusive =
                                coupon.gst === "Exclusive";

                            let couponCGST = 0,
                                couponSGST = 0,
                                couponTax = 0,
                                couponTotal = couponPrice * quantity;

                            if (isCouponExclusive) {
                                couponCGST = couponPrice * CGST_RATE;
                                couponSGST = couponPrice * SGST_RATE;
                                couponTax = couponCGST + couponSGST;
                                couponTotal =
                                    (couponPrice + couponTax) * quantity;
                            }
                            return (
                                <View style={styles.tableRow} key={index}>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
                                        ]}
                                    >
                                        {index + 1}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "30%" },
                                        ]}
                                    >
                                        {couponName}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {couponPrice}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "10%" },
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
                                        {isGST || isMemGst || isCouponGst
                                            ? couponTotal.toFixed(2)
                                            : (couponTotal - couponTax).toFixed(
                                                  2
                                              )}
                                    </Text>
                                </View>
                            );
                        })}
                        ;
                        {productDetails.map((product, index) => (
                            <View style={styles.tableRow} key={index}>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {services.length + 1 + index}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "30%" }]}
                                >
                                    {product.name}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "15%" }]}
                                >
                                    {product.price}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {product.quantity}
                                </Text>
                                <Text
                                    style={[styles.tableCell, { width: "10%" }]}
                                >
                                    {product.Discounts}
                                </Text>
                                {isGST ||
                                    isMemGst ||
                                    (isCouponGst && (
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
                                    ))}
                                {isGST || isMemGst || isCouponGst ? (
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {product.total -
                                            product.cgst -
                                            product.sgst}
                                    </Text>
                                ) : (
                                    <Text
                                        style={[
                                            styles.tableCell,
                                            { width: "15%" },
                                        ]}
                                    >
                                        {product.total -
                                            product.tax -
                                            product.cgst -
                                            product.sgst}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text
                            style={[styles.tableCell, { width: "40%" }]}
                        ></Text>
                        <Text style={[styles.tableCell, { width: "40%" }]}>
                            TOTAL
                        </Text>
                        <Text style={[styles.tableCell, { width: "40%" }]}>
                            {/* {total_prise} */}
                        </Text>
                        <Text style={[styles.tableCell, { width: "15%" }]}>
                            {Memebrship
                                ? total_quantity + quantity
                                : total_quantity + quantity - 1}
                        </Text>
                        <Text style={[styles.tableCell, { width: "10%" }]}>
                            {total_discount}
                        </Text>
                        {isGST ||
                            isMemGst ||
                            (isCouponGst && (
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
                            ))}
                        <Text style={[styles.tableCell, { width: "15%" }]}>
                            {grand_total}
                        </Text>
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
                // If the blob is created successfully, download it
                // console.log("PDF Blob:", blob);
                saveAs(blob, `Invoice-${invoiceData.getInvoiceId}.pdf`);
                const pdfRef = ref(
                    storage,
                    `invoices/Invoice-${invoiceData.getInvoiceId}.pdf`
                );
                await uploadBytes(pdfRef, blob);

                // Get download URL from Firebase Storage
                const downloadURL = await getDownloadURL(pdfRef);

                // Create WhatsApp link
                const phoneNumber = `+91${mobile_no}`;
                const message = `Hi ${customer_name}!\nWe hope you had a pleasant experience at ${sname}.\nWe are looking forward to servicing you again, attached is the invoice.\nThanks and Regards,\nTeam ${sname}\n\nClick on the link to download:: ${downloadURL}`;
                const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                    message
                )}`;

                // Open WhatsApp link
                window.open(whatsappLink, "_blank");
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

            <div className="invoice_main">
                <form onSubmit={handleGenerateInvoice}>
                    <div>
                        <div className="invoice_header">
                            {/* <img src={Logo1} alt='Logo' className='invoice_logo' /> */}
                            <div className="invoice_name">{sname}</div>
                        </div>
                        <div className="invoice_content">
                            <div id="invoice_left">
                                <h3>
                                    <b>Invoice To:</b>
                                </h3>
                                <p>{customer_name}</p>
                                <p>{address}</p>
                                <p>{email}</p>
                                <p>{mobile_no}</p>
                                <p>
                                    <b>Payment Mode:</b>
                                </p>
                                {Object.keys(payment_mode).map((mode) => (
                                    <p key={mode}>
                                        <b>{mode}:</b> {payment_mode[mode]}
                                    </p>
                                ))}
                            </div>
                            <div id="invoice_right">
                                <div className="invoice-invoice_id">
                                    <p>
                                        <b>Invoice Id:</b>
                                    </p>
                                    <p>{getInvoiceId}</p>
                                </div>
                                <div className="invoice_date">
                                    <p>
                                        <b>Date of Invoice:</b>{" "}
                                    </p>
                                    <p>{getCurrentDate()}</p>
                                </div>
                                {isGST ? (
                                    <div className="invoice_gst">
                                        <p>
                                            <b>GST Number:</b> {gst_number}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="invoice_table table-bordered">
                                <thead>
                                    <tr
                                        style={{
                                            border: "1px solid #787871",
                                            padding: "3px",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <th style={{ width: "5%" }}>S. No.</th>
                                        <th style={{ width: "30%" }}>
                                            DESCRIPTION
                                        </th>
                                        <th style={{ width: "10%" }}>PRICE</th>
                                        <th style={{ width: "10%" }}>
                                            QUANTITY
                                        </th>
                                        <th style={{ width: "10%" }}>
                                            DISCOUNT
                                        </th>
                                        {/* <th style={{ width: '10%' }}>CGST(2.5%)</th> */}
                                        {isGST || isMemGst || isCouponGst ? (
                                            <>
                                                <th style={{ width: "10%" }}>
                                                    TAX AMT(18%)
                                                </th>
                                                <th style={{ width: "10%" }}>
                                                    CGST(9%)
                                                </th>
                                                <th style={{ width: "10%" }}>
                                                    SGST(9%)
                                                </th>
                                            </>
                                        ) : null}
                                        {/* <th style={{ width: '10%' }}>SGST(2.5%)</th> */}
                                        <th
                                            style={{
                                                width: "10%",
                                                color: "white",
                                                backgroundColor: "#0d6efd",
                                            }}
                                        >
                                            TOTAL AMT
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                border: "1px solid #787871",
                                                padding: "3px",
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            <td
                                                scope="col"
                                                style={{ textAlign: "center" }}
                                            >
                                                {index + 1}
                                            </td>
                                            <td
                                                scope="col"
                                                className="text-center"
                                                style={{ textAlign: "center" }}
                                            >
                                                {service.category}:{" "}
                                                {service.name}
                                            </td>
                                            <td
                                                scope="col"
                                                className="text-center"
                                                style={{ textAlign: "center" }}
                                            >
                                                <input
                                                    type="number"
                                                    className="editable-field"
                                                    id={`price_input_${index}`}
                                                    value={prices[index]}
                                                    readOnly
                                                    onChange={(e) =>
                                                        handlePriceBlur(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                scope="col"
                                                className="text-center"
                                                style={{ textAlign: "center" }}
                                            >
                                                <input
                                                    type="number"
                                                    className="editable-field"
                                                    id={`quantity_input_${index}`}
                                                    value={quantities[index]}
                                                    readOnly
                                                    onBlur={(e) =>
                                                        handleQuantityBlur(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td
                                                scope="col"
                                                className="text-center"
                                                style={{ textAlign: "center" }}
                                            >
                                                {service.discountValue}
                                            </td>
                                            {isGST ||
                                            isMemGst ||
                                            isCouponGst ? (
                                                <>
                                                    <td
                                                        scope="col"
                                                        className="text-center"
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {taxes[index]}
                                                    </td>
                                                    <td
                                                        scope="col"
                                                        className="text-center"
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {cgst[index]}
                                                    </td>
                                                    <td
                                                        scope="col"
                                                        className="text-center"
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {sgst[index]}
                                                    </td>
                                                </>
                                            ) : null}
                                            <td
                                                scope="col"
                                                style={{
                                                    width: "20%",
                                                    color: "black",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {totalAmts[index]}
                                            </td>
                                        </tr>
                                    ))}

                                    {Memebrship &&
                                        membership_name !== "None" && (
                                            <tr
                                                style={{
                                                    border: "1px solid #787871",
                                                    padding: "3px",
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <td
                                                    scope="col"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {services.length + 1}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {membership_name}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        className="editable-field"
                                                        value={membershipPrice}
                                                        readOnly
                                                    />
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    1
                                                </td>{" "}
                                                {/* Quantity is always 1 for membership */}
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    0
                                                </td>{" "}
                                                {isGST ||
                                                isMemGst ||
                                                isCouponGst ? (
                                                    <>
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {membershipTax}
                                                        </td>{" "}
                                                        {/* Calculated tax */}
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {cgsts}
                                                        </td>{" "}
                                                        {/* Calculated CGST */}
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {sgsts}
                                                        </td>{" "}
                                                        {/* Calculated SGST */}
                                                    </>
                                                ) : null}
                                                {isGST ||
                                                isMemGst ||
                                                isCouponGst ? (
                                                    <td
                                                        scope="col"
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {membershipTotal}{" "}
                                                        {/* Total including taxes */}
                                                    </td>
                                                ) : (
                                                    <td
                                                        scope="col"
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {membershipTotal -
                                                            membershipTax}{" "}
                                                        {/* Total without taxes */}
                                                    </td>
                                                )}
                                            </tr>
                                        )}

                                    {coupon.map((coupon, index) => {
                                        const couponPrice =
                                            coupon.coupon_price || 0;
                                        const coupon_name = coupon.coupon_name;
                                        let couponCGST = 0,
                                            couponSGST = 0,
                                            couponTax = 0,
                                            couponTotal = couponPrice;

                                        if (coupon.gst === "Exclusive") {
                                            couponCGST =
                                                couponPrice * CGST_RATE;
                                            couponSGST =
                                                couponPrice * SGST_RATE;
                                            couponTax = couponCGST + couponSGST;
                                            couponTotal =
                                                couponPrice + couponTax;
                                        }

                                        return (
                                            <tr
                                                key={index}
                                                style={{
                                                    border: "1px solid #787871",
                                                    padding: "3px",
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <td
                                                    scope="col"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {index + 1}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {coupon_name}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        className="editable-field"
                                                        value={couponPrice}
                                                        readOnly
                                                    />
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {quantity}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    0
                                                </td>

                                                {/* Show GST, CGST, SGST, and Total if applicable */}
                                                {isGST ||
                                                isMemGst ||
                                                isCouponGst ? (
                                                    <>
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {couponTax.toFixed(
                                                                2
                                                            )}
                                                        </td>
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {couponCGST.toFixed(
                                                                2
                                                            )}
                                                        </td>
                                                        <td
                                                            scope="col"
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {couponSGST.toFixed(
                                                                2
                                                            )}
                                                        </td>
                                                    </>
                                                ) : null}

                                                {isGST ||
                                                membergst ||
                                                coupon.gst === "Exclusive" ? (
                                                    <td
                                                        scope="col"
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {couponTotal.toFixed(2)}
                                                    </td>
                                                ) : (
                                                    <td
                                                        scope="col"
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {(
                                                            couponTotal -
                                                            couponTax
                                                        ).toFixed(2)}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    {productDetails.length > 0 &&
                                        productDetails.map((product, index) => (
                                            <tr
                                                key={index}
                                                style={{
                                                    border: "1px solid #787871",
                                                    padding: "3px",
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {index + 1}
                                                </td>

                                                <td
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {product.name}
                                                </td>

                                                <td
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        className="editable-field"
                                                        value={product.price}
                                                        readOnly
                                                    />
                                                </td>

                                                <td
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {product.quantity}
                                                </td>
                                                <td
                                                    scope="col"
                                                    className="text-center"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {product.Discounts}
                                                </td>

                                                {isGST ||
                                                isMemGst ||
                                                isCouponGst ? (
                                                    <>
                                                        <td
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {product.tax}
                                                        </td>
                                                        <td
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {product.cgst}
                                                        </td>
                                                        <td
                                                            className="text-center"
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            {product.sgst}
                                                        </td>
                                                    </>
                                                ) : null}

                                                {isGST || membergst ? (
                                                    <td
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {(
                                                            product.total -
                                                            product.cgst -
                                                            product.sgst
                                                        ).toFixed(2)}
                                                    </td>
                                                ) : (
                                                    <td
                                                        style={{
                                                            width: "20%",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {(
                                                            product.total -
                                                            product.tax -
                                                            product.cgst -
                                                            product.sgst
                                                        ).toFixed(2)}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}

                                    {/* Total Row */}
                                    <tr
                                        style={{
                                            border: "1px solid #787871",
                                            padding: "3px",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <th
                                            colSpan="2"
                                            style={{
                                                width: "20%",
                                                color: "white",
                                                fontWeight: 500,
                                                fontSize: 15,
                                                backgroundColor: "#0d6efd",
                                            }}
                                        >
                                            TOTAL
                                        </th>
                                        <th
                                            style={{
                                                width: "5%",
                                                padding: "0.7%",
                                            }}
                                            className="text-center"
                                        >
                                            {/* {total_prise} */}
                                        </th>
                                        <th
                                            style={{
                                                width: "10%",
                                                padding: "0.7%",
                                            }}
                                            className="text-center"
                                        >
                                            {Memebrship
                                                ? total_quantity + quantity
                                                : total_quantity + quantity - 1}
                                        </th>
                                        <th
                                            style={{
                                                width: "10%",
                                                padding: "0.7%",
                                            }}
                                            className="text-center"
                                        >
                                            {total_discount}
                                        </th>
                                        {isGST || isMemGst || isCouponGst ? (
                                            <>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        padding: "0.7%",
                                                    }}
                                                    className="text-center"
                                                >
                                                    {total_tax}
                                                </th>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        padding: "0.7%",
                                                    }}
                                                    className="text-center"
                                                >
                                                    {total_cgst}
                                                </th>
                                                <th
                                                    style={{
                                                        width: "10%",
                                                        padding: "0.7%",
                                                    }}
                                                    className="text-center"
                                                >
                                                    {total_sgst}
                                                </th>
                                            </>
                                        ) : null}
                                        <th
                                            style={{
                                                width: "10%",
                                                padding: "0.1%",
                                                backgroundColor: "#0d6efd",
                                                color: "white",
                                            }}
                                        >
                                            {/* <small style={{ color: "white" }}>
                        Loyalty Points used: {deductedPoint}
                      </small>{" "} */}
                                            <br />
                                            Total: {grand_total}
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {comments ? (
                            <div className="inv_comm">
                                <h4>Comments:</h4>
                                <p>{comments}</p>
                            </div>
                        ) : null}

                        <div id="invoice_footer">
                            <div id="invoice_footer_left">
                                {membership_points > 0 && (
                                    <>
                                        <h4>Membership Points Discount:</h4>
                                    </>
                                )}
                                {coupon_points > 0 && (
                                    <>
                                        <h4>coupon Points Discount:</h4>
                                    </>
                                )}
                                <h4>Amount in Words:</h4>
                                <p>{grandTotalInWords} Rupees Only</p>
                            </div>
                            <div id="invoice_footer_right">
                                {membership_points > 0 && (
                                    <p className="text-black font-bold">
                                        - {membership_points} Points
                                    </p>
                                )}
                                {coupon_points > 0 && (
                                    <p className="text-black font-bold">
                                        - {coupon_points} Points
                                    </p>
                                )}

                                <h4>FINAL VALUE:</h4>
                                <p className="text-black font-bold">
                                    Rs {final_price}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div className="flex items-center justify-center mt-8">
                <button
                    className="flex items-center justify-center px-6 py-2 text-white 
              bg-blue-500 rounded-md hover:bg-blue-600 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                    onClick={handleGenerateInvoice}
                    disabled={loading || invoiceGenerated}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
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
