import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FileText, File, ChartPie, AlertTriangle, UserCheck, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { generateAttendanceReportPDF } from "@/lib/utils/pdf-generator";
import { AttendanceReport } from "@shared/schema";

type ReportType = "attendance" | "behavior" | "statistics";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [classFilter, setClassFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Generate report mutation
  const generateReport = useMutation({
    mutationFn: () => 
      apiRequest("GET", `/api/reports/${reportType}?class=${classFilter}&start=${startDate}&end=${endDate}&period=${periodFilter}`),
    onSuccess: async (response) => {
      const data = await response.json() as AttendanceReport;
      
      try {
        await generateAttendanceReportPDF(data);
        
        toast({
          title: "تم إنشاء التقرير",
          description: "تم تحميل التقرير بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ في إنشاء التقرير",
          description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء التقرير",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    generateReport.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>التقارير</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div 
              className={`border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-primary transition ${
                reportType === "attendance" ? "bg-blue-50 border-primary" : "bg-gray-50"
              }`}
              onClick={() => setReportType("attendance")}
            >
              <div className="flex items-center">
                <div className="bg-primary p-3 rounded-full">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div className="mr-3">
                  <h3 className="font-bold text-gray-800">تقرير الحضور</h3>
                  <p className="text-sm text-gray-600">سجلات حضور الطلاب</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-primary transition ${
                reportType === "behavior" ? "bg-blue-50 border-primary" : "bg-gray-50"
              }`}
              onClick={() => setReportType("behavior")}
            >
              <div className="flex items-center">
                <div className="bg-primary p-3 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="mr-3">
                  <h3 className="font-bold text-gray-800">تقرير المخالفات</h3>
                  <p className="text-sm text-gray-600">المخالفات السلوكية</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-primary transition ${
                reportType === "statistics" ? "bg-blue-50 border-primary" : "bg-gray-50"
              }`}
              onClick={() => setReportType("statistics")}
            >
              <div className="flex items-center">
                <div className="bg-primary p-3 rounded-full">
                  <ChartPie className="h-5 w-5 text-white" />
                </div>
                <div className="mr-3">
                  <h3 className="font-bold text-gray-800">تقرير إحصائي</h3>
                  <p className="text-sm text-gray-600">إحصائيات عامة للمدرسة</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Generator */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-4">إنشاء التقرير</h3>
            
            <form onSubmit={handleGenerateReport}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع التقرير</label>
                  <Select
                    value={reportType}
                    onValueChange={(value) => setReportType(value as ReportType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">تقرير الحضور</SelectItem>
                      <SelectItem value="behavior">تقرير المخالفات</SelectItem>
                      <SelectItem value="statistics">تقرير إحصائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الصف</label>
                  <Select
                    value={classFilter}
                    onValueChange={setClassFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الصفوف</SelectItem>
                      <SelectItem value="1">الصف الأول</SelectItem>
                      <SelectItem value="2">الصف الثاني</SelectItem>
                      <SelectItem value="3">الصف الثالث</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفترة</label>
                  <Select
                    value={periodFilter}
                    onValueChange={setPeriodFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="semester">هذا الفصل</SelectItem>
                      <SelectItem value="year">العام الدراسي</SelectItem>
                      <SelectItem value="custom">تخصيص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {periodFilter === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" type="button" className="ml-2">
                  معاينة
                </Button>
                <Button 
                  type="submit"
                  disabled={generateReport.isPending}
                  className="flex gap-2"
                >
                  <File className="h-4 w-4" />
                  <span>تصدير PDF</span>
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
