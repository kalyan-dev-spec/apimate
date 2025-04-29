import React from "react";
import { Link } from "react-router-dom"; // Import Router Link

const Navbar = ({ onRegisterClick }) => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between w-full">
      <h1 className="text-2xl font-bold text-blue-700">
        <Link to="/">API Mate</Link> {/* ✅ Home link */}
      </h1>

      <div className="space-x-6">
        {/* ✅ Link to View Registered APIs Page */}
        <Link to="/" className="text-blue-700 font-semibold text-lg hover:text-blue-900 transition">
          View APIs
        </Link>
        <Link to="/chatbot-page" className="text-blue-700 font-semibold text-lg hover:text-blue-900 transition">
          APIMate Chat
        </Link>
        <Link to="/analysis-apis" className="text-blue-700 font-semibold text-lg hover:text-blue-900 transition">
          Onboard APIs
        </Link>
        {/* ✅ Open Register API Modal */}
        <button onClick={onRegisterClick} className="text-blue-700 font-semibold text-lg hover:text-blue-900 transition">
          Register API
        </button>

        
      </div>
    </nav>
  );
};

export default Navbar;