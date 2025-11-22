import {
  users,
  studentProfiles,
  jobs,
  jobApplications,
  forumPosts,
  ppts,
  events,
  placements,
  notifications,
  type User,
  type InsertUser,
  type StudentProfile,
  type InsertStudentProfile,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type ForumPost,
  type InsertForumPost,
  type Ppt,
  type InsertPpt,
  type Event,
  type InsertEvent,
  type Placement,
  type InsertPlacement,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: string, profile: Partial<InsertStudentProfile>): Promise<StudentProfile>;

  getAllJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;

  getJobApplicationsByStudent(studentId: string): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  hasApplied(jobId: string, studentId: string): Promise<boolean>;

  getAllForumPosts(): Promise<(ForumPost & { author: { name: string } })[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  deleteForumPost(id: string): Promise<void>;

  getAllPPTs(): Promise<Ppt[]>;
  createPPT(ppt: InsertPpt): Promise<Ppt>;
  deletePPT(id: string): Promise<void>;

  getAllEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  getAllPlacements(): Promise<Placement[]>;
  createPlacement(placement: InsertPlacement): Promise<Placement>;

  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId));
    return profile || undefined;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [newProfile] = await db
      .insert(studentProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateStudentProfile(
    userId: string,
    profile: Partial<InsertStudentProfile>
  ): Promise<StudentProfile> {
    const [updated] = await db
      .update(studentProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.postedAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const [updated] = await db
      .update(jobs)
      .set(job)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getJobApplicationsByStudent(studentId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.studentId, studentId))
      .orderBy(desc(jobApplications.appliedAt));
  }

  async createJobApplication(
    application: InsertJobApplication
  ): Promise<JobApplication> {
    const [newApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async hasApplied(jobId: string, studentId: string): Promise<boolean> {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .where(eq(jobApplications.studentId, studentId));
    return !!application;
  }

  async getAllForumPosts(): Promise<(ForumPost & { author: { name: string } })[]> {
    const posts = await db
      .select({
        id: forumPosts.id,
        userId: forumPosts.userId,
        companyName: forumPosts.companyName,
        title: forumPosts.title,
        content: forumPosts.content,
        postedAt: forumPosts.postedAt,
        authorName: users.name,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .orderBy(desc(forumPosts.postedAt));

    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      companyName: post.companyName,
      title: post.title,
      content: post.content,
      postedAt: post.postedAt,
      author: { name: post.authorName || "Unknown" },
    }));
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async deleteForumPost(id: string): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  async getAllPPTs(): Promise<Ppt[]> {
    return await db.select().from(ppts).orderBy(desc(ppts.uploadedAt));
  }

  async createPPT(ppt: InsertPpt): Promise<Ppt> {
    const [newPpt] = await db.insert(ppts).values(ppt).returning();
    return newPpt;
  }

  async deletePPT(id: string): Promise<void> {
    await db.delete(ppts).where(eq(ppts.id, id));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getAllPlacements(): Promise<Placement[]> {
    return await db.select().from(placements).orderBy(desc(placements.createdAt));
  }

  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const [newPlacement] = await db
      .insert(placements)
      .values(placement)
      .returning();
    return newPlacement;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }
}

export const storage = new DatabaseStorage();
