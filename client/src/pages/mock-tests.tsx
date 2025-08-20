import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Clock,
  FileText,
  Users,
  Plus,
  Search,
  Filter,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  Play,
  BarChart3,
  Timer,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MockTest } from "@shared/schema";
import SidebarNavigation from "@/components/ui/sidebar-navigation";

const mockTestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.string().min(1, "Subject is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.number().min(1, "Must have at least 1 question"),
  passingScore: z.number().min(0).max(100, "Passing score must be between 0-100"),
  instructions: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type MockTestFormData = z.infer<typeof mockTestSchema>;

export default function MockTests() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const queryClient = useQueryClient();

  // Fetch mock tests
  const { data: mockTests = [], isLoading } = useQuery<MockTest[]>({
    queryKey: ["/api/mock-tests"],
  });

  // Create mock test mutation
  const createTestMutation = useMutation({
    mutationFn: async (data: MockTestFormData) => {
      return await apiRequest("/api/mock-tests", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-tests"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Mock test created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create mock test",
        variant: "destructive",
      });
    },
  });

  const form = useForm<MockTestFormData>({
    resolver: zodResolver(mockTestSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      duration: 60,
      totalQuestions: 10,
      passingScore: 70,
      instructions: "",
      scheduledDate: "",
    },
  });

  const onSubmit = (data: MockTestFormData) => {
    createTestMutation.mutate(data);
  };

  const filteredTests = mockTests.filter((test) => {
    if (selectedSubject !== "all" && test.subject !== selectedSubject) return false;
    if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (test: MockTest) => {
    if (!test.scheduledDate) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    
    const now = new Date();
    const scheduledDate = new Date(test.scheduledDate);
    const endTime = new Date(scheduledDate.getTime() + test.duration * 60000);
    
    if (endTime < now) {
      return <Badge variant="outline">Completed</Badge>;
    } else if (scheduledDate <= now && now < endTime) {
      return <Badge variant="default" className="bg-green-600">Active</Badge>;
    } else {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      "Mathematics": "bg-blue-100 text-blue-800",
      "English": "bg-green-100 text-green-800",
      "Science": "bg-purple-100 text-purple-800",
      "History": "bg-orange-100 text-orange-800",
      "Physical Education": "bg-red-100 text-red-800",
      "Leadership": "bg-yellow-100 text-yellow-800",
    };
    return colors[subject as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyIcon = (score: number) => {
    if (score >= 80) return <Trophy className="text-yellow-500" size={16} />;
    if (score >= 60) return <BarChart3 className="text-orange-500" size={16} />;
    return <Timer className="text-red-500" size={16} />;
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mock Tests</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Academic</span> / <span className="text-foreground font-medium">Mock Tests</span>
              </nav>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700">
                  <Plus className="mr-2" size={16} />
                  Create Mock Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Mock Test</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter test title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Science">Science</SelectItem>
                                <SelectItem value="History">History</SelectItem>
                                <SelectItem value="Physical Education">Physical Education</SelectItem>
                                <SelectItem value="Leadership">Leadership</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="totalQuestions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Questions</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="10" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passingScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passing Score (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="70" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of the test" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Test instructions for cadets" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTestMutation.isPending}>
                        {createTestMutation.isPending ? "Creating..." : "Create Test"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Physical Education">Physical Education</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tests Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center">
                          {test.title}
                          <span className="ml-2">{getDifficultyIcon(test.passingScore)}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSubjectColor(test.subject)}>
                            {test.subject}
                          </Badge>
                          {getStatusBadge(test)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {test.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2" size={14} />
                        Duration: {test.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="mr-2" size={14} />
                        Questions: {test.totalQuestions}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Trophy className="mr-2" size={14} />
                        Passing: {test.passingScore}%
                      </div>
                      {test.scheduledDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Timer className="mr-2" size={14} />
                          {new Date(test.scheduledDate).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2" size={14} />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2" size={14} />
                        Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredTests.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No mock tests found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedSubject !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters" 
                  : "Create your first mock test to get started"}
              </p>
              {searchQuery || selectedSubject !== "all" || selectedStatus !== "all" ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject("all");
                  setSelectedStatus("all");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2" size={16} />
                  Create Mock Test
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}