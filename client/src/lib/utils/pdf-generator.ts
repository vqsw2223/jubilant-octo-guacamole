import { AttendanceReport } from "@shared/schema";

/**
 * توليد تقرير الحضور كملف PDF
 */
export async function generateAttendanceReportPDF(report: AttendanceReport): Promise<void> {
  try {
    // التأكد من تحميل jsPDF
    if (typeof window.jspdf === "undefined") {
      console.error("jsPDF لم يتم تحميل مكتبة");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    
    // إنشاء مستند بالإعدادات الافتراضية
    const doc = new jsPDF();
    
    // تعيين وضع من اليمين إلى اليسار للنص العربي
    doc.setR2L(true);
    
    // إعداد الخط العربي
    try {
      // استخدام الخط القياسي للتوافق
      doc.setFont("Helvetica", "normal");
    } catch (err) {
      console.warn("خطأ في تعيين الخط:", err);
      // العودة إلى الخط الافتراضي
      doc.setFont("Helvetica", "normal");
    }
    
    // إضافة عنوان
    doc.setFontSize(18);
    doc.text("تقرير الغياب - مدرسة جابر بن حيان", 105, 20, { align: "center" });
    
    // إضافة شعار المدرسة (اختياري)
    try {
      const schoolLogo = new Image();
      schoolLogo.src = "/images/school-logo-new.png";
      doc.addImage(schoolLogo, "PNG", 10, 10, 20, 20);
    } catch (err) {
      console.warn("خطأ في إضافة الشعار:", err);
    }
    
    // إضافة معلومات التقرير
    doc.setFontSize(14);
    doc.text(`الصف: ${report.className || "جميع الصفوف"}`, 190, 40, { align: "right" });
    doc.text(`الشعبة: ${report.section || "جميع الشعب"}`, 190, 50, { align: "right" });
    doc.text(`التاريخ: ${report.date}`, 190, 60, { align: "right" });
    
    // إضافة ملخص البيانات
    doc.setFontSize(12);
    doc.text(`عدد الطلاب: ${report.totalStudents}`, 190, 80, { align: "right" });
    doc.text(`الحضور: ${report.presentCount}`, 190, 90, { align: "right" });
    doc.text(`الغياب: ${report.absentCount}`, 190, 100, { align: "right" });
    doc.text(`المتأخرون: ${report.lateCount}`, 190, 110, { align: "right" });
    
    // إضافة نسبة الحضور
    const attendanceRate = Math.round((report.presentCount / report.totalStudents) * 100);
    doc.text(`نسبة الحضور: ${attendanceRate}%`, 190, 120, { align: "right" });
    
    // إضافة جدول (مبسط)
    const startY = 140;
    const cellHeight = 10;
    const colWidths = [25, 40, 70];
    const headers = ["الحالة", "الصف / الشعبة", "اسم الطالب"];
    
    // رسم رأس الجدول
    doc.setFillColor(220, 220, 220);
    doc.rect(40, startY, 120, cellHeight, "F");
    doc.setFontSize(12);
    
    let currentX = 160;
    headers.forEach((header, index) => {
      doc.text(header, currentX, startY + 7);
      currentX -= colWidths[index];
    });
    
    // حفظ الملف
    doc.save(`تقرير-الغياب-${report.date.replace(/\//g, "-")}.pdf`);
    
  } catch (error) {
    console.error("خطأ في إنشاء ملف PDF:", error);
  }
}

// إضافة التعريف لكائن window للتمكن من استخدام jsPDF
declare global {
  interface Window {
    jspdf: any;
  }
}