import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  section: text("section").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  className: true,
  section: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  date: text("date").notNull(),
  status: text("status").notNull(), // present, absent, late, excused
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).pick({
  studentId: true,
  date: true,
  status: true,
  notes: true,
});

export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type AttendanceRecord = Omit<z.infer<typeof insertAttendanceRecordSchema>, "status"> & {
  status: AttendanceStatus;
};
export type AttendanceRecordFull = typeof attendanceRecords.$inferSelect;

// Behavior violations table
export const behaviorViolations = pgTable("behavior_violations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  studentName: text("student_name").notNull(),
  violationType: text("violation_type").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  lessonPeriod: text("lesson_period"),
  severity: text("severity").notNull(), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBehaviorViolationSchema = createInsertSchema(behaviorViolations).pick({
  studentId: true,
  studentName: true,
  violationType: true,
  description: true,
  date: true,
  lessonPeriod: true,
  severity: true,
});

export type ViolationSeverity = "low" | "medium" | "high";
export type BehaviorViolation = typeof behaviorViolations.$inferSelect;
export type InsertBehaviorViolation = z.infer<typeof insertBehaviorViolationSchema>;

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  importance: text("importance").notNull(), // normal, important, urgent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  startDate: true,
  endDate: true,
  importance: true,
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Users table (as required by the template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Class schedule schema
export type ClassSchedule = {
  className: string;
  section: string;
  days: string[];
  periods: Array<{
    name: string;
    time: string;
  }>;
  lessons: Array<{
    day: string;
    periodIndex: number;
    subject: string;
    teacher: string;
  }>;
};

// Additional types for UI components

// Activity type for recent activities
export type ActivityType = "attendance" | "absence" | "late" | "violation";

// Recent activity type
export type RecentActivity = {
  id: number;
  type: ActivityType;
  description: string;
  studentName: string;
  time: string;
  createdAt: string;
};

// Attendance summary for dashboard
export type AttendanceSummary = {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
};

// Attendance report for PDF generation
export type AttendanceReport = {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  date: string;
  className?: string;
  section?: string;
};
