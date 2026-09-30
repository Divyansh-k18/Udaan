import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";


import App from "./App.jsx";

import { AccessibilityProvider } from "./context/AccessibilityContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

import "./index.css";
import "./styles/accessibility.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <App />
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);