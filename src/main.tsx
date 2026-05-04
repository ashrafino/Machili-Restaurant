import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@/lib/api-client";
import App from "./App";
import "./index.css";

// Configure the API client to use the correct base URL from environment variables.
// This allows the restaurant app to connect to the API server on different domains/ports
// in development (e.g., localhost:3000) and production (e.g., https://api.machili.com).
const apiUrl = import.meta.env.VITE_API_URL || "";
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
