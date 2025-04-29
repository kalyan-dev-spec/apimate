import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaPlus, FaTrash } from "react-icons/fa";

const RegisterAPIModal = ({ isOpen, onClose, preFilledData }) => {
  const [formData, setFormData] = useState({
    api_name: "",
    description: "",
    example_request: "",
    example_response: "",
    architecture: "",
    developer: "",
    contact_email: "",
    api_parameters: [],
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!preFilledData) {
      setFormData({
        api_name: "",
        description: "",
        example_request: "",
        example_response: "",
        architecture: "",
        developer: "",
        contact_email: "",
        api_parameters: [],
      });
    } else {
      setFormData({
        api_name: preFilledData.api_name || "",
        description: preFilledData.api_description || "",
        example_request: JSON.stringify(preFilledData.api_request_template, null, 2) || "",
        example_response: preFilledData.example_response || "",
        architecture: preFilledData.architecture || "",
        developer: preFilledData.author_details?.author_name || "",
        contact_email: preFilledData.author_details?.author_email || "",
        api_parameters: preFilledData.api_parameters || [],
      });
    }
  }, [isOpen, preFilledData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParameterChange = (index, field, value) => {
    const updatedParams = [...formData.api_parameters];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    setFormData({ ...formData, api_parameters: updatedParams });
  };

  const addParameter = () => {
    setFormData({
      ...formData,
      api_parameters: [...formData.api_parameters, { name: "", required: "optional", description: "" }],
    });
  };

  const removeParameter = (index) => {
    const updatedParams = [...formData.api_parameters];
    updatedParams.splice(index, 1);
    setFormData({ ...formData, api_parameters: updatedParams });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevent default form submission

    if (!formData.api_name || !formData.description || !formData.example_request || !formData.developer || !formData.contact_email) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/register_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        alert("Failed to register API. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to the server:", error);
      alert("An error occurred while registering the API.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-3xl w-full flex flex-col">
        <h2 className="text-3xl font-bold mb-4">Register API</h2>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <p className="text-xl font-bold text-green-600">API Registered Successfully!</p>
          </div>
        ) : (
          <>
            {/* ✅ Scrollable Content */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh] pr-4 space-y-4">
              <label className="block font-medium text-lg">API Name *</label>
              <input type="text" name="api_name" value={formData.api_name} onChange={handleChange} className="w-full p-3 border rounded-md text-lg" required />

              <label className="block font-medium text-lg">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-md text-lg" required />

              <label className="block font-medium text-lg">Example Request *</label>
              <textarea name="example_request" value={formData.example_request} onChange={handleChange} className="w-full p-3 border rounded-md text-lg font-mono text-sm" required />

              <label className="block font-medium text-lg">Example Response (Optional)</label>
              <textarea name="example_response" value={formData.example_response} onChange={handleChange} className="w-full p-3 border rounded-md text-lg font-mono text-sm" />

              <label className="block font-medium text-lg">Architecture Details (Optional)</label>
              <input type="text" name="architecture" value={formData.architecture} onChange={handleChange} className="w-full p-3 border rounded-md text-lg" />

              <label className="block font-medium text-lg">Developer *</label>
              <input type="text" name="developer" value={formData.developer} onChange={handleChange} className="w-full p-3 border rounded-md text-lg" required />

              <label className="block font-medium text-lg">Contact Email *</label>
              <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full p-3 border rounded-md text-lg" required />

              {/* ✅ API Parameters Section */}
              <label className="block font-medium text-lg">API Parameters (Optional)</label>
              {formData.api_parameters.map((param, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Parameter Name"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <select
                    value={param.required}
                    onChange={(e) => handleParameterChange(index, "required", e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Parameter Description"
                    value={param.description}
                    onChange={(e) => handleParameterChange(index, "description", e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button type="button" onClick={() => removeParameter(index)} className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addParameter} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mt-2">
                <FaPlus />
                <span>Add Parameter</span>
              </button>

              {/* ✅ Fixed Footer Buttons */}
              <div className="mt-4 flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-5 py-3 rounded-md text-lg">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-md text-lg">
                  Register API
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterAPIModal;