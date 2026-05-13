import React, { createContext, useContext, useState } from "react";

// Create the Context
const ToastContext = createContext();

// ToastProvider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to show a toast
  const showToast = (title, message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove the toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 1050,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast text-bg-${toast.type} border-0 show`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">
                <strong>{toast.title}</strong>
                <p>{toast.message}</p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
