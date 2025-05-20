import { AttendanceReport } from "@shared/schema";

/**
 * Generate PDF for attendance report
 */
export async function generateAttendancePDF(data: AttendanceReport): Promise<void> {
  // Make sure jsPDF is loaded
  if (!window.jspdf) {
    console.error("jsPDF library not loaded");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Set RTL and Arabic font support
  doc.setR2L(true);
  doc.setFont("Amiri");
  
  // Add title
  doc.setFontSize(20);
  doc.text("تقرير الغياب – مدرسة جابر بن حيان", 105, 20, { align: "center" });
  
  // Add content
  doc.setFontSize(14);
  doc.text(`عدد الطلاب: ${data.totalStudents}`, 170, 40, { align: "right" });
  doc.text(`عدد الطلاب الحاضرين: ${data.presentCount}`, 170, 50, { align: "right" });
  doc.text(`عدد المتغيبين: ${data.absentCount}`, 170, 60, { align: "right" });
  doc.text(`عدد المتأخرين: ${data.lateCount}`, 170, 70, { align: "right" });
  
  // Add date
  const today = new Date();
  doc.text(`تاريخ التقرير: ${today.toLocaleDateString("ar-SA")}`, 170, 90, { align: "right" });
  
  // Save PDF
  doc.save("تقرير_الغياب.pdf");
}

/**
 * Load jsPDF library dynamically if not already loaded
 */
export function ensurePdfLibraryLoaded(): Promise<void> {
  if (window.jspdf) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load jsPDF library"));
    document.head.appendChild(script);
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
