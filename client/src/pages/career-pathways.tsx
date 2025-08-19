import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import SidebarNavigation from "@/components/ui/sidebar-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { authenticatedFetch } from "@/lib/auth";
import { GraduationCap, Search, Plus, Eye, Edit, Briefcase, TrendingUp, Users, Target } from "lucide-react";

interface Cadet {
  id: string;
  firstName: string;
  lastName: string;
  careerPathway: string;
  status: string;
  class: string;
}

interface DevelopmentPlan {
  id: string;
  cadetId: string;
  careerGoals: any;
  targetGraduationDate: string;
  status: string;
}

const careerPathways = [
  { id: "it", name: "Information Technology", color: "bg-blue-100 text-blue-800" },
  { id: "healthcare", name: "Healthcare", color: "bg-green-100 text-green-800" },
  { id: "construction", name: "Construction Trades", color: "bg-orange-100 text-orange-800" },
  { id: "automotive", name: "Automotive Technology", color: "bg-purple-100 text-purple-800" },
  { id: "culinary", name: "Culinary Arts", color: "bg-yellow-100 text-yellow-800" },
  { id: "security", name: "Security Services", color: "bg-red-100 text-red-800" },
  { id: "logistics", name: "Logistics & Transportation", color: "bg-indigo-100 text-indigo-800" },
  { id: "business", name: "Business Administration", color: "bg-gray-100 text-gray-800" },
];

export default function CareerPathways() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPathway, setSelectedPathway] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: cadets, isLoading } = useQuery<Cadet[]>({
    queryKey: ["/api/cadets"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/cadets");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: developmentPlans } = useQuery<DevelopmentPlan[]>({
    queryKey: ["/api/development-plans"],
    queryFn: async () => {
      // This would need to be implemented in the backend to get all plans
      const response = await authenticatedFetch("/api/development-plans");
      return response.json();
    },
    enabled: !!user,
  });

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

  const activeCadets = cadets?.filter(c => c.status === "active") || [];
  const pathwayStats = careerPathways.map(pathway => {
    const count = activeCadets.filter(c => c.careerPathway === pathway.id).length;
    return { ...pathway, count, percentage: activeCadets.length > 0 ? (count / activeCadets.length) * 100 : 0 };
  });

  const filteredCadets = activeCadets.filter(cadet => {
    const matchesSearch = searchQuery === "" || 
      `${cadet.firstName} ${cadet.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPathway = selectedPathway === "all" || cadet.careerPathway === selectedPathway;
    return matchesSearch && matchesPathway;
  });

  const totalWithPathways = activeCadets.filter(c => c.careerPathway).length;
  const completionRate = activeCadets.length > 0 ? Math.round((totalWithPathways / activeCadets.length) * 100) : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Career Pathways</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Career Pathways</span>
              </nav>
            </div>
            <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-create-development-plan">
              <Plus className="mr-2" size={16} />
              Create Development Plan
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Cadets</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-cadets">
                      {activeCadets.length}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Users size={14} className="mr-1" />
                      Active enrollment
                    </p>
                  </div>
                  <Users className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">With Career Pathways</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-with-pathways">
                      {totalWithPathways}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp size={14} className="mr-1" />
                      {completionRate}% completion
                    </p>
                  </div>
                  <Briefcase className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Pathways</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-available-pathways">
                      {careerPathways.length}
                    </p>
                    <p className="text-sm text-academy-gold flex items-center mt-1">
                      <Target size={14} className="mr-1" />
                      Career options
                    </p>
                  </div>
                  <Target className="text-academy-gold" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Most Popular</p>
                    <p className="text-xl font-bold text-foreground" data-testid="stat-most-popular">
                      {pathwayStats.reduce((prev, current) => (prev.count > current.count) ? prev : current)?.name || "N/A"}
                    </p>
                    <p className="text-sm text-purple-600 flex items-center mt-1">
                      <GraduationCap size={14} className="mr-1" />
                      Top choice
                    </p>
                  </div>
                  <GraduationCap className="text-purple-600" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pathway Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="text-navy-600" />
                Career Pathway Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pathwayStats.map((pathway) => (
                  <div key={pathway.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pathway.name}</span>
                      <Badge className={pathway.color} data-testid={`pathway-count-${pathway.id}`}>
                        {pathway.count}
                      </Badge>
                    </div>
                    <Progress value={pathway.percentage} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {pathway.percentage.toFixed(1)}% of cadets
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cadets Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="text-navy-600" />
                Cadet Career Assignments
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search cadets by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-cadets"
                    />
                  </div>
                </div>
                <select
                  value={selectedPathway}
                  onChange={(e) => setSelectedPathway(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                  data-testid="select-pathway-filter"
                >
                  <option value="all">All Pathways</option>
                  {careerPathways.map((pathway) => (
                    <option key={pathway.id} value={pathway.id}>
                      {pathway.name}
                    </option>
                  ))}
                  <option value="">No Pathway Assigned</option>
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading cadets...</p>
                </div>
              ) : !filteredCadets || filteredCadets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="mx-auto mb-4" size={48} />
                  <p>No cadets found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Career Pathway</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Development Plan</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCadets.map((cadet) => {
                        const pathway = careerPathways.find(p => p.id === cadet.careerPathway);
                        const hasDevelopmentPlan = developmentPlans?.some(dp => dp.cadetId === cadet.id);
                        
                        return (
                          <TableRow key={cadet.id} data-testid={`cadet-row-${cadet.id}`}>
                            <TableCell className="font-medium">
                              {cadet.firstName} {cadet.lastName}
                            </TableCell>
                            <TableCell>{cadet.class || "Unassigned"}</TableCell>
                            <TableCell>
                              {pathway ? (
                                <Badge className={pathway.color}>
                                  {pathway.name}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not assigned</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                {cadet.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {hasDevelopmentPlan ? (
                                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                              ) : (
                                <Badge variant="outline">None</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-view-cadet-${cadet.id}`}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-edit-cadet-${cadet.id}`}
                                >
                                  <Edit size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
