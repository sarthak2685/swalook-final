import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../Styles/showInvoice.css';
import { Helmet } from 'react-helmet';
import numberToWords from './NumberToWords';
import { useParams } from 'react-router-dom';
import Logo1 from '../../assets/S_logo.png';
import config from '../../config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


function ViewInvoice() {
  const { id } = useParams();
  const [saloon_name, setSaloonName] = useState('');
  const [invoiceData, setInvoiceData] = useState({});
  const invoiceRef = useRef(null);
  const bid = localStorage.getItem('branch_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/api/swalook/get_bill_data/?id=${id}&branch_name=${bid}`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log("response", response.data);
        console.log("data",response.data.current_user_data);
  
        setInvoiceData(response.data.current_user_data);
        setSaloonName(localStorage.getItem('saloon_name'));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [id]);
  

  // Function to generate PDF with adjusted margins
  // const generatePDF = () => {
  //   const capture = document.querySelector('.invoice_main');
  //   const margin = 10; 
  //   const pageWidth = 210; 
  //   const increasedWidth = pageWidth + (2 * margin); 

  //   html2canvas(capture).then(canvas => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'mm', [increasedWidth, 297]); 
  //     const componentWidth = pdf.internal.pageSize.getWidth();
  //     const componentHeight = pdf.internal.pageSize.getHeight();

      
  //     const posX = margin;
  //     const posY = margin;
  //     const imgWidth = componentWidth - (2 * margin);
  //     const imgHeight = componentHeight - (2 * margin);

  //     pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
  //     pdf.save(`invoice_${id}.pdf`);
  //   });
  // };

  const generatePDF = () => {
    const capture = document.querySelector('.invoice_main');
    
    html2canvas(capture).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with A4 size
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Define padding and margin
      const padding = 10; // 10mm padding
      const margin = 10;  // 10mm margin
      
      // Calculate the available width and height for the image
      const availableWidth = pdfWidth - 2 * margin;
      const availableHeight = pdfHeight - 2 * margin;
      
      // Calculate the image width and height to fit within the available area
      const imgWidth = availableWidth - 2 * padding;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Position the image with padding and margin
      const posX = margin + padding ;
      const posY = margin + padding ;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth , imgHeight);
      pdf.save(`Invoice-${id}.pdf`);
    });
};



  // Variables and JSX for rendering invoice details
  const isGST = invoiceData.gst_number ? true : false;
  const grandTotalInWords = numberToWords(parseFloat(invoiceData.grand_total));
  
  // Check if `services` and `products` need to be parsed
  const services = invoiceData.services ? JSON.parse(invoiceData.services) : [];
  // const products = invoiceData.products ? JSON.parse(invoiceData.products) : [];
  
  // const membership = typeof invoiceData.vendor_customers_profile === 'string'
  //   ? JSON.parse(invoiceData.vendor_customers_profile)
  //   : invoiceData.vendor_customers_profile || {};
  
  const showCGST = services.some(service => parseFloat(service.CGST) > 0);
  const showSGST = services.some(service => parseFloat(service.SGST) > 0);
  
  // console.log("kuchv", membership);
  

  return (
    <div className='invoice_container'>
      <Helmet>
        <title>View Invoice</title>
      </Helmet>
      <div className='invoice_main' ref={invoiceRef} id='invoice_content'>
        <form>
          <div>
            <div className='invoice_header'>
              {/* <img src={Logo1} alt='Logo' className='invoice_logo' /> */}
              <div className='invoice_name'>{saloon_name}</div>
            </div>
            <div className='invoice_content'>
              <div className='invoice_left'>
                <h3>Invoice To:</h3>
                <p>{invoiceData.customer_name}</p>
                <p>{invoiceData.address}</p>
                <p>{invoiceData.email}</p>
              </div>
              <div className='invoice_right'>
                <h5>InvoiceId: {invoiceData.slno}</h5>
                <div className='invoice_date'>
                  <p>Date of Invoice: {invoiceData.date}</p>
                </div>
                {isGST && <p>GST Number: {invoiceData.gst_number}</p>}
              </div>
            </div>
  
            <div className='table-responsive'>
              <table className='invoice_table table-bordered'>
                <thead>
                  <tr style={{ border: '1px solid #787871', backgroundColor: '#fff' }}>
                    <th style={{ width: '5%' }}>S. No.</th>
                    <th style={{ width: '30%' }}>DESCRIPTION</th>
                    <th style={{ width: '10%' }}>PRICE</th>
                    <th style={{ width: '10%' }}>QUANTITY</th>
                    <th style={{ width: '10%' }}>DISCOUNT</th>
                    {showCGST && <th style={{ width: '10%' }}>TAX AMT</th>}
                    {showCGST && <th style={{ width: '10%' }}>CGST(2.5%)</th>}
                    {showSGST && <th style={{ width: '10%' }}>SGST(2.5%)</th>}
                    <th style={{ width: '10%', color: 'white', backgroundColor: '#0d6efd' }}>TOTAL AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((item, index) => (
                    <tr key={index} style={{ border: '1px solid #787871', backgroundColor: '#fff' }}>
                      <td className='text-center'>{index + 1}</td>
                      <td className='text-center'>{item.Description}</td>
                      <td className='text-center'>{item.Price}</td>
                      <td className='text-center'>{item.Quantity}</td>
                      <td className='text-center'>{item.Discount}</td>
                      {isGST ? (
                        <>
                          {showCGST && <td className='text-center'>{item.Tax_amt}</td>}
                          {showCGST && <td className='text-center'>{item.CGST}</td>}
                          {showSGST && <td className='text-center'>{item.SGST}</td>}
                        </>
                      ) : (
                        <>
                          {showCGST && <td className='text-center'>0</td>}
                          {showCGST && <td className='text-center'>0</td>}
                          {showSGST && <td className='text-center'>0</td>}
                        </>
                      )}
                      <td className='text-center'>{item.Total_amount}</td>
                    </tr>
                  ))}
  
                  <tr style={{ border: '1px solid #787871', backgroundColor: '#fff' }}>
                    <th colSpan='2' style={{ color: 'white', backgroundColor: '#0d6efd' }}>TOTAL</th>
                    <th className='text-center'>{invoiceData.total_prise}</th>
                    <th className='text-center'>{invoiceData.total_quantity}</th>
                    <th className='text-center'>{invoiceData.total_discount}</th>
                    {showCGST && <th className='text-center'>{invoiceData.total_tax}</th>}
                    {showCGST && <th className='text-center'>{invoiceData.total_cgst}</th>}
                    {showSGST && <th className='text-center'>{invoiceData.total_sgst}</th>}
                    <th className='text-center' style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                      <small>Loyalty Points used: {invoiceData.loyalty_points_deducted}</small> <br />
                      Total: {invoiceData.grand_total}
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
  
            {invoiceData.comment && (
              <div className='invoice_comment'>
                <h4>Comments:</h4>
                <p>{invoiceData.comment}</p>
              </div>
            )}
  
            <div className='invoice_footer'>
              <div className='invoice_footer_left'>
                <h4>Amount in Words:</h4>
                <p>{grandTotalInWords} Rupees Only</p>
              </div>
              <div className='invoice_footer_right'>
                <h4>FINAL VALUE:</h4>
                <p>Rs {invoiceData.grand_total}</p>
              </div>
            </div>
          </div>
        </form>
  
        <div className='download_button'>
          <button onClick={generatePDF}>Download as PDF</button>
        </div>
      </div>
    </div>
  );
  
}

export default ViewInvoice;
