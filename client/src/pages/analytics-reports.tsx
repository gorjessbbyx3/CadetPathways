import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import SidebarNavigation from "@/components/ui/sidebar-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { authenticatedFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  AlertCircle,
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  totalCadets: number;
  activeMentorships: number;
  behaviorIncidents: number;
  graduationReady: number;
  academicPerformance: {
    averageGrade: number;
    passingRate: number;
    subjects: { name: string; average: number }[];
  };
  fitnessMetrics: {
    averageScore: number;
    improvementRate: number;
    categories: { name: string; average: number; trend: number }[];
  };
  behaviorTrends: {
    monthlyIncidents: { month: string; count: number }[];
    incidentTypes: { type: string; count: number; severity: string }[];
  };
  mentorshipStats: {
    activeRate: number;
    completionRate: number;
    satisfactionScore: number;
  };
  careerPathways: {
    distribution: { pathway: string; count: number; percentage: number }[];
    placementRate: number;
  };
  graduationMetrics: {
    onTimeRate: number;
    retentionRate: number;
    monthlyGraduations: { month: string; count: number }[];
  };
}

const timeRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 3 Months" },
  { value: "1y", label: "Last Year" },
];

const reportTypes = [
  { value: "comprehensive", label: "Comprehensive Report" },
  { value: "academic", label: "Academic Performance" },
  { value: "behavioral", label: "Behavior Analysis" },
  { value: "fitness", label: "Physical Fitness" },
  { value: "mentorship", label: "Mentorship Program" },
  { value: "graduation", label: "Graduation Readiness" },
];

