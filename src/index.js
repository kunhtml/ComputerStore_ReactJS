import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Components
import App from "./App";
import Loader from "./components/Loader";

// Context
import { AppProvider } from "./context/AppContext";

// Simple error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <pre
            style={{
              textAlign: "left",
              color: "red",
              margin: "20px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
            }}
          >
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Create root
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

// Initial render
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Log environment for debugging
console.log("Environment:", process.env.NODE_ENV);
console.log("API URL:", process.env.REACT_APP_API_URL);
