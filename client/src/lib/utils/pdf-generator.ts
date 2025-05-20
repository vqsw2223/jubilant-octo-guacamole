import { AttendanceReport } from "@shared/schema";

/**
 * Generate PDF for attendance report
 */
export async function generateAttendancePDF(data: AttendanceReport): Promise<void> {
  try {
    // Make sure jsPDF is loaded
    await ensurePdfLibraryLoaded();
    
    if (!window.jspdf) {
      console.error("jsPDF library not loaded");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    
    // Create document with default settings
    const doc = new jsPDF();
    
    // Set Right-to-Left mode for Arabic text
    doc.setR2L(true);
    
    // First try to use our Saudi Arabia font, fallback to standard fonts
    try {
      // Using standard font for better compatibility
      doc.setFont("Helvetica", "normal");
    } catch (err) {
      console.warn("Error setting font:", err);
      // Fallback to default
      doc.setFont("Helvetica", "normal");
    }
    
    // Add title
    doc.setFontSize(18);
    doc.text("تقرير الغياب - مدرسة جابر بن حيان", 105, 20, { align: "center" });
    
    // Add content - using separate lines to reduce potential issues
    doc.setFontSize(12);
    
    // Draw report data - using position from right for proper RTL alignment
    doc.text("عدد الطلاب:", 170, 40, { align: "right" });
    doc.text(data.totalStudents.toString(), 140, 40, { align: "right" });
    
    doc.text("عدد الطلاب الحاضرين:", 170, 50, { align: "right" });
    doc.text(data.presentCount.toString(), 140, 50, { align: "right" });
    
    doc.text("عدد المتغيبين:", 170, 60, { align: "right" });
    doc.text(data.absentCount.toString(), 140, 60, { align: "right" });
    
    doc.text("عدد المتأخرين:", 170, 70, { align: "right" });
    doc.text(data.lateCount.toString(), 140, 70, { align: "right" });
    
    // Add date
    const today = new Date();
    doc.text("تاريخ التقرير:", 170, 90, { align: "right" });
    doc.text(today.toLocaleDateString("ar-SA"), 140, 90, { align: "right" });
    
    // Add footer
    doc.setFontSize(10);
    doc.text("© 2025 سامي بن عازم الرويلي – جميع الحقوق محفوظة", 105, 270, { align: "center" });
    
    // Save PDF
    doc.save("تقرير_الغياب.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

/**
 * Load jsPDF library dynamically if not already loaded
 */
export function ensurePdfLibraryLoaded(): Promise<void> {
  if (window.jspdf) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    // Load core jsPDF
    const jsPdfScript = document.createElement('script');
    jsPdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    
    jsPdfScript.onload = () => {
      // After jsPDF loads, load Arabic fonts plugin if needed
      if (!window.jspdf) {
        reject(new Error("jsPDF failed to initialize on window object"));
        return;
      }
      
      // Load specific font for Arabic if needed
      try {
        const amiriFontStyle = document.createElement('style');
        amiriFontStyle.textContent = `
          @font-face {
            font-family: 'Amiri';
            src: url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(amiriFontStyle);
        
        resolve();
      } catch (err) {
        console.warn("Error loading Arabic font:", err);
        // Continue anyway with system fonts
        resolve();
      }
    };
    
    jsPdfScript.onerror = () => reject(new Error("Failed to load jsPDF library"));
    document.head.appendChild(jsPdfScript);
  });
}

// Add jsPDF to window type
declare global {
  interface Window {
    jspdf: {
      jsPDF: new () => {
        setR2L: (rtl: boolean) => void;
        setFont: (fontName: string, fontStyle?: string) => void;
        setFontSize: (size: number) => void;
        text: (text: string, x: number, y: number, options?: any) => void;
        save: (filename: string) => void;
      };
    };
  }
}
