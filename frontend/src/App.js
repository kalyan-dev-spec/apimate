import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ✅ Import Router
import Navbar from "./components/Navbar";
import RegisterAPIModal from "./components/RegisterAPIModal";
import AnalysisAPIs from "./pages/AnalysisAPI";
import RegisteredAPIs from "./pages/RegisteredAPI"; // ✅ Import New Page
import ChatBotPage from "./pages/ChatBotPage"; 

const App = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [preFilledData, setPreFilledData] = useState(null);

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* ✅ Navbar with Routing */}
        <Navbar onRegisterClick={() => {
          setPreFilledData(null);
          setShowRegistrationForm(true);
        }} />

        {/* ✅ Routes for different pages */}
        <Routes>
          <Route path="/analysis-apis" element={<AnalysisAPIs />} />
          <Route path="/" element={<RegisteredAPIs />} />
          <Route path="/chatbot-page" element={<ChatBotPage />} />
        </Routes>

        {/* ✅ Register API Modal */}
        <RegisterAPIModal isOpen={showRegistrationForm} onClose={() => setShowRegistrationForm(false)} preFilledData={preFilledData} />
      </div>
    </Router>
  );
};

export default App;