// // Don't remove nay code form this file 
// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom';
// import Header from './Header';
// import VertNav from './VertNav';

// function Templates() {
//     const [activeTab, setActiveTab] = useState('templates');
//     const branchName = localStorage.getItem("branch_name");
//     const branchId = localStorage.getItem("branch_id");
//     const sname = localStorage.getItem("s-name");
//     const templates = [
//         {
//           title: 'Happy Birthday',
//           content: `Dear {Customer Name},\n\n🎉 Happy Birthday from [Salon Name]! 🎂 We hope your day is filled with joy and celebration. As a token of our appreciation, we're offering you an exclusive [Discount/Special Offer] on any service of your choice throughout this month.\n\nIndulge in a relaxing spa session or a glamorous makeover and let us make your day extra special.\n\n✨ Book your appointment today and treat yourself! 🎁\n[Link/Phone Number]\n\nWarm regards,\nThe [Salon Name] Team.`,
//         },
//         {
//           title: 'Marketing 1',
//           content: `✨ Pamper Yourself Like Never Before! ✨\n\nUnlock the ultimate self-care experience at [Salon Name]. This week only, enjoy an exclusive [Discount/Special Offer] on our premium [Treatment Name].\n\nFrom soothing massages to flawless hair transformations, we've got everything you need to feel refreshed and beautiful.\n\nDon't miss out on this limited-time offer! 🌸\n\nBook your appointment now and let us bring out your inner glow.\n[Link/Phone Number]\n\nWith love,\n[Salon Name]`,
//         },
//         {
//           title: 'Marketing 2',
//           content: `☀️ Summer Glow-Up Alert! ☀️\n\nGet ready to shine under the sun with our special summer package at [Salon Name]. 🌴\n\nEnjoy a rejuvenating facial, a perfect hair makeover, and glowing skin treatments, all bundled in one amazing package. Plus, enjoy [Discount/Special Offer] when you book this week.\n\nWhether it's a beach day or a special event, let us help you look flawless and confident.\n\nSecure your spot today! 🌺\n[Link/Phone Number]`,
//         },
//         {
//           title: 'Marketing 3',
//           content: `🎉 Introducing Our Newest Service! 🎉\n\nWe're excited to announce the launch of [New Product/Service] at [Salon Name].\n\nBe among the first to experience the magic and enjoy an exclusive [Special Offer] on your first session.\n\n✨ Experience luxury, elegance, and relaxation like never before.\n\nLimited slots available. Book your appointment now and let us pamper you to perfection.\n[Link/Phone Number]`,
//         },
//         {
//           title: 'Anniversary',
//           content: `🌟 Happy Anniversary from [Salon Name]! 🌟\n\nWe’re thrilled to be part of your beautiful journey. To celebrate your special milestone, we’re offering you a delightful [Discount/Special Offer] on any service of your choice this month.\n\nIndulge in a luxurious spa treatment, a stunning makeover, or a relaxing massage — the choice is yours.\n\nShow this message to your stylist upon booking and let us make your day truly memorable. 🎁\n\nBook now: [Link/Phone Number]`,
//         },
//         {
//           title: 'Marketing 4',
//           content: `🌼 Client Appreciation Week is Here! 🌼\n\nWe want to thank you for being part of the [Salon Name] family. This week, enjoy an exclusive [Discount/Special Offer] on all our services.\n\nFrom hair styling to beauty treatments and relaxing massages, let us pamper you and make you feel fabulous.\n\nDon't miss this special opportunity to treat yourself. 💆‍♀️\n\nShow this message to your stylist upon booking.\n[Link/Phone Number]`,
//         },
//         {
//           title: 'Festive Offer',
//           content: `🎁 Celebrate the Festive Season with Us! 🎁\n\nStep into the holiday spirit with glowing skin and fabulous hair. We're offering [Special Festive Discount] on all services throughout the festive season.\n\nWhether it's a dazzling party look or a relaxing spa session, we've got you covered.\n\nHurry up and book your appointment today and shine brighter this festive season. ✨\n[Link/Phone Number]`,
//         },
//         {
//           title: 'Exclusive VIP Offer',
//           content: `👑 VIP Treatment Awaits You! 👑\n\nAs one of our loyal clients, we’re offering you an exclusive [Special Offer] on our premium beauty and wellness services.\n\nIndulge in luxury treatments, rejuvenate your skin, and feel your best with our expert team.\n\nLimited slots available. Book your VIP experience now and let us pamper you like royalty.\n[Link/Phone Number]`,
//         },
//       ];
      
//     const navigate = useNavigate();

//     const handleCardClick = (template) => {
//       navigate(`/${sname}/${branchName}/message-details`, { state: template });
//     };
  
//     return (
//       <div className="bg-gray-100 min-h-[200vh] ">
//         <Header />
//         <VertNav />
//         {/* Content */}
//         <main className="flex-1 p-6 bg-gray-100 md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-8">
//           <h1 className="text-3xl font-bold mb-8">Message Templates</h1>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {templates.map((template, index) => (
//             <div key={index} className="bg-white p-5 rounded-lg shadow-md cursor-pointer" onClick={() => handleCardClick(template)}>
//                 <h2 className="text-xl font-semibold mb-3">{template.title}</h2>
//                 <p className="text-gray-700 whitespace-pre-line">{template.content}</p>
//               </div>
//             ))}
//           </div>
//         </main>
//       </div>
//     );
//   };

// export default Templates

