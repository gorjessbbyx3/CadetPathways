import { 
  users, cadets, behaviorIncidents, fitnessAssessments, mentorships, 
  developmentPlans, academicRecords, communications, parentGuardians,
  type User, type InsertUser, type Cadet, type InsertCadet,
  type BehaviorIncident, type InsertBehaviorIncident,
  type FitnessAssessment, type InsertFitnessAssessment,
  type Mentorship, type InsertMentorship,
  type DevelopmentPlan, type InsertDevelopmentPlan,
  type AcademicRecord, type InsertAcademicRecord,
  type Communication, type InsertCommunication,
  type ParentGuardian, type InsertParentGuardian
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getAllStaff(): Promise<User[]>;

  // Cadet management
  getCadet(id: string): Promise<Cadet | undefined>;
  createCadet(cadet: InsertCadet): Promise<Cadet>;
  updateCadet(id: string, cadet: Partial<InsertCadet>): Promise<Cadet>;
  getAllCadets(): Promise<Cadet[]>;
  searchCadets(query: string): Promise<Cadet[]>;
  getCadetsByStatus(status: string): Promise<Cadet[]>;

  // Behavior incidents
  getBehaviorIncident(id: string): Promise<BehaviorIncident | undefined>;
  createBehaviorIncident(incident: InsertBehaviorIncident): Promise<BehaviorIncident>;
  updateBehaviorIncident(id: string, incident: Partial<InsertBehaviorIncident>): Promise<BehaviorIncident>;
  getBehaviorIncidentsByCadet(cadetId: string): Promise<BehaviorIncident[]>;
  getRecentBehaviorIncidents(limit?: number): Promise<BehaviorIncident[]>;

  // Fitness assessments
  getFitnessAssessment(id: string): Promise<FitnessAssessment | undefined>;
  createFitnessAssessment(assessment: InsertFitnessAssessment): Promise<FitnessAssessment>;
  updateFitnessAssessment(id: string, assessment: Partial<InsertFitnessAssessment>): Promise<FitnessAssessment>;
  getFitnessAssessmentsByCadet(cadetId: string): Promise<FitnessAssessment[]>;
  getLatestFitnessAssessmentByCadet(cadetId: string): Promise<FitnessAssessment | undefined>;

  // Mentorships
  getMentorship(id: string): Promise<Mentorship | undefined>;
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  updateMentorship(id: string, mentorship: Partial<InsertMentorship>): Promise<Mentorship>;
  getMentorshipsByCadet(cadetId: string): Promise<Mentorship[]>;
  getMentorshipsByMentor(mentorId: string): Promise<Mentorship[]>;
  getActiveMentorships(): Promise<Mentorship[]>;

  // Development plans
  getDevelopmentPlan(id: string): Promise<DevelopmentPlan | undefined>;
  createDevelopmentPlan(plan: InsertDevelopmentPlan): Promise<DevelopmentPlan>;
  updateDevelopmentPlan(id: string, plan: Partial<InsertDevelopmentPlan>): Promise<DevelopmentPlan>;
  getDevelopmentPlanByCadet(cadetId: string): Promise<DevelopmentPlan | undefined>;

  // Academic records
  getAcademicRecord(id: string): Promise<AcademicRecord | undefined>;
  createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: string, record: Partial<InsertAcademicRecord>): Promise<AcademicRecord>;
  getAcademicRecordsByCadet(cadetId: string): Promise<AcademicRecord[]>;

  // Communications
  getCommunication(id: string): Promise<Communication | undefined>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  getRecentCommunications(limit?: number): Promise<Communication[]>;

  // Parent/Guardian relationships
  getParentGuardian(id: string): Promise<ParentGuardian | undefined>;
  createParentGuardian(parentGuardian: InsertParentGuardian): Promise<ParentGuardian>;
  getParentGuardiansByCadet(cadetId: string): Promise<ParentGuardian[]>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalCadets: number;
    activeMentorships: number;
    behaviorIncidents: number;
    graduationReady: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User management
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

  async updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(insertUser).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllStaff(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Cadet management
  async getCadet(id: string): Promise<Cadet | undefined> {
    const [cadet] = await db.select().from(cadets).where(eq(cadets.id, id));
    return cadet || undefined;
  }

  async createCadet(insertCadet: InsertCadet): Promise<Cadet> {
    const [cadet] = await db.insert(cadets).values(insertCadet).returning();
    return cadet;
  }

  async updateCadet(id: string, insertCadet: Partial<InsertCadet>): Promise<Cadet> {
    const [cadet] = await db.update(cadets).set({
      ...insertCadet,
      updatedAt: new Date()
    }).where(eq(cadets.id, id)).returning();
    return cadet;
  }

  async getAllCadets(): Promise<Cadet[]> {
    return await db.select().from(cadets).orderBy(desc(cadets.createdAt));
  }

  async searchCadets(query: string): Promise<Cadet[]> {
    return await db.select().from(cadets).where(
      sql`${cadets.firstName} ILIKE ${`%${query}%`} OR ${cadets.lastName} ILIKE ${`%${query}%`}`
    );
  }

  async getCadetsByStatus(status: string): Promise<Cadet[]> {
    return await db.select().from(cadets).where(eq(cadets.status, status));
  }

  // Behavior incidents
  async getBehaviorIncident(id: string): Promise<BehaviorIncident | undefined> {
    const [incident] = await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.id, id));
    return incident || undefined;
  }

  async createBehaviorIncident(insertIncident: InsertBehaviorIncident): Promise<BehaviorIncident> {
    const [incident] = await db.insert(behaviorIncidents).values(insertIncident).returning();
    return incident;
  }

  async updateBehaviorIncident(id: string, insertIncident: Partial<InsertBehaviorIncident>): Promise<BehaviorIncident> {
    const [incident] = await db.update(behaviorIncidents).set(insertIncident).where(eq(behaviorIncidents.id, id)).returning();
    return incident;
  }

  async getBehaviorIncidentsByCadet(cadetId: string): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.cadetId, cadetId)).orderBy(desc(behaviorIncidents.dateOccurred));
  }

  async getRecentBehaviorIncidents(limit: number = 10): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).orderBy(desc(behaviorIncidents.dateOccurred)).limit(limit);
  }

  // Fitness assessments
  async getFitnessAssessment(id: string): Promise<FitnessAssessment | undefined> {
    const [assessment] = await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.id, id));
    return assessment || undefined;
  }

  async createFitnessAssessment(insertAssessment: InsertFitnessAssessment): Promise<FitnessAssessment> {
    const [assessment] = await db.insert(fitnessAssessments).values(insertAssessment).returning();
    return assessment;
  }

  async updateFitnessAssessment(id: string, insertAssessment: Partial<InsertFitnessAssessment>): Promise<FitnessAssessment> {
    const [assessment] = await db.update(fitnessAssessments).set(insertAssessment).where(eq(fitnessAssessments.id, id)).returning();
    return assessment;
  }

  async getFitnessAssessmentsByCadet(cadetId: string): Promise<FitnessAssessment[]> {
    return await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.cadetId, cadetId)).orderBy(desc(fitnessAssessments.assessmentDate));
  }

  async getLatestFitnessAssessmentByCadet(cadetId: string): Promise<FitnessAssessment | undefined> {
    const [assessment] = await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.cadetId, cadetId)).orderBy(desc(fitnessAssessments.assessmentDate)).limit(1);
    return assessment || undefined;
  }

  // Mentorships
  async getMentorship(id: string): Promise<Mentorship | undefined> {
    const [mentorship] = await db.select().from(mentorships).where(eq(mentorships.id, id));
    return mentorship || undefined;
  }

  async createMentorship(insertMentorship: InsertMentorship): Promise<Mentorship> {
    const [mentorship] = await db.insert(mentorships).values(insertMentorship).returning();
    return mentorship;
  }

  async updateMentorship(id: string, insertMentorship: Partial<InsertMentorship>): Promise<Mentorship> {
    const [mentorship] = await db.update(mentorships).set(insertMentorship).where(eq(mentorships.id, id)).returning();
    return mentorship;
  }

  async getMentorshipsByCadet(cadetId: string): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.cadetId, cadetId)).orderBy(desc(mentorships.startDate));
  }

  async getMentorshipsByMentor(mentorId: string): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.mentorId, mentorId)).orderBy(desc(mentorships.startDate));
  }

  async getActiveMentorships(): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.status, 'active'));
  }

  // Development plans
  async getDevelopmentPlan(id: string): Promise<DevelopmentPlan | undefined> {
    const [plan] = await db.select().from(developmentPlans).where(eq(developmentPlans.id, id));
    return plan || undefined;
  }

  async createDevelopmentPlan(insertPlan: InsertDevelopmentPlan): Promise<DevelopmentPlan> {
    const [plan] = await db.insert(developmentPlans).values(insertPlan).returning();
    return plan;
  }

  async updateDevelopmentPlan(id: string, insertPlan: Partial<InsertDevelopmentPlan>): Promise<DevelopmentPlan> {
    const [plan] = await db.update(developmentPlans).set({
      ...insertPlan,
      updatedAt: new Date()
    }).where(eq(developmentPlans.id, id)).returning();
    return plan;
  }

  async getDevelopmentPlanByCadet(cadetId: string): Promise<DevelopmentPlan | undefined> {
    const [plan] = await db.select().from(developmentPlans).where(eq(developmentPlans.cadetId, cadetId));
    return plan || undefined;
  }

  // Academic records
  async getAcademicRecord(id: string): Promise<AcademicRecord | undefined> {
    const [record] = await db.select().from(academicRecords).where(eq(academicRecords.id, id));
    return record || undefined;
  }

  async createAcademicRecord(insertRecord: InsertAcademicRecord): Promise<AcademicRecord> {
    const [record] = await db.insert(academicRecords).values(insertRecord).returning();
    return record;
  }

  async updateAcademicRecord(id: string, insertRecord: Partial<InsertAcademicRecord>): Promise<AcademicRecord> {
    const [record] = await db.update(academicRecords).set(insertRecord).where(eq(academicRecords.id, id)).returning();
    return record;
  }

  async getAcademicRecordsByCadet(cadetId: string): Promise<AcademicRecord[]> {
    return await db.select().from(academicRecords).where(eq(academicRecords.cadetId, cadetId)).orderBy(desc(academicRecords.semester));
  }

  // Communications
  async getCommunication(id: string): Promise<Communication | undefined> {
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    return communication || undefined;
  }

  async createCommunication(insertCommunication: InsertCommunication): Promise<Communication> {
    const [communication] = await db.insert(communications).values(insertCommunication).returning();
    return communication;
  }

  async getRecentCommunications(limit: number = 10): Promise<Communication[]> {
    return await db.select().from(communications).orderBy(desc(communications.sentAt)).limit(limit);
  }

  // Parent/Guardian relationships
  async getParentGuardian(id: string): Promise<ParentGuardian | undefined> {
    const [parentGuardian] = await db.select().from(parentGuardians).where(eq(parentGuardians.id, id));
    return parentGuardian || undefined;
  }

  async createParentGuardian(insertParentGuardian: InsertParentGuardian): Promise<ParentGuardian> {
    const [parentGuardian] = await db.insert(parentGuardians).values(insertParentGuardian).returning();
    return parentGuardian;
  }

  async getParentGuardiansByCadet(cadetId: string): Promise<ParentGuardian[]> {
    return await db.select().from(parentGuardians).where(eq(parentGuardians.cadetId, cadetId));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalCadets: number;
    activeMentorships: number;
    behaviorIncidents: number;
    graduationReady: number;
  }> {
    const [totalCadetsResult] = await db.select({ count: count() }).from(cadets).where(eq(cadets.status, 'active'));
    const [activeMentorshipsResult] = await db.select({ count: count() }).from(mentorships).where(eq(mentorships.status, 'active'));
    const [behaviorIncidentsResult] = await db.select({ count: count() }).from(behaviorIncidents).where(eq(behaviorIncidents.status, 'open'));
    const [graduationReadyResult] = await db.select({ count: count() }).from(cadets).where(and(
      eq(cadets.status, 'active'),
      sql`${cadets.expectedGraduationDate} <= CURRENT_DATE + INTERVAL '6 months'`
    ));

    return {
      totalCadets: totalCadetsResult.count,
      activeMentorships: activeMentorshipsResult.count,
      behaviorIncidents: behaviorIncidentsResult.count,
      graduationReady: graduationReadyResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
