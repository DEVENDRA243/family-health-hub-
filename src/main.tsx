import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { registerServiceWorker } from "./lib/register-sw";

// Register Service Worker for offline support and sub-second asset caching
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
