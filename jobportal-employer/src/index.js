import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css"; // If you have global styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ToastProvider } from "./ToastManager";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // Move the basename prop to the Router component here
  <Router>
    <ToastProvider>
      <App />
    </ToastProvider>
  </Router>
);
