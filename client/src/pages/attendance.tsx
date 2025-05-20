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
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Student, AttendanceRecord, AttendanceStatus } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get attendance data for selected class, section and date
  const { data: attendanceData, isLoading } = useQuery<Array<Student & { attendanceStatus?: AttendanceStatus, notes?: string }>>({
    queryKey: ["/api/attendance", selectedClass, selectedSection, selectedDate],
    enabled: !!selectedDate
  });

  // Save attendance mutation
  const saveAttendance = useMutation({
    mutationFn: (record: AttendanceRecord) => 
      apiRequest("POST", "/api/attendance", record),
    onSuccess: () => {
      toast({
        title: "تم تسجيل الحضور",
        description: "تم حفظ بيانات الحضور بنجاح",
      });
      
      // Refresh attendance data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/attendance", selectedClass, selectedSection, selectedDate]
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل الحضور",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle saving attendance for a student
  const handleSaveAttendance = (studentId: number, status: AttendanceStatus, notes: string = "") => {
    saveAttendance.mutate({
      studentId,
      date: selectedDate,
      status,
      notes
    });
  };

  // Table columns
  const columns = [
    {
      header: "رقم الطالب",
      accessor: "id" as keyof Student
    },
    {
      header: "اسم الطالب",
      accessor: "name" as keyof Student
    },
    {
      header: "الصف",
      accessor: "className" as keyof Student
    },
    {
      header: "الشعبة",
      accessor: "section" as keyof Student
    },
    {
      header: "الحالة",
      accessor: (student: Student & { attendanceStatus?: AttendanceStatus }) => {
        const [status, setStatus] = useState<AttendanceStatus>(student.attendanceStatus || "present");
        
        return (
          <Select
            value={status}
            onValueChange={(value: AttendanceStatus) => setStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">حاضر</SelectItem>
              <SelectItem value="absent">غائب</SelectItem>
              <SelectItem value="late">متأخر</SelectItem>
              <SelectItem value="excused">إذن</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    },
    {
      header: "ملاحظات",
      accessor: (student: Student & { notes?: string }) => {
        const [notes, setNotes] = useState(student.notes || "");
        
        return (
          <Input
            placeholder="ملاحظات"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        );
      }
    },
    {
      header: "إجراءات",
      accessor: (student: Student & { attendanceStatus?: AttendanceStatus, notes?: string }) => {
        const [status, setStatus] = useState<AttendanceStatus>(student.attendanceStatus || "present");
        const [notes, setNotes] = useState(student.notes || "");
        
        return (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleSaveAttendance(student.id, status, notes)}
            className="text-primary hover:text-primary/80"
            disabled={saveAttendance.isPending}
          >
            <Save className="h-4 w-4" />
          </Button>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            <span>نظام الحضور</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
            <div className="w-full md:w-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="بحث عن طالب..."
                  className="bg-gray-50 border pr-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الصفوف</SelectItem>
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
                  <SelectValue placeholder="جميع الشعب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الشعب</SelectItem>
                  <SelectItem value="أ">أ</SelectItem>
                  <SelectItem value="ب">ب</SelectItem>
                  <SelectItem value="ج">ج</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-50 border"
              />
            </div>
          </div>
          
          {/* Attendance Table */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-center">جاري تحميل البيانات...</div>
            </div>
          ) : (
            <DataTable
              data={attendanceData || []}
              columns={columns}
              searchField="name"
              emptyMessage="لا توجد بيانات للطلاب في الفترة المحددة"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
