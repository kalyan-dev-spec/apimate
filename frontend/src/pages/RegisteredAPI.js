import React, { useState, useEffect } from "react";

const RegisteredAPIs = () => {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExample, setSelectedExample] = useState(null);
  const [selectedText, setSelectedText] = useState(null); // ✅ Store full description or architecture
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    fetch("http://localhost:5050/get_apis")
      .then((response) => response.json())
      .then((data) => {
        setApis(data);
        setLoading(false);
      })
      .catch(() => {
        setApis([]);
        setLoading(false);
      });
  }, []);

  // ✅ Function to truncate text to 100 characters
  const truncateText = (text) => {
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };
  const formatJsonSafely = (jsonString) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch (error) {
      return jsonString; // ✅ Return raw text if not valid JSON
    }
  };
  const filteredApis = apis.filter((api) =>
    api.api_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchText.toLowerCase()) ||
    api.developer?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 relative">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6">Welcome to APIMate</h1>

        {/* Centered Search */}
        <div className="flex justify-center px-4">
          <input
            type="text"
            placeholder="Search APIs..."
            className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-md text-black shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Registered APIs</h2>

        {loading ? (
          <p className="text-gray-700">Loading APIs...</p>
        ) : filteredApis.length === 0 ? (
          <p className="text-gray-700">No matching APIs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredApis.map((api) => (
            <div key={api.id} className="bg-white p-6 shadow-md rounded-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold">{api.api_name}</h3>
                
                {/* ✅ Description with Read More */}
                <p className="text-gray-600">
                  {truncateText(api.description)}
                  {api.description.length > 100 && (
                    <button
                      className="text-blue-600 ml-2 underline"
                      onClick={() => setSelectedText(api.description)}
                    >
                      Read More
                    </button>
                  )}
                </p>

                {/* ✅ Architecture with Read More */}
                {api.architecture && (
                  <p className="text-gray-500 mt-2">
                    <strong>Architecture:</strong> {truncateText(api.architecture)}
                    {api.architecture.length > 100 && (
                      <button
                        className="text-blue-600 ml-2 underline"
                        onClick={() => setSelectedText(api.architecture)}
                      >
                        Read More
                      </button>
                    )}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  <strong>Developer:</strong> {api.developer}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Email:</strong> {api.contact_email}
                </p>
              </div>

              {/* ✅ Buttons Section */}
              <div className="mt-4 flex space-x-2">
                <button
                  className="flex-1 bg-blue-600 text-white font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition"
                  onClick={() => setSelectedExample(api)}
                >
                  View API Example
                </button>
              </div>
            </div>
          ))}
      </div>
        )}
      </div>
      {/* ✅ Full Text Popup (for Description & Architecture) */}
      {selectedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Details</h2>
            <p className="text-gray-800">{selectedText}</p>

            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              onClick={() => setSelectedText(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ API Example JSON Popup */}
      {selectedExample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedExample.api_name} - API Example</h2>

            {/* ✅ Scrollable Content */}
            <div className="overflow-y-auto max-h-[60vh] p-2 border rounded-md bg-gray-50">
              {/* Example Request */}
              <h3 className="text-lg font-semibold mt-2">Example Request:</h3>
              <pre className="bg-gray-200 p-3 rounded-md text-sm overflow-auto max-h-70">
                {formatJsonSafely(selectedExample.example_request)}
              </pre>

              {/* Example Response */}
              <h3 className="text-lg font-semibold mt-2">Example Response:</h3>
              <pre className="bg-gray-200 p-3 rounded-md text-sm overflow-auto max-h-70">
                {formatJsonSafely(selectedExample.example_response)}
              </pre>

              {/* API Parameters */}
              <h3 className="text-lg font-semibold mt-2">API Parameters:</h3>
              {(() => {
                let apiParams = [];

                try {
                  const raw = selectedExample.api_parameters;
                  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

                  if (Array.isArray(parsed)) {
                    apiParams = parsed;
                  } else if (parsed && typeof parsed === "object") {
                    apiParams = Object.entries(parsed).map(([name, description]) => ({
                      name,
                      required: "optional", // Change if needed
                      description,
                    }));
                  }
                } catch (e) {
                  console.warn("Invalid api_parameters:", e);
                }

                return apiParams.length > 0 ? (
                  <div className="overflow-y-auto max-h-40 border rounded-md p-3 bg-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Required</th>
                          <th className="text-left p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiParams.map((param, index) => (
                          <tr key={index} className="border-b">
                          <td className="p-2">{typeof param.name === "object" ? JSON.stringify(param.name) : param.name}</td>
                          <td className="p-2">{typeof param.required === "object" ? JSON.stringify(param.required) : param.required}</td>
                          <td className="p-2">{typeof param.description === "object" ? JSON.stringify(param.description) : param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No parameters defined for this API.</p>
                );
              })()}
            </div>

            {/* Close Button */}
            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              onClick={() => setSelectedExample(null)} // ✅ Close popup
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredAPIs;