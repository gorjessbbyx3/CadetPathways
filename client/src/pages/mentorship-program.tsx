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
import { Handshake, Plus, Eye, Edit, Search, Users, Calendar, Heart } from "lucide-react";

interface Mentorship {
  id: string;
  mentorId: string;
  cadetId: string;
  startDate: string;
  endDate: string;
  status: string;
  meetingFrequency: string;
  goals: any;
  notes: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface Cadet {
  id: string;
  firstName: string;
  lastName: string;
}

const mentorshipFormSchema = z.object({
  mentorId: z.string().min(1, "Mentor is required"),
  cadetId: z.string().min(1, "Cadet is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  meetingFrequency: z.string().min(1, "Meeting frequency is required"),
  goals: z.string().optional(),
  notes: z.string().optional(),
});

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  terminated: "bg-red-100 text-red-800",
};

const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function MentorshipProgram() {
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

  const form = useForm<z.infer<typeof mentorshipFormSchema>>({
    resolver: zodResolver(mentorshipFormSchema),
    defaultValues: {
      mentorId: "",
      cadetId: "",
      startDate: "",
      endDate: "",
      meetingFrequency: "",
      goals: "",
      notes: "",
    },
  });

  const { data: mentorships, isLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/mentorships"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/mentorships");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: staff } = useQuery<User[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/staff");
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

  const createMentorshipMutation = useMutation({
    mutationFn: async (data: z.infer<typeof mentorshipFormSchema>) => {
      const response = await authenticatedFetch("/api/mentorships", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          goals: data.goals ? [{ description: data.goals, completed: false }] : [],
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentorships"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Mentorship created",
        description: "The mentorship pairing has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mentorship.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof mentorshipFormSchema>) => {
    createMentorshipMutation.mutate(data);
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

  const mentors = staff?.filter(s => s.role === "mentor" || s.role === "instructor");
  const activeMentorships = mentorships?.filter(m => m.status === "active") || [];
  const totalMentors = mentors?.length || 0;
  const totalCadets = cadets?.length || 0;
  const participationRate = totalCadets > 0 ? Math.round((activeMentorships.length / totalCadets) * 100) : 0;

  const filteredMentorships = mentorships?.filter(mentorship => {
    if (!searchQuery) return true;
    const mentor = mentors?.find(m => m.id === mentorship.mentorId);
    const cadet = cadets?.find(c => c.id === mentorship.cadetId);
    return mentor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           cadet && `${cadet.firstName} ${cadet.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mentorship Program</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Mentorship Program</span>
              </nav>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-create-mentorship">
                  <Plus className="mr-2" size={16} />
                  Create Mentorship
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Mentorship Pairing</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mentorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mentor</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-mentor">
                                <SelectValue placeholder="Select a mentor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mentors?.map((mentor) => (
                                <SelectItem key={mentor.id} value={mentor.id}>
                                  {mentor.name} ({mentor.role})
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
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-end-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meetingFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-frequency">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {frequencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Goals</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What are the goals for this mentorship?"
                              {...field}
                              data-testid="textarea-goals"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about this pairing..."
                              {...field}
                              data-testid="textarea-notes"
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
                        data-testid="button-cancel-mentorship"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy-600 hover:bg-navy-700"
                        disabled={createMentorshipMutation.isPending}
                        data-testid="button-submit-mentorship"
                      >
                        {createMentorshipMutation.isPending ? "Creating..." : "Create Mentorship"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Mentorships</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-active-mentorships">
                      {activeMentorships.length}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Heart size={14} className="mr-1" />
                      Currently paired
                    </p>
                  </div>
                  <Handshake className="text-navy-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Mentors</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-available-mentors">
                      {totalMentors}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Users size={14} className="mr-1" />
                      Staff members
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
                    <p className="text-sm font-medium text-muted-foreground">Participation Rate</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-participation-rate">
                      {participationRate}%
                    </p>
                    <p className="text-sm text-academy-gold flex items-center mt-1">
                      <Calendar size={14} className="mr-1" />
                      Cadet engagement
                    </p>
                  </div>
                  <Calendar className="text-academy-gold" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="text-navy-600" />
                Mentorship Pairings
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search mentorships..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-mentorships"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading mentorships...</p>
                </div>
              ) : !filteredMentorships || filteredMentorships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake className="mx-auto mb-4" size={48} />
                  <p>No mentorships found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mentor</TableHead>
                        <TableHead>Cadet</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMentorships.map((mentorship) => {
                        const mentor = mentors?.find(m => m.id === mentorship.mentorId);
                        const cadet = cadets?.find(c => c.id === mentorship.cadetId);
                        return (
                          <TableRow key={mentorship.id} data-testid={`mentorship-row-${mentorship.id}`}>
                            <TableCell className="font-medium">
                              {mentor?.name || `Mentor ${mentorship.mentorId.slice(-4)}`}
                            </TableCell>
                            <TableCell>
                              {cadet ? `${cadet.firstName} ${cadet.lastName}` : `Cadet ${mentorship.cadetId.slice(-4)}`}
                            </TableCell>
                            <TableCell>
                              {new Date(mentorship.startDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="capitalize">{mentorship.meetingFrequency}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[mentorship.status as keyof typeof statusColors]}>
                                {mentorship.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-view-mentorship-${mentorship.id}`}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  data-testid={`button-edit-mentorship-${mentorship.id}`}
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
