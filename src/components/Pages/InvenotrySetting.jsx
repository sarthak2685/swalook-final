

import React, { useState } from 'react';
import { PlusCircle, Save } from 'lucide-react';
import Header from './Header';
import VertNav from './VertNav';
import ProductImage from '../../assets/inventory.png'; // Add your image path here

function InvenotrySetting() {
  const [fields, setFields] = useState([
    { product: '', service: '', quantity: '' }
  ]);

  const handleChange = (index, field, value) => {
    const updatedFields = [...fields];
    updatedFields[index][field] = value;
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([...fields, { product: '', service: '', quantity: '' }]);
  };

  const handleSave = () => {
    console.log('Saved Data:', fields);
    // Add API call here to save data
  };

  return (
    <>
      <Header />
      <VertNav />
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="w-full md:w-2/3 p-4 mt-8 mr-32 ml-0 md:ml-[20rem] lg:ml-[29rem]">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Product Usage Settings</h2>

          {fields.map((field, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                className="border border-blue-500 hover:border-black rounded px-4 py-4"
                value={field.service}
                onChange={(e) => handleChange(index, 'service', e.target.value)}
              >
                <option value="">Select Linked to Service</option>
                <option value="Hair Wash">Hair Wash</option>
                <option value="Facial">Facial</option>
                <option value="Massage">Massage</option>
              </select>

              <select
                className="border border-blue-500 hover:border-black rounded px-4 py-4"
                value={field.product}
                onChange={(e) => handleChange(index, 'product', e.target.value)}
              >
                <option value="">Select Product</option>
                <option value="Shampoo">Shampoo</option>
                <option value="Conditioner">Conditioner</option>
                <option value="Oil">Oil</option>
              </select>

              <input
                type="number"
                step="0.01"
                className="border border-blue-500 text-black rounded px-4 py-2"
                placeholder="One Complete Product for how many services"
                value={field.quantity}
                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
              />
            </div>
          ))}

          <div className="flex flex-row gap-4 justify-center mt-8 md:justify-center">
            <button
              onClick={addField}
              className="flex items-center rounded-lg gap-2 text-white bg-blue-500 border border-blue-600 px-4 py-2 "
            >
              <PlusCircle size={20} /> New Product
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              <Save size={20} /> Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvenotrySetting;

