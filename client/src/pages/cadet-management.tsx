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
import { authenticatedFetch } from "@/lib/auth";
import { Search, Plus, Eye, Edit, Filter } from "lucide-react";

interface Cadet {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  class: string;
  enrollmentDate: string;
  careerPathway: string;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  graduated: "bg-blue-100 text-blue-800",
  dismissed: "bg-red-100 text-red-800",
  transferred: "bg-yellow-100 text-yellow-800",
};

export default function CadetManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: cadets, isLoading, error } = useQuery<Cadet[]>({
    queryKey: ["/api/cadets", searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await authenticatedFetch(`/api/cadets?${params}`);
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

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Cadet Management</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Cadet Management</span>
              </nav>
            </div>
            <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-add-cadet">
              <Plus className="mr-2" size={16} />
              Add New Cadet
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>All Cadets</CardTitle>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                  data-testid="select-status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading cadets...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Failed to load cadets. Please try again.</p>
                </div>
              ) : !cadets || cadets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No cadets found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                        <TableHead>Career Pathway</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cadets.map((cadet) => (
                        <TableRow key={cadet.id} data-testid={`cadet-row-${cadet.id}`}>
                          <TableCell className="font-medium">
                            {cadet.firstName} {cadet.lastName}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={statusColors[cadet.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                            >
                              {cadet.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{cadet.class || "Unassigned"}</TableCell>
                          <TableCell>
                            {cadet.enrollmentDate ? new Date(cadet.enrollmentDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>{cadet.careerPathway || "Not selected"}</TableCell>
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
