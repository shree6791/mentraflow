import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress known harmless console errors
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args[0]?.toString() || '';
  
  // Filter out known harmless errors
  const harmlessErrors = [
    'WebSocket connection',
    'message port closed',
    'Cross-Origin-Opener-Policy',
    'WDS_SOCKET_PORT'
  ];
  
  const isHarmless = harmlessErrors.some(msg => errorMessage.includes(msg));
  
  if (!isHarmless) {
    originalError.apply(console, args);
  }
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
