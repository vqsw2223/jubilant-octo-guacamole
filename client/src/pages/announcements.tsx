import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Edit, Trash } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Announcement } from "@shared/schema";

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [importance, setImportance] = useState("normal");

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Create announcement mutation
  const createAnnouncement = useMutation({
    mutationFn: (announcement: Omit<Announcement, "id" | "createdAt">) => 
      apiRequest("POST", "/api/announcements", announcement),
    onSuccess: () => {
      // Reset form and show success message
      setTitle("");
      setContent("");
      setStartDate("");
      setEndDate("");
      setImportance("normal");
      
      toast({
        title: "تم إنشاء الإعلان بنجاح",
        description: "تم نشر الإعلان الجديد",
      });
      
      // Refresh announcements list
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الإعلان",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete announcement mutation
  const deleteAnnouncement = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/announcements/${id}`),
    onSuccess: () => {
      toast({
        title: "تم حذف الإعلان",
        description: "تم حذف الإعلان بنجاح",
      });
      
      // Refresh announcements list
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف الإعلان",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !startDate) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    createAnnouncement.mutate({
      title,
      content,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      importance: importance as "normal" | "important" | "urgent",
    });
  };

  // Map importance to status badge type
  const importanceToStatus = (importance: string): "normal" | "important" | "urgent" => {
    switch (importance) {
      case "important": return "important";
      case "urgent": return "urgent";
      default: return "normal";
    }
  };

  // Map importance to label
  const importanceToLabel = (importance: string): string => {
    switch (importance) {
      case "important": return "مهم";
      case "urgent": return "عاجل";
      default: return "عادي";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            <span>الإعلانات</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Create Announcement Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">إنشاء إعلان جديد</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="title">عنوان الإعلان</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان الإعلان"
                  className="mt-1"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="content">نص الإعلان</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب نص الإعلان هنا..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="startDate">تاريخ النشر</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="importance">الأهمية</Label>
                  <Select
                    value={importance}
                    onValueChange={setImportance}
                  >
                    <SelectTrigger id="importance" className="mt-1">
                      <SelectValue placeholder="اختر مستوى الأهمية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="important">مهم</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={createAnnouncement.isPending}
                  className="flex gap-2"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>نشر الإعلان</span>
                </Button>
              </div>
            </form>
          </div>
          
          {/* Announcements List */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">الإعلانات الحالية</h3>
            
            {isLoading ? (
              <div className="text-center p-4">جاري تحميل البيانات...</div>
            ) : announcements?.length === 0 ? (
              <div className="text-center p-4 text-gray-500">لا توجد إعلانات حالية</div>
            ) : (
              <div className="space-y-4">
                {announcements?.map((announcement) => (
                  <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center">
                          <StatusBadge 
                            status={importanceToStatus(announcement.importance)} 
                            label={importanceToLabel(announcement.importance)}
                            className="ml-2"
                          />
                          {announcement.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-2">{announcement.content}</p>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-gray-500 hover:text-gray-700 ml-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteAnnouncement.mutate(announcement.id)}
                          disabled={deleteAnnouncement.isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-gray-500">
                      <span>تاريخ النشر: {new Date(announcement.startDate).toLocaleDateString("ar-SA")}</span>
                      {announcement.endDate && (
                        <span>تاريخ الانتهاء: {new Date(announcement.endDate).toLocaleDateString("ar-SA")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
