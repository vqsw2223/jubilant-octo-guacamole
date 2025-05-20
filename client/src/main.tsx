import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load jsPDF script
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(script);

createRoot(document.getElementById("root")!).render(<App />);
