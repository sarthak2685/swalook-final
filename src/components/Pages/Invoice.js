import React, { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import { json, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from "react-to-print";
import '../Styles/Invoice.css';
import Logo1 from '../../assets/S_logo.png'
import numberToWords from '../Pages/NumberToWords';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Popup from './Popup';
import { Helmet } from 'react-helmet';
import config from '../../config';
import { CircularProgress } from '@mui/material';
import { storage } from '../../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; 

function Invoice() {

  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false); 
  // const [membershipPrice, setMembershipPrice] = useState(0);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bid = localStorage.getItem('branch_id');

  
  const location = useLocation();
  const getCurrentDate = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const currentDate = new Date();
    const month = months[currentDate.getMonth()];
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  const isGST = location.state.isGST;
  const customer_name = location.state.customer_name;
  const mobile_no = location.state.mobile_no;
  const email = location.state.email;
  const services = location.state.GBselectedServices;
  const address = location.state.address;
  const service_by = location.state.service_by;
  const discount = location.state.discount;
  const gst_number = location.state.gst_number;
  const comments = location.state.comments;
  const invoiceId = location.state.InvoiceId;
  const payment_mode = location.state.PaymentMode;
  const sname = localStorage.getItem('s-name');
  const [deductedPoint, setDeductedPoint] = useState(0);

  const initialPrices = services.map(service => parseFloat(service.finalPrice));
  const [prices, setPrices] = useState(initialPrices);
  const initialQuantity = services.map(service => parseFloat(service.inputFieldValue));
  const [quantities, setQuantities] = useState(initialQuantity);

  const token = localStorage.getItem('token');


  const [discounts, setDiscounts] = useState(Array(services.length).fill(discount));
  const [taxes, setTaxes] = useState(Array(services.length).fill(0));
  const [cgst, setCGST] = useState(Array(location.state.GBselectedServices.length).fill(0));
  const [sgst, setSGST] = useState(Array(location.state.GBselectedServices.length).fill(0));
  const [totalAmts, setTotalAmts] = useState(Array(location.state.GBselectedServices.length).fill(0));

  const [total_prise, setTotalPrice] = useState(0);
  const [total_quantity, setTotalQuantity] = useState(0);
  const [total_discount, setTotalDiscount] = useState(0);
  const [total_tax, setTotalTax] = useState(0);
  const [total_cgst, setTotalCGST] = useState(0);
  const [total_sgst, setTotalSGST] = useState(0);
  const [grand_total, setGrandTotal] = useState(0);
  

  const [invoice , setInvoice] = useState([]);
  const [productPrice, setProductPrice] = useState(0);
  const [productDetails, setProductDetails] = useState([]);
  const [producData, setProductData] = useState(location.state?.productData || []); // Default to empty array if not set
  
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
  
  useEffect(() => {
    const fetchProductData = async () => {
      const token = localStorage.getItem('token'); // Ensure token is defined
    
      try {
        const response = await axios.get(apipoint, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });
    
        console.log("API Response", response.data); // Log API response
    
        const productDatas = response.data.data;
        console.log("ProductDatas", productDatas); // Log productDatas
    
        if (Array.isArray(productDatas)) {
          const selectedProductDetails = producData
            .map(pd => {
              const product = productDatas.find(p => p.id === pd.id);
              if (product) {
                // Ensure price and quantity are numbers
                const price = Number(product.product_price) || 0;
                const quantity = Number(pd.quantity) || 0;
                const tax = Number(calculateTax(price)) || 0;
                const cgst = Number(calculateCGST(price)) || 0;
                const sgst = Number(calculateSGST(price)) || 0;
    
                // Log values for debugging
                console.log(`Price: ${price}, Quantity: ${quantity}, Tax: ${tax}, CGST: ${cgst}, SGST: ${sgst}`);
    
                // Calculate total
                const total = (price * quantity) + tax + cgst + sgst;
                console.log(`Calculated Total Before Rounding: ${total}`);
    
                return {
                  name: product.product_name,
                  price: roundToTwoDecimals(price),
                  quantity,
                  tax: roundToTwoDecimals(tax),
                  cgst: roundToTwoDecimals(cgst),
                  sgst: roundToTwoDecimals(sgst),
                  total: roundToTwoDecimals(total), // Use rounded total
                };
              }
              return null;
            })
            .filter(product => product !== null);
    
          console.log("Selected Product Details", selectedProductDetails); // Log selectedProductDetails
          setProductDetails(selectedProductDetails);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    
  
    fetchProductData();
  }, [apipoint, producData]); // Removed token from dependencies as it’s defined inside useEffect
  
 // Add dependencies for useEffect

 const [membershipPrice, setMembershipPrice] = useState(0);

  const [membership, setMembership] = useState(location.state?.selectMembership);
  const branchId = localStorage.getItem('branch_id');

  const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/view/?branch_name=${branchId}`;

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
  
        const membershipData = response.data.data;
        console.log("membership", membershipData);
  
        // Ensure membershipData is an array
        if (Array.isArray(membershipData)) {
          // If membership is "None" or not valid, skip fetching
          if (membership === "None" || !membership) {
            setMembershipPrice(0);
            return;
          }
          console.log("Fetching members",membership,setMembershipPrice);
  
          // Find the selected membership price
          const selectedMembership = membershipData.find(m => m.program_type === membership);
          console.log("selectedMembership", selectedMembership);
  
          const price = selectedMembership ? selectedMembership.price : 0;
          console.log("price-", price);
  
          setMembershipPrice(price);
        } else {
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching membership data:', error);
      }
    };
  
    // Only fetch data if membership is not "None" or invalid
    if (membership && membership !== "None") {
      fetchMembershipData();
    }
  }, [membership, apiEndpoint, token]);
  

useEffect(() => {
  const GST_RATE = 0.18;
  const CGST_RATE = GST_RATE / 2;
  const SGST_RATE = GST_RATE / 2;

  // Check if any service has "No GST"
  const noGSTApplied = services.some(service => service.gst === "No GST");

  // Calculate taxes for services
  const updatedServiceTaxes = prices.map((price, index) => {
    const amountBeforeTax = (price * quantities[index]) - discounts[index];
    let taxAmount = 0;
    let cgstValue = 0;
    let sgstValue = 0;

    // Apply GST only if service does not have "No GST"
    if (services[index].gst !== "No GST") {
      taxAmount = amountBeforeTax * GST_RATE;
      cgstValue = taxAmount / 2;
      sgstValue = taxAmount / 2;
    }

    const totalAmt = parseFloat((amountBeforeTax + taxAmount).toFixed(2));

    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      cgstValue: parseFloat(cgstValue.toFixed(2)),
      sgstValue: parseFloat(sgstValue.toFixed(2)),
      totalAmt
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
  console.log("dvkdbv",totalAmt);
     // Total amount includes base price + tax if applicable
    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      cgstValue: parseFloat(cgstValue.toFixed(2)),
      sgstValue: parseFloat(sgstValue.toFixed(2)),
      totalAmt: parseFloat(totalAmt.toFixed(2))
    };
  });
  

  let membershipTotal = membershipPrice;
  let membershipTax = 0;
  let membershipCGST = 0;
  let membershipSGST=0;
  
  // Calculate GST values only if GST is applied
  if (isGST) {
    const membershipCGST = membershipPrice * CGST_RATE;
    const membershipSGST = membershipPrice * SGST_RATE;
    membershipTax = membershipCGST + membershipSGST;
    membershipTotal = membershipPrice + membershipTax;
    // console.log("sahil",membershipSGST,membershipCGST);
  }
  // Aggregate totals for services and products
  const totalServicePrices = prices.reduce((acc, price, index) => acc + (price * quantities[index] - discounts[index]), 0);
  const totalServiceQuantity = quantities.reduce((acc, quantity) => acc + quantity, 0);
  const totalServiceDiscount = discounts.reduce((acc, discount) => acc + discount, 0);

  // Calculate totals for products
  const totalProductPrices = productDetails.reduce((acc, product) => acc + (product.price * product.quantity), 0);
  const totalProductQuantity = productDetails.reduce((acc, product) => acc + product.quantity, 0);

  // Membership quantity to be added here
  const membershipQuantity = 1; // Change this to the actual membership quantity value
  const totalQuantity = totalServiceQuantity + totalProductQuantity + membershipQuantity;

  // Service totals
  const totalServiceTax = updatedServiceTaxes.reduce((acc, { taxAmount }) => acc + taxAmount, 0);
  const totalServiceCGST = updatedServiceTaxes.reduce((acc, { cgstValue }) => acc + cgstValue, 0);
  const totalServiceSGST = updatedServiceTaxes.reduce((acc, { sgstValue }) => acc + sgstValue, 0);
  const totalServiceGrandTotal = updatedServiceTaxes.reduce((acc, { totalAmt }) => acc + totalAmt, 0);

  // Product totals
  const totalProductTax = updatedProductTaxes.reduce((acc, { taxAmount }) => acc + taxAmount, 0);
  const totalProductCGST = updatedProductTaxes.reduce((acc, { cgstValue }) => acc + cgstValue, 0);
  const totalProductSGST = updatedProductTaxes.reduce((acc, { sgstValue }) => acc + sgstValue, 0);
  const totalProductGrandTotal = updatedProductTaxes.reduce((acc, { totalAmt }) => acc + totalAmt, 0);

  // Final totals including membership
  const finalTotalPrice = totalServicePrices + totalProductPrices + membershipPrice;
  const finalGrandTotal = totalServiceGrandTotal + totalProductGrandTotal + membershipTotal;

  // Update states
  setTotalPrice(finalTotalPrice.toFixed(2));
  setTotalQuantity(totalQuantity); // Updated with membership quantity
  setTotalDiscount(totalServiceDiscount);
  setTotalTax((totalServiceTax + totalProductTax + membershipTax).toFixed(2));
  setTotalCGST((totalServiceCGST + totalProductCGST).toFixed(2));
  setTotalSGST((totalServiceSGST + totalProductSGST).toFixed(2));
  setGrandTotal(finalGrandTotal.toFixed(2));
  setTaxes(updatedServiceTaxes.map(t => t.taxAmount).concat(updatedProductTaxes.map(t => t.taxAmount)));
  setCGST(updatedServiceTaxes.map(t => t.cgstValue).concat(updatedProductTaxes.map(t => t.cgstValue)));
  setSGST(updatedServiceTaxes.map(t => t.sgstValue).concat(updatedProductTaxes.map(t => t.sgstValue)));
  setTotalAmts(updatedServiceTaxes.map(t => t.totalAmt).concat(updatedProductTaxes.map(t => t.totalAmt)));
}, [prices, quantities, discounts, services, productDetails, membershipPrice]);



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
    const discountValue = value === null || value === undefined ? 0 : parseFloat(value);
    const newDiscounts = [...discounts];
    newDiscounts[index] = discountValue;
    setDiscounts(newDiscounts);
  };

  const handleTaxBlur = (index, value) => {
    const newTaxes = [...taxes];
    newTaxes[index] = parseFloat(value);
    setTaxes(newTaxes);
  }

  const handleCGSTBlur = (index, value) => {
    const newCGST = [...cgst];
    newCGST[index] = parseFloat(value);
    setCGST(newCGST);
  }

  const handleSGSTBlur = (index, value) => {
    const newSGST = [...sgst];
    newSGST[index] = parseFloat(value);
    setSGST(newSGST);
  }

  const handleTotalAmtBlur = (index, value) => {
    const newTotalAmts = [...totalAmts];
    newTotalAmts[index] = parseFloat(value);
    setTotalAmts(newTotalAmts);
  }

  const [Minimum , setMinimum] = useState(0);

  useEffect(() => {
    const fetchAmount = async () => {
      const apiEndpoint = `${config.apiUrl}/api/swalook/loyality_program/get_minimum_value/?branch_name=${bid}`;
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        });
        if (response.data.status) {
          setMinimum(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    }
    fetchAmount();
  }
  , []);

  useEffect(() => {
    if (grand_total > Minimum) {
      setDeductedPoint(location.state.deductedPoints || 0);
    } else {
      setDeductedPoint(0);
    }
  }, [grand_total, Minimum]);


  const bname = atob(localStorage.getItem('branch_name'));  

  const final_price = Math.ceil(parseFloat(grand_total) - parseFloat(deductedPoint));

  const grandTotalInWords = numberToWords(final_price);


const [invoiceGenerated, setInvoiceGenerated] = useState(false); 

 const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (invoiceGenerated) {
      setPopupMessage('Invoice has already been generated');
      setShowPopup(true);
      return;
    }
    setLoading(true);

    // Map over services to create the newInvoice array
    const newInvoice =[ 
      ...services.map((service, index) => ({
      Description: service.value,
      Price: prices[index],
      Quantity: quantities[index],
      Discount: discounts[index],
      Tax_amt: taxes[index],
      CGST: cgst[index],
      SGST: sgst[index],
      Total_amount: totalAmts[index],
    })),
...productDetails.map((product, index) => {
  const adjustedIndex = index + services.length;
  console.log("producttttttttt", adjustedIndex);

  if (isGST) {
    return {
      Description: product.name,
      Price: product.price,  
      Quantity: product.quantity,
      Discount: 0,
      Tax_amt: product.tax,   // Return tax amount when GST is applied
      CGST: product.cgst,     // Return CGST when GST is applied
      SGST: product.sgst,     // Return SGST when GST is applied
      Total_amount: product.total-product.cgst-product.sgst,  // Total including taxes
    };
  } else {
    // Return a different structure when GST is not applied
    return {
      Description: product.name,
      Price: product.price,  
      Quantity: product.quantity,
      Discount: 0, 
      Tax_amt: 0,  // No tax applied
      CGST: 0,     // No CGST applied
      SGST: 0,     // No SGST applied
      Total_amount: product.price * product.quantity,  
    };
  }
}),

    membership && {
      Description: membership,
      Price: membershipPrice,
      Quantity: 1,
      Discount: 0,
      Tax_amt: membershipTax,
      CGST: cgsts,
      SGST: sgsts,
      Total_amount: membershipTotal,
    }
  ]
  
    setInvoice(newInvoice);
  
    const token = localStorage.getItem('token');
    console.log("token",totalAmts);
  console.log(final_price);
  
  
    const data = {
      customer_name: customer_name,
      mobile_no: mobile_no,
      email: email,
      services: JSON.stringify(newInvoice),
      address: address,
      service_by: service_by.map(service => service.label).toString(),
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
      json_data: producData,
      loyalty_points_deducted: deductedPoint,
      payment_mode: payment_mode
    };
  
    try {
      // Make the POST request
      const response = await axios.post(`${config.apiUrl}/api/swalook/billing/?branch_name=${bid}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
  
      // Handle success
      if (response.status === 201) {
        await handlePrint();
        setPopupMessage('Invoice generated successfully');
        setShowPopup(true);
        setInvoiceGenerated(true); 

      // handleInvoiceSend();

      }
    } catch (error) {
      // Handle error
      setPopupMessage('Error generating invoice');
      setShowPopup(true);
      console.error('Error generating invoice:', error);
    } finally {
      setLoading(false); // Set loading to false when API call finishes
    }

  };
  
  console.log("service",service_by)

  const [getInvoiceId , setInvoiceId] = useState(invoiceId);

  const [getSaloonName, setSaloonName] = useState('');
  useEffect(()=>{
    setSaloonName(localStorage.getItem('saloon_name'));
  })

  const branchName = localStorage.getItem('branch_name');
// Calculate taxes and totals for the membership
let membershipTotal = membershipPrice;
let membershipTax = 0;
let cgsts = 0;
let sgsts=0;

// Calculate GST values only if GST is applied
if (isGST) {
   cgsts = membershipPrice * CGST_RATE;
   sgsts = membershipPrice * SGST_RATE;
  membershipTax = cgsts + sgsts;
  membershipTotal = membershipPrice + membershipTax;
  console.log("shjbfhbhgbefbehjbfhjdb",cgsts,sgsts);
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
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(`${config.apiUrl}/api/swalook/save-pdf/`, formData, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('PDF saved successfully', response.data);
  } catch (error) {
    console.error('Error saving PDF:', error);
  }
};



const handlePrint = async () => {
  const styles = StyleSheet.create({
    invoiceContainer: { padding: 20, paddingHorizontal: 20 },
    section: {
      marginBottom: 20,
      flexDirection: "row",
      justifyContent: "space-between", // Align header and customer sections
      
      alignItems: "flex-start",
    },
    sectionColumn: { flex: 1, marginHorizontal: 10 , gap: 5, fontSize: 14},
    invoiceHeader: { 
      textAlign: "center", 
      fontSize: 24, 
      fontWeight: "bold", 
      marginBottom: 15 // Add space after sname header
    },
    table: { width: "100%", marginTop: 20 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#f0f0f0",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      fontSize: 10,
      fontWeight: "bold",
      padding: 5,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      fontSize: 10,
      paddingVertical: 8,
    },
    tableCell: { flex: 1, textAlign: "center", padding: 5 },
    totalRow: {
      flexDirection: "row",
      backgroundColor: "#eaeaea",
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      fontWeight: "bold",
      paddingVertical: 10,
      fontSize: 9, // Smaller font size for the total row
    },
    footer: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 10, // Smaller text size for footer
    },
    footerText: { fontWeight: "bold" },
    fieldName: { fontWeight: "600" }, // Semibold for field names
  });


  // Example Data - Replace with actual dynamic data
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
    membership,
    membershipPrice,
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
  };

  const InvoiceDocument = () => (
<Document>
<Page style={styles.invoiceContainer}>
<Text style={styles.invoiceHeader}>{sname}</Text>

      {/* Header and Customer Section */}
      <View style={styles.section}>
      <View style={styles.sectionColumn}>
            <Text style={styles.fieldName}>Invoice To:</Text>
            <Text>{customer_name}</Text>
            <Text>{address}</Text>
            <Text>{email}</Text>
            <Text>{mobile_no}</Text>
            <Text>Payment Mode: {payment_mode}</Text>
          </View>
          <View style={styles.sectionColumn}>
            <Text>Date of Invoice: {getCurrentDate()}</Text>
            <Text>Invoice Id: {getInvoiceId}</Text>
            {isGST && <Text>GST Number: {gst_number}</Text>}
          </View>
          
      </View>


        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '10%' }]}>S. No.</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>DESCRIPTION</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>PRICE</Text>
            <Text style={[styles.tableCell, { width: '10%' }]}>QUANTITY</Text>
            <Text style={[styles.tableCell, { width: '10%' }]}>DISCOUNT</Text>
            {isGST && (
              <>
                <Text style={[styles.tableCell, { width: '10%' }]}>TAX AMT</Text>
                <Text style={[styles.tableCell, { width: '10%' }]}>CGST</Text>
                <Text style={[styles.tableCell, { width: '10%' }]}>SGST</Text>
              </>
            )}
            <Text style={[styles.tableCell, { width: '15%' }]}>TOTAL AMT</Text>
          </View>

          {/* Table Rows */}
          {services.map((service, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={[styles.tableCell, { width: "10%" }]}>{index + 1}</Text>
            <Text style={[styles.tableCell, { width: "30%" }]}>{service.value}</Text>
            <Text style={[styles.tableCell, { width: "15%" }]}>{service.price}</Text>
            <Text style={[styles.tableCell, { width: "10%" }]}>
              {service.inputFieldValue || "N/A"}
            </Text>
            <Text style={[styles.tableCell, { width: "10%" }]}>{service.discount || 0}</Text>
            {isGST && (
              <>
                <Text style={[styles.tableCell, { width: "10%" }]}>{service.tax}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{service.cgst}</Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>{service.sgst}</Text>
              </>
            )}
            <Text style={[styles.tableCell, { width: "15%" }]}>{totalAmts[index]}</Text>
          </View>
        ))}

          {/* Membership Row */}
          {membership && membership !== 'None' && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '10%' }]}>{services.length + 1}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{membership}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{membershipPrice}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>1</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>0</Text>
              {isGST && (
                <>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{membershipTax}</Text>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{cgsts}</Text>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{sgsts}</Text>
                </>
              )}
              {isGST ? (
               <Text style={[styles.tableCell, { width: '15%' }]}>{membershipTotal}</Text>

              ) : (
                <Text style={[styles.tableCell, { width: '15%' }]}>{membershipTotal-membershipTax}</Text>
              )}
              <Text style={[styles.tableCell, { width: '15%' }]}>{membershipTotal}</Text>
            </View>
          )}

          {/* Product Rows */}
          {productDetails.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, { width: '10%' }]}>{services.length + 1 + index}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{product.name}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{product.price}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{product.quantity}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>0</Text>
              {isGST && (
                <>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{product.tax}</Text>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{product.cgst}</Text>
                  <Text style={[styles.tableCell, { width: '10%' }]}>{product.sgst}</Text>
                </>
              )}
              {isGST ? (
                <Text style={[styles.tableCell, { width: '15%' }]}>{product.total - product.cgst-product.sgst}</Text>
              ) : (
                <Text style={[styles.tableCell, { width: '15%' }]}>{product.total-product.tax-product.cgst-product.sgst}</Text>
              )}
             
            </View>
          ))}
        </View>
        <View style={[styles.tableRow, styles.totalRow]}>
        <Text style={[styles.tableCell, { width: "40%" }]}></Text>
          <Text style={[styles.tableCell, { width: "40%" }]}>TOTAL</Text>
          <Text style={[styles.tableCell, { width: "40%" }]}>{total_prise}</Text>
          <Text style={[styles.tableCell, { width: "15%" }]}>
            {membership === "None" ? total_quantity - 1 : total_quantity}
          </Text>
          <Text style={[styles.tableCell, { width: "10%" }]}>{total_discount}</Text>
          {isGST && (
            <>
              <Text style={[styles.tableCell, { width: "10%" }]}>{total_tax}</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>{total_cgst}</Text>
              <Text style={[styles.tableCell, { width: "10%" }]}>{total_sgst}</Text>
            </>
          )}
          <Text style={[styles.tableCell, { width: "15%" }]}>{grand_total}</Text>
        </View>
          { comments ? (
          <Text>Comments: {comments}</Text>
          ) : null}


        {/* Footer */}
        <View style={styles.footer}>
          <Text>Amount in Words: {grandTotalInWords} Rupees Only</Text>
          <Text>FINAL VALUE: Rs {final_price}</Text>
        </View>
      </Page>
    </Document>
  );
  try {
    const blob = await pdf(<InvoiceDocument />).toBlob();

    if (blob) {
      // If the blob is created successfully, download it
      console.log('PDF Blob:', blob);
      saveAs(blob, `Invoice-${invoiceData.getInvoiceId}.pdf`);
      const pdfRef = ref(storage, `invoices/Invoice-${invoiceData.getInvoiceId}.pdf`);
      await uploadBytes(pdfRef, blob);
    
      // Get download URL from Firebase Storage
      const downloadURL = await getDownloadURL(pdfRef);
    
      // Create WhatsApp link
      const phoneNumber = `+91${mobile_no}`;
      const message = `Hi ${customer_name}!\nWe hope you had a pleasant experience at ${atob(branchName)}.\nWe are looking forward to servicing you again, attached is the invoice.\nThanks and Regards,\nTeam ${atob(branchName)}\n\nClick on the link to download:: ${downloadURL}`;
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
      // Open WhatsApp link
      window.open(whatsappLink, '_blank');
    } else {
      console.error('Failed to create PDF blob');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  }

  // const blob = await pdf(<InvoiceDocument />).toBlob();

  // // Save PDF locally
  // saveAs(blob, `Invoice-${invoiceData.getInvoiceId}.pdf`);

  // // Initialize formData for uploading the PDF

};


