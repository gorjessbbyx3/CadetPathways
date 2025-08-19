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
import { AlertTriangle, Plus, Eye, Edit, Search, Calendar } from "lucide-react";

interface BehaviorIncident {
  id: string;
  cadetId: string;
  reportedById: string;
  incidentType: string;
  severity: string;
  description: string;
  location: string;
  dateOccurred: string;
  actionTaken: string;
  followUpRequired: boolean;
  followUpDate: string;
  status: string;
  createdAt: string;
}

interface Cadet {
  id: string;
  firstName: string;
  lastName: string;
}

const incidentFormSchema = z.object({
  cadetId: z.string().min(1, "Cadet is required"),
  incidentType: z.string().min(1, "Incident type is required"),
  severity: z.string().min(1, "Severity is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  dateOccurred: z.string().min(1, "Date occurred is required"),
  actionTaken: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
});

const severityColors = {
  minor: "bg-yellow-100 text-yellow-800",
  major: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-red-100 text-red-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-purple-100 text-purple-800",
};

export default function BehaviorTracking() {
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

  const form = useForm<z.infer<typeof incidentFormSchema>>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      cadetId: "",
      incidentType: "",
      severity: "",
      description: "",
      location: "",
      dateOccurred: "",
      actionTaken: "",
      followUpRequired: false,
      followUpDate: "",
    },
  });

  const { data: incidents, isLoading } = useQuery<BehaviorIncident[]>({
    queryKey: ["/api/behavior-incidents", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await authenticatedFetch(`/api/behavior-incidents?${params}`);
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

  const createIncidentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof incidentFormSchema>) => {
      const response = await authenticatedFetch("/api/behavior-incidents", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          reportedById: user?.id,
          dateOccurred: new Date(data.dateOccurred).toISOString(),
          followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/behavior-incidents"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Incident recorded",
        description: "The behavior incident has been successfully recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record incident.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof incidentFormSchema>) => {
    createIncidentMutation.mutate(data);
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

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Behavior Tracking</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Behavior Tracking</span>
              </nav>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-record-incident">
                  <Plus className="mr-2" size={16} />
                  Record Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Behavior Incident</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      name="incidentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incident Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-incident-type">
                                <SelectValue placeholder="Select incident type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="late">Late for Formation</SelectItem>
                              <SelectItem value="insubordination">Insubordination</SelectItem>
                              <SelectItem value="fighting">Fighting</SelectItem>
                              <SelectItem value="disrespect">Disrespectful Behavior</SelectItem>
                              <SelectItem value="uniform">Uniform Violation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-severity">
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minor">Minor</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOccurred"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Occurred</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              data-testid="input-date-occurred"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Where did this occur?"
                              {...field}
                              data-testid="input-location"
                            />
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
                            <Textarea
                              placeholder="Describe what happened..."
                              {...field}
                              data-testid="textarea-description"
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
                        data-testid="button-cancel-incident"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy-600 hover:bg-navy-700"
                        disabled={createIncidentMutation.isPending}
                        data-testid="button-submit-incident"
                      >
                        {createIncidentMutation.isPending ? "Recording..." : "Record Incident"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" />
                Behavior Incidents
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search incidents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-incidents"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading incidents...</p>
                </div>
              ) : !incidents || incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="mx-auto mb-4" size={48} />
                  <p>No behavior incidents found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cadet</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.map((incident) => (
                        <TableRow key={incident.id} data-testid={`incident-row-${incident.id}`}>
                          <TableCell>
                            {new Date(incident.dateOccurred).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            Cadet {incident.cadetId.slice(-4)}
                          </TableCell>
                          <TableCell>{incident.incidentType}</TableCell>
                          <TableCell>
                            <Badge className={severityColors[incident.severity as keyof typeof severityColors]}>
                              {incident.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[incident.status as keyof typeof statusColors]}>
                              {incident.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{incident.location || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-view-incident-${incident.id}`}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-edit-incident-${incident.id}`}
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
