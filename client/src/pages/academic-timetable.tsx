import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AcademicSchedule {
  id: number;
  cadetId: number;
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  instructorId: string;
  location: string;
  semester: string;
  isActive: boolean;
  createdAt: string;
}

export default function AcademicTimetable() {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch schedules for the selected day
  const { data: schedules = [], isLoading } = useQuery<AcademicSchedule[]>({
    queryKey: ["/api/academic-schedules", selectedDay],
    queryFn: async () => {
      const response = await apiRequest(`/api/academic-schedules?dayOfWeek=${selectedDay}`);
      return response as AcademicSchedule[];
    },
  });

  // Fetch all cadets for the form
  const { data: cadets = [] } = useQuery<any[]>({
    queryKey: ["/api/cadets"],
    queryFn: async () => {
      const response = await apiRequest("/api/cadets");
      return response as any[];
    },
  });

  // Fetch all staff for the form
  const { data: staff = [] } = useQuery<any[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await apiRequest("/api/staff");
      return response as any[];
    },
  });

  // Add schedule mutation
  const addScheduleMutation = useMutation({
    mutationFn: (scheduleData: any) => apiRequest("/api/academic-schedules", "POST", scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic-schedules"] });
      setShowAddDialog(false);
    },
  });

  const handleAddSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scheduleData = {
      cadetId: parseInt(formData.get("cadetId") as string),
      dayOfWeek: formData.get("dayOfWeek") as string,
      timeSlot: formData.get("timeSlot") as string,
      subject: formData.get("subject") as string,
      instructorId: formData.get("instructorId") as string,
      location: formData.get("location") as string,
      semester: formData.get("semester") as string,
      isActive: true,
    };
    addScheduleMutation.mutate(scheduleData);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const groupedSchedules = schedules.reduce((acc: any, schedule: AcademicSchedule) => {
    const key = `${schedule.timeSlot}-${schedule.subject}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(schedule);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Timetable</h1>
          <p className="text-muted-foreground">
            Manage class schedules and academic timetables for cadets
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Schedule Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cadetId">Cadet</Label>
                  <Select name="cadetId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cadet" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadets.map((cadet: any) => (
                        <SelectItem key={cadet.id} value={cadet.id.toString()}>
                          {cadet.firstName} {cadet.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select name="dayOfWeek" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select name="timeSlot" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input name="subject" placeholder="Mathematics, English, etc." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select name="instructorId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter((s: any) => s.role === 'instructor').map((instructor: any) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input name="location" placeholder="Classroom A, Lab 1, etc." required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input name="semester" placeholder="Fall 2024, Spring 2025, etc." required />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addScheduleMutation.isPending}>
                  {addScheduleMutation.isPending ? "Adding..." : "Add Schedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day Selection
          </CardTitle>
          <CardDescription>Choose a day to view the timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {selectedDay} Schedule
          </CardTitle>
          <CardDescription>Academic schedule for {selectedDay}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading schedule...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No classes scheduled for {selectedDay}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cadets</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedSchedules).map(([key, scheduleGroup]: [string, any]) => {
                  const mainSchedule = scheduleGroup[0];
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{mainSchedule.timeSlot}</TableCell>
                      <TableCell>{mainSchedule.subject}</TableCell>
                      <TableCell>{mainSchedule.instructorId}</TableCell>
                      <TableCell>{mainSchedule.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {scheduleGroup.length} cadet{scheduleGroup.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={mainSchedule.isActive ? "default" : "secondary"}>
                          {mainSchedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}