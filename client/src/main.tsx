import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load jsPDF scripts
const loadJsPDF = document.createElement('script');
loadJsPDF.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(loadJsPDF);

// Load font for PDF
const loadFont = document.createElement('script');
loadFont.src = "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js";
document.head.appendChild(loadFont);

// Add Amiri font for Arabic support
const amiriFont = document.createElement('link');
amiriFont.rel = "stylesheet";
amiriFont.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap";
document.head.appendChild(amiriFont);

createRoot(document.getElementById("root")!).render(<App />);
