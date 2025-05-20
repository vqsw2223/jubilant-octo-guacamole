import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Printer } from "lucide-react";
import { generateAttendancePDF, ensurePdfLibraryLoaded } from "@/lib/utils/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { ClassSchedule } from "@shared/schema";

export default function SchedulePage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Fetch schedule data
  const { data: schedule, isLoading } = useQuery<ClassSchedule>({
    queryKey: ["/api/schedule", selectedClass, selectedSection],
    enabled: !!(selectedClass || selectedSection)
  });

  // Handle print schedule
  const handlePrintSchedule = async () => {
    try {
      await ensurePdfLibraryLoaded();
      // This is a placeholder, we would need to implement the actual PDF generation
      toast({
        title: "طباعة الجدول",
        description: "تم تحضير الجدول للطباعة",
      });
    } catch (error) {
      toast({
        title: "خطأ في طباعة الجدول",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>جدول الحصص</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Schedule Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
            <div className="w-full md:w-auto flex flex-wrap gap-2">
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">اختر الصف</SelectItem>
                  <SelectItem value="1">الصف الأول</SelectItem>
                  <SelectItem value="2">الصف الثاني</SelectItem>
                  <SelectItem value="3">الصف الثالث</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="اختر الشعبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">اختر الشعبة</SelectItem>
                  <SelectItem value="أ">أ</SelectItem>
                  <SelectItem value="ب">ب</SelectItem>
                  <SelectItem value="ج">ج</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handlePrintSchedule}
              className="flex gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الجدول</span>
            </Button>
          </div>
          
          {/* Schedule Table */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">جاري تحميل البيانات...</div>
            </div>
          ) : !selectedClass && !selectedSection ? (
            <div className="text-center p-8 text-gray-500">
              يرجى اختيار الصف والشعبة لعرض الجدول
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحصة / اليوم
                    </th>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الأحد
                    </th>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاثنين
                    </th>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الثلاثاء
                    </th>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الأربعاء
                    </th>
                    <th className="border border-gray-200 py-3 px-6 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الخميس
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule?.periods.map((period, periodIndex) => (
                    <tr key={periodIndex}>
                      <td className="border border-gray-200 py-3 px-6 bg-gray-50 font-medium">
                        {period.name} ({period.time})
                      </td>
                      {schedule.days.map((day, dayIndex) => {
                        const lesson = schedule.lessons.find(
                          l => l.day === day && l.periodIndex === periodIndex
                        );
                        
                        return (
                          <td key={dayIndex} className="border border-gray-200 py-3 px-4">
                            {lesson ? (
                              <>
                                <div className="font-bold">{lesson.subject}</div>
                                <div className="text-xs text-gray-500">{lesson.teacher}</div>
                              </>
                            ) : dayIndex === 0 && periodIndex === 3 ? (
                              <div className="bg-gray-100 text-center">استراحة</div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