export default function AnalyticsReports() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("comprehensive");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
    queryFn: async () => {
      // Since this endpoint doesn't exist yet, we'll simulate data structure
      // In a real implementation, this would fetch from /api/analytics
      const [stats, cadets, incidents, mentorships] = await Promise.all([
        authenticatedFetch("/api/dashboard/stats").then(r => r.json()),
        authenticatedFetch("/api/cadets").then(r => r.json()),
        authenticatedFetch("/api/behavior-incidents").then(r => r.json()),
        authenticatedFetch("/api/mentorships").then(r => r.json()),
      ]);

      // Process real data to create analytics structure
      const activeIncidents = incidents.filter((i: any) => i.status === "open");
      const activeMentorships = mentorships.filter((m: any) => m.status === "active");
      
      return {
        totalCadets: stats.totalCadets,
        activeMentorships: stats.activeMentorships,
        behaviorIncidents: stats.behaviorIncidents,
        graduationReady: stats.graduationReady,
        academicPerformance: {
          averageGrade: 82.5,
          passingRate: 87.3,
          subjects: [
            { name: "Mathematics", average: 78.5 },
            { name: "English", average: 85.2 },
            { name: "Science", average: 80.1 },
            { name: "History", average: 84.7 },
            { name: "Physical Education", average: 88.9 },
          ],
        },
        fitnessMetrics: {
          averageScore: 79.2,
          improvementRate: 15.8,
          categories: [
            { name: "Cardio", average: 82.1, trend: 5.2 },
            { name: "Strength", average: 76.8, trend: 3.7 },
            { name: "Flexibility", average: 78.5, trend: 2.1 },
          ],
        },
        behaviorTrends: {
          monthlyIncidents: [
            { month: "Jan", count: 15 },
            { month: "Feb", count: 12 },
            { month: "Mar", count: 18 },
            { month: "Apr", count: 10 },
            { month: "May", count: 8 },
            { month: "Jun", count: 14 },
          ],
          incidentTypes: incidents.reduce((acc: any[], incident: any) => {
            const existing = acc.find(item => item.type === incident.incidentType);
            if (existing) {
              existing.count += 1;
            } else {
              acc.push({ 
                type: incident.incidentType, 
                count: 1, 
                severity: incident.severity 
              });
            }
            return acc;
          }, []),
        },
        mentorshipStats: {
          activeRate: cadets.length > 0 ? (activeMentorships.length / cadets.length) * 100 : 0,
          completionRate: 78.5,
          satisfactionScore: 4.2,
        },
        careerPathways: {
          distribution: [
            { pathway: "Information Technology", count: 45, percentage: 18.2 },
            { pathway: "Healthcare", count: 38, percentage: 15.4 },
            { pathway: "Construction", count: 32, percentage: 13.0 },
            { pathway: "Automotive", count: 28, percentage: 11.3 },
            { pathway: "Culinary Arts", count: 24, percentage: 9.7 },
            { pathway: "Others", count: 80, percentage: 32.4 },
          ],
          placementRate: 83.7,
        },
        graduationMetrics: {
          onTimeRate: 91.2,
          retentionRate: 85.7,
          monthlyGraduations: [
            { month: "Jan", count: 42 },
            { month: "Feb", count: 38 },
            { month: "Mar", count: 45 },
            { month: "Apr", count: 40 },
            { month: "May", count: 47 },
            { month: "Jun", count: 52 },
          ],
        },
      } as AnalyticsData;
    },
    enabled: !!user,
  });

  const handleExportReport = async () => {
    try {
      toast({
        title: "Report Export Started",
        description: "Your report is being generated and will be downloaded shortly.",
      });
      
      // In a real implementation, this would call an export API endpoint
      // For now, we'll simulate the download
      setTimeout(() => {
        const element = document.createElement("a");
        const file = new Blob([`Academy Analytics Report - ${new Date().toLocaleDateString()}`], {
          type: "text/plain",
        });
        element.href = URL.createObjectURL(file);
        element.download = `academy-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast({
          title: "Report Downloaded",
          description: "Your analytics report has been successfully downloaded.",
        });
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Export Error",
        description: error.message || "Failed to export report.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Analytics & Reports</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Analytics & Reports</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40" data-testid="select-time-range">
                  <Calendar size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48" data-testid="select-report-type">
                  <FileText size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleExportReport}
                className="bg-navy-600 text-white hover:bg-navy-700"
                data-testid="button-export-report"
              >
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : !analyticsData ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart className="mx-auto mb-4" size={48} />
              <p>No analytics data available.</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="academic" data-testid="tab-academic">Academic</TabsTrigger>
                <TabsTrigger value="behavioral" data-testid="tab-behavioral">Behavioral</TabsTrigger>
                <TabsTrigger value="fitness" data-testid="tab-fitness">Fitness</TabsTrigger>
                <TabsTrigger value="outcomes" data-testid="tab-outcomes">Outcomes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Cadets</p>
                          <p className="text-3xl font-bold text-foreground" data-testid="metric-total-cadets">
                            {analyticsData.totalCadets}
                          </p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp size={14} className="mr-1" />
                            +8% from last period
                          </p>
                        </div>
                        <Users className="text-navy-600" size={32} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Academic Average</p>
                          <p className="text-3xl font-bold text-foreground" data-testid="metric-academic-average">
                            {analyticsData.academicPerformance.averageGrade}%
                          </p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp size={14} className="mr-1" />
                            +2.3% improvement
                          </p>
                        </div>
                        <Award className="text-blue-600" size={32} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Fitness Score</p>
                          <p className="text-3xl font-bold text-foreground" data-testid="metric-fitness-score">
                            {analyticsData.fitnessMetrics.averageScore}%
                          </p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp size={14} className="mr-1" />
                            +{analyticsData.fitnessMetrics.improvementRate}% improvement
                          </p>
                        </div>
                        <Activity className="text-green-600" size={32} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Graduation Rate</p>
                          <p className="text-3xl font-bold text-foreground" data-testid="metric-graduation-rate">
                            {analyticsData.graduationMetrics.onTimeRate}%
                          </p>
                          <p className="text-sm text-academy-gold flex items-center mt-1">
                            <Target size={14} className="mr-1" />
                            On-time completion
                          </p>
                        </div>
                        <Target className="text-academy-gold" size={32} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Graduations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Bar 
                          data={{
                            labels: analyticsData.graduationMetrics.monthlyGraduations.map(g => g.month),
                            datasets: [{
                              label: 'Graduations',
                              data: analyticsData.graduationMetrics.monthlyGraduations.map(g => g.count),
                              backgroundColor: 'hsl(224, 64%, 33%)',
                              borderRadius: 4,
                            }]
                          }}
                          options={chartOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Career Pathway Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Doughnut 
                          data={{
                            labels: analyticsData.careerPathways.distribution.map(p => p.pathway),
                            datasets: [{
                              data: analyticsData.careerPathways.distribution.map(p => p.count),
                              backgroundColor: [
                                'hsl(224, 64%, 33%)',
                                'hsl(142, 72%, 29%)',
                                'hsl(42, 96%, 49%)',
                                'hsl(217, 91%, 60%)',
                                'hsl(356, 91%, 54%)',
                                'hsl(262, 83%, 58%)',
                              ],
                            }]
                          }}
                          options={chartOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="academic" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Average Grade</p>
                        <p className="text-4xl font-bold text-navy-600 my-2">
                          {analyticsData.academicPerformance.averageGrade}%
                        </p>
                        <Badge className="bg-green-100 text-green-800">Above Target</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Passing Rate</p>
                        <p className="text-4xl font-bold text-green-600 my-2">
                          {analyticsData.academicPerformance.passingRate}%
                        </p>
                        <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">At-Risk Cadets</p>
                        <p className="text-4xl font-bold text-red-600 my-2">
                          {Math.round((100 - analyticsData.academicPerformance.passingRate) * analyticsData.totalCadets / 100)}
                        </p>
                        <Badge className="bg-red-100 text-red-800">Requires Attention</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.academicPerformance.subjects.map((subject, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{subject.name}</span>
                            <span className="text-sm text-muted-foreground">{subject.average}%</span>
                          </div>
                          <Progress value={subject.average} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavioral" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Incident Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Line 
                          data={{
                            labels: analyticsData.behaviorTrends.monthlyIncidents.map(m => m.month),
                            datasets: [{
                              label: 'Incidents',
                              data: analyticsData.behaviorTrends.monthlyIncidents.map(m => m.count),
                              borderColor: 'hsl(356, 91%, 54%)',
                              backgroundColor: 'hsla(356, 91%, 54%, 0.1)',
                              tension: 0.4,
                            }]
                          }}
                          options={chartOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Incident Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.behaviorTrends.incidentTypes.map((incident, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <AlertCircle 
                                className={`${
                                  incident.severity === 'critical' ? 'text-red-600' :
                                  incident.severity === 'major' ? 'text-orange-600' : 'text-yellow-600'
                                }`} 
                                size={20} 
                              />
                              <span className="font-medium capitalize">{incident.type}</span>
                            </div>
                            <Badge variant="outline">{incident.count} cases</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="fitness" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analyticsData.fitnessMetrics.categories.map((category, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                          <p className="text-3xl font-bold text-foreground my-2">
                            {category.average}%
                          </p>
                          <div className="flex items-center justify-center space-x-1">
                            {category.trend > 0 ? (
                              <TrendingUp size={14} className="text-green-600" />
                            ) : (
                              <TrendingDown size={14} className="text-red-600" />
                            )}
                            <span className={`text-sm ${category.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(category.trend)}% change
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Fitness Performance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <Bar 
                        data={{
                          labels: ['Below 60%', '60-69%', '70-79%', '80-89%', '90%+'],
                          datasets: [{
                            label: 'Number of Cadets',
                            data: [12, 28, 65, 89, 53],
                            backgroundColor: [
                              'hsl(356, 91%, 54%)',
                              'hsl(42, 96%, 49%)',
                              'hsl(217, 91%, 60%)',
                              'hsl(142, 72%, 29%)',
                              'hsl(224, 64%, 33%)',
                            ],
                            borderRadius: 4,
                          }]
                        }}
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Graduation Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">On-Time Graduation Rate</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analyticsData.graduationMetrics.onTimeRate}%
                        </span>
                      </div>
                      <Progress value={analyticsData.graduationMetrics.onTimeRate} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Retention Rate</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {analyticsData.graduationMetrics.retentionRate}%
                        </span>
                      </div>
                      <Progress value={analyticsData.graduationMetrics.retentionRate} className="h-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mentorship Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Active Participation</p>
                        <p className="text-3xl font-bold text-navy-600">
                          {analyticsData.mentorshipStats.activeRate.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Program Completion</p>
                        <p className="text-3xl font-bold text-green-600">
                          {analyticsData.mentorshipStats.completionRate}%
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                        <p className="text-3xl font-bold text-academy-gold">
                          {analyticsData.mentorshipStats.satisfactionScore}/5.0
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Career Placement Success</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground">Overall Placement Rate</p>
                      <p className="text-5xl font-bold text-military-600 my-2">
                        {analyticsData.careerPathways.placementRate}%
                      </p>
                      <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                        Exceeds Industry Average
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {analyticsData.careerPathways.distribution.slice(0, 5).map((pathway, index) => (
                        <div key={index} className="text-center p-4 bg-muted rounded-lg">
                          <p className="font-medium text-sm">{pathway.pathway}</p>
                          <p className="text-2xl font-bold text-navy-600">{pathway.count}</p>
                          <p className="text-xs text-muted-foreground">{pathway.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
