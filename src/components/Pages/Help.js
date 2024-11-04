import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/Help.css'; 
import Header from './Header';
import { Helmet } from 'react-helmet';
import VertNav from './VertNav';

function Help() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    let errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   
    const phoneRegex = /^\d{10}$/;

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email is not valid';
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (!formData.message) {
      errors.message = 'Message is required';
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      mobile_no: formData.phoneNumber,
      message: formData.message
    };

    try {
      const response = await axios.post('https://api.crm.swalook.in/api/swalook/help_desk/', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization':`Token ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        setStatus('Form submitted successfully');
        alert('Form submitted successfully');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          message: ''
        });
        setErrors({});
      } else {
        setStatus('Error submitting form');
        alert('Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error submitting form');
        alert('Error submitting form');
    }
  };

  return (
    <div className='help-big'>
      <Helmet>
        <title>Help</title>
      </Helmet>
      <Header />
      <VertNav/>
      <div className="help-container">
        <div className="contact-card">
          <h2 style={{color:"#091A44"}}>Help</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number *"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            {errors.phoneNumber && <small className="error">{errors.phoneNumber}</small>}
            <textarea
              name="message"
              placeholder="How can we help you? *"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            {errors.message && <span className="error">{errors.message}</span>}
            <button type="submit">CONTACT US</button>
          </form>
          {status && <p>{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default Help;
