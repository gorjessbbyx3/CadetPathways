import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import SidebarNavigation from "@/components/ui/sidebar-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedFetch } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Plus, Eye, Edit, Search, TrendingUp, TrendingDown } from "lucide-react";

interface FitnessAssessment {
  id: string;
  cadetId: string;
  assessedById: string;
  assessmentDate: string;
  pushUps: number;
  sitUps: number;
  twoMileRun: string;
  bodyWeight: number;
  bodyFatPercentage: number;
  overallScore: number;
  notes: string;
  improvementPlan: string;
  createdAt: string;
}

interface Cadet {
  id: string;
  firstName: string;
  lastName: string;
}

const assessmentFormSchema = z.object({
  cadetId: z.string().min(1, "Cadet is required"),
  assessmentDate: z.string().min(1, "Assessment date is required"),
  pushUps: z.number().min(0, "Push-ups must be a positive number"),
  sitUps: z.number().min(0, "Sit-ups must be a positive number"),
  twoMileRun: z.string().min(1, "Two-mile run time is required"),
  bodyWeight: z.number().min(0, "Body weight must be a positive number"),
  bodyFatPercentage: z.number().min(0).max(100, "Body fat percentage must be between 0-100"),
  overallScore: z.number().min(0).max(100, "Overall score must be between 0-100"),
  notes: z.string().optional(),
  improvementPlan: z.string().optional(),
});

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-blue-100 text-blue-800";
  if (score >= 70) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

export default function PhysicalFitness() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const form = useForm<z.infer<typeof assessmentFormSchema>>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      cadetId: "",
      assessmentDate: "",
      pushUps: 0,
      sitUps: 0,
      twoMileRun: "",
      bodyWeight: 0,
      bodyFatPercentage: 0,
      overallScore: 0,
      notes: "",
      improvementPlan: "",
    },
  });

  const { data: assessments, isLoading } = useQuery<FitnessAssessment[]>({
    queryKey: ["/api/fitness-assessments"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/fitness-assessments?cadetId=all");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: cadets } = useQuery<Cadet[]>({
    queryKey: ["/api/cadets"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/cadets");
      return response.json();
    },
    enabled: !!user,
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assessmentFormSchema>) => {
      const response = await authenticatedFetch("/api/fitness-assessments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          assessedById: user?.id,
          assessmentDate: new Date(data.assessmentDate).toISOString(),
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness-assessments"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Assessment recorded",
        description: "The fitness assessment has been successfully recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record assessment.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof assessmentFormSchema>) => {
    createAssessmentMutation.mutate(data);
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

  const filteredAssessments = assessments?.filter(assessment => {
    if (!searchQuery) return true;
    const cadet = cadets?.find(c => c.id === assessment.cadetId);
    return cadet && 
      `${cadet.firstName} ${cadet.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Physical Fitness</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Physical Fitness</span>
              </nav>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-new-assessment">
                  <Plus className="mr-2" size={16} />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Fitness Assessment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cadetId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cadet</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-cadet">
                                  <SelectValue placeholder="Select a cadet" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cadets?.map((cadet) => (
                                  <SelectItem key={cadet.id} value={cadet.id}>
                                    {cadet.firstName} {cadet.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="assessmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                data-testid="input-assessment-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pushUps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Push-ups</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-push-ups"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sitUps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sit-ups</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-sit-ups"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twoMileRun"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>2-Mile Run (MM:SS)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="15:30"
                                {...field}
                                data-testid="input-two-mile-run"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bodyWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Weight (lbs)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-body-weight"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bodyFatPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Body Fat %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-body-fat"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="overallScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Score</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-overall-score"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Assessment notes..."
                              {...field}
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="improvementPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Improvement Plan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Recommended improvements..."
                              {...field}
                              data-testid="textarea-improvement-plan"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel-assessment"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy-600 hover:bg-navy-700"
                        disabled={createAssessmentMutation.isPending}
                        data-testid="button-submit-assessment"
                      >
                        {createAssessmentMutation.isPending ? "Recording..." : "Record Assessment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Fitness Metrics Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Push-ups</p>
                    <p className="text-2xl font-bold text-foreground">47</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp size={14} className="mr-1" />
                      +8% this month
                    </p>
                  </div>
                  <Dumbbell className="text-navy-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Sit-ups</p>
                    <p className="text-2xl font-bold text-foreground">52</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp size={14} className="mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <Dumbbell className="text-military-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Run Time</p>
                    <p className="text-2xl font-bold text-foreground">16:23</p>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <TrendingDown size={14} className="mr-1" />
                      -45s this month
                    </p>
                  </div>
                  <Dumbbell className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-foreground">83</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp size={14} className="mr-1" />
                      +5% this month
                    </p>
                  </div>
                  <Dumbbell className="text-academy-gold" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="text-navy-600" />
                Fitness Assessments
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search by cadet name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-assessments"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading assessments...</p>
                </div>
              ) : !filteredAssessments || filteredAssessments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="mx-auto mb-4" size={48} />
                  <p>No fitness assessments found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cadet</TableHead>
                        <TableHead>Push-ups</TableHead>
                        <TableHead>Sit-ups</TableHead>
                        <TableHead>2-Mile Run</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => {
                        const cadet = cadets?.find(c => c.id === assessment.cadetId);
                        return (
                          <TableRow key={assessment.id} data-testid={`assessment-row-${assessment.id}`}>
                            <TableCell>
                              {new Date(assessment.assessmentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {cadet ? `${cadet.firstName} ${cadet.lastName}` : `Cadet ${assessment.cadetId.slice(-4)}`}
                            </TableCell>
                            <TableCell>{assessment.pushUps}</TableCell>
                            <TableCell>{assessment.sitUps}</TableCell>
                            <TableCell>{assessment.twoMileRun}</TableCell>
                            <TableCell>
                              <Badge className={getScoreColor(assessment.overallScore)}>
                                {assessment.overallScore}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-view-assessment-${assessment.id}`}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-edit-assessment-${assessment.id}`}
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
