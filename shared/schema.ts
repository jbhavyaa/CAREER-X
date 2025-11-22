import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rollNumber: text("roll_number").unique(),
  cgpa: decimal("cgpa", { precision: 3, scale: 2 }),
  branch: text("branch"),
  course: text("course"),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  package: text("package").notNull(),
  minCgpa: decimal("min_cgpa", { precision: 3, scale: 2 }).notNull(),
  allowedBranches: text("allowed_branches").array().notNull(),
  allowedCourses: text("allowed_courses").array().notNull(),
  deadline: timestamp("deadline").notNull(),
  postedBy: varchar("posted_by").notNull().references(() => users.id),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
});

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const ppts = pgTable("ppts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const placements = pgTable("placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  studentsPlaced: integer("students_placed").notNull(),
  year: integer("year").notNull(),
  branch: text("branch").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  jobsPosted: many(jobs),
  applications: many(jobApplications),
  forumPosts: many(forumPosts),
  pptsUploaded: many(ppts),
  eventsCreated: many(events),
  placementsCreated: many(placements),
  notificationsCreated: many(notifications),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  postedByUser: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  student: one(users, {
    fields: [jobApplications.studentId],
    references: [users.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one }) => ({
  author: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
}));

export const pptsRelations = relations(ppts, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [ppts.uploadedBy],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  createdByUser: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  createdByUser: one(users, {
    fields: [placements.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  createdByUser: one(users, {
    fields: [notifications.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
  status: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  postedAt: true,
});

export const insertPptSchema = createInsertSchema(ppts).omit({
  id: true,
  uploadedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export type InsertPpt = z.infer<typeof insertPptSchema>;
export type Ppt = typeof ppts.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertPlacement = z.infer<typeof insertPlacementSchema>;
export type Placement = typeof placements.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
