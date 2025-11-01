import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "@/pages/dashboard";
import CadetManagement from "@/pages/cadet-management";
import BehaviorTracking from "@/pages/behavior-tracking";
import PhysicalFitness from "@/pages/physical-fitness";
import MentorshipProgram from "@/pages/mentorship-program";
import CareerPathways from "@/pages/career-pathways";
import StaffManagement from "@/pages/staff-management";
import Communications from "@/pages/communications";
import AnalyticsReports from "@/pages/analytics-reports";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import AcademicTimetable from "@/pages/academic-timetable";
import AssignmentManagement from "@/pages/assignment-management";
import MockTests from "@/pages/mock-tests";
import ClassDiary from "@/pages/class-diary";
import AIInsights from "@/pages/ai-insights";
import MentorDashboard from "@/pages/mentor-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/cadet-management" component={CadetManagement} />
      <Route path="/behavior-tracking" component={BehaviorTracking} />
      <Route path="/physical-fitness" component={PhysicalFitness} />
      <Route path="/mentorship-program" component={MentorshipProgram} />
      <Route path="/career-pathways" component={CareerPathways} />
      <Route path="/staff-management" component={StaffManagement} />
      <Route path="/communications" component={Communications} />
      <Route path="/analytics-reports" component={AnalyticsReports} />
      <Route path="/academic-timetable" component={AcademicTimetable} />
      <Route path="/assignment-management" component={AssignmentManagement} />
      <Route path="/mock-tests" component={MockTests} />
      <Route path="/class-diary" component={ClassDiary} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/mentor-dashboard" component={MentorDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
