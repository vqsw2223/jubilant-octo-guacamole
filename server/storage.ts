import {
  type User,
  type InsertUser,
  type Student,
  type AttendanceRecord,
  type AttendanceRecordFull,
  type BehaviorViolation,
  type InsertBehaviorViolation,
  type Announcement,
  type InsertAnnouncement,
  type ClassSchedule,
  type AttendanceSummary,
  type RecentActivity,
  type AttendanceReport
} from "@shared/schema";

// Storage interface with all required methods
export interface IStorage {
  // User methods (required by template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getAllStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  
  // Attendance methods
  getAttendanceRecords(
    className?: string,
    section?: string,
    date?: string
  ): Promise<Array<Student & { attendanceStatus?: string, notes?: string }>>;
  saveAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecordFull>;
  getAttendanceSummary(): Promise<AttendanceSummary>;
  
  // Behavior methods
  getBehaviorViolations(): Promise<BehaviorViolation[]>;
  saveBehaviorViolation(violation: InsertBehaviorViolation): Promise<BehaviorViolation>;
  deleteBehaviorViolation(id: number): Promise<void>;
  
  // Announcement methods
  getAnnouncements(): Promise<Announcement[]>;
  getRecentAnnouncements(): Promise<Announcement[]>;
  saveAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Schedule methods
  getClassSchedule(
    className?: string,
    section?: string
  ): Promise<ClassSchedule>;
  
  // Dashboard methods
  getRecentActivities(): Promise<RecentActivity[]>;
  
  // Report methods
  generateAttendanceReport(
    className?: string,
    startDate?: string,
    endDate?: string,
    period?: string
  ): Promise<AttendanceReport>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private attendanceRecords: Map<number, AttendanceRecordFull>;
  private behaviorViolations: Map<number, BehaviorViolation>;
  private announcements: Map<number, Announcement>;
  
  // ID counters
  private userIdCounter: number;
  private studentIdCounter: number;
  private attendanceIdCounter: number;
  private violationIdCounter: number;
  private announcementIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.attendanceRecords = new Map();
    this.behaviorViolations = new Map();
    this.announcements = new Map();
    
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.violationIdCounter = 1;
    this.announcementIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Add default admin user
    this.createUser({
      username: "sami",
      password: "12345"
    });
    
    // Seed some students
    this.seedStudents();
    
