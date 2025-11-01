import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  UserCheck,
  Brain,
  Sparkles
} from "lucide-react";

interface AtRiskAlert {
  cadetId: number;
  cadetName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendedInterventions: string[];
  urgency: number;
}

export default function AIInsights() {
  const [selectedTab, setSelectedTab] = useState("at-risk");

  const { data: atRiskCadets = [], isLoading: loadingAtRisk, error: atRiskError } = useQuery<AtRiskAlert[]>({
    queryKey: ["/api/ai/at-risk-cadets"],
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                AI-Powered Insights
              </h1>
              <p className="text-muted-foreground mt-1">
                Intelligent analysis and recommendations powered by AI
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-1/2">
            <TabsTrigger value="at-risk" data-testid="tab-at-risk">
              <AlertTriangle className="mr-2 h-4 w-4" />
              At-Risk Cadets
            </TabsTrigger>
            <TabsTrigger value="overview" data-testid="tab-overview">
              <TrendingUp className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* At-Risk Cadets Tab */}
          <TabsContent value="at-risk" className="space-y-4">
            {atRiskError ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Service Unavailable</h3>
                  <p className="text-muted-foreground mb-4">
                    {(atRiskError as any)?.message || 'Unable to load AI insights. Please try again later.'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The AI service may be temporarily unavailable or not configured properly.
                  </p>
                </CardContent>
              </Card>
            ) : loadingAtRisk ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : atRiskCadets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Cadets on Track</h3>
                  <p className="text-muted-foreground">
                    No cadets currently identified as at-risk.
                  </p>
                </CardContent>
              </Card>
            ) : (
              atRiskCadets.map((alert) => (
                <Card 
                  key={alert.cadetId} 
                  className="hover:shadow-lg transition-shadow"
                  data-testid={`alert-${alert.cadetId}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getRiskIcon(alert.riskLevel)}
                        <div>
                          <CardTitle className="text-xl" data-testid="cadet-name">
                            {alert.cadetName}
                          </CardTitle>
                          <CardDescription>
                            Urgency: {alert.urgency}/10
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        className={getRiskColor(alert.riskLevel)}
                        data-testid="risk-level"
                      >
                        {alert.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Risk Factors */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-1">
                        {alert.riskFactors.map((factor, i) => (
                          <li 
                            key={i} 
                            className="text-sm text-muted-foreground flex items-start"
                            data-testid={`risk-factor-${i}`}
                          >
                            <span className="mr-2">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Interventions */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Recommended Interventions
                      </h4>
                      <ul className="space-y-1">
                        {alert.recommendedInterventions.map((intervention, i) => (
                          <li 
                            key={i} 
                            className="text-sm text-foreground flex items-start"
                            data-testid={`intervention-${i}`}
                          >
                            <span className="mr-2 text-primary">✓</span>
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" data-testid="button-view-profile">
                        View Full Profile
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-assign-mentor">
                        Assign Mentor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Summary Cards */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Total Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="total-alerts">
                    {atRiskCadets.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadets requiring attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Critical Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600" data-testid="critical-count">
                    {atRiskCadets.filter(a => a.riskLevel === 'critical').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Immediate intervention needed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    High Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600" data-testid="high-priority-count">
                    {atRiskCadets.filter(a => a.riskLevel === 'high').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Action required soon
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About AI Insights</CardTitle>
                <CardDescription>
                  How our AI analyzes cadet data to identify risks and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What We Analyze</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Academic performance trends and grade patterns</li>
                    <li>• Physical fitness assessment progress</li>
                    <li>• Behavior incident frequency and severity</li>
                    <li>• Engagement levels and mentorship participation</li>
                    <li>• Career pathway alignment and progress</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How It Helps</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Early identification of at-risk cadets before situations escalate</li>
                    <li>• Data-driven mentor and roommate recommendations</li>
                    <li>• Personalized intervention strategies</li>
                    <li>• Pattern recognition across academic, behavioral, and fitness metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
