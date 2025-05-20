import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes

  // Get dashboard attendance summary
  app.get("/api/dashboard/attendance-summary", async (req, res) => {
    try {
      const summary = await storage.getAttendanceSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance summary" });
    }
  });

  // Get recent activities for dashboard
  app.get("/api/dashboard/recent-activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent activities" });
    }
  });

  // Get recent announcements for dashboard
  app.get("/api/dashboard/recent-announcements", async (req, res) => {
    try {
      const announcements = await storage.getRecentAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent announcements" });
    }
  });

  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching students" });
    }
  });

  // Get attendance records
  app.get("/api/attendance", async (req, res) => {
    try {
      const { class: className, section, date } = req.query;
      const records = await storage.getAttendanceRecords(
        className as string | undefined,
        section as string | undefined,
        date as string | undefined
      );
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance records" });
    }
  });

  // Create attendance record
  app.post("/api/attendance", async (req, res) => {
    try {
      const schema = z.object({
        studentId: z.number(),
        date: z.string(),
        status: z.enum(["present", "absent", "late", "excused"]),
        notes: z.string().optional()
      });

      const data = schema.parse(req.body);
      const record = await storage.saveAttendanceRecord(data);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance record data" });
    }
  });

  // Get behavior violations
  app.get("/api/behavior", async (req, res) => {
    try {
      const violations = await storage.getBehaviorViolations();
      res.json(violations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching behavior violations" });
    }
  });

  // Create behavior violation
  app.post("/api/behavior", async (req, res) => {
    try {
      const schema = z.object({
        studentId: z.number(),
        violationType: z.string(),
        description: z.string(),
        date: z.string(),
        lessonPeriod: z.string().optional(),
        severity: z.enum(["low", "medium", "high"])
      });

      const data = schema.parse(req.body);
      
      // Get student name
      const student = await storage.getStudent(data.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const violation = await storage.saveBehaviorViolation({
        ...data,
        studentName: student.name
      });
      
      res.status(201).json(violation);
    } catch (error) {
      res.status(400).json({ message: "Invalid behavior violation data" });
    }
  });

  // Delete behavior violation
  app.delete("/api/behavior/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBehaviorViolation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting behavior violation" });
    }
  });

  // Get announcements
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Error fetching announcements" });
    }
  });

  // Create announcement
  app.post("/api/announcements", async (req, res) => {
    try {
      const schema = z.object({
        title: z.string(),
        content: z.string(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        importance: z.enum(["normal", "important", "urgent"])
      });

      const data = schema.parse(req.body);
      const announcement = await storage.saveAnnouncement({
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Invalid announcement data" });
    }
  });

  // Delete announcement
  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting announcement" });
    }
  });

  // Get schedule
  app.get("/api/schedule", async (req, res) => {
    try {
      const { class: className, section } = req.query;
      const schedule = await storage.getClassSchedule(
        className as string | undefined,
        section as string | undefined
      );
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Error fetching class schedule" });
    }
  });

  // Generate report
  app.get("/api/reports/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const { class: className, start, end, period } = req.query;
      
      if (type === "attendance") {
        const report = await storage.generateAttendanceReport(
          className as string | undefined,
          start as string | undefined,
          end as string | undefined,
          period as string | undefined
        );
        res.json(report);
      } else if (type === "behavior") {
        // Not implemented yet
        res.status(501).json({ message: "Behavior report not implemented yet" });
      } else if (type === "statistics") {
        // Not implemented yet
        res.status(501).json({ message: "Statistics report not implemented yet" });
      } else {
        res.status(400).json({ message: "Invalid report type" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error generating report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
