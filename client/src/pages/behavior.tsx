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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Eye, Edit, Trash, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Student, BehaviorViolation, ViolationSeverity } from "@shared/schema";

export default function BehaviorPage() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [violationType, setViolationType] = useState("");
  const [description, setDescription] = useState("");
  const [violationDate, setViolationDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonPeriod, setLessonPeriod] = useState("");
  const [severity, setSeverity] = useState<ViolationSeverity>("medium");

  // Fetch students for the dropdown
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Fetch behavior violations
  const { data: violations, isLoading } = useQuery<BehaviorViolation[]>({
    queryKey: ["/api/behavior"],
  });

  // Create violation mutation
  const createViolation = useMutation({
    mutationFn: (violation: Omit<BehaviorViolation, "id">) => 
      apiRequest("POST", "/api/behavior", violation),
    onSuccess: () => {
      // Reset form
      setSelectedStudent("");
      setViolationType("");
      setDescription("");
      setViolationDate(new Date().toISOString().split('T')[0]);
      setLessonPeriod("");
      setSeverity("medium");
      
      toast({
        title: "تم تسجيل المخالفة",
        description: "تم تسجيل المخالفة السلوكية بنجاح",
      });
      
      // Refresh violations list
      queryClient.invalidateQueries({ queryKey: ["/api/behavior"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل المخالفة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete violation mutation
  const deleteViolation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/behavior/${id}`),
    onSuccess: () => {
      toast({
        title: "تم حذف المخالفة",
        description: "تم حذف المخالفة السلوكية بنجاح",
      });
      
      // Refresh violations list
      queryClient.invalidateQueries({ queryKey: ["/api/behavior"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف المخالفة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !violationType || !description || !violationDate) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const studentId = parseInt(selectedStudent);
    
    createViolation.mutate({
      studentId,
      violationType,
      description,
      date: violationDate,
      lessonPeriod,
      severity
    });
  };

  // Map severity to status badge
  const severityToStatus = (severity: ViolationSeverity) => {
    switch (severity) {
      case "low": return "present";
      case "medium": return "late";
      case "high": return "absent";
      default: return "late";
    }
  };

  // Map severity to label
  const severityToLabel = (severity: ViolationSeverity) => {
    switch (severity) {
      case "low": return "بسيطة";
      case "medium": return "متوسطة";
      case "high": return "شديدة";
      default: return "متوسطة";
    }
  };

  // Table columns for violations
  const columns = [
    {
      header: "اسم الطالب",
      accessor: "studentName" as keyof BehaviorViolation
    },
    {
      header: "نوع المخالفة",
      accessor: "violationType" as keyof BehaviorViolation
    },
    {
      header: "التاريخ",
      accessor: (violation: BehaviorViolation) => new Date(violation.date).toLocaleDateString("ar-SA")
    },
    {
      header: "المستوى",
      accessor: (violation: BehaviorViolation) => (
        <StatusBadge 
          status={severityToStatus(violation.severity)} 
          label={severityToLabel(violation.severity)} 
        />
      )
    },
    {
      header: "الإجراء",
      accessor: (violation: BehaviorViolation) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" title="عرض">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" title="تعديل">
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700" 
            title="حذف"
            onClick={() => deleteViolation.mutate(violation.id)}
            disabled={deleteViolation.isPending}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>المخالفات السلوكية</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Add Violation Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">تسجيل مخالفة جديدة</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="student">اسم الطالب</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger id="student" className="mt-1">
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="violationType">نوع المخالفة</Label>
                  <Select
                    value={violationType}
                    onValueChange={setViolationType}
                  >
                    <SelectTrigger id="violationType" className="mt-1">
                      <SelectValue placeholder="اختر نوع المخالفة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سلوك عدواني">سلوك عدواني</SelectItem>
                      <SelectItem value="تخريب ممتلكات">تخريب ممتلكات</SelectItem>
                      <SelectItem value="عدم الالتزام بالزي المدرسي">عدم الالتزام بالزي المدرسي</SelectItem>
                      <SelectItem value="استخدام الجوال">استخدام الجوال</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="description">وصف المخالفة</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل المخالفة هنا..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="date">تاريخ المخالفة</Label>
                  <Input
                    id="date"
                    type="date"
                    value={violationDate}
                    onChange={(e) => setViolationDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lessonPeriod">الحصة الدراسية</Label>
                  <Select
                    value={lessonPeriod}
                    onValueChange={setLessonPeriod}
                  >
                    <SelectTrigger id="lessonPeriod" className="mt-1">
                      <SelectValue placeholder="اختر الحصة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الأولى">الأولى</SelectItem>
                      <SelectItem value="الثانية">الثانية</SelectItem>
                      <SelectItem value="الثالثة">الثالثة</SelectItem>
                      <SelectItem value="الرابعة">الرابعة</SelectItem>
                      <SelectItem value="الخامسة">الخامسة</SelectItem>
                      <SelectItem value="السادسة">السادسة</SelectItem>
                      <SelectItem value="الفسحة">الفسحة</SelectItem>
                      <SelectItem value="قبل الدوام">قبل الدوام</SelectItem>
                      <SelectItem value="بعد الدوام">بعد الدوام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="severity">مستوى المخالفة</Label>
                  <Select
                    value={severity}
                    onValueChange={(value) => setSeverity(value as ViolationSeverity)}
                  >
                    <SelectTrigger id="severity" className="mt-1">
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">بسيطة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">شديدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={createViolation.isPending}
                  className="flex gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>حفظ المخالفة</span>
                </Button>
              </div>
            </form>
          </div>
          
          {/* Violations History */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">سجل المخالفات</h3>
              <div className="relative w-64">
                <Input 
                  type="text" 
                  placeholder="بحث..." 
                  className="bg-gray-50 border pr-10"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">جاري تحميل البيانات...</div>
            ) : (
              <DataTable
                data={violations || []}
                columns={columns}
                searchField="studentName"
                emptyMessage="لم يتم تسجيل أي مخالفات بعد"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