    // Seed announcements
    this.seedAnnouncements();
  }

  // Seed initial data for demo
  private seedStudents() {
    const students = [
      { name: "أحمد محمد العمري", className: "الثالث", section: "أ" },
      { name: "خالد عبدالله السالم", className: "الثالث", section: "أ" },
      { name: "فهد سعد الغامدي", className: "الثالث", section: "أ" },
      { name: "محمد علي السعدي", className: "الثالث", section: "ب" },
      { name: "عبدالله محمد الحربي", className: "الثالث", section: "ب" },
    ];
    
    for (const student of students) {
      const id = this.studentIdCounter++;
      this.students.set(id, { id, ...student });
    }
  }
  
  private seedAnnouncements() {
    const announcements = [
      {
        title: "اجتماع أولياء الأمور",
        content: "سيعقد اجتماع أولياء الأمور يوم الخميس القادم الساعة 6 مساءً.",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        importance: "urgent"
      },
      {
        title: "الاختبارات النهائية",
        content: "تبدأ الاختبارات النهائية يوم الأحد القادم. يرجى الاستعداد.",
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        importance: "important"
      }
    ];
    
    for (const announcement of announcements) {
      const id = this.announcementIdCounter++;
      this.announcements.set(id, { 
        id, 
        ...announcement, 
        createdAt: new Date() 
      } as Announcement);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Student methods
  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  // Attendance methods
  async getAttendanceRecords(
    className?: string,
    section?: string,
    date?: string
  ): Promise<Array<Student & { attendanceStatus?: string, notes?: string }>> {
    const students = Array.from(this.students.values())
      .filter(student => {
        if (className && student.className !== className) return false;
        if (section && student.section !== section) return false;
        return true;
      });
    
    // If date is provided, get attendance status for that date
    if (date) {
      return students.map(student => {
        const record = Array.from(this.attendanceRecords.values())
          .find(r => r.studentId === student.id && r.date === date);
        
        return {
          ...student,
          attendanceStatus: record?.status,
          notes: record?.notes
        };
      });
    }
    
    return students;
  }
  
  async saveAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecordFull> {
    // Find if record already exists for this student and date
    const existingRecordId = Array.from(this.attendanceRecords.entries())
      .find(([_, r]) => r.studentId === record.studentId && r.date === record.date)?.[0];
    
    let id = existingRecordId;
    
    if (!id) {
      id = this.attendanceIdCounter++;
    }
    
    const fullRecord: AttendanceRecordFull = {
      id,
      ...record,
      createdAt: new Date()
    };
    
    this.attendanceRecords.set(id, fullRecord);
    return fullRecord;
  }
  
  async getAttendanceSummary(): Promise<AttendanceSummary> {
    const totalStudents = this.students.size;
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = Array.from(this.attendanceRecords.values())
      .filter(record => record.date === today);
    
    const presentCount = todayRecords.filter(r => r.status === "present").length;
    const absentCount = todayRecords.filter(r => r.status === "absent").length;
    const lateCount = todayRecords.filter(r => r.status === "late").length;
    
    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount
    };
  }
  
  // Behavior methods
  async getBehaviorViolations(): Promise<BehaviorViolation[]> {
    return Array.from(this.behaviorViolations.values());
  }
  
  async saveBehaviorViolation(violation: InsertBehaviorViolation): Promise<BehaviorViolation> {
    const id = this.violationIdCounter++;
    const fullViolation: BehaviorViolation = {
      id,
      ...violation,
      createdAt: new Date()
    };
    
    this.behaviorViolations.set(id, fullViolation);
    return fullViolation;
  }
  
  async deleteBehaviorViolation(id: number): Promise<void> {
    this.behaviorViolations.delete(id);
  }
  
  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async getRecentAnnouncements(): Promise<Announcement[]> {
    return (await this.getAnnouncements()).slice(0, 3);
  }
  
  async saveAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementIdCounter++;
    const fullAnnouncement: Announcement = {
      id,
      ...announcement,
      createdAt: new Date()
    };
    
    this.announcements.set(id, fullAnnouncement);
    return fullAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<void> {
    this.announcements.delete(id);
  }
  
  // Schedule methods
  async getClassSchedule(className?: string, section?: string): Promise<ClassSchedule> {
    // Return the mock schedule data for any class/section
    return {
      className: className || "الثالث",
      section: section || "أ",
      days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
      periods: [
        { name: "الأولى", time: "7:30 - 8:15" },
        { name: "الثانية", time: "8:15 - 9:00" },
        { name: "الثالثة", time: "9:00 - 9:45" },
        { name: "الفسحة", time: "9:45 - 10:15" },
        { name: "الرابعة", time: "10:15 - 11:00" },
        { name: "الخامسة", time: "11:00 - 11:45" },
        { name: "السادسة", time: "11:45 - 12:30" }
      ],
      lessons: [
        { day: "الأحد", periodIndex: 0, subject: "رياضيات", teacher: "أ. محمد" },
        { day: "الأحد", periodIndex: 1, subject: "لغة عربية", teacher: "أ. خالد" },
        { day: "الأحد", periodIndex: 2, subject: "علوم", teacher: "أ. أحمد" },
        { day: "الأحد", periodIndex: 4, subject: "تربية إسلامية", teacher: "أ. عبدالله" },
        { day: "الأحد", periodIndex: 5, subject: "لغة إنجليزية", teacher: "أ. فهد" },
        { day: "الأحد", periodIndex: 6, subject: "حاسب آلي", teacher: "أ. سعد" },
        
        { day: "الاثنين", periodIndex: 0, subject: "علوم", teacher: "أ. أحمد" },
        { day: "الاثنين", periodIndex: 1, subject: "رياضيات", teacher: "أ. محمد" },
        { day: "الاثنين", periodIndex: 2, subject: "لغة عربية", teacher: "أ. خالد" },
        { day: "الاثنين", periodIndex: 4, subject: "لغة إنجليزية", teacher: "أ. فهد" },
        { day: "الاثنين", periodIndex: 5, subject: "تربية بدنية", teacher: "أ. ماجد" },
        { day: "الاثنين", periodIndex: 6, subject: "تربية إسلامية", teacher: "أ. عبدالله" },
        
        { day: "الثلاثاء", periodIndex: 0, subject: "لغة عربية", teacher: "أ. خالد" },
        { day: "الثلاثاء", periodIndex: 1, subject: "علوم", teacher: "أ. أحمد" },
        { day: "الثلاثاء", periodIndex: 2, subject: "رياضيات", teacher: "أ. محمد" },
        { day: "الثلاثاء", periodIndex: 4, subject: "تربية بدنية", teacher: "أ. ماجد" },
        { day: "الثلاثاء", periodIndex: 5, subject: "تربية إسلامية", teacher: "أ. عبدالله" },
        { day: "الثلاثاء", periodIndex: 6, subject: "لغة إنجليزية", teacher: "أ. فهد" },
        
        { day: "الأربعاء", periodIndex: 0, subject: "تربية إسلامية", teacher: "أ. عبدالله" },
        { day: "الأربعاء", periodIndex: 1, subject: "لغة إنجليزية", teacher: "أ. فهد" },
        { day: "الأربعاء", periodIndex: 2, subject: "علوم", teacher: "أ. أحمد" },
        { day: "الأربعاء", periodIndex: 4, subject: "رياضيات", teacher: "أ. محمد" },
        { day: "الأربعاء", periodIndex: 5, subject: "حاسب آلي", teacher: "أ. سعد" },
        { day: "الأربعاء", periodIndex: 6, subject: "لغة عربية", teacher: "أ. خالد" },
        
        { day: "الخميس", periodIndex: 0, subject: "لغة إنجليزية", teacher: "أ. فهد" },
        { day: "الخميس", periodIndex: 1, subject: "حاسب آلي", teacher: "أ. سعد" },
        { day: "الخميس", periodIndex: 2, subject: "تربية بدنية", teacher: "أ. ماجد" },
        { day: "الخميس", periodIndex: 4, subject: "لغة عربية", teacher: "أ. خالد" },
        { day: "الخميس", periodIndex: 5, subject: "علوم", teacher: "أ. أحمد" },
        { day: "الخميس", periodIndex: 6, subject: "رياضيات", teacher: "أ. محمد" }
      ]
    };
  }
  
  // Dashboard methods
  async getRecentActivities(): Promise<RecentActivity[]> {
    // Generate mock recent activities
    const activities: RecentActivity[] = [
      {
        id: 1,
        type: "attendance",
        description: "تسجيل حضور",
        studentName: "أحمد محمد العمري",
        time: "07:30 ص",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: "late",
        description: "تسجيل تأخر",
        studentName: "خالد عبدالله السالم",
        time: "08:15 ص",
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        type: "absence",
        description: "تسجيل غياب",
        studentName: "فهد سعد الغامدي",
        time: "09:00 ص",
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        type: "violation",
        description: "تسجيل مخالفة",
        studentName: "محمد علي السعدي",
        time: "10:30 ص",
        createdAt: new Date().toISOString()
      }
    ];
    
    return activities;
  }
  
  // Report methods
  async generateAttendanceReport(
    className?: string,
    startDate?: string,
    endDate?: string,
    period?: string
  ): Promise<AttendanceReport> {
    const today = new Date();
    
    // Based on the period, calculate start and end dates
    if (period && !startDate) {
      switch (period) {
        case "day":
          startDate = today.toISOString().split('T')[0];
          endDate = startDate;
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = monthStart.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        // Other periods could be added as needed
      }
    }
    
    // Generate attendance report data
    return {
      totalStudents: this.students.size,
      presentCount: 120,
      absentCount: 5,
      lateCount: 3,
      date: today.toLocaleDateString("ar-SA"),
      className: className,
      section: undefined
    };
  }
}

export const storage = new MemStorage();
