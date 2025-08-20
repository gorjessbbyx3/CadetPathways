import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar,
  Clock,
  BookOpen,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  User,
  CalendarDays
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
import type { ClassDiaryEntry } from "@shared/schema";
import SidebarNavigation from "@/components/ui/sidebar-navigation";

const classDiarySchema = z.object({
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  content: z.string().min(1, "Content is required"),
  homework: z.string().optional(),
  announcements: z.string().optional(),
  attendance: z.string().optional(),
});

type ClassDiaryFormData = z.infer<typeof classDiarySchema>;

export default function ClassDiary() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ClassDiaryEntry | null>(null);
  const queryClient = useQueryClient();

  // Fetch class diary entries
  const { data: diaryEntries = [], isLoading } = useQuery<ClassDiaryEntry[]>({
    queryKey: ["/api/class-diary"],
  });

  // Create diary entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: ClassDiaryFormData) => {
      return await apiRequest("/api/class-diary", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class-diary"] });
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Class diary entry created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create diary entry",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ClassDiaryFormData>({
    resolver: zodResolver(classDiarySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      subject: "",
      topic: "",
      content: "",
      homework: "",
      announcements: "",
      attendance: "",
    },
  });

  const onSubmit = (data: ClassDiaryFormData) => {
    createEntryMutation.mutate(data);
  };

  const filteredEntries = diaryEntries.filter((entry) => {
    if (selectedSubject !== "all" && entry.subject !== selectedSubject) return false;
    if (selectedDate && entry.date !== selectedDate) return false;
    if (searchQuery && !entry.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Class Diary</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Academic</span> / <span className="text-foreground font-medium">Class Diary</span>
              </nav>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700">
                  <Plus className="mr-2" size={16} />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Class Diary Entry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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

                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic/Lesson Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter lesson topic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lesson Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what was covered in today's lesson"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="homework"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Homework Assignment (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter homework details if any"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="announcements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Announcements (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any class announcements or important notes"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendance Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 25/30 present" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createEntryMutation.isPending}>
                        {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
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
                  placeholder="Search by topic..."
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
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
              placeholder="Filter by date"
            />
          </div>
        </div>

        {/* Diary Entries */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{entry.topic}</CardTitle>
                          <Badge className={getSubjectColor(entry.subject)}>
                            {entry.subject}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarDays className="mr-1" size={14} />
                            {formatDate(entry.date)}
                          </div>
                          {entry.attendance && (
                            <div className="flex items-center">
                              <Users className="mr-1" size={14} />
                              {entry.attendance}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2" size={14} />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2" size={14} />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Lesson Content */}
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                          <BookOpen className="mr-2" size={14} />
                          Lesson Content
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {entry.content}
                        </p>
                      </div>

                      {/* Homework */}
                      {entry.homework && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                            <MessageSquare className="mr-2" size={14} />
                            Homework
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {entry.homework}
                          </p>
                        </div>
                      )}

                      {/* Announcements */}
                      {entry.announcements && (
                        <div>
                          <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center">
                            <MessageSquare className="mr-2" size={14} />
                            Announcements
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {entry.announcements}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No diary entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedSubject !== "all" || selectedDate
                  ? "Try adjusting your filters" 
                  : "Start documenting your class activities"}
              </p>
              {searchQuery || selectedSubject !== "all" || selectedDate ? (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject("all");
                  setSelectedDate("");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2" size={16} />
                  Add First Entry
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}