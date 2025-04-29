import React, { useState } from "react";

const RegistrationForm = ({ onClose, preFilledData }) => {
  const [apiDetails, setApiDetails] = useState({
    apiName: preFilledData?.api_name || "",
    description: preFilledData?.api_description || "",
    exampleJson: JSON.stringify(preFilledData?.api_request_template, null, 2) || "",
    architecture: "",
    developer: preFilledData?.author_details?.author_name || "",
    contactEmail: preFilledData?.author_details?.author_email || "",
  });

  const handleChange = (e) => {
    setApiDetails({ ...apiDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!apiDetails.apiName || !apiDetails.description || !apiDetails.exampleJson || !apiDetails.developer || !apiDetails.contactEmail) {
      alert("Please fill out all required fields.");
      return;
    }

    // Simple email validation
    if (!apiDetails.contactEmail.includes("@")) {
      alert("Enter a valid email address.");
      return;
    }

    console.log("API Registered:", apiDetails);
    alert("API Registered Successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Register API</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block font-medium">API Name *</label>
          <input
            type="text"
            name="apiName"
            value={apiDetails.apiName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />

          <label className="block font-medium">Description *</label>
          <textarea
            name="description"
            value={apiDetails.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />

          <label className="block font-medium">Example JSON *</label>
          <textarea
            name="exampleJson"
            value={apiDetails.exampleJson}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md font-mono text-sm"
          />

          <label className="block font-medium">Architecture Details (Optional)</label>
          <input
            type="text"
            name="architecture"
            value={apiDetails.architecture}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />

          <label className="block font-medium">Developer Name *</label>
          <input
            type="text"
            name="developer"
            value={apiDetails.developer}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />

          <label className="block font-medium">Contact Email *</label>
          <input
            type="email"
            name="contactEmail"
            value={apiDetails.contactEmail}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
              Register API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;