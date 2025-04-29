import React, { useState } from "react";
import { FaSearch } from "react-icons/fa"; // Import magnifier icon
import RegisterAPIModal from "../components/RegisterAPIModal";


const AnalysisAPIs = () => {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [path, setPath] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // For modal
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [preFilledData, setPreFilledData] = useState(null);

  const handleSubmit = async () => {
    if (!owner || !repo) {
      alert("Owner and Repo are required fields.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5050/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, path }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({ error: "Failed to fetch data from Flask API." });
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* Main Layout */}
      <div className="flex flex-1 bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/4 bg-white shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Analyze GitHub Repo</h2>

          <label className="text-sm font-medium text-gray-600">GitHub Owner</label>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="p-2 border rounded-md mb-3" />

          <label className="text-sm font-medium text-gray-600">Repository Name</label>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} className="p-2 border rounded-md mb-3" />

          <label className="text-sm font-medium text-gray-600">Path (Optional)</label>
          <input type="text" value={path} onChange={(e) => setPath(e.target.value)} className="p-2 border rounded-md mb-3" />

          <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white py-2 rounded-md mt-4 hover:bg-blue-700 transition">
            {loading ? "Extracting..." : "Analyze Repository"}
          </button>
        </div>

        {/* Display Results as Cards */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          <h2 className="text-xl font-semibold mb-4">Analysis Results:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results ? (
              Object.keys(results).map((file, index) => {
                const data = results[file];

                return (
                  <div key={index} className="bg-white p-6 shadow-md rounded-md relative w-full h-80 flex flex-col justify-between">
                    <h3 className="text-lg font-bold">{data.api_name}</h3>
                    <p className="text-gray-600 text-sm">Author: {data.author_details?.author_name || "Unknown"}</p>
                    <p className="text-gray-700 text-sm">{data.api_description}</p>

                    {/* Magnifier Button */}
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 z-0"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(data);
                      }}
                    >
                      <FaSearch size={18} />
                    </button>

                    {/* Register API Button */}
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded-md mt-2 hover:bg-blue-700 transition"
                      onClick={() => {
                        setPreFilledData(data);
                        setShowRegistrationForm(true);
                      }}
                    >
                      Register API
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600">Waiting for analysis...</p>
            )}
          </div>
        </div>
                {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-3">{selectedFile.api_name}</h2>

              <div className="text-gray-800 text-sm space-y-2">
                <p><strong>Author:</strong> {selectedFile.author_details?.author_name || "Unknown"}</p>
                <p><strong>Email:</strong> {selectedFile.author_details?.author_email || "Not available"}</p>
                <p><strong>Commit Message:</strong> {selectedFile.author_details?.commit_message || "No commit message"}</p>
                <p><strong>Commit Date:</strong> {selectedFile.author_details?.commit_date || "Unknown date"}</p>
                <p><strong>Language:</strong> {selectedFile.language || "Unknown"}</p>
                <p><strong>Description:</strong> {selectedFile.api_description || "No description available"}</p>
              </div>

              {/* Show API Request Template as JSON */}
              <h3 className="text-md font-semibold mt-4">API Request Template</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-60">
                {JSON.stringify(selectedFile.api_request_template, null, 2)}
              </pre>

              <button
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                onClick={() => setSelectedFile(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            {/* ✅ Fix Spinner */}
            <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-lg">Extracting Data...</p>
          </div>
        </div>
      )}
      {/* Registration Form Modal */}
      <RegisterAPIModal isOpen={showRegistrationForm} onClose={() => setShowRegistrationForm(false)} preFilledData={preFilledData} />



    </div>
  );
};

export default AnalysisAPIs;