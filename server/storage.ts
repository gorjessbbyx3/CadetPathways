import { 
  users, cadets, behaviorIncidents, fitnessAssessments, mentorships, 
  developmentPlans, academicRecords, communications, parentGuardians,
  academicSchedules, assignments, assignmentSubmissions, mockTests, 
  mockTestAttempts, classDiaryEntries, feeRecords,
  type User, type InsertUser, type Cadet, type InsertCadet,
  type BehaviorIncident, type InsertBehaviorIncident,
  type FitnessAssessment, type InsertFitnessAssessment,
  type Mentorship, type InsertMentorship,
  type DevelopmentPlan, type InsertDevelopmentPlan,
  type AcademicRecord, type InsertAcademicRecord,
  type Communication, type InsertCommunication,
  type ParentGuardian, type InsertParentGuardian,
  type AcademicSchedule, type InsertAcademicSchedule,
  type Assignment, type InsertAssignment,
  type AssignmentSubmission, type InsertAssignmentSubmission,
  type MockTest, type InsertMockTest,
  type MockTestAttempt, type InsertMockTestAttempt,
  type ClassDiaryEntry, type InsertClassDiaryEntry,
  type FeeRecord, type InsertFeeRecord
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
  getCadet(id: number): Promise<Cadet | undefined>;
  createCadet(cadet: InsertCadet): Promise<Cadet>;
  updateCadet(id: number, cadet: Partial<InsertCadet>): Promise<Cadet>;
  getAllCadets(): Promise<Cadet[]>;
  searchCadets(query: string): Promise<Cadet[]>;
  getCadetsByStatus(status: string): Promise<Cadet[]>;

  // Behavior incidents
  getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined>;
  createBehaviorIncident(incident: InsertBehaviorIncident): Promise<BehaviorIncident>;
  updateBehaviorIncident(id: number, incident: Partial<InsertBehaviorIncident>): Promise<BehaviorIncident>;
  getBehaviorIncidentsByCadet(cadetId: number): Promise<BehaviorIncident[]>;
  getRecentBehaviorIncidents(limit?: number): Promise<BehaviorIncident[]>;

  // Fitness assessments
  getFitnessAssessment(id: number): Promise<FitnessAssessment | undefined>;
  createFitnessAssessment(assessment: InsertFitnessAssessment): Promise<FitnessAssessment>;
  updateFitnessAssessment(id: number, assessment: Partial<InsertFitnessAssessment>): Promise<FitnessAssessment>;
  getFitnessAssessmentsByCadet(cadetId: number): Promise<FitnessAssessment[]>;
  getLatestFitnessAssessmentByCadet(cadetId: number): Promise<FitnessAssessment | undefined>;

  // Mentorships
  getMentorship(id: number): Promise<Mentorship | undefined>;
  createMentorship(mentorship: InsertMentorship): Promise<Mentorship>;
  updateMentorship(id: number, mentorship: Partial<InsertMentorship>): Promise<Mentorship>;
  getMentorshipsByCadet(cadetId: number): Promise<Mentorship[]>;
  getMentorshipsByMentor(mentorId: string): Promise<Mentorship[]>;
  getActiveMentorships(): Promise<Mentorship[]>;

  // Development plans
  getDevelopmentPlan(id: number): Promise<DevelopmentPlan | undefined>;
  createDevelopmentPlan(plan: InsertDevelopmentPlan): Promise<DevelopmentPlan>;
  updateDevelopmentPlan(id: number, plan: Partial<InsertDevelopmentPlan>): Promise<DevelopmentPlan>;
  getDevelopmentPlanByCadet(cadetId: number): Promise<DevelopmentPlan | undefined>;

  // Academic records
  getAcademicRecord(id: number): Promise<AcademicRecord | undefined>;
  createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: number, record: Partial<InsertAcademicRecord>): Promise<AcademicRecord>;
  getAcademicRecordsByCadet(cadetId: number): Promise<AcademicRecord[]>;

  // Communications
  getCommunication(id: number): Promise<Communication | undefined>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  getRecentCommunications(limit?: number): Promise<Communication[]>;

  // Parent/Guardian relationships
  getParentGuardian(id: number): Promise<ParentGuardian | undefined>;
  createParentGuardian(parentGuardian: InsertParentGuardian): Promise<ParentGuardian>;
  getParentGuardiansByCadet(cadetId: number): Promise<ParentGuardian[]>;

  // Academic schedules/timetables
  getAcademicSchedule(id: number): Promise<AcademicSchedule | undefined>;
  createAcademicSchedule(schedule: InsertAcademicSchedule): Promise<AcademicSchedule>;
  updateAcademicSchedule(id: number, schedule: Partial<InsertAcademicSchedule>): Promise<AcademicSchedule>;
  getAcademicSchedulesByCadet(cadetId: number): Promise<AcademicSchedule[]>;
  getAcademicSchedulesByDay(dayOfWeek: string): Promise<AcademicSchedule[]>;

  // Assignments
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  getAllAssignments(): Promise<Assignment[]>;
  getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]>;
  getAssignmentsByCadet(cadetId: number): Promise<Assignment[]>;

  // Assignment submissions
  getAssignmentSubmission(id: number): Promise<AssignmentSubmission | undefined>;
  createAssignmentSubmission(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  updateAssignmentSubmission(id: number, submission: Partial<InsertAssignmentSubmission>): Promise<AssignmentSubmission>;
  getAssignmentSubmissionsByAssignment(assignmentId: number): Promise<AssignmentSubmission[]>;
  getAssignmentSubmissionsByCadet(cadetId: number): Promise<AssignmentSubmission[]>;

  // Mock tests
  getMockTest(id: number): Promise<MockTest | undefined>;
  createMockTest(test: InsertMockTest): Promise<MockTest>;
  updateMockTest(id: number, test: Partial<InsertMockTest>): Promise<MockTest>;
  getAllMockTests(): Promise<MockTest[]>;
  getMockTestsByInstructor(instructorId: string): Promise<MockTest[]>;
  getActiveMockTests(): Promise<MockTest[]>;

  // Mock test attempts
  getMockTestAttempt(id: number): Promise<MockTestAttempt | undefined>;
  createMockTestAttempt(attempt: InsertMockTestAttempt): Promise<MockTestAttempt>;
  getMockTestAttemptsByTest(testId: number): Promise<MockTestAttempt[]>;
  getMockTestAttemptsByCadet(cadetId: number): Promise<MockTestAttempt[]>;

  // Class diary entries
  getClassDiaryEntry(id: number): Promise<ClassDiaryEntry | undefined>;
  createClassDiaryEntry(entry: InsertClassDiaryEntry): Promise<ClassDiaryEntry>;
  updateClassDiaryEntry(id: number, entry: Partial<InsertClassDiaryEntry>): Promise<ClassDiaryEntry>;
  getClassDiaryEntriesByDate(date: string): Promise<ClassDiaryEntry[]>;
  getClassDiaryEntriesBySubject(subject: string): Promise<ClassDiaryEntry[]>;

  // Fee records
  getFeeRecord(id: number): Promise<FeeRecord | undefined>;
  createFeeRecord(feeRecord: InsertFeeRecord): Promise<FeeRecord>;
  updateFeeRecord(id: number, feeRecord: Partial<InsertFeeRecord>): Promise<FeeRecord>;
  getFeeRecordsByCadet(cadetId: number): Promise<FeeRecord[]>;
  getOverdueFees(): Promise<FeeRecord[]>;

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

  // Academic schedules/timetables
  async getAcademicSchedule(id: number): Promise<AcademicSchedule | undefined> {
    const [schedule] = await db.select().from(academicSchedules).where(eq(academicSchedules.id, id));
    return schedule || undefined;
  }

  async createAcademicSchedule(insertSchedule: InsertAcademicSchedule): Promise<AcademicSchedule> {
    const [schedule] = await db.insert(academicSchedules).values(insertSchedule).returning();
    return schedule;
  }

  async updateAcademicSchedule(id: number, insertSchedule: Partial<InsertAcademicSchedule>): Promise<AcademicSchedule> {
    const [schedule] = await db.update(academicSchedules).set(insertSchedule).where(eq(academicSchedules.id, id)).returning();
    return schedule;
  }

  async getAcademicSchedulesByCadet(cadetId: number): Promise<AcademicSchedule[]> {
    return await db.select().from(academicSchedules).where(eq(academicSchedules.cadetId, cadetId));
  }

  async getAcademicSchedulesByDay(dayOfWeek: string): Promise<AcademicSchedule[]> {
    return await db.select().from(academicSchedules).where(eq(academicSchedules.dayOfWeek, dayOfWeek));
  }

  // Assignments
  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(insertAssignment).returning();
    return assignment;
  }

  async updateAssignment(id: number, insertAssignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [assignment] = await db.update(assignments).set(insertAssignment).where(eq(assignments.id, id)).returning();
    return assignment;
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.dueDate));
  }

  async getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.instructorId, instructorId));
  }

  async getAssignmentsByCadet(cadetId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(sql`${assignments.assignedToCadets} @> ${JSON.stringify([cadetId])}`);
  }

  // Assignment submissions
  async getAssignmentSubmission(id: number): Promise<AssignmentSubmission | undefined> {
    const [submission] = await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.id, id));
    return submission || undefined;
  }

  async createAssignmentSubmission(insertSubmission: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    const [submission] = await db.insert(assignmentSubmissions).values(insertSubmission).returning();
    return submission;
  }

  async updateAssignmentSubmission(id: number, insertSubmission: Partial<InsertAssignmentSubmission>): Promise<AssignmentSubmission> {
    const [submission] = await db.update(assignmentSubmissions).set(insertSubmission).where(eq(assignmentSubmissions.id, id)).returning();
    return submission;
  }

  async getAssignmentSubmissionsByAssignment(assignmentId: number): Promise<AssignmentSubmission[]> {
    return await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.assignmentId, assignmentId));
  }

  async getAssignmentSubmissionsByCadet(cadetId: number): Promise<AssignmentSubmission[]> {
    return await db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.cadetId, cadetId));
  }

  // Mock tests
  async getMockTest(id: string): Promise<MockTest | undefined> {
    const [test] = await db.select().from(mockTests).where(eq(mockTests.id, id));
    return test || undefined;
  }

  async createMockTest(insertTest: InsertMockTest): Promise<MockTest> {
    const [test] = await db.insert(mockTests).values(insertTest).returning();
    return test;
  }

  async updateMockTest(id: string, insertTest: Partial<InsertMockTest>): Promise<MockTest> {
    const [test] = await db.update(mockTests).set(insertTest).where(eq(mockTests.id, id)).returning();
    return test;
  }

  async getAllMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).orderBy(desc(mockTests.createdAt));
  }

  async getMockTestsByInstructor(instructorId: string): Promise<MockTest[]> {
    return await db.select().from(mockTests).where(eq(mockTests.instructorId, instructorId));
  }

  async getActiveMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).where(eq(mockTests.isActive, true));
  }

  // Mock test attempts
  async getMockTestAttempt(id: string): Promise<MockTestAttempt | undefined> {
    const [attempt] = await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.id, id));
    return attempt || undefined;
  }

  async createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt> {
    const [attempt] = await db.insert(mockTestAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getMockTestAttemptsByTest(testId: string): Promise<MockTestAttempt[]> {
    return await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.testId, testId));
  }

  async getMockTestAttemptsByCadet(cadetId: string): Promise<MockTestAttempt[]> {
    return await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.cadetId, cadetId));
  }

  // Class diary entries
  async getClassDiaryEntry(id: string): Promise<ClassDiaryEntry | undefined> {
    const [entry] = await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.id, id));
    return entry || undefined;
  }

  async createClassDiaryEntry(insertEntry: InsertClassDiaryEntry): Promise<ClassDiaryEntry> {
    const [entry] = await db.insert(classDiaryEntries).values(insertEntry).returning();
    return entry;
  }

  async updateClassDiaryEntry(id: string, insertEntry: Partial<InsertClassDiaryEntry>): Promise<ClassDiaryEntry> {
    const [entry] = await db.update(classDiaryEntries).set(insertEntry).where(eq(classDiaryEntries.id, id)).returning();
    return entry;
  }

  async getClassDiaryEntriesByDate(date: string): Promise<ClassDiaryEntry[]> {
    return await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.date, date));
  }

  async getClassDiaryEntriesBySubject(subject: string): Promise<ClassDiaryEntry[]> {
    return await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.subject, subject));
  }

  // Fee records
  async getFeeRecord(id: string): Promise<FeeRecord | undefined> {
    const [record] = await db.select().from(feeRecords).where(eq(feeRecords.id, id));
    return record || undefined;
  }

  async createFeeRecord(insertRecord: InsertFeeRecord): Promise<FeeRecord> {
    const [record] = await db.insert(feeRecords).values(insertRecord).returning();
    return record;
  }

  async updateFeeRecord(id: string, insertRecord: Partial<InsertFeeRecord>): Promise<FeeRecord> {
    const [record] = await db.update(feeRecords).set(insertRecord).where(eq(feeRecords.id, id)).returning();
    return record;
  }

  async getFeeRecordsByCadet(cadetId: string): Promise<FeeRecord[]> {
    return await db.select().from(feeRecords).where(eq(feeRecords.cadetId, cadetId));
  }

  async getOverdueFees(): Promise<FeeRecord[]> {
    return await db.select().from(feeRecords).where(and(
      eq(feeRecords.status, 'pending'),
      sql`${feeRecords.dueDate} < CURRENT_DATE`
    ));
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
