import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import apiMateImg from "./images/image.png";

const ChatBotPage = () => {
  const [messages, setMessages] = useState([]); // Stores conversation messages
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append the user's message to the conversation
    const userMessage = { role: "User", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const currentInput = input;
    setInput("");

    try {
      // Send the message to your backend
      // The backend returns a JSON with { response, retrieved_context }
      const response = await fetch("http://localhost:5050/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
        credentials: "include", // Include credentials if needed
      });
      const data = await response.json();
      
      // Store only the final answer in state (expected to include Markdown with LaTeX)
      const botMessage = {
        role: "Bot",
        text: data.response, // For example: "Certainly! Here is the formula: $E=mc^2$"
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "Bot", text: "Error: Failed to fetch response." }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {/* Sidebar */}
        <div className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chat Bot</h2>
        <p className="text-gray-600 text-center mb-4">
            Hello!<br />
            I am APIMate.<br />
            I can help you with API-related queries.
        </p>

        {/* Sidebar Image */}
        <img
            src={apiMateImg}// adjust path if different
            alt="API Chatbot"
            className="w-128 h-256 object-contain mt-2"
        />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50 p-6">
          <div className="flex-1 overflow-auto mb-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.role === "User" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block p-3 rounded-md shadow ${
                      msg.role === "User"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    {msg.role === "Bot" ? (
                      // Use ReactMarkdown to parse markdown text with math.
                      <ReactMarkdown
                        children={msg.text}
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Start the conversation...</p>
            )}
          </div>
          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-l-md focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition"
            >
              {loading ? "..." : <FaPaperPlane />}
            </button>
          </form>
        </div>
      </div>

      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-lg">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotPage;