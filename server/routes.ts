import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertCadetSchema, insertBehaviorIncidentSchema,
  insertFitnessAssessmentSchema, insertMentorshipSchema, insertDevelopmentPlanSchema,
  insertAcademicRecordSchema, insertCommunicationSchema, insertParentGuardianSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
