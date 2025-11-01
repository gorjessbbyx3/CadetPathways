import { db } from "./db";
import { eq, desc, and, count, sql, gte, lte } from "drizzle-orm";
import {
  users,
  cadets,
  behaviorIncidents,
  fitnessAssessments,
  mentorships,
  developmentPlans,
  academicRecords,
  communications,
  parentGuardians,
  academicSchedules,
  assignments,
  assignmentSubmissions,
  mockTests,
  mockTestAttempts,
  classDiaryEntries,
  feeRecords,
  tasks,
  meetingLogs,
  sharedNotes,
  notifications,
  type User,
  type InsertUser,
  type Cadet,
  type InsertCadet,
  type BehaviorIncident,
  type InsertBehaviorIncident,
  type FitnessAssessment,
  type InsertFitnessAssessment,
  type Mentorship,
  type InsertMentorship,
  type DevelopmentPlan,
  type InsertDevelopmentPlan,
  type AcademicRecord,
  type InsertAcademicRecord,
  type Communication,
  type InsertCommunication,
  type ParentGuardian,
  type InsertParentGuardian,
  type AcademicSchedule,
  type InsertAcademicSchedule,
  type Assignment,
  type InsertAssignment,
  type AssignmentSubmission,
  type InsertAssignmentSubmission,
  type MockTest,
  type InsertMockTest,
  type MockTestAttempt,
  type InsertMockTestAttempt,
  type ClassDiaryEntry,
  type InsertClassDiaryEntry,
  type FeeRecord,
  type InsertFeeRecord,
  type Task,
  type InsertTask,
  type MeetingLog,
  type InsertMeetingLog,
  type SharedNote,
  type InsertSharedNote,
  type Notification,
  type InsertNotification,
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllStaff(): Promise<User[]>;

  // Cadet management
  getCadet(id: number): Promise<Cadet | undefined>;
  createCadet(insertCadet: InsertCadet): Promise<Cadet>;
  updateCadet(id: number, insertCadet: Partial<InsertCadet>): Promise<Cadet>;
  getAllCadets(): Promise<Cadet[]>;
  getCadetsByStatus(status: string): Promise<Cadet[]>;
  searchCadets(query: string): Promise<Cadet[]>;

  // Behavior incidents
  getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined>;
  createBehaviorIncident(insertIncident: InsertBehaviorIncident): Promise<BehaviorIncident>;
  updateBehaviorIncident(id: number, insertIncident: Partial<InsertBehaviorIncident>): Promise<BehaviorIncident>;
  getBehaviorIncidentsByCadet(cadetId: number): Promise<BehaviorIncident[]>;
  getRecentBehaviorIncidents(limit?: number): Promise<BehaviorIncident[]>;

  // Fitness assessments
  getFitnessAssessment(id: number): Promise<FitnessAssessment | undefined>;
  createFitnessAssessment(insertAssessment: InsertFitnessAssessment): Promise<FitnessAssessment>;
  updateFitnessAssessment(id: number, insertAssessment: Partial<InsertFitnessAssessment>): Promise<FitnessAssessment>;
  getFitnessAssessmentsByCadet(cadetId: number): Promise<FitnessAssessment[]>;
  getAllFitnessAssessments(): Promise<FitnessAssessment[]>;
  getLatestFitnessAssessmentByCadet(cadetId: number): Promise<FitnessAssessment | undefined>;

  // Mentorships
  getMentorship(id: number): Promise<Mentorship | undefined>;
  createMentorship(insertMentorship: InsertMentorship): Promise<Mentorship>;
  updateMentorship(id: number, insertMentorship: Partial<InsertMentorship>): Promise<Mentorship>;
  getMentorshipsByMentor(mentorId: string): Promise<Mentorship[]>;
  getMentorshipsByCadet(cadetId: number): Promise<Mentorship[]>;
  getActiveMentorships(): Promise<Mentorship[]>;

  // Development plans
  getDevelopmentPlan(id: number): Promise<DevelopmentPlan | undefined>;
  createDevelopmentPlan(insertPlan: InsertDevelopmentPlan): Promise<DevelopmentPlan>;
  updateDevelopmentPlan(id: number, insertPlan: Partial<InsertDevelopmentPlan>): Promise<DevelopmentPlan>;
  getDevelopmentPlansByCadet(cadetId: number): Promise<DevelopmentPlan[]>;

  // Academic records
  getAcademicRecord(id: number): Promise<AcademicRecord | undefined>;
  createAcademicRecord(insertRecord: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: number, insertRecord: Partial<InsertAcademicRecord>): Promise<AcademicRecord>;
  getAcademicRecordsByCadet(cadetId: number): Promise<AcademicRecord[]>;

  // Communications
  getCommunication(id: number): Promise<Communication | undefined>;
  createCommunication(insertCommunication: InsertCommunication): Promise<Communication>;
  getRecentCommunications(limit?: number): Promise<Communication[]>;

  // Parent/Guardian relationships
  getParentGuardian(id: number): Promise<ParentGuardian | undefined>;
  createParentGuardian(insertParentGuardian: InsertParentGuardian): Promise<ParentGuardian>;
  getParentGuardiansByCadet(cadetId: number): Promise<ParentGuardian[]>;

  // Academic schedules
  getAcademicSchedule(id: number): Promise<AcademicSchedule | undefined>;
  createAcademicSchedule(insertSchedule: InsertAcademicSchedule): Promise<AcademicSchedule>;
  updateAcademicSchedule(id: number, insertSchedule: Partial<InsertAcademicSchedule>): Promise<AcademicSchedule>;
  getAcademicSchedulesByCadet(cadetId: number): Promise<AcademicSchedule[]>;
  getAcademicSchedulesByDay(dayOfWeek: string): Promise<AcademicSchedule[]>;

  // Assignments
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(insertAssignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, insertAssignment: Partial<InsertAssignment>): Promise<Assignment>;
  getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]>;
  getAssignmentsByCadet(cadetId: number): Promise<Assignment[]>;
  getAllAssignments(): Promise<Assignment[]>;

  // Assignment submissions
  getAssignmentSubmission(id: number): Promise<AssignmentSubmission | undefined>;
  createAssignmentSubmission(insertSubmission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  updateAssignmentSubmission(id: number, insertSubmission: Partial<InsertAssignmentSubmission>): Promise<AssignmentSubmission>;
  getAssignmentSubmissionsByAssignment(assignmentId: number): Promise<AssignmentSubmission[]>;
  getAssignmentSubmissionsByCadet(cadetId: number): Promise<AssignmentSubmission[]>;

  // Mock tests
  getMockTest(id: number): Promise<MockTest | undefined>;
  createMockTest(insertTest: InsertMockTest): Promise<MockTest>;
  updateMockTest(id: number, insertTest: Partial<InsertMockTest>): Promise<MockTest>;
  getMockTestsByInstructor(instructorId: string): Promise<MockTest[]>;
  getActiveMockTests(): Promise<MockTest[]>;
  getAllMockTests(): Promise<MockTest[]>;

  // Mock test attempts
  getMockTestAttempt(id: number): Promise<MockTestAttempt | undefined>;
  createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt>;
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

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  createTask(insertTask: InsertTask): Promise<Task>;
  updateTask(id: number, insertTask: Partial<InsertTask>): Promise<Task>;
  getTasksByAssignee(userId: string): Promise<Task[]>;
  getTasksByCadet(cadetId: number): Promise<Task[]>;
  getTasksDueToday(userId: string): Promise<Task[]>;
  getOverdueTasks(userId: string): Promise<Task[]>;
  getPendingTasks(userId: string): Promise<Task[]>;

  // Meeting logs
  getMeetingLog(id: number): Promise<MeetingLog | undefined>;
  createMeetingLog(insertLog: InsertMeetingLog): Promise<MeetingLog>;
  updateMeetingLog(id: number, insertLog: Partial<InsertMeetingLog>): Promise<MeetingLog>;
  getMeetingLogsByMentor(mentorId: string): Promise<MeetingLog[]>;
  getMeetingLogsByCadet(cadetId: number): Promise<MeetingLog[]>;
  getMeetingLogsByMentorship(mentorshipId: number): Promise<MeetingLog[]>;
  getRecentMeetingLogs(userId: string, limit?: number): Promise<MeetingLog[]>;

  // Shared notes
  getSharedNote(id: number): Promise<SharedNote | undefined>;
  createSharedNote(insertNote: InsertSharedNote): Promise<SharedNote>;
  updateSharedNote(id: number, insertNote: Partial<InsertSharedNote>): Promise<SharedNote>;
  getSharedNotesByCadet(cadetId: number): Promise<SharedNote[]>;
  getRecentSharedNotes(limit?: number): Promise<SharedNote[]>;
  getUrgentNotes(): Promise<SharedNote[]>;

  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(insertNotification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, insertNotification: Partial<InsertNotification>): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllStaff(): Promise<User[]> {
    return await db.select().from(users).where(
      sql`${users.role} IN ('administrator', 'instructor', 'mentor')`
    );
  }

  //Cadet management
  async getCadet(id: number): Promise<Cadet | undefined> {
    const [cadet] = await db.select().from(cadets).where(eq(cadets.id, id));
    return cadet || undefined;
  }

  async createCadet(insertCadet: InsertCadet): Promise<Cadet> {
    const [cadet] = await db.insert(cadets).values(insertCadet).returning();
    return cadet;
  }

  async updateCadet(id: number, insertCadet: Partial<InsertCadet>): Promise<Cadet> {
    const [cadet] = await db.update(cadets).set(insertCadet).where(eq(cadets.id, id)).returning();
    return cadet;
  }

  async getAllCadets(): Promise<Cadet[]> {
    return await db.select().from(cadets);
  }

  async getCadetsByStatus(status: string): Promise<Cadet[]> {
    return await db.select().from(cadets).where(eq(cadets.status, status));
  }

  async searchCadets(query: string): Promise<Cadet[]> {
    return await db.select().from(cadets).where(
      sql`${cadets.firstName} ILIKE ${'%' + query + '%'} OR ${cadets.lastName} ILIKE ${'%' + query + '%'}`
    );
  }

  // Behavior incidents
  async getBehaviorIncident(id: number): Promise<BehaviorIncident | undefined> {
    const [incident] = await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.id, id));
    return incident || undefined;
  }

  async createBehaviorIncident(insertIncident: InsertBehaviorIncident): Promise<BehaviorIncident> {
    const [incident] = await db.insert(behaviorIncidents).values(insertIncident).returning();
    return incident;
  }

  async updateBehaviorIncident(id: number, insertIncident: Partial<InsertBehaviorIncident>): Promise<BehaviorIncident> {
    const [incident] = await db.update(behaviorIncidents).set(insertIncident).where(eq(behaviorIncidents.id, id)).returning();
    return incident;
  }

  async getBehaviorIncidentsByCadet(cadetId: number): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).where(eq(behaviorIncidents.cadetId, cadetId)).orderBy(desc(behaviorIncidents.dateOccurred));
  }

  async getRecentBehaviorIncidents(limit: number = 10): Promise<BehaviorIncident[]> {
    return await db.select().from(behaviorIncidents).orderBy(desc(behaviorIncidents.dateOccurred)).limit(limit);
  }

  // Fitness assessments
  async getFitnessAssessment(id: number): Promise<FitnessAssessment | undefined> {
    const [assessment] = await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.id, id));
    return assessment || undefined;
  }

  async createFitnessAssessment(insertAssessment: InsertFitnessAssessment): Promise<FitnessAssessment> {
    const [assessment] = await db.insert(fitnessAssessments).values(insertAssessment).returning();
    return assessment;
  }

  async updateFitnessAssessment(id: number, insertAssessment: Partial<InsertFitnessAssessment>): Promise<FitnessAssessment> {
    const [assessment] = await db.update(fitnessAssessments).set(insertAssessment).where(eq(fitnessAssessments.id, id)).returning();
    return assessment;
  }

  async getFitnessAssessmentsByCadet(cadetId: number): Promise<FitnessAssessment[]> {
    return await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.cadetId, cadetId)).orderBy(desc(fitnessAssessments.assessmentDate));
  }

  async getAllFitnessAssessments(): Promise<FitnessAssessment[]> {
    return await db.select().from(fitnessAssessments).orderBy(desc(fitnessAssessments.assessmentDate));
  }

  async getLatestFitnessAssessmentByCadet(cadetId: number): Promise<FitnessAssessment | undefined> {
    const [assessment] = await db.select().from(fitnessAssessments).where(eq(fitnessAssessments.cadetId, cadetId)).orderBy(desc(fitnessAssessments.assessmentDate)).limit(1);
    return assessment || undefined;
  }

  // Mentorships
  async getMentorship(id: number): Promise<Mentorship | undefined> {
    const [mentorship] = await db.select().from(mentorships).where(eq(mentorships.id, id));
    return mentorship || undefined;
  }

  async createMentorship(insertMentorship: InsertMentorship): Promise<Mentorship> {
    const [mentorship] = await db.insert(mentorships).values(insertMentorship).returning();
    return mentorship;
  }

  async updateMentorship(id: number, insertMentorship: Partial<InsertMentorship>): Promise<Mentorship> {
    const [mentorship] = await db.update(mentorships).set(insertMentorship).where(eq(mentorships.id, id)).returning();
    return mentorship;
  }

  async getMentorshipsByMentor(mentorId: string): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.mentorId, mentorId));
  }

  async getMentorshipsByCadet(cadetId: number): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.cadetId, cadetId));
  }

  async getActiveMentorships(): Promise<Mentorship[]> {
    return await db.select().from(mentorships).where(eq(mentorships.status, 'active'));
  }

  // Development plans
  async getDevelopmentPlan(id: number): Promise<DevelopmentPlan | undefined> {
    const [plan] = await db.select().from(developmentPlans).where(eq(developmentPlans.id, id));
    return plan || undefined;
  }

  async createDevelopmentPlan(insertPlan: InsertDevelopmentPlan): Promise<DevelopmentPlan> {
    const [plan] = await db.insert(developmentPlans).values(insertPlan).returning();
    return plan;
  }

  async updateDevelopmentPlan(id: number, insertPlan: Partial<InsertDevelopmentPlan>): Promise<DevelopmentPlan> {
    const [plan] = await db.update(developmentPlans).set(insertPlan).where(eq(developmentPlans.id, id)).returning();
    return plan;
  }

  async getDevelopmentPlansByCadet(cadetId: number): Promise<DevelopmentPlan[]> {
    return await db.select().from(developmentPlans).where(eq(developmentPlans.cadetId, cadetId));
  }

  // Academic records
  async getAcademicRecord(id: number): Promise<AcademicRecord | undefined> {
    const [record] = await db.select().from(academicRecords).where(eq(academicRecords.id, id));
    return record || undefined;
  }

  async createAcademicRecord(insertRecord: InsertAcademicRecord): Promise<AcademicRecord> {
    const [record] = await db.insert(academicRecords).values(insertRecord).returning();
    return record;
  }

  async updateAcademicRecord(id: number, insertRecord: Partial<InsertAcademicRecord>): Promise<AcademicRecord> {
    const [record] = await db.update(academicRecords).set(insertRecord).where(eq(academicRecords.id, id)).returning();
    return record;
  }

  async getAcademicRecordsByCadet(cadetId: number): Promise<AcademicRecord[]> {
    return await db.select().from(academicRecords).where(eq(academicRecords.cadetId, cadetId));
  }

  // Communications
  async getCommunication(id: number): Promise<Communication | undefined> {
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
  async getParentGuardian(id: number): Promise<ParentGuardian | undefined> {
    const [parentGuardian] = await db.select().from(parentGuardians).where(eq(parentGuardians.id, id));
    return parentGuardian || undefined;
  }

  async createParentGuardian(insertParentGuardian: InsertParentGuardian): Promise<ParentGuardian> {
    const [parentGuardian] = await db.insert(parentGuardians).values(insertParentGuardian).returning();
    return parentGuardian;
  }

  async getParentGuardiansByCadet(cadetId: number): Promise<ParentGuardian[]> {
    return await db.select().from(parentGuardians).where(eq(parentGuardians.cadetId, cadetId));
  }

  // Academic schedules
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

  async getAssignmentsByInstructor(instructorId: string): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.instructorId, instructorId));
  }

  async getAssignmentsByCadet(cadetId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(
      sql`${assignments.assignedToCadets} @> ${JSON.stringify([cadetId])}`
    );
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.dueDate));
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
  async getMockTest(id: number): Promise<MockTest | undefined> {
    const [test] = await db.select().from(mockTests).where(eq(mockTests.id, id));
    return test || undefined;
  }

  async createMockTest(insertTest: InsertMockTest): Promise<MockTest> {
    const [test] = await db.insert(mockTests).values(insertTest).returning();
    return test;
  }

  async updateMockTest(id: number, insertTest: Partial<InsertMockTest>): Promise<MockTest> {
    const [test] = await db.update(mockTests).set(insertTest).where(eq(mockTests.id, id)).returning();
    return test;
  }

  async getMockTestsByInstructor(instructorId: string): Promise<MockTest[]> {
    return await db.select().from(mockTests).where(eq(mockTests.instructorId, instructorId));
  }

  async getActiveMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).where(eq(mockTests.isActive, true));
  }

  async getAllMockTests(): Promise<MockTest[]> {
    return await db.select().from(mockTests).orderBy(desc(mockTests.createdAt));
  }

  // Mock test attempts
  async getMockTestAttempt(id: number): Promise<MockTestAttempt | undefined> {
    const [attempt] = await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.id, id));
    return attempt || undefined;
  }

  async createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt> {
    const [attempt] = await db.insert(mockTestAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getMockTestAttemptsByTest(testId: number): Promise<MockTestAttempt[]> {
    return await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.testId, testId));
  }

  async getMockTestAttemptsByCadet(cadetId: number): Promise<MockTestAttempt[]> {
    return await db.select().from(mockTestAttempts).where(eq(mockTestAttempts.cadetId, cadetId));
  }

  // Class diary entries
  async getClassDiaryEntry(id: number): Promise<ClassDiaryEntry | undefined> {
    const [entry] = await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.id, id));
    return entry || undefined;
  }

  async createClassDiaryEntry(entry: InsertClassDiaryEntry): Promise<ClassDiaryEntry> {
    const [diaryEntry] = await db.insert(classDiaryEntries).values(entry).returning();
    return diaryEntry;
  }

  async updateClassDiaryEntry(id: number, entry: Partial<InsertClassDiaryEntry>): Promise<ClassDiaryEntry> {
    const [diaryEntry] = await db.update(classDiaryEntries).set(entry).where(eq(classDiaryEntries.id, id)).returning();
    return diaryEntry;
  }

  async getClassDiaryEntriesByDate(date: string): Promise<ClassDiaryEntry[]> {
    return await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.date, date));
  }

  async getClassDiaryEntriesBySubject(subject: string): Promise<ClassDiaryEntry[]> {
    return await db.select().from(classDiaryEntries).where(eq(classDiaryEntries.subject, subject));
  }

  // Fee records
  async getFeeRecord(id: number): Promise<FeeRecord | undefined> {
    const [feeRecord] = await db.select().from(feeRecords).where(eq(feeRecords.id, id));
    return feeRecord || undefined;
  }

  async createFeeRecord(feeRecord: InsertFeeRecord): Promise<FeeRecord> {
    const [record] = await db.insert(feeRecords).values(feeRecord).returning();
    return record;
  }

  async updateFeeRecord(id: number, feeRecord: Partial<InsertFeeRecord>): Promise<FeeRecord> {
    const [record] = await db.update(feeRecords).set(feeRecord).where(eq(feeRecords.id, id)).returning();
    return record;
  }

  async getFeeRecordsByCadet(cadetId: number): Promise<FeeRecord[]> {
    return await db.select().from(feeRecords).where(eq(feeRecords.cadetId, cadetId));
  }

  async getOverdueFees(): Promise<FeeRecord[]> {
    return await db.select().from(feeRecords).where(and(
      eq(feeRecords.status, 'pending'),
      sql`${feeRecords.dueDate} < CURRENT_DATE`
    ));
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, insertTask: Partial<InsertTask>): Promise<Task> {
    const [task] = await db.update(tasks).set({ ...insertTask, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedToId, userId)).orderBy(desc(tasks.dueDate));
  }

  async getTasksByCadet(cadetId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.cadetId, cadetId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksDueToday(userId: string): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.select().from(tasks).where(and(
      eq(tasks.assignedToId, userId),
      gte(tasks.dueDate, today),
      lte(tasks.dueDate, tomorrow)
    )).orderBy(tasks.priority);
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(and(
      eq(tasks.assignedToId, userId),
      sql`${tasks.dueDate} < CURRENT_DATE`,
      sql`${tasks.status} != 'completed'`
    )).orderBy(tasks.dueDate);
  }

  async getPendingTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(and(
      eq(tasks.assignedToId, userId),
      eq(tasks.status, 'pending')
    )).orderBy(desc(tasks.priority), tasks.dueDate);
  }

  // Meeting logs
  async getMeetingLog(id: number): Promise<MeetingLog | undefined> {
    const [log] = await db.select().from(meetingLogs).where(eq(meetingLogs.id, id));
    return log || undefined;
  }

  async createMeetingLog(insertLog: InsertMeetingLog): Promise<MeetingLog> {
    const [log] = await db.insert(meetingLogs).values(insertLog).returning();
    return log;
  }

  async updateMeetingLog(id: number, insertLog: Partial<InsertMeetingLog>): Promise<MeetingLog> {
    const [log] = await db.update(meetingLogs).set({ ...insertLog, updatedAt: new Date() }).where(eq(meetingLogs.id, id)).returning();
    return log;
  }

  async getMeetingLogsByMentor(mentorId: string): Promise<MeetingLog[]> {
    return await db.select().from(meetingLogs).where(eq(meetingLogs.mentorId, mentorId)).orderBy(desc(meetingLogs.meetingDate));
  }

  async getMeetingLogsByCadet(cadetId: number): Promise<MeetingLog[]> {
    return await db.select().from(meetingLogs).where(eq(meetingLogs.cadetId, cadetId)).orderBy(desc(meetingLogs.meetingDate));
  }

  async getMeetingLogsByMentorship(mentorshipId: number): Promise<MeetingLog[]> {
    return await db.select().from(meetingLogs).where(eq(meetingLogs.mentorshipId, mentorshipId)).orderBy(desc(meetingLogs.meetingDate));
  }

  async getRecentMeetingLogs(userId: string, limit: number = 10): Promise<MeetingLog[]> {
    return await db.select().from(meetingLogs).where(eq(meetingLogs.mentorId, userId)).orderBy(desc(meetingLogs.meetingDate)).limit(limit);
  }

  // Shared notes
  async getSharedNote(id: number): Promise<SharedNote | undefined> {
    const [note] = await db.select().from(sharedNotes).where(eq(sharedNotes.id, id));
    return note || undefined;
  }

  async createSharedNote(insertNote: InsertSharedNote): Promise<SharedNote> {
    const [note] = await db.insert(sharedNotes).values(insertNote).returning();
    return note;
  }

  async updateSharedNote(id: number, insertNote: Partial<InsertSharedNote>): Promise<SharedNote> {
    const [note] = await db.update(sharedNotes).set({ ...insertNote, updatedAt: new Date() }).where(eq(sharedNotes.id, id)).returning();
    return note;
  }

  async getSharedNotesByCadet(cadetId: number): Promise<SharedNote[]> {
    return await db.select().from(sharedNotes).where(eq(sharedNotes.cadetId, cadetId)).orderBy(desc(sharedNotes.createdAt));
  }

  async getRecentSharedNotes(limit: number = 20): Promise<SharedNote[]> {
    return await db.select().from(sharedNotes).orderBy(desc(sharedNotes.createdAt)).limit(limit);
  }

  async getUrgentNotes(): Promise<SharedNote[]> {
    return await db.select().from(sharedNotes).where(eq(sharedNotes.isUrgent, true)).orderBy(desc(sharedNotes.createdAt));
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async updateNotification(id: number, insertNotification: Partial<InsertNotification>): Promise<Notification> {
    const [notification] = await db.update(notifications).set(insertNotification).where(eq(notifications.id, id)).returning();
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    )).orderBy(desc(notifications.priority), desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
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