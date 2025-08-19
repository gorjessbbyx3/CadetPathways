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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedFetch } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Bus, Plus, Eye, Edit, Search, Users, Shield, Award, Clock } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

const roleColors = {
  administrator: "bg-red-100 text-red-800",
  instructor: "bg-blue-100 text-blue-800",
  mentor: "bg-green-100 text-green-800",
  parent: "bg-gray-100 text-gray-800",
};

const roleOptions = [
  { value: "administrator", label: "Administrator" },
  { value: "instructor", label: "Instructor" },
  { value: "mentor", label: "Mentor" },
];

export default function StaffManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  const { data: staff, isLoading } = useQuery<User[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/staff");
      return response.json();
    },
    enabled: !!user,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      const response = await authenticatedFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Staff member added",
        description: "The new staff member has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff member.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
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

  if (user.role !== "administrator") {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarNavigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Shield className="mx-auto mb-4 text-red-500" size={48} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access staff management.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeStaff = staff?.filter(s => s.isActive) || [];
  const administrators = activeStaff.filter(s => s.role === "administrator");
  const instructors = activeStaff.filter(s => s.role === "instructor");
  const mentors = activeStaff.filter(s => s.role === "mentor");

  const filteredStaff = staff?.filter(member => {
    const matchesSearch = searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Staff Management</span>
              </nav>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-add-staff">
                  <Plus className="mr-2" size={16} />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((option) => (
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temporary Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter temporary password"
                              {...field}
                              data-testid="input-password"
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
                        data-testid="button-cancel-staff"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy-600 hover:bg-navy-700"
                        disabled={createUserMutation.isPending}
                        data-testid="button-submit-staff"
                      >
                        {createUserMutation.isPending ? "Adding..." : "Add Staff Member"}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-staff">
                      {activeStaff.length}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Users size={14} className="mr-1" />
                      Active members
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
                    <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-administrators">
                      {administrators.length}
                    </p>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <Shield size={14} className="mr-1" />
                      System admins
                    </p>
                  </div>
                  <Shield className="text-red-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Instructors</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-instructors">
                      {instructors.length}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Award size={14} className="mr-1" />
                      Teaching staff
                    </p>
                  </div>
                  <Award className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mentors</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-mentors">
                      {mentors.length}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Bus size={14} className="mr-1" />
                      Mentoring staff
                    </p>
                  </div>
                  <Bus className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="text-navy-600" />
                Staff Directory
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search staff by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-staff"
                    />
                  </div>
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                  data-testid="select-role-filter"
                >
                  <option value="all">All Roles</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading staff...</p>
                </div>
              ) : !filteredStaff || filteredStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bus className="mx-auto mb-4" size={48} />
                  <p>No staff members found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow key={member.id} data-testid={`staff-row-${member.id}`}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {member.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock size={14} className="text-muted-foreground" />
                              {new Date(member.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-view-staff-${member.id}`}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-edit-staff-${member.id}`}
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
