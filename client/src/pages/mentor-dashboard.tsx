import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Calendar, CheckSquare, AlertCircle, Plus, Clock, 
  ListTodo, MessageSquare, FileText, Bell, Target, TrendingUp,
  AlertTriangle, CheckCircle, CircleDot
} from "lucide-react";
import { insertTaskSchema, insertMeetingLogSchema, insertSharedNoteSchema, type Task, type MeetingLog, type SharedNote, type Notification, type Mentorship, type Cadet } from "@shared/schema";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";

export default function MentorDashboard() {
  const { toast } = useToast();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const { data: mentorships = [], isLoading: mentorshipsLoading } = useQuery<Mentorship[]>({
    queryKey: ["/api/mentorships"],
  });

  const { data: cadets = [] } = useQuery<Cadet[]>({
    queryKey: ["/api/cadets"],
  });

  const { data: tasksToday = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/today"],
  });

  const { data: overdueTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/overdue"],
  });

  const { data: pendingTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/pending"],
  });

  const { data: recentMeetings = [] } = useQuery<MeetingLog[]>({
    queryKey: ["/api/meeting-logs"],
  });

  const { data: urgentNotes = [] } = useQuery<SharedNote[]>({
    queryKey: ["/api/shared-notes/urgent"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/unread"],
  });

  const activeMentorships = mentorships.filter((m: Mentorship) => m.status === "active");

  const getMenteeById = (id: number) => cadets.find((c: Cadet) => c.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-mentor-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="heading-mentor-dashboard">
            Mentor Operations Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Coordinate your team, track progress, and stay connected
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-task" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <QuickTaskForm onClose={() => setShowTaskDialog(false)} cadets={cadets} />
            </DialogContent>
          </Dialog>

          <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-log-meeting" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Log Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <QuickMeetingForm onClose={() => setShowMeetingDialog(false)} mentorships={activeMentorships} cadets={cadets} />
            </DialogContent>
          </Dialog>

          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-note">
                <FileText className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <QuickNoteForm onClose={() => setShowNoteDialog(false)} cadets={cadets} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-mentees">{activeMentorships.length}</div>
            <p className="text-xs text-muted-foreground">Currently under your guidance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-tasks-today">{tasksToday.length}</div>
            <p className="text-xs text-muted-foreground">Due by end of day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-overdue">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-notifications">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Team notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Daily Actions & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Action Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Action Center
              </CardTitle>
              <CardDescription>Your priorities for today</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today" data-testid="tab-tasks-today">Today ({tasksToday.length})</TabsTrigger>
                  <TabsTrigger value="overdue" data-testid="tab-tasks-overdue">Overdue ({overdueTasks.length})</TabsTrigger>
                  <TabsTrigger value="pending" data-testid="tab-tasks-pending">Pending ({pendingTasks.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="space-y-3 mt-4">
                  {tasksToday.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No tasks due today. Great job!</p>
                    </div>
                  ) : (
                    tasksToday.map((task: Task) => (
                      <TaskCard key={task.id} task={task} mentee={getMenteeById(task.cadetId!)} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="overdue" className="space-y-3 mt-4">
                  {overdueTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No overdue tasks!</p>
                    </div>
                  ) : (
                    overdueTasks.map((task: Task) => (
                      <TaskCard key={task.id} task={task} mentee={getMenteeById(task.cadetId!)} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 mt-4">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending tasks</p>
                    </div>
                  ) : (
                    pendingTasks.map((task: Task) => (
                      <TaskCard key={task.id} task={task} mentee={getMenteeById(task.cadetId!)} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Mentor Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent meetings logged</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeetings.slice(0, 5).map((meeting: MeetingLog) => {
                    const mentee = getMenteeById(meeting.cadetId);
                    return (
                      <div key={meeting.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700" data-testid={`meeting-log-${meeting.id}`}>
                        <CircleDot className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {mentee ? `${mentee.firstName} ${mentee.lastName}` : "Unknown Cadet"}
                            </p>
                            {meeting.cadetMood && <Badge variant="outline">{meeting.cadetMood}</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {meeting.summary || meeting.progressNotes || "No summary"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {format(new Date(meeting.meetingDate), "MMM dd, yyyy")} • {meeting.duration || 0} min
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Team Updates & Alerts */}
        <div className="space-y-6">
          {/* Urgent Team Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Urgent Team Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No urgent notes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentNotes.slice(0, 5).map((note: SharedNote) => {
                    const mentee = getMenteeById(note.cadetId!);
                    return (
                      <div key={note.id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800" data-testid={`urgent-note-${note.id}`}>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                          <div className="flex-1">
                            {mentee && (
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {mentee.firstName} {mentee.lastName}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {note.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Mentees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Mentees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeMentorships.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active mentorships</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeMentorships.map((mentorship: Mentorship) => {
                    const mentee = getMenteeById(mentorship.cadetId);
                    if (!mentee) return null;
                    return (
                      <div key={mentorship.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={`mentee-card-${mentee.id}`}>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {mentee.firstName} {mentee.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {mentorship.status}
                          </p>
                        </div>
                        <Badge variant="secondary">{mentee.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification: Notification) => (
                    <div key={notification.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700" data-testid={`notification-${notification.id}`}>
                      <div className="flex items-start gap-2">
                        <div className={`h-2 w-2 rounded-full mt-2 ${notification.priority === "high" ? "bg-red-500" : notification.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, mentee }: { task: Task; mentee: Cadet | undefined }) {
  const { toast } = useToast();

  const updateTaskStatus = async (status: string) => {
    try {
      await apiRequest(`/api/tasks/${task.id}`, "PATCH", { status });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/pending"] });
      toast({ title: "Task updated successfully" });
    } catch (error: any) {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700" data-testid={`task-${task.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority} priority
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
          {mentee && <span>{mentee.firstName} {mentee.lastName}</span>}
          {task.dueDate && <span>Due: {format(new Date(task.dueDate), "MMM dd")}</span>}
        </div>
      </div>
      {task.status !== "completed" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateTaskStatus(task.status === "pending" ? "in-progress" : "completed")}
          data-testid={`button-update-task-${task.id}`}
        >
          {task.status === "pending" ? "Start" : "Complete"}
        </Button>
      )}
    </div>
  );
}

function QuickTaskForm({ onClose, cadets }: { onClose: () => void; cadets: Cadet[] }) {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const form = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]),
      status: z.enum(["pending", "in-progress", "completed"]),
      dueDate: z.string(),
      cadetId: z.string().optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium" as const,
      status: "pending" as const,
      dueDate: new Date().toISOString().split("T")[0],
      cadetId: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        ...data,
        assignedToId: user.id,
        cadetId: data.cadetId ? parseInt(data.cadetId) : undefined,
        dueDate: new Date(data.dueDate),
      };
      
      await apiRequest("/api/tasks", "POST", payload);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/pending"] });
      toast({ title: "Task created successfully" });
      onClose();
    } catch (error: any) {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a task to track mentor activities</DialogDescription>
        </DialogHeader>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="E.g., Follow up on behavior incident" data-testid="input-task-title" />
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
                <Textarea {...field} placeholder="Additional details..." data-testid="input-task-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-priority">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-task-due-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cadetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Cadet (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-task-cadet">
                    <SelectValue placeholder="Select a cadet..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cadets.map((cadet: Cadet) => (
                    <SelectItem key={cadet.id} value={cadet.id.toString()}>
                      {cadet.firstName} {cadet.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" data-testid="button-submit-task">Create Task</Button>
        </div>
      </form>
    </Form>
  );
}

function QuickMeetingForm({ onClose, mentorships, cadets }: { onClose: () => void; mentorships: Mentorship[]; cadets: Cadet[] }) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(z.object({
      mentorshipId: z.string().min(1, "Mentorship is required"),
      cadetId: z.string().min(1, "Cadet is required"),
      meetingDate: z.string(),
      duration: z.string().optional(),
      summary: z.string().optional(),
      cadetMood: z.string().optional(),
    })),
    defaultValues: {
      mentorshipId: "",
      cadetId: "",
      meetingDate: new Date().toISOString().split("T")[0],
      duration: "30",
      summary: "",
      cadetMood: "neutral",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        mentorId: user.id,
        cadetId: parseInt(data.cadetId),
        mentorshipId: parseInt(data.mentorshipId),
        meetingDate: new Date(data.meetingDate),
        duration: data.duration ? parseInt(data.duration) : undefined,
        summary: data.summary || undefined,
        cadetMood: data.cadetMood || undefined,
      };
      
      await apiRequest("/api/meeting-logs", "POST", payload);
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-logs"] });
      toast({ title: "Meeting logged successfully" });
      onClose();
    } catch (error: any) {
      toast({ title: "Error logging meeting", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Log Mentor Session</DialogTitle>
          <DialogDescription>Record details of your mentor meeting</DialogDescription>
        </DialogHeader>
        
        <FormField
          control={form.control}
          name="mentorshipId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-meeting-mentorship">
                    <SelectValue placeholder="Select mentee..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mentorships.map((mentorship: Mentorship) => {
                    const cadet = cadets.find((c: Cadet) => c.id === mentorship.cadetId);
                    return (
                      <SelectItem key={mentorship.id} value={mentorship.id.toString()}>
                        {cadet ? `${cadet.firstName} ${cadet.lastName}` : "Unknown"}
                      </SelectItem>
                    );
                  })}
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
                  <SelectTrigger data-testid="select-meeting-cadet">
                    <SelectValue placeholder="Select cadet..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cadets.map((cadet: Cadet) => (
                    <SelectItem key={cadet.id} value={cadet.id.toString()}>
                      {cadet.firstName} {cadet.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cadetMood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cadet Mood</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-cadet-mood">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="concerned">Concerned</SelectItem>
                    <SelectItem value="distressed">Distressed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (min)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} data-testid="input-meeting-duration" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="meetingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="input-meeting-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Summary</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="What was discussed? Any progress or concerns?" rows={4} data-testid="input-meeting-summary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" data-testid="button-submit-meeting">Log Meeting</Button>
        </div>
      </form>
    </Form>
  );
}

function QuickNoteForm({ onClose, cadets }: { onClose: () => void; cadets: Cadet[] }) {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertSharedNoteSchema),
    defaultValues: {
      content: "",
      isUrgent: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        ...data,
        authorId: user.id,
        cadetId: data.cadetId ? parseInt(data.cadetId) : undefined,
      };
      
      await apiRequest("/api/shared-notes", "POST", payload);
      queryClient.invalidateQueries({ queryKey: ["/api/shared-notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shared-notes/urgent"] });
      toast({ title: "Note added successfully" });
      onClose();
    } catch (error: any) {
      toast({ title: "Error adding note", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add Team Note</DialogTitle>
          <DialogDescription>Share information with the entire team</DialogDescription>
        </DialogHeader>
        
        <FormField
          control={form.control}
          name="cadetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Cadet (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-note-cadet">
                    <SelectValue placeholder="Select a cadet..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cadets.map((cadet: Cadet) => (
                    <SelectItem key={cadet.id} value={cadet.id.toString()}>
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Content</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Share observations, concerns, or important information..." 
                  rows={6}
                  data-testid="input-note-content"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isUrgent"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Mark as Urgent</FormLabel>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Urgent notes will be highlighted for all team members
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-note-urgent"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" data-testid="button-submit-note">Add Note</Button>
        </div>
      </form>
    </Form>
  );
}
