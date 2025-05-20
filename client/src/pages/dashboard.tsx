import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Home, 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  Download, 
  Megaphone,
  UserPlus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getCurrentArabicDate } from "@/lib/utils/arabic-date";
import { 
  AttendanceSummary, 
  RecentActivity, 
  Announcement,
  ActivityType 
} from "@shared/schema";

export default function DashboardPage() {
  const [currentDate] = useState(getCurrentArabicDate());

  // Fetch attendance summary
  const { data: attendanceSummary } = useQuery<AttendanceSummary>({
    queryKey: ["/api/dashboard/attendance-summary"],
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery<RecentActivity[]>({
    queryKey: ["/api/dashboard/recent-activities"],
  });

  // Fetch recent announcements
  const { data: recentAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/dashboard/recent-announcements"],
  });

  // Map activity type to badge status
  const activityTypeToStatus = (type: ActivityType) => {
    switch (type) {
      case "attendance": return "present";
      case "late": return "late";
      case "absence": return "absent";
      case "violation": return "violation";
      default: return "present";
    }
  };

  // Map activity type to label
  const activityTypeToLabel = (type: ActivityType) => {
    switch (type) {
      case "attendance": return "حاضر";
      case "late": return "متأخر";
      case "absence": return "غائب";
      case "violation": return "مخالفة";
      default: return "حاضر";
    }
  };

  // Activity table columns
  const activityColumns = [
    { 
      header: "النشاط", 
      accessor: "description" as keyof RecentActivity
    },
    { 
      header: "الطالب", 
      accessor: "studentName" as keyof RecentActivity
    },
    { 
      header: "الوقت", 
      accessor: "time" as keyof RecentActivity
    },
    { 
      header: "الحالة", 
      accessor: (activity: RecentActivity) => (
        <StatusBadge 
          status={activityTypeToStatus(activity.type)} 
          label={activityTypeToLabel(activity.type)} 
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img src="/images/school-logo.jpg" alt="شعار المدرسة" className="h-12 w-12 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم - مدرسة جابر بن حيان الثانوية</h1>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="ml-1" aria-hidden="true">📅</span>
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-r-4 border-primary">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>إجمالي الطلاب</CardDescription>
                <CardTitle className="text-2xl">{attendanceSummary?.totalStudents || 0}</CardTitle>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>الحاضرون اليوم</CardDescription>
                <CardTitle className="text-2xl">{attendanceSummary?.presentCount || 0}</CardTitle>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>الغائبون</CardDescription>
                <CardTitle className="text-2xl">{attendanceSummary?.absentCount || 0}</CardTitle>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <UserMinus className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-yellow-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>المتأخرون</CardDescription>
                <CardTitle className="text-2xl">{attendanceSummary?.lateCount || 0}</CardTitle>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold">آخر النشاطات</CardTitle>
            <Link href="/reports" className="text-primary text-sm hover:underline">
              عرض الكل
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={recentActivities || []}
            columns={activityColumns}
            emptyMessage="لا توجد نشاطات حديثة"
          />
        </CardContent>
      </Card>

      {/* Quick Actions & Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Button className="flex items-center w-full gap-2">
                <UserPlus className="h-4 w-4" />
                <span>إضافة طالب جديد</span>
              </Button>
              <Button variant="outline" className="flex items-center w-full gap-2">
                <Download className="h-4 w-4" />
                <span>تصدير تقرير الحضور</span>
              </Button>
              <Button variant="outline" className="flex items-center w-full gap-2">
                <Megaphone className="h-4 w-4" />
                <span>إنشاء إعلان جديد</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Announcements Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold">آخر الإعلانات</CardTitle>
              <Link href="/announcements" className="text-primary text-sm hover:underline">
                كل الإعلانات
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {recentAnnouncements && recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className={`p-3 rounded-md border-r-2 ${
                      announcement.importance === 'urgent' 
                        ? 'bg-blue-50 border-primary' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800">{announcement.title}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.startDate).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                لا توجد إعلانات حديثة
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
