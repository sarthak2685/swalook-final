import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import VertNav from './VertNav';

function WhatsappTemplates() {
    const [activeTab, setActiveTab] = useState('templates');
    const branchName = localStorage.getItem("branch_name");
    const branchId = localStorage.getItem("branch_id");
    const sname = localStorage.getItem("s-name");
    const templates = [
        {
          title: 'Happy Birthday',
          content: `Dear {Customer Name},\n\n🎉 Happy Birthday from [Salon Name]! 🎂 We hope your day is filled with joy and celebration. As a token of our appreciation, we're offering you an exclusive [Discount/Special Offer] on any service of your choice throughout this month.\n\nIndulge in a relaxing spa session or a glamorous makeover and let us make your day extra special.\n\n✨ Book your appointment today and treat yourself! 🎁\n[Link/Phone Number]\n\nWarm regards,\nThe [Salon Name] Team.`,
        },
        {
          title: 'Marketing 1',
          content: `✨ Pamper Yourself Like Never Before! ✨\n\nUnlock the ultimate self-care experience at [Salon Name]. This week only, enjoy an exclusive [Discount/Special Offer] on our premium [Treatment Name].\n\nFrom soothing massages to flawless hair transformations, we've got everything you need to feel refreshed and beautiful.\n\nDon't miss out on this limited-time offer! 🌸\n\nBook your appointment now and let us bring out your inner glow.\n[Link/Phone Number]\n\nWith love,\n[Salon Name]`,
        },
        {
          title: 'Marketing 2',
          content: `☀️ Summer Glow-Up Alert! ☀️\n\nGet ready to shine under the sun with our special summer package at [Salon Name]. 🌴\n\nEnjoy a rejuvenating facial, a perfect hair makeover, and glowing skin treatments, all bundled in one amazing package. Plus, enjoy [Discount/Special Offer] when you book this week.\n\nWhether it's a beach day or a special event, let us help you look flawless and confident.\n\nSecure your spot today! 🌺\n[Link/Phone Number]`,
        },
        {
          title: 'Marketing 3',
          content: `🎉 Introducing Our Newest Service! 🎉\n\nWe're excited to announce the launch of [New Product/Service] at [Salon Name].\n\nBe among the first to experience the magic and enjoy an exclusive [Special Offer] on your first session.\n\n✨ Experience luxury, elegance, and relaxation like never before.\n\nLimited slots available. Book your appointment now and let us pamper you to perfection.\n[Link/Phone Number]`,
        },
        {
          title: 'Anniversary',
          content: `🌟 Happy Anniversary from [Salon Name]! 🌟\n\nWe’re thrilled to be part of your beautiful journey. To celebrate your special milestone, we’re offering you a delightful [Discount/Special Offer] on any service of your choice this month.\n\nIndulge in a luxurious spa treatment, a stunning makeover, or a relaxing massage — the choice is yours.\n\nShow this message to your stylist upon booking and let us make your day truly memorable. 🎁\n\nBook now: [Link/Phone Number]`,
        },
        {
          title: 'Marketing 4',
          content: `🌼 Client Appreciation Week is Here! 🌼\n\nWe want to thank you for being part of the [Salon Name] family. This week, enjoy an exclusive [Discount/Special Offer] on all our services.\n\nFrom hair styling to beauty treatments and relaxing massages, let us pamper you and make you feel fabulous.\n\nDon't miss this special opportunity to treat yourself. 💆‍♀️\n\nShow this message to your stylist upon booking.\n[Link/Phone Number]`,
        },
        {
          title: 'Festive Offer',
          content: `🎁 Celebrate the Festive Season with Us! 🎁\n\nStep into the holiday spirit with glowing skin and fabulous hair. We're offering [Special Festive Discount] on all services throughout the festive season.\n\nWhether it's a dazzling party look or a relaxing spa session, we've got you covered.\n\nHurry up and book your appointment today and shine brighter this festive season. ✨\n[Link/Phone Number]`,
        },
        {
          title: 'Exclusive VIP Offer',
          content: `👑 VIP Treatment Awaits You! 👑\n\nAs one of our loyal clients, we’re offering you an exclusive [Special Offer] on our premium beauty and wellness services.\n\nIndulge in luxury treatments, rejuvenate your skin, and feel your best with our expert team.\n\nLimited slots available. Book your VIP experience now and let us pamper you like royalty.\n[Link/Phone Number]`,
        },
      ];
      
    const navigate = useNavigate();

    const handleCardClick = (template) => {
      navigate(`/${sname}/${branchName}/whatsapp-details`, { state: template });
    };
  
    return (
      <div className="bg-gray-100 min-h-[200vh] ">
        <Header />
        <VertNav />
        {/* Content */}
        <main className="flex-1 p-6 bg-gray-100 md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold mb-8">Message Templates</h1>
          <Link to={`/${sname}/${branchName}/templates`}>
                    <button className="bg-blue-500 text-white px-6 py-4 rounded-lg flex items-center gap-2 hover:bg-blue-800 disabled:opacity-60"
                    >Instagram Templates</button>
                    </Link>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-md cursor-pointer" onClick={() => handleCardClick(template)}>
                <h2 className="text-xl font-semibold mb-3">{template.title}</h2>
                <p className="text-gray-700 whitespace-pre-line">{template.content}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  };

export default  WhatsappTemplates
