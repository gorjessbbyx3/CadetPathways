import OpenAI from 'openai';
import type { 
  Cadet, 
  BehaviorIncident, 
  FitnessAssessment, 
  AcademicRecord,
  Mentorship,
  User 
} from '@shared/schema';

// Validate OpenAI configuration at startup
if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  console.warn('[AI Service] Warning: OpenAI credentials not configured. AI features will be unavailable.');
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy-key',
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

function checkAIAvailable(): void {
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    throw new Error('AI service unavailable: OpenAI credentials not configured');
  }
}

export interface CadetProfile {
  cadet: Cadet;
  academicRecords: AcademicRecord[];
  fitnessAssessments: FitnessAssessment[];
  behaviorIncidents: BehaviorIncident[];
  mentorships: Mentorship[];
  academicTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  fitnessTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  behaviorScore: number; // 0-100, higher is better
  engagementScore: number; // 0-100
}

export interface RoommateRecommendation {
  cadetId1: number;
  cadetId2: number;
  compatibilityScore: number;
  reasons: string[];
  potentialConcerns: string[];
}

export interface MentorRecommendation {
  mentorId: string;
  mentorName: string;
  compatibilityScore: number;
  strengths: string[];
  relevantExperience: string[];
}

export interface AtRiskAlert {
  cadetId: number;
  cadetName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendedInterventions: string[];
  urgency: number; // 1-10
}

