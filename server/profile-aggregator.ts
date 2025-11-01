import type { CadetProfile } from './ai-service';
import { storage } from './storage';

export class ProfileAggregator {
  async buildCadetProfile(cadetId: number): Promise<CadetProfile | null> {
    const cadet = await storage.getCadet(cadetId);
    if (!cadet) return null;

    const [academicRecords, fitnessAssessments, behaviorIncidents, mentorships] = await Promise.all([
      storage.getAcademicRecordsByCadet(cadetId),
      storage.getFitnessAssessmentsByCadet(cadetId),
      storage.getBehaviorIncidentsByCadet(cadetId),
      storage.getMentorshipsByCadet(cadetId),
    ]);

    return {
      cadet,
      academicRecords,
      fitnessAssessments,
      behaviorIncidents,
      mentorships,
      academicTrend: this.calculateAcademicTrend(academicRecords),
      fitnessTrend: this.calculateFitnessTrend(fitnessAssessments),
      behaviorScore: this.calculateBehaviorScore(behaviorIncidents),
      engagementScore: this.calculateEngagementScore(mentorships, behaviorIncidents),
    };
  }

  async buildAllCadetProfiles(): Promise<CadetProfile[]> {
    const cadets = await storage.getAllCadets();
    const profiles = await Promise.all(
      cadets.map(cadet => this.buildCadetProfile(cadet.id))
    );
    return profiles.filter((p): p is CadetProfile => p !== null);
  }

  private calculateAcademicTrend(records: any[]): 'improving' | 'stable' | 'declining' | 'unknown' {
    if (records.length < 2) return 'unknown';

    // Sort by date
    const sorted = [...records].sort((a, b) => 
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    );

    const gradeToNumber = (grade: string | null): number | null => {
      if (!grade) return null;
      const gradeMap: { [key: string]: number } = {
        'A+': 97, 'A': 93, 'A-': 90,
        'B+': 87, 'B': 83, 'B-': 80,
        'C+': 77, 'C': 73, 'C-': 70,
        'D+': 67, 'D': 63, 'D-': 60,
        'F': 50
      };
      return gradeMap[grade] || null;
    };

    const recentGrades = sorted.slice(0, 3)
      .map(r => gradeToNumber(r.grade))
      .filter((g): g is number => g !== null);

    const olderGrades = sorted.slice(3, 6)
      .map(r => gradeToNumber(r.grade))
      .filter((g): g is number => g !== null);

    if (recentGrades.length === 0 || olderGrades.length === 0) return 'unknown';

    const recentAvg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length;
    const olderAvg = olderGrades.reduce((a, b) => a + b, 0) / olderGrades.length;

    const diff = recentAvg - olderAvg;
    if (diff > 3) return 'improving';
    if (diff < -3) return 'declining';
    return 'stable';
  }

  private calculateFitnessTrend(assessments: any[]): 'improving' | 'stable' | 'declining' | 'unknown' {
    if (assessments.length < 2) return 'unknown';

    const sorted = [...assessments].sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );

    const recentScores = sorted.slice(0, 2)
      .map(a => a.overallScore)
      .filter((s): s is number => s !== null && s !== undefined);

    const olderScores = sorted.slice(2, 4)
      .map(a => a.overallScore)
      .filter((s): s is number => s !== null && s !== undefined);

    if (recentScores.length === 0) return 'unknown';
    if (olderScores.length === 0) return recentScores.length > 0 ? 'stable' : 'unknown';

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

    const diff = recentAvg - olderAvg;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private calculateBehaviorScore(incidents: any[]): number {
    if (incidents.length === 0) return 100;

    // Recent incidents (last 30 days) weight more
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentIncidents = incidents.filter(i => 
      new Date(i.dateOccurred) > thirtyDaysAgo
    );

    const severityWeights: { [key: string]: number } = {
      'minor': 5,
      'moderate': 15,
      'major': 30,
      'severe': 50,
    };

    const recentPenalty = recentIncidents.reduce((sum, incident) => 
      sum + (severityWeights[incident.severity] || 10), 0
    );

    const olderPenalty = (incidents.length - recentIncidents.length) * 3;

    const totalPenalty = recentPenalty + olderPenalty;
    const score = Math.max(0, 100 - totalPenalty);

    return Math.round(score);
  }

  private calculateEngagementScore(mentorships: any[], incidents: any[]): number {
    let score = 50; // Base score

    // Active mentorship is positive
    const activeMentorships = mentorships.filter(m => m.status === 'active');
    score += activeMentorships.length * 15;

    // Positive behavior (lack of recent incidents) is positive
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentIncidents = incidents.filter(i => 
      new Date(i.dateOccurred) > thirtyDaysAgo
    );

    if (recentIncidents.length === 0) {
      score += 20;
    } else {
      score -= recentIncidents.length * 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const profileAggregator = new ProfileAggregator();
