import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, boolean, jsonb, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for staff, administrators, instructors, mentors
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // administrator, instructor, mentor, parent
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Cadets table - main entity for the academy
export const cadets = pgTable("cadets", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  socialSecurityNumber: text("social_security_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  email: text("email"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  medicalNotes: text("medical_notes"),
  enrollmentDate: date("enrollment_date").notNull(),
  expectedGraduationDate: date("expected_graduation_date"),
  status: text("status").notNull().default("active"), // active, graduated, dismissed, transferred
  class: text("class"), // Company/Platoon assignment
  academicLevel: text("academic_level"), // Grade level equivalent
  careerPathway: text("career_pathway"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Behavior incidents tracking
export const behaviorIncidents = pgTable("behavior_incidents", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  reportedById: varchar("reported_by_id").notNull().references(() => users.id),
  incidentType: text("incident_type").notNull(), // late, insubordination, fighting, etc.
  severity: text("severity").notNull(), // minor, major, critical
  description: text("description").notNull(),
  location: text("location"),
  dateOccurred: timestamp("date_occurred").notNull(),
  actionTaken: text("action_taken"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  status: text("status").default("open"), // open, resolved, escalated
  createdAt: timestamp("created_at").defaultNow(),
});

// Physical fitness assessments
export const fitnessAssessments = pgTable("fitness_assessments", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  assessedById: varchar("assessed_by_id").notNull().references(() => users.id),
  assessmentDate: date("assessment_date").notNull(),
  pushUps: integer("push_ups"),
  sitUps: integer("sit_ups"),
  twoMileRun: text("two_mile_run"), // Time in MM:SS format
  bodyWeight: decimal("body_weight", { precision: 5, scale: 2 }),
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 2 }),
  overallScore: integer("overall_score"),
  notes: text("notes"),
  improvementPlan: text("improvement_plan"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentorship relationships
export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: text("status").default("active"), // active, completed, terminated
  meetingFrequency: text("meeting_frequency"), // weekly, biweekly, monthly
  goals: jsonb("goals"), // Array of goal objects
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual development plans
export const developmentPlans = pgTable("development_plans", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  academicGoals: jsonb("academic_goals"),
  fitnessGoals: jsonb("fitness_goals"),
  behaviorGoals: jsonb("behavior_goals"),
  careerGoals: jsonb("career_goals"),
  targetGraduationDate: date("target_graduation_date"),
  lastReviewDate: date("last_review_date"),
  nextReviewDate: date("next_review_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic records
export const academicRecords = pgTable("academic_records", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  subject: text("subject").notNull(),
  semester: text("semester").notNull(),
  grade: text("grade"),
  credits: decimal("credits", { precision: 3, scale: 1 }),
  instructorId: varchar("instructor_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Academic schedules/timetables  
export const academicSchedules = pgTable("academic_schedules", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  dayOfWeek: text("day_of_week").notNull(), // Monday, Tuesday, etc.
  timeSlot: text("time_slot").notNull(), // "08:00 AM", "09:00 AM", etc.
  subject: text("subject").notNull(),
  instructorId: varchar("instructor_id").references(() => users.id),
  location: text("location"),
  semester: text("semester").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments and submissions
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  dueDate: timestamp("due_date").notNull(),
  maxPoints: integer("max_points").default(100),
  assignedToCadets: jsonb("assigned_to_cadets"), // Array of cadet IDs
  fileRequirements: text("file_requirements"), // PDF, DOC, etc.
  status: text("status").default("active"), // active, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  submissionDate: timestamp("submission_date").defaultNow(),
  filePath: text("file_path"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  grade: integer("grade"),
  feedback: text("feedback"),
  status: text("status").default("submitted"), // submitted, graded, late
  createdAt: timestamp("created_at").defaultNow(),
});

// Mock tests and assessments
export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  questions: jsonb("questions").notNull(), // Array of question objects
  timeLimit: integer("time_limit"), // Minutes (also called duration in UI)
  totalQuestions: integer("total_questions"),
  passingScore: integer("passing_score").default(70),
  scheduledDate: timestamp("scheduled_date"),
  maxAttempts: integer("max_attempts").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mockTestAttempts = pgTable("mock_test_attempts", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => mockTests.id),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  answers: jsonb("answers").notNull(), // Array of selected answers
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  completedAt: timestamp("completed_at").defaultNow(),
  timeSpent: integer("time_spent"), // Minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// Class diary entries
export const classDiaryEntries = pgTable("class_diary_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  homework: text("homework"),
  announcements: text("announcements"),
  attendees: jsonb("attendees"), // Array of cadet IDs who attended
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee management
export const feeRecords = pgTable("fee_records", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  feeType: text("fee_type").notNull(), // tuition, meals, uniforms, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  paymentMethod: text("payment_method"),
  status: text("status").default("pending"), // pending, paid, overdue, waived
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication logs
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientType: text("recipient_type").notNull(), // individual, group, all_cadets, all_staff
  recipientIds: jsonb("recipient_ids"), // Array of user/cadet IDs
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  deliveryMethod: text("delivery_method").notNull(), // email, sms, push_notification
  sentAt: timestamp("sent_at").defaultNow(),
  status: text("status").default("sent"), // sent, delivered, failed
});

// Parent/Guardian relationships
export const parentGuardians = pgTable("parent_guardians", {
  id: serial("id").primaryKey(),
  cadetId: integer("cadet_id").notNull().references(() => cadets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  relationship: text("relationship").notNull(), // parent, guardian, legal_guardian
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  behaviorIncidents: many(behaviorIncidents),
  fitnessAssessments: many(fitnessAssessments),
  mentorships: many(mentorships),
  developmentPlans: many(developmentPlans),
  academicRecords: many(academicRecords),
  communications: many(communications),
  parentGuardians: many(parentGuardians),
  assignments: many(assignments),
  mockTests: many(mockTests),
  classDiaryEntries: many(classDiaryEntries),
}));

export const cadetsRelations = relations(cadets, ({ many }) => ({
  behaviorIncidents: many(behaviorIncidents),
  fitnessAssessments: many(fitnessAssessments),
  mentorships: many(mentorships),
  developmentPlans: many(developmentPlans),
  academicRecords: many(academicRecords),
  parentGuardians: many(parentGuardians),
  academicSchedules: many(academicSchedules),
  assignmentSubmissions: many(assignmentSubmissions),
  mockTestAttempts: many(mockTestAttempts),
  feeRecords: many(feeRecords),
}));

export const behaviorIncidentsRelations = relations(behaviorIncidents, ({ one }) => ({
  cadet: one(cadets, {
    fields: [behaviorIncidents.cadetId],
    references: [cadets.id],
  }),
  reportedBy: one(users, {
    fields: [behaviorIncidents.reportedById],
    references: [users.id],
  }),
}));

export const fitnessAssessmentsRelations = relations(fitnessAssessments, ({ one }) => ({
  cadet: one(cadets, {
    fields: [fitnessAssessments.cadetId],
    references: [cadets.id],
  }),
  assessedBy: one(users, {
    fields: [fitnessAssessments.assessedById],
    references: [users.id],
  }),
}));

export const mentorshipsRelations = relations(mentorships, ({ one }) => ({
  mentor: one(users, {
    fields: [mentorships.mentorId],
    references: [users.id],
  }),
  cadet: one(cadets, {
    fields: [mentorships.cadetId],
    references: [cadets.id],
  }),
}));

export const developmentPlansRelations = relations(developmentPlans, ({ one }) => ({
  cadet: one(cadets, {
    fields: [developmentPlans.cadetId],
    references: [cadets.id],
  }),
  createdBy: one(users, {
    fields: [developmentPlans.createdById],
    references: [users.id],
  }),
}));

export const academicRecordsRelations = relations(academicRecords, ({ one }) => ({
  cadet: one(cadets, {
    fields: [academicRecords.cadetId],
    references: [cadets.id],
  }),
  instructor: one(users, {
    fields: [academicRecords.instructorId],
    references: [users.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  sender: one(users, {
    fields: [communications.senderId],
    references: [users.id],
  }),
}));

export const parentGuardiansRelations = relations(parentGuardians, ({ one }) => ({
  cadet: one(cadets, {
    fields: [parentGuardians.cadetId],
    references: [cadets.id],
  }),
  user: one(users, {
    fields: [parentGuardians.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCadetSchema = createInsertSchema(cadets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBehaviorIncidentSchema = createInsertSchema(behaviorIncidents).omit({
  id: true,
  createdAt: true,
});

export const insertFitnessAssessmentSchema = createInsertSchema(fitnessAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertMentorshipSchema = createInsertSchema(mentorships).omit({
  id: true,
  createdAt: true,
});

export const insertDevelopmentPlanSchema = createInsertSchema(developmentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicRecordSchema = createInsertSchema(academicRecords).omit({
  id: true,
  createdAt: true,
});

// Add relations for new tables
export const academicSchedulesRelations = relations(academicSchedules, ({ one }) => ({
  cadet: one(cadets, {
    fields: [academicSchedules.cadetId],
    references: [cadets.id],
  }),
  instructor: one(users, {
    fields: [academicSchedules.instructorId],
    references: [users.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  instructor: one(users, {
    fields: [assignments.instructorId],
    references: [users.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  cadet: one(cadets, {
    fields: [assignmentSubmissions.cadetId],
    references: [cadets.id],
  }),
}));

export const mockTestsRelations = relations(mockTests, ({ one, many }) => ({
  instructor: one(users, {
    fields: [mockTests.instructorId],
    references: [users.id],
  }),
  attempts: many(mockTestAttempts),
}));

export const mockTestAttemptsRelations = relations(mockTestAttempts, ({ one }) => ({
  test: one(mockTests, {
    fields: [mockTestAttempts.testId],
    references: [mockTests.id],
  }),
  cadet: one(cadets, {
    fields: [mockTestAttempts.cadetId],
    references: [cadets.id],
  }),
}));

export const classDiaryEntriesRelations = relations(classDiaryEntries, ({ one }) => ({
  instructor: one(users, {
    fields: [classDiaryEntries.instructorId],
    references: [users.id],
  }),
}));

export const feeRecordsRelations = relations(feeRecords, ({ one }) => ({
  cadet: one(cadets, {
    fields: [feeRecords.cadetId],
    references: [cadets.id],
  }),
}));

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  sentAt: true,
});

export const insertParentGuardianSchema = createInsertSchema(parentGuardians).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new tables
export const insertAcademicScheduleSchema = createInsertSchema(academicSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  createdAt: true,
  submissionDate: true,
});

export const insertMockTestSchema = createInsertSchema(mockTests).omit({
  id: true,
  createdAt: true,
});

export const insertMockTestAttemptSchema = createInsertSchema(mockTestAttempts).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertClassDiaryEntrySchema = createInsertSchema(classDiaryEntries).omit({
  id: true,
  createdAt: true,
});

export const insertFeeRecordSchema = createInsertSchema(feeRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Cadet = typeof cadets.$inferSelect;
export type InsertCadet = z.infer<typeof insertCadetSchema>;
export type BehaviorIncident = typeof behaviorIncidents.$inferSelect;
export type InsertBehaviorIncident = z.infer<typeof insertBehaviorIncidentSchema>;
export type FitnessAssessment = typeof fitnessAssessments.$inferSelect;
export type InsertFitnessAssessment = z.infer<typeof insertFitnessAssessmentSchema>;
export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
export type DevelopmentPlan = typeof developmentPlans.$inferSelect;
export type InsertDevelopmentPlan = z.infer<typeof insertDevelopmentPlanSchema>;
export type AcademicRecord = typeof academicRecords.$inferSelect;
export type InsertAcademicRecord = z.infer<typeof insertAcademicRecordSchema>;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type ParentGuardian = typeof parentGuardians.$inferSelect;
export type InsertParentGuardian = z.infer<typeof insertParentGuardianSchema>;
export type AcademicSchedule = typeof academicSchedules.$inferSelect;
export type InsertAcademicSchedule = z.infer<typeof insertAcademicScheduleSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type MockTest = typeof mockTests.$inferSelect;
export type InsertMockTest = z.infer<typeof insertMockTestSchema>;
export type MockTestAttempt = typeof mockTestAttempts.$inferSelect;
export type InsertMockTestAttempt = z.infer<typeof insertMockTestAttemptSchema>;
export type ClassDiaryEntry = typeof classDiaryEntries.$inferSelect;
export type InsertClassDiaryEntry = z.infer<typeof insertClassDiaryEntrySchema>;
export type FeeRecord = typeof feeRecords.$inferSelect;
export type InsertFeeRecord = z.infer<typeof insertFeeRecordSchema>;
