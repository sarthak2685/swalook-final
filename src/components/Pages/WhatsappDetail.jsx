import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import VertNav from "./VertNav";
import CloseIcon from "@mui/icons-material/Close"; // Import close icon

function WhatsappDetail() {
  const location = useLocation();
  const { state } = location || {};
  const [message, setMessage] = useState(state?.content || "");
  const textAreaRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filter, setFilter] = useState("All"); 

  const customers = [
    { id: 1, name: "Promoth", phone: "+91-8148148396" },
    { id: 2, name: "Debashish", phone: "+91-8148148396" },
    { id: 3, name: "Sarthak", phone: "+91-8148148396" },
    { id: 4, name: "Karan", phone: "+91-8148148396" },
    { id: 5, name: "Tanay", phone: "+91-8148148396" },
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle customer selection
  const handleCustomerSelection = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Select/Deselect All Customers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]); // Deselect all
    } else {
      setSelectedCustomers(customers.map((customer) => customer.id)); // Select all
    }
  };

  const variables = [
    { name: "{Customer Name}", example: "demo" },
    { name: "{Phone Number}", example: "+91-xxxxxxxx" },
    { name: "{Salon Name}", example: "Test Saloon" },
  ];

  const insertVariable = (variable) => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const updatedMessage =
        message.substring(0, start) + variable + message.substring(end);

      setMessage(updatedMessage);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div className="bg-gray-100 min-h-[200vh]">
      <Header />
      <VertNav />
      <div className="md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-10">
        <h1 className="font-bold text-3xl">Message Templates</h1>
      </div>

      <main className="flex flex-col md:flex-row p-6 md:ml-[22rem] min-h-screen md:mr-12 ml-0 mr-0 gap-8 mt-10 shadow-lg rounded-xl bg-white">
        {/* Left Section: Message Template */}
        <div className="w-full md:w-2/3">
          <h1 className="text-2xl font-bold mb-4">{state?.title || "Message Template"}</h1>
          <textarea
            ref={textAreaRef}
            className="w-full p-4 mb-4 border rounded-lg min-h-[25rem] text-gray-700"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message template will appear here..."
          />
          <div className="flex justify-between mt-14">
          <button className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Generate Content with AI
          </button>
          <button onClick={openModal} className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Select Customers
            </button>
            </div>
        </div>

        {/* Right Section: Variables Table */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg ">
          <h2 className="text-xl font-semibold mb-4">Variables</h2>
          <table className="w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Example Output</th>
                <th className="py-2 px-4">Select</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((variable, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{variable.name}</td>
                  <td className="py-2 px-4">{variable.example}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                      onClick={() => insertVariable(variable.name)}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-max p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold">Customers</h2>
              <button onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>
            {/* Filter Buttons */}
            <div className="flex gap-2 mt-4 overflow-auto">
              {["All", "Today's Birthdays", "Today's Anniversaries", "Inactive - last 2"].map((item) => (
                <button
                  key={item}
                  className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
                    filter === item ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Customer List (Scrollable) */}
            <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg p-2">
              <label className="flex items-center gap-3 p-2 border-b">
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedCustomers.length === customers.length} />
                <span className="font-semibold">Select All</span>
              </label>
              {customers.map((customer) => (
                <label key={customer.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md border-b">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCustomerSelection(customer.id)}
                  />
                  <span>{customer.name} ({customer.phone})</span>
                </label>
              ))}
            </div>

            {/* Send Message Button */}
            <button className="mt-4 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Send Message
            </button>
            </div>
          </div>
      )}
    </div>
  );
}

export default WhatsappDetail;
