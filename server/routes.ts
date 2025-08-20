import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCadetSchema, insertBehaviorIncidentSchema,
  insertFitnessAssessmentSchema, insertMentorshipSchema, insertDevelopmentPlanSchema,
  insertAcademicRecordSchema, insertCommunicationSchema, insertParentGuardianSchema,
  insertAcademicScheduleSchema, insertAssignmentSchema, insertAssignmentSubmissionSchema,
  insertMockTestSchema, insertMockTestAttemptSchema, insertClassDiaryEntrySchema,
  insertFeeRecordSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "academy-secret-key";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (password && user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }

      const { password: userPassword, ...userWithoutPassword } = user;
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cadet management routes
  app.get("/api/cadets", authenticateToken, async (req, res) => {
    try {
      const { search, status } = req.query;
      
      let cadets;
      if (search) {
        cadets = await storage.searchCadets(search as string);
      } else if (status) {
        cadets = await storage.getCadetsByStatus(status as string);
      } else {
        cadets = await storage.getAllCadets();
      }
      
      res.json(cadets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cadets/:id", authenticateToken, async (req, res) => {
    try {
      const cadet = await storage.getCadet(req.params.id);
      if (!cadet) {
        return res.status(404).json({ message: "Cadet not found" });
      }
      res.json(cadet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cadets", authenticateToken, async (req, res) => {
    try {
      const cadetData = insertCadetSchema.parse(req.body);
      const cadet = await storage.createCadet(cadetData);
      res.status(201).json(cadet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cadets/:id", authenticateToken, async (req, res) => {
    try {
      const cadetData = insertCadetSchema.partial().parse(req.body);
      const cadet = await storage.updateCadet(req.params.id, cadetData);
      res.json(cadet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Behavior incident routes
  app.get("/api/behavior-incidents", authenticateToken, async (req, res) => {
    try {
      const { cadetId, limit } = req.query;
      
      let incidents;
      if (cadetId) {
        incidents = await storage.getBehaviorIncidentsByCadet(cadetId as string);
      } else {
        incidents = await storage.getRecentBehaviorIncidents(limit ? parseInt(limit as string) : undefined);
      }
      
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/behavior-incidents", authenticateToken, async (req, res) => {
    try {
      const incidentData = insertBehaviorIncidentSchema.parse(req.body);
      const incident = await storage.createBehaviorIncident(incidentData);
      res.status(201).json(incident);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/behavior-incidents/:id", authenticateToken, async (req, res) => {
    try {
      const incidentData = insertBehaviorIncidentSchema.partial().parse(req.body);
      const incident = await storage.updateBehaviorIncident(req.params.id, incidentData);
      res.json(incident);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Fitness assessment routes
  app.get("/api/fitness-assessments", authenticateToken, async (req, res) => {
    try {
      const { cadetId } = req.query;
      
      if (cadetId) {
        const assessments = await storage.getFitnessAssessmentsByCadet(cadetId as string);
        res.json(assessments);
      } else {
        res.status(400).json({ message: "cadetId parameter is required" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/fitness-assessments/latest/:cadetId", authenticateToken, async (req, res) => {
    try {
      const assessment = await storage.getLatestFitnessAssessmentByCadet(req.params.cadetId);
      if (!assessment) {
        return res.status(404).json({ message: "No fitness assessment found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fitness-assessments", authenticateToken, async (req, res) => {
    try {
      const assessmentData = insertFitnessAssessmentSchema.parse(req.body);
      const assessment = await storage.createFitnessAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Mentorship routes
  app.get("/api/mentorships", authenticateToken, async (req, res) => {
    try {
      const { cadetId, mentorId, status } = req.query;
      
      let mentorships;
      if (cadetId) {
        mentorships = await storage.getMentorshipsByCadet(cadetId as string);
      } else if (mentorId) {
        mentorships = await storage.getMentorshipsByMentor(mentorId as string);
      } else if (status === 'active') {
        mentorships = await storage.getActiveMentorships();
      } else {
        mentorships = await storage.getActiveMentorships(); // default to active
      }
      
      res.json(mentorships);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mentorships", authenticateToken, async (req, res) => {
    try {
      const mentorshipData = insertMentorshipSchema.parse(req.body);
      const mentorship = await storage.createMentorship(mentorshipData);
      res.status(201).json(mentorship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/mentorships/:id", authenticateToken, async (req, res) => {
    try {
      const mentorshipData = insertMentorshipSchema.partial().parse(req.body);
      const mentorship = await storage.updateMentorship(req.params.id, mentorshipData);
      res.json(mentorship);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Development plan routes
  app.get("/api/development-plans/:cadetId", authenticateToken, async (req, res) => {
    try {
      const plan = await storage.getDevelopmentPlanByCadet(req.params.cadetId);
      if (!plan) {
        return res.status(404).json({ message: "Development plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/development-plans", authenticateToken, async (req, res) => {
    try {
      const planData = insertDevelopmentPlanSchema.parse(req.body);
      const plan = await storage.createDevelopmentPlan(planData);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/development-plans/:id", authenticateToken, async (req, res) => {
    try {
      const planData = insertDevelopmentPlanSchema.partial().parse(req.body);
      const plan = await storage.updateDevelopmentPlan(req.params.id, planData);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Academic record routes
  app.get("/api/academic-records", authenticateToken, async (req, res) => {
    try {
      const { cadetId } = req.query;
      
      if (cadetId) {
        const records = await storage.getAcademicRecordsByCadet(cadetId as string);
        res.json(records);
      } else {
        res.status(400).json({ message: "cadetId parameter is required" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/academic-records", authenticateToken, async (req, res) => {
    try {
      const recordData = insertAcademicRecordSchema.parse(req.body);
      const record = await storage.createAcademicRecord(recordData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Communication routes
  app.get("/api/communications", authenticateToken, async (req, res) => {
    try {
      const { limit } = req.query;
      const communications = await storage.getRecentCommunications(limit ? parseInt(limit as string) : undefined);
      res.json(communications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/communications", authenticateToken, async (req, res) => {
    try {
      const communicationData = insertCommunicationSchema.parse(req.body);
      const communication = await storage.createCommunication(communicationData);
      res.status(201).json(communication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Staff management routes
  app.get("/api/staff", authenticateToken, async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      const staffWithoutPasswords = staff.map(({ password, ...staffMember }) => staffMember);
      res.json(staffWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Parent/Guardian routes
  app.get("/api/parent-guardians/:cadetId", authenticateToken, async (req, res) => {
    try {
      const parentGuardians = await storage.getParentGuardiansByCadet(req.params.cadetId);
      res.json(parentGuardians);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/parent-guardians", authenticateToken, async (req, res) => {
    try {
      const parentGuardianData = insertParentGuardianSchema.parse(req.body);
      const parentGuardian = await storage.createParentGuardian(parentGuardianData);
      res.status(201).json(parentGuardian);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Academic schedules routes
  app.get("/api/academic-schedules", authenticateToken, async (req, res) => {
    try {
      const { cadetId, dayOfWeek } = req.query;
      let schedules;
      if (cadetId) {
        schedules = await storage.getAcademicSchedulesByCadet(parseInt(cadetId as string));
      } else if (dayOfWeek) {
        schedules = await storage.getAcademicSchedulesByDay(dayOfWeek as string);
      } else {
        // Return empty array or implement a general method
        schedules = [];
      }
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/academic-schedules", authenticateToken, async (req, res) => {
    try {
      const scheduleData = insertAcademicScheduleSchema.parse(req.body);
      const schedule = await storage.createAcademicSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/academic-schedules/:id", authenticateToken, async (req, res) => {
    try {
      const scheduleData = insertAcademicScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateAcademicSchedule(parseInt(req.params.id), scheduleData);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assignments routes
  app.get("/api/assignments", authenticateToken, async (req, res) => {
    try {
      const { instructorId, cadetId } = req.query;
      let assignments;
      if (instructorId) {
        assignments = await storage.getAssignmentsByInstructor(instructorId as string);
      } else if (cadetId) {
        assignments = await storage.getAssignmentsByCadet(parseInt(cadetId as string));
      } else {
        assignments = await storage.getAllAssignments();
      }
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assignments", authenticateToken, async (req, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/assignments/:id", authenticateToken, async (req, res) => {
    try {
      const assignmentData = insertAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateAssignment(parseInt(req.params.id), assignmentData);
      res.json(assignment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assignment submissions routes
  app.get("/api/assignment-submissions", authenticateToken, async (req, res) => {
    try {
      const { assignmentId, cadetId } = req.query;
      let submissions;
      if (assignmentId) {
        submissions = await storage.getAssignmentSubmissionsByAssignment(parseInt(assignmentId as string));
      } else if (cadetId) {
        submissions = await storage.getAssignmentSubmissionsByCadet(parseInt(cadetId as string));
      } else {
        submissions = [];
      }
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assignment-submissions", authenticateToken, async (req, res) => {
    try {
      const submissionData = insertAssignmentSubmissionSchema.parse(req.body);
      const submission = await storage.createAssignmentSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/assignment-submissions/:id", authenticateToken, async (req, res) => {
    try {
      const submissionData = insertAssignmentSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateAssignmentSubmission(parseInt(req.params.id), submissionData);
      res.json(submission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Mock tests routes
  app.get("/api/mock-tests", authenticateToken, async (req, res) => {
    try {
      const { instructorId, active } = req.query;
      let tests;
      if (instructorId) {
        tests = await storage.getMockTestsByInstructor(instructorId as string);
      } else if (active === "true") {
        tests = await storage.getActiveMockTests();
      } else {
        tests = await storage.getAllMockTests();
      }
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mock-tests", authenticateToken, async (req, res) => {
    try {
      const testData = insertMockTestSchema.parse(req.body);
      const test = await storage.createMockTest(testData);
      res.status(201).json(test);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/mock-tests/:id", authenticateToken, async (req, res) => {
    try {
      const testData = insertMockTestSchema.partial().parse(req.body);
      const test = await storage.updateMockTest(parseInt(req.params.id), testData);
      res.json(test);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Mock test attempts routes
  app.get("/api/mock-test-attempts", authenticateToken, async (req, res) => {
    try {
      const { testId, cadetId } = req.query;
      let attempts;
      if (testId) {
        attempts = await storage.getMockTestAttemptsByTest(parseInt(testId as string));
      } else if (cadetId) {
        attempts = await storage.getMockTestAttemptsByCadet(parseInt(cadetId as string));
      } else {
        attempts = [];
      }
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mock-test-attempts", authenticateToken, async (req, res) => {
    try {
      const attemptData = insertMockTestAttemptSchema.parse(req.body);
      const attempt = await storage.createMockTestAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Class diary routes
  app.get("/api/class-diary", authenticateToken, async (req, res) => {
    try {
      const { date, subject } = req.query;
      let entries;
      if (date) {
        entries = await storage.getClassDiaryEntriesByDate(date as string);
      } else if (subject) {
        entries = await storage.getClassDiaryEntriesBySubject(subject as string);
      } else {
        entries = [];
      }
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/class-diary", authenticateToken, async (req, res) => {
    try {
      const entryData = insertClassDiaryEntrySchema.parse(req.body);
      const entry = await storage.createClassDiaryEntry(entryData);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/class-diary/:id", authenticateToken, async (req, res) => {
    try {
      const entryData = insertClassDiaryEntrySchema.partial().parse(req.body);
      const entry = await storage.updateClassDiaryEntry(parseInt(req.params.id), entryData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Fee records routes
  app.get("/api/fee-records", authenticateToken, async (req, res) => {
    try {
      const { cadetId, overdue } = req.query;
      let records;
      if (cadetId) {
        records = await storage.getFeeRecordsByCadet(parseInt(cadetId as string));
      } else if (overdue === "true") {
        records = await storage.getOverdueFees();
      } else {
        records = [];
      }
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fee-records", authenticateToken, async (req, res) => {
    try {
      const feeData = insertFeeRecordSchema.parse(req.body);
      const record = await storage.createFeeRecord(feeData);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/fee-records/:id", authenticateToken, async (req, res) => {
    try {
      const feeData = insertFeeRecordSchema.partial().parse(req.body);
      const record = await storage.updateFeeRecord(parseInt(req.params.id), feeData);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
