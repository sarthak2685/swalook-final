import { useEffect, useState } from "react";
import Header from "./Header";
import VertNav from "./VertNav";
import { Link, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import config from "../../config";

const Templates = () => {
  const branchName = localStorage.getItem("branch_name");
  const sname = localStorage.getItem("s-name");
  const [templates, setTemplates] = useState([]);
  const bid = localStorage.getItem("branch_id");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${config.apiUrl}/api/swalook/upload/image/?branch_name=${bid}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          }
        );
        setTemplates(response.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleCardClick = (template) => {
    navigate(`/${sname}/${branchName}/message-details`, { state: template });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("image_name", sname);

    try {
      const response = await axios.post(
        `${config.apiUrl}/api/swalook/upload/image/?branch_name=${bid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        }
      );
      setTemplates((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-[200vh]">
      <VertNav />
      <Header />
      <div className="flex-1 p-6 bg-gray-100 md:ml-[22rem] md:mr-8 ml-0 mr-0 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold mb-8">Instagram/Facebook Templates</h2>
          <Link to={`/${sname}/${branchName}/whatsapp-templates`}>
          <button className="bg-blue-500 text-white px-6 py-4 rounded-lg flex items-center gap-2 hover:bg-blue-800 disabled:opacity-60"
          >Whatsapp Templates</button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-4 cursor-pointer"
              onClick={() => handleCardClick(template)}
            >
              <img
                src={`${config.apiUrl}${template.image}`}
                alt={template.title}
                className="w-full h-auto rounded-md"
              />
              <h3 className="mt-2 text-md font-medium">{template.image_name}</h3>
              <p className="text-gray-500 text-sm">{template.size}</p>
            </div>
          ))}
          <label className="bg-white shadow-lg rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
            <FaCloudUploadAlt className="text-9xl text-gray-600" />
            <p className="mt-2  text-xl lg:text-3xl font-medium text-gray-600">Upload your Template</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Templates;