console.log("hero hu ",typeof membership, membership, membershipPrice);
  return (
    
    <div className='invoice_container'>
      <Helmet>
        <title>Invoice</title>
      </Helmet>
      
      <div  className='invoice_main'>
        <form onSubmit={handleGenerateInvoice}>
          <div>
        <div className='invoice_header'>
          {/* <img src={Logo1} alt='Logo' className='invoice_logo' /> */}
          <div className='invoice_name'>{sname}</div>
        </div>
        <div className='invoice_content'>
          <div className='invoice_left'>
            <h3><b>Invoice To:</b></h3>
            <p>{customer_name}</p>
            <p>{address}</p>
            <p>{email}</p>
            <p>{mobile_no}</p>
            <p><b>Payment Mode:</b> {payment_mode}</p>
          </div>
          <div className='invoice_right'>
            <div className='invoice-invoice_id'>
            <p><b>Invoice Id:</b></p>
              <p>{getInvoiceId}</p>
            </div>
            <div className='invoice_date'>
              <p><b>Date of Invoice:</b> </p>
              <p>{getCurrentDate()}</p>
            </div>
            {isGST ? (
              <div className='invoice_gst'>
                <p><b>GST Number:</b> {gst_number}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className='table-responsive'>
          <table className='invoice_table table-bordered'>
            <thead>
              <tr style={{ border: '1px solid #787871', padding: '3px', backgroundColor: '#fff' }}>
                <th style={{ width: '5%' }}>S. No.</th>
                <th style={{ width: '30%' }}>DESCRIPTION</th>
                <th style={{ width: '10%' }}>PRICE</th>
                <th style={{ width: '10%' }}>QUANTITY</th>
                <th style={{ width: '10%' }}>DISCOUNT</th>
                {/* <th style={{ width: '10%' }}>CGST(2.5%)</th> */}
                {isGST ? (
                  <>
                    <th style={{ width: '10%' }}>TAX AMT(18%)</th>
                    <th style={{ width: '10%' }}>CGST(9%)</th>
                    <th style={{ width: '10%' }}>SGST(9%)</th>
                  </>
                ) : null}
                {/* <th style={{ width: '10%' }}>SGST(2.5%)</th> */}
                <th style={{ width: '10%', color: 'white', backgroundColor: '#0d6efd' }}>TOTAL AMT</th>
              </tr>
            </thead>
            <tbody>
  {services.map((service, index) => (
    <tr key={index} style={{ border: '1px solid #787871', padding: '3px', backgroundColor: '#fff' }}>
      <td scope='col' style={{ textAlign: 'center' }}>{index + 1}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{service.value}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>
        <input type='number' className='editable-field' id={`price_input_${index}`} value={prices[index]} readOnly onChange={(e) => handlePriceBlur(index, e.target.value)} />
      </td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>
        <input type='number' className='editable-field' id={`quantity_input_${index}`} value={quantities[index]} readOnly onBlur={(e) => handleQuantityBlur(index, e.target.value)} />
      </td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>
        <input type='number' className='editable-field' id={`discount_input_${index}`} defaultValue={discounts[index] === null || discounts[index] === undefined ? 0 : discounts[index]} onBlur={(e) => handleDiscountBlur(index, e.target.value)} />
      </td>
      {isGST ? (
        <>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{taxes[index]}</td>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{cgst[index]}</td>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{sgst[index]}</td>
        </>
      ) : null}
      <td scope='col' style={{ width: '20%', color: 'black', textAlign: 'center' }}>{totalAmts[index]}</td>
    </tr>
  ))}

  {membership && membership!=="None" &&(
    <tr style={{ border: '1px solid #787871', padding: '3px', backgroundColor: '#fff' }}>
      <td scope='col' style={{ textAlign: 'center' }}>{services.length + 1}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{membership}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>
        <input type='number' className='editable-field' value={membershipPrice} readOnly />
      </td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>1</td> {/* Quantity is always 1 for membership */}
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>0</td> {/* Discount is always 0 */}
      {isGST ? (
        <>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{membershipTax}</td> {/* Calculated tax */}
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{cgsts}</td> {/* Calculated CGST */}
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{sgsts}</td> {/* Calculated SGST */}
        </>
      ) : null}

    {isGST ? (
  <td scope='col' style={{ width: '20%', color: 'black', textAlign: 'center' }}>
    {(membershipTotal)} {/* Total including taxes */}
  </td>
) : (
  <td scope='col' style={{ width: '20%', color: 'black', textAlign: 'center' }}>
    {membershipTotal - membershipTax} {/* Total without taxes */}
  </td>
)}
    </tr>
  )}
{productDetails.length > 0 && (
  <>
    <tr style={{ border: '1px solid #787871', padding: '3px', backgroundColor: '#fff' }}>
      <td scope='col' style={{ textAlign: 'center' }}>3</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{productDetails[0].name}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>
        <input type='number' className='editable-field' value={productDetails[0].price} readOnly />
      </td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{productDetails[0].quantity}</td>
      <td scope='col' className='text-center' style={{ textAlign: 'center' }}>0</td>
      {isGST ? (
        <>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{productDetails[0].tax}</td>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{productDetails[0].cgst}</td>
          <td scope='col' className='text-center' style={{ textAlign: 'center' }}>{productDetails[0].sgst}</td>
        </>
      ) : null}
      {isGST ? (
  <td scope='col' style={{ width: '20%', color: 'black', textAlign: 'center' }}>
    {(productDetails[0].total - productDetails[0].cgst - productDetails[0].sgst).toFixed(2)}
  </td>
) : (
  <td scope='col' style={{ width: '20%', color: 'black', textAlign: 'center' }}>
    {(productDetails[0].total -productDetails[0].tax -productDetails[0].cgst -productDetails[0].sgst)}
  </td>
)}

    </tr>
  </>
)}


{/* Total Row */}
<tr style={{ border: '1px solid #787871', padding: '3px', backgroundColor: '#fff' }}>
  <th colSpan='2' style={{ width: '20%', color: 'white', fontWeight: 500, fontSize: 15, backgroundColor: '#0d6efd' }}>TOTAL</th>
  <th style={{ width: '5%', padding: '0.7%' }} className='text-center'>{total_prise}</th>
  <th style={{ width: '10%', padding: '0.7%' }} className="text-center">
  {membership === 'None' ? total_quantity - 1 : total_quantity}
</th>
  <th style={{ width: '10%', padding: '0.7%' }} className='text-center'>{total_discount}</th>
  {isGST ? (
    <>
      <th style={{ width: '10%', padding: '0.7%' }} className='text-center'>{total_tax}</th>
      <th style={{ width: '10%', padding: '0.7%' }} className='text-center'>{total_cgst}</th>
      <th style={{ width: '10%', padding: '0.7%' }} className='text-center'>{total_sgst}</th>
    </>
  ) : null}
  <th style={{ width: '10%', padding: '0.1%', backgroundColor: '#0d6efd', color: 'white' }}>
    <small style={{ color: 'white' }}>Loyalty Points used: {deductedPoint}</small> <br />
    Total: {grand_total} 
  </th>
</tr>
</tbody>


          </table>
        </div>
        {comments ? (
  <div className='inv_comm'>
    <h4>Comments:</h4>
    <p>{comments}</p>  
  </div>
) : null}

        <div className='invoice_footer'>
          <div className='invoice_footer_left'>
            <h4>Amount in Words:</h4>
            <p>{grandTotalInWords} Rupees Only</p>
          </div>
          <div className='invoice_footer_right'>
            <h4>FINAL VALUE:</h4>
            <p>Rs {final_price}</p>
          </div>
        </div>
        </div>
        
        </form>
      </div>
      <div className='generate-button-container'>
  <button 
    className='generate-button' 
    onClick={handleGenerateInvoice} 
    disabled={loading || invoiceGenerated}  
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Final Invoice'}
  </button>
</div>
      {showPopup && <Popup message={popupMessage} onClose={() => {setShowPopup(false); navigate(`/${sname}/${branchName}/dashboard`);} }/>}
    </div>
  );
}

export default Invoice;