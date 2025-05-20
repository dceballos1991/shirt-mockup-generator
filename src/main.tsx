import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const ShirtMockupGenerator = {
  mount: (elementId: string, options = {}) => {
    const element = document.getElementById(elementId);
    if (element) {
      createRoot(element).render(
        <StrictMode>
          <App {...options} />
        </StrictMode>
      );
      return true;
    }
    console.error(`Element with id '${elementId}' not found`);
    return false;
  },
};

// Explicitly assign to window
window.ShirtMockupGenerator = ShirtMockupGenerator;

// For Vite/TypeScript compatibility, add the ShirtMockupGenerator to the Window interface
declare global {
  interface Window {
    ShirtMockupGenerator: typeof ShirtMockupGenerator;
  }
}

export default ShirtMockupGenerator;
