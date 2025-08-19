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
import { Checkbox } from "@/components/ui/checkbox";
import { authenticatedFetch } from "@/lib/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, Eye, Search, Send, Users, Mail, Megaphone, Clock } from "lucide-react";

interface Communication {
  id: string;
  senderId: string;
  recipientType: string;
  recipientIds: string[];
  subject: string;
  message: string;
  priority: string;
  deliveryMethod: string;
  sentAt: string;
  status: string;
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

const communicationFormSchema = z.object({
  recipientType: z.string().min(1, "Recipient type is required"),
  recipientIds: z.array(z.string()).optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  priority: z.string().min(1, "Priority is required"),
  deliveryMethod: z.string().min(1, "Delivery method is required"),
});

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors = {
  sent: "bg-green-100 text-green-800",
  delivered: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const recipientTypes = [
  { value: "individual", label: "Individual" },
  { value: "group", label: "Selected Group" },
  { value: "all_cadets", label: "All Cadets" },
  { value: "all_staff", label: "All Staff" },
];

const deliveryMethods = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push_notification", label: "Push Notification" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function Communications() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const form = useForm<z.infer<typeof communicationFormSchema>>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      recipientType: "",
      recipientIds: [],
      subject: "",
      message: "",
      priority: "normal",
      deliveryMethod: "email",
    },
  });

  const watchRecipientType = form.watch("recipientType");

  const { data: communications, isLoading } = useQuery<Communication[]>({
    queryKey: ["/api/communications"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/communications");
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

  const sendCommunicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof communicationFormSchema>) => {
      const response = await authenticatedFetch("/api/communications", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          recipientIds: watchRecipientType === "individual" || watchRecipientType === "group" 
            ? selectedRecipients 
            : [],
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      setIsDialogOpen(false);
      setSelectedRecipients([]);
      form.reset();
      toast({
        title: "Message sent",
        description: "Your communication has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send communication.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof communicationFormSchema>) => {
    sendCommunicationMutation.mutate(data);
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

  const totalSent = communications?.length || 0;
  const sentToday = communications?.filter(c => 
    new Date(c.sentAt).toDateString() === new Date().toDateString()
  ).length || 0;
  const urgentMessages = communications?.filter(c => c.priority === "urgent").length || 0;
  const failedMessages = communications?.filter(c => c.status === "failed").length || 0;

  const filteredCommunications = communications?.filter(comm => {
    if (!searchQuery) return true;
    return comm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
           comm.message.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const availableRecipients = watchRecipientType === "individual" || watchRecipientType === "group"
    ? [...(staff || []).map(s => ({ id: s.id, name: s.name, type: "staff" })),
       ...(cadets || []).map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, type: "cadet" }))]
    : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Communications</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Communications</span>
              </nav>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy-600 text-white hover:bg-navy-700" data-testid="button-send-message">
                  <Plus className="mr-2" size={16} />
                  Send Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Communication</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-recipient-type">
                                  <SelectValue placeholder="Select recipient type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {recipientTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
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
                        name="deliveryMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-delivery-method">
                                  <SelectValue placeholder="Select delivery method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {deliveryMethods.map((method) => (
                                  <SelectItem key={method.value} value={method.value}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {(watchRecipientType === "individual" || watchRecipientType === "group") && (
                      <div>
                        <FormLabel>Select Recipients</FormLabel>
                        <div className="max-h-32 overflow-y-auto border border-border rounded p-2 space-y-2">
                          {availableRecipients.map((recipient) => (
                            <div key={recipient.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedRecipients.includes(recipient.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedRecipients([...selectedRecipients, recipient.id]);
                                  } else {
                                    setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                                  }
                                }}
                                data-testid={`checkbox-recipient-${recipient.id}`}
                              />
                              <label className="text-sm">
                                {recipient.name} ({recipient.type})
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-priority">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {priorities.map((priority) => (
                                  <SelectItem key={priority.value} value={priority.value}>
                                    {priority.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter message subject"
                              {...field}
                              data-testid="input-subject"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your message..."
                              rows={6}
                              {...field}
                              data-testid="textarea-message"
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
                        data-testid="button-cancel-message"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-navy-600 hover:bg-navy-700"
                        disabled={sendCommunicationMutation.isPending}
                        data-testid="button-submit-message"
                      >
                        <Send className="mr-2" size={16} />
                        {sendCommunicationMutation.isPending ? "Sending..." : "Send Message"}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-sent">
                      {totalSent}
                    </p>
                    <p className="text-sm text-blue-600 flex items-center mt-1">
                      <Send size={14} className="mr-1" />
                      All time
                    </p>
                  </div>
                  <MessageSquare className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sent Today</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-sent-today">
                      {sentToday}
                    </p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <Clock size={14} className="mr-1" />
                      Today
                    </p>
                  </div>
                  <Clock className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Urgent Messages</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-urgent-messages">
                      {urgentMessages}
                    </p>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <Megaphone size={14} className="mr-1" />
                      High priority
                    </p>
                  </div>
                  <Megaphone className="text-red-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Failed Deliveries</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-failed-messages">
                      {failedMessages}
                    </p>
                    <p className="text-sm text-orange-600 flex items-center mt-1">
                      <Mail size={14} className="mr-1" />
                      Requires attention
                    </p>
                  </div>
                  <Mail className="text-orange-600" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-navy-600" />
                Communication History
              </CardTitle>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search communications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-communications"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading communications...</p>
                </div>
              ) : !filteredCommunications || filteredCommunications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto mb-4" size={48} />
                  <p>No communications found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommunications.map((communication) => (
                        <TableRow key={communication.id} data-testid={`communication-row-${communication.id}`}>
                          <TableCell>
                            {new Date(communication.sentAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {communication.subject}
                          </TableCell>
                          <TableCell className="capitalize">
                            {communication.recipientType.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="capitalize">
                            {communication.deliveryMethod}
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[communication.priority as keyof typeof priorityColors]}>
                              {communication.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[communication.status as keyof typeof statusColors]}>
                              {communication.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-view-communication-${communication.id}`}
                            >
                              <Eye size={14} />
                            </Button>
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