export class AIService {
  async analyzeCadet(profile: CadetProfile): Promise<{
    insights: string[];
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  }> {
    checkAIAvailable();
    
    const prompt = `You are analyzing a cadet's profile at the Hawaii National Guard Youth Challenge Academy. Review all the data and provide actionable insights.

Cadet Information:
- Name: ${profile.cadet.firstName} ${profile.cadet.lastName}
- Status: ${profile.cadet.status}
- Career Pathway: ${profile.cadet.careerPathway || 'Not selected'}

Academic Performance:
- Trend: ${profile.academicTrend}
- Recent Records: ${profile.academicRecords.length} total
${profile.academicRecords.slice(0, 3).map(r => `  * ${r.subject}: ${r.grade || 'In Progress'}`).join('\n')}

Physical Fitness:
- Trend: ${profile.fitnessTrend}
- Assessments: ${profile.fitnessAssessments.length} completed
${profile.fitnessAssessments.slice(0, 2).map(a => `  * Score: ${a.overallScore || 'N/A'}%`).join('\n')}

Behavior:
- Score: ${profile.behaviorScore}/100
- Recent Incidents: ${profile.behaviorIncidents.length} total
${profile.behaviorIncidents.slice(0, 3).map(i => `  * ${i.incidentType} (${i.severity})`).join('\n')}

Engagement:
- Score: ${profile.engagementScore}/100
- Mentorships: ${profile.mentorships.length}

Based on this data, provide:
1. Key insights about the cadet's progress and patterns
2. Their main strengths
3. Any concerns or warning signs
4. Specific actionable recommendations

Respond in JSON format:
{
  "insights": ["insight1", "insight2", ...],
  "strengths": ["strength1", "strength2", ...],
  "concerns": ["concern1", "concern2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      insights: result.insights || [],
      strengths: result.strengths || [],
      concerns: result.concerns || [],
      recommendations: result.recommendations || [],
    };
  }

  async recommendRoommates(
    profiles: CadetProfile[],
    targetCadetId: number
  ): Promise<RoommateRecommendation[]> {
    checkAIAvailable();
    
    const targetProfile = profiles.find(p => p.cadet.id === targetCadetId);
    if (!targetProfile) return [];

    const otherProfiles = profiles.filter(p => 
      p.cadet.id !== targetCadetId && 
      p.cadet.status === 'active'
    );

    const prompt = `You are recommending compatible roommates for a cadet at a military youth academy.

Target Cadet:
- Name: ${targetProfile.cadet.firstName} ${targetProfile.cadet.lastName}
- Behavior Score: ${targetProfile.behaviorScore}/100
- Engagement: ${targetProfile.engagementScore}/100
- Academic Trend: ${targetProfile.academicTrend}
- Fitness Trend: ${targetProfile.fitnessTrend}
- Career Pathway: ${targetProfile.cadet.careerPathway || 'Not selected'}
- Recent Incidents: ${targetProfile.behaviorIncidents.slice(0, 3).map(i => i.incidentType).join(', ') || 'None'}

Potential Roommates:
${otherProfiles.slice(0, 10).map((p, i) => `
${i + 1}. ${p.cadet.firstName} ${p.cadet.lastName} (ID: ${p.cadet.id})
   - Behavior: ${p.behaviorScore}/100
   - Engagement: ${p.engagementScore}/100
   - Academic: ${p.academicTrend}
   - Fitness: ${p.fitnessTrend}
   - Career: ${p.cadet.careerPathway || 'Not selected'}
   - Incidents: ${p.behaviorIncidents.slice(0, 2).map(i => i.incidentType).join(', ') || 'None'}
`).join('\n')}

Rank the top 5 most compatible roommates. Consider:
- Compatible behavior patterns (not identical, but complementary)
- Similar career interests
- Balanced strengths/weaknesses
- Potential positive influence
- Avoid pairing cadets with conflicting behavior issues

Respond in JSON format:
{
  "recommendations": [
    {
      "cadetId": number,
      "compatibilityScore": number (0-100),
      "reasons": ["reason1", "reason2", ...],
      "potentialConcerns": ["concern1", ...]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const recommendations = result.recommendations || [];

    return recommendations.map((rec: any) => ({
      cadetId1: targetCadetId,
      cadetId2: rec.cadetId,
      compatibilityScore: rec.compatibilityScore,
      reasons: rec.reasons || [],
      potentialConcerns: rec.potentialConcerns || [],
    }));
  }

  async suggestMentors(
    cadetProfile: CadetProfile,
    availableMentors: User[]
  ): Promise<MentorRecommendation[]> {
    checkAIAvailable();
    
    const prompt = `You are matching a cadet with the best mentor at a military youth academy.

Cadet Profile:
- Name: ${cadetProfile.cadet.firstName} ${cadetProfile.cadet.lastName}
- Career Pathway: ${cadetProfile.cadet.careerPathway || 'Undecided'}
- Academic Trend: ${cadetProfile.academicTrend}
- Behavior Score: ${cadetProfile.behaviorScore}/100
- Engagement: ${cadetProfile.engagementScore}/100
- Key Concerns: ${cadetProfile.behaviorIncidents.slice(0, 2).map(i => i.incidentType).join(', ') || 'None'}

Available Mentors:
${availableMentors.slice(0, 15).map((m, i) => `
${i + 1}. ${m.name} (ID: ${m.id})
   - Role: ${m.role}
   - Email: ${m.email}
`).join('\n')}

Rank the top 5 best mentor matches. Consider:
- Career pathway alignment
- Mentor's expertise and experience
- Cadet's specific needs and challenges
- Personality compatibility (based on behavior patterns)
- Potential for positive influence

Respond in JSON format:
{
  "recommendations": [
    {
      "mentorId": "string",
      "compatibilityScore": number (0-100),
      "strengths": ["strength1", "strength2", ...],
      "relevantExperience": ["experience1", ...]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const recommendations = result.recommendations || [];

    return recommendations.map((rec: any) => {
      const mentor = availableMentors.find(m => m.id === rec.mentorId);
      return {
        mentorId: rec.mentorId,
        mentorName: mentor?.name || 'Unknown',
        compatibilityScore: rec.compatibilityScore,
        strengths: rec.strengths || [],
        relevantExperience: rec.relevantExperience || [],
      };
    });
  }

  async identifyAtRiskCadets(profiles: CadetProfile[]): Promise<AtRiskAlert[]> {
    checkAIAvailable();
    
    const prompt = `You are identifying at-risk cadets at a military youth academy who need intervention.

Cadet Profiles:
${profiles.map((p, i) => `
${i + 1}. ${p.cadet.firstName} ${p.cadet.lastName} (ID: ${p.cadet.id})
   - Status: ${p.cadet.status}
   - Academic Trend: ${p.academicTrend}
   - Fitness Trend: ${p.fitnessTrend}
   - Behavior Score: ${p.behaviorScore}/100
   - Engagement: ${p.engagementScore}/100
   - Recent Incidents: ${p.behaviorIncidents.length} (${p.behaviorIncidents.slice(0, 2).map(i => i.incidentType).join(', ')})
   - Mentorships: ${p.mentorships.filter(m => m.status === 'active').length} active
`).join('\n')}

Identify cadets who are at risk and need intervention. Consider:
- Declining academic or fitness trends
- Multiple or severe behavior incidents
- Low engagement scores
- Lack of mentorship support
- Pattern of escalating issues

For each at-risk cadet, determine:
- Risk level: low, medium, high, or critical
- Specific risk factors
- Recommended interventions
- Urgency (1-10 scale)

Respond in JSON format:
{
  "alerts": [
    {
      "cadetId": number,
      "riskLevel": "low|medium|high|critical",
      "riskFactors": ["factor1", "factor2", ...],
      "recommendedInterventions": ["intervention1", ...],
      "urgency": number
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const alerts = result.alerts || [];

    return alerts.map((alert: any) => {
      const profile = profiles.find(p => p.cadet.id === alert.cadetId);
      return {
        cadetId: alert.cadetId,
        cadetName: profile ? `${profile.cadet.firstName} ${profile.cadet.lastName}` : 'Unknown',
        riskLevel: alert.riskLevel,
        riskFactors: alert.riskFactors || [],
        recommendedInterventions: alert.recommendedInterventions || [],
        urgency: alert.urgency || 5,
      };
    });
  }
}

export const aiService = new AIService();