// import React, { useState, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import Header from "./Header";
// import VertNav from "./VertNav";
// import CloseIcon from "@mui/icons-material/Close"; // Import close icon

// function MessageDetails() {
//   const location = useLocation();
//   const { state } = location || {};
//   const [message, setMessage] = useState(state?.content || "");
//   const textAreaRef = useRef(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedCustomers, setSelectedCustomers] = useState([]);
//   const [filter, setFilter] = useState("All"); 

//   const customers = [
//     { id: 1, name: "Promoth", phone: "+91-8148148396" },
//     { id: 2, name: "Debashish", phone: "+91-8148148396" },
//     { id: 3, name: "Sarthak", phone: "+91-8148148396" },
//     { id: 4, name: "Karan", phone: "+91-8148148396" },
//     { id: 5, name: "Tanay", phone: "+91-8148148396" },
//   ];

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   // Handle customer selection
//   const handleCustomerSelection = (id) => {
//     setSelectedCustomers((prev) =>
//       prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
//     );
//   };

//   // Select/Deselect All Customers
//   const toggleSelectAll = () => {
//     if (selectedCustomers.length === customers.length) {
//       setSelectedCustomers([]); // Deselect all
//     } else {
//       setSelectedCustomers(customers.map((customer) => customer.id)); // Select all
//     }
//   };

//   const variables = [
//     { name: "{Customer Name}", example: "demo" },
//     { name: "{Phone Number}", example: "+91-xxxxxxxx" },
//     { name: "{Salon Name}", example: "Test Saloon" },
//   ];

//   const insertVariable = (variable) => {
//     if (textAreaRef.current) {
//       const textarea = textAreaRef.current;
//       const start = textarea.selectionStart;
//       const end = textarea.selectionEnd;

//       const updatedMessage =
//         message.substring(0, start) + variable + message.substring(end);

//       setMessage(updatedMessage);

//       setTimeout(() => {
//         textarea.selectionStart = textarea.selectionEnd = start + variable.length;
//         textarea.focus();
//       }, 0);
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-[200vh]">
//       <Header />
//       <VertNav />
//       <div className="md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-10">
//         <h1 className="font-bold text-3xl">Message Templates</h1>
//       </div>

//       <main className="flex flex-col md:flex-row p-6 md:ml-[22rem] min-h-screen md:mr-12 ml-0 mr-0 gap-8 mt-10 shadow-lg rounded-xl bg-white">
//         {/* Left Section: Message Template */}
//         <div className="w-full md:w-2/3">
//           <h1 className="text-2xl font-bold mb-4">{state?.title || "Message Template"}</h1>
//           <textarea
//             ref={textAreaRef}
//             className="w-full p-4 mb-4 border rounded-lg min-h-[25rem] text-gray-700"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Your message template will appear here..."
//           />
//           <div className="flex justify-between mt-14">
//           <button className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//             Generate Content with AI
//           </button>
//           <button onClick={openModal} className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//               Select Customers
//             </button>
//             </div>
//         </div>

//         {/* Right Section: Variables Table */}
//         <div className="w-full md:w-1/3 bg-white p-6 rounded-lg ">
//           <h2 className="text-xl font-semibold mb-4">Variables</h2>
//           <table className="w-full border border-gray-300 rounded-lg">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-2 px-4 text-left">Name</th>
//                 <th className="py-2 px-4 text-left">Example Output</th>
//                 <th className="py-2 px-4">Select</th>
//               </tr>
//             </thead>
//             <tbody>
//               {variables.map((variable, index) => (
//                 <tr key={index} className="border-t">
//                   <td className="py-2 px-4">{variable.name}</td>
//                   <td className="py-2 px-4">{variable.example}</td>
//                   <td className="py-2 px-4">
//                     <button
//                       className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
//                       onClick={() => insertVariable(variable.name)}
//                     >
//                       Add
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </main>
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-max p-6 relative">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center border-b pb-2">
//               <h2 className="text-xl font-bold">Customers</h2>
//               <button onClick={closeModal}>
//                 <CloseIcon />
//               </button>
//             </div>
//             {/* Filter Buttons */}
//             <div className="flex gap-2 mt-4 overflow-auto">
//               {["All", "Today's Birthdays", "Today's Anniversaries", "Inactive - last 2"].map((item) => (
//                 <button
//                   key={item}
//                   className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
//                     filter === item ? "bg-blue-500 text-white" : "bg-gray-200"
//                   }`}
//                   onClick={() => setFilter(item)}
//                 >
//                   {item}
//                 </button>
//               ))}
//             </div>

//             {/* Customer List (Scrollable) */}
//             <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-2">
//               <label className="flex items-center gap-3 p-2 border-b">
//                 <input type="checkbox" onChange={toggleSelectAll} checked={selectedCustomers.length === customers.length} />
//                 <span className="font-semibold">Select All</span>
//               </label>
//               {customers.map((customer) => (
//                 <label key={customer.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md border-b">
//                   <input
//                     type="checkbox"
//                     checked={selectedCustomers.includes(customer.id)}
//                     onChange={() => handleCustomerSelection(customer.id)}
//                   />
//                   <span>{customer.name} ({customer.phone})</span>
//                 </label>
//               ))}
//             </div>

//             {/* Send Message Button */}
//             <button className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//               Send Message
//             </button>
//             </div>
//           </div>
//       )}
//     </div>
//   );
// }

// export default MessageDetails;
