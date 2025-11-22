import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole, type AuthRequest } from "./middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserSchema, insertJobSchema, insertForumPostSchema, insertEventSchema, insertPlacementSchema, insertNotificationSchema } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Content-Disposition", "inline");
    next();
  });
  app.use("/uploads", express.static(uploadDir));

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, role } = insertUserSchema.extend({
        name: z.string(),
        role: z.enum(["student", "admin"]),
      }).parse(req.body);

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role,
      });

      if (role === "student") {
        await storage.createStudentProfile({
          userId: user.id,
          rollNumber: null,
          cgpa: null,
          branch: null,
          course: null,
        });
      }

      res.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== role) {
        return res.status(401).json({ message: "Invalid role selected" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login successful" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getStudentProfile(req.userId!);
      res.json(profile || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const existingProfile = await storage.getStudentProfile(req.userId!);

      if (existingProfile) {
        const updated = await storage.updateStudentProfile(req.userId!, req.body);
        res.json(updated);
      } else {
        const created = await storage.createStudentProfile({
          userId: req.userId!,
          ...req.body,
        });
        res.json(created);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/profile/resume", authenticateToken, upload.single("resume"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      const existingProfile = await storage.getStudentProfile(req.userId!);
      if (existingProfile) {
        await storage.updateStudentProfile(req.userId!, { resumeUrl: fileUrl });
      } else {
        await storage.createStudentProfile({
          userId: req.userId!,
          rollNumber: "",
          cgpa: "0.00",
          branch: "",
          course: "",
          resumeUrl: fileUrl,
        });
      }

      res.json({ message: "Resume uploaded successfully", fileUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/jobs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/jobs", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        deadline: new Date(req.body.deadline),
        minCgpa: req.body.minCgpa ? req.body.minCgpa.toString() : "0.00",
        postedBy: req.userId,
      });
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/jobs/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const updateData = {
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline) : req.body.deadline,
        minCgpa: req.body.minCgpa ? req.body.minCgpa.toString() : req.body.minCgpa,
      };
      const job = await storage.updateJob(req.params.id, updateData);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/jobs/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteJob(req.params.id);
      res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/my", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const applications = await storage.getJobApplicationsByStudent(req.userId!);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/applications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { jobId } = req.body;
      const hasApplied = await storage.hasApplied(jobId, req.userId!);

      if (hasApplied) {
        return res.status(400).json({ message: "Already applied to this job" });
      }

      const application = await storage.createJobApplication({
        jobId,
        studentId: req.userId!,
      });
      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/forums", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const posts = await storage.getAllForumPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/forums", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/forums/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteForumPost(req.params.id);
      res.json({ message: "Post deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ppts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const ppts = await storage.getAllPPTs();
      res.json(ppts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ppts", authenticateToken, requireRole("admin"), upload.single("ppt"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const ppt = await storage.createPPT({
        companyName: req.body.companyName,
        fileUrl,
        uploadedBy: req.userId!,
      });

      res.status(201).json(ppt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/ppts/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deletePPT(req.params.id);
      res.json({ message: "PPT deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: req.userId,
      });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/events/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/events/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/placements", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const placements = await storage.getAllPlacements();
      res.json(placements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/placements", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const placementData = insertPlacementSchema.parse({
        ...req.body,
        createdBy: req.userId,
      });
      const placement = await storage.createPlacement(placementData);
      res.status(201).json(placement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const notificationData = insertNotificationSchema.parse({
        ...req.body,
        createdBy: req.userId,
      });
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
