
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, ArrowUpDown, CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ApplicationStatus = "Pending" | "Approved" | "Rejected";

type Application = {
  id: string;
  studentName: string;
  className: string;
  submittedAt: any;
  status: ApplicationStatus;
};

const applicationSchema = z.object({
  studentName: z.string().min(3, "Student name must be at least 3 characters."),
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }),
  className: z.string({
    required_error: "Please select a class to apply for.",
  }),
  guardianName: z.string().min(3, "Guardian name is required."),
  guardianPhone: z.string().min(10, "A valid phone number is required."),
  address: z.string().min(5, "Address is required."),
  previousSchool: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const statusVariant = {
    Pending: "secondary",
    Approved: "default",
    Rejected: "destructive",
} as const;


export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        const applicationsCollection = collection(db, "schools", user.uid, "applications");
        const unsubscribe = onSnapshot(applicationsCollection, (snapshot) => {
            const appsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                submittedAt: doc.data().submittedAt?.toDate()
            })) as Application[];
            setApplications(appsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching applications:", error);
            toast({ title: "Error", description: "Could not fetch applications.", variant: "destructive" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }
  }, [user, toast]);
  
  const onSubmit = async (data: ApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application.",
        variant: "destructive",
      });
      return;
    }

    try {
      const applicationsCollection = collection(db, "schools", user.uid, "applications");
      await addDoc(applicationsCollection, {
        ...data,
        submittedAt: serverTimestamp(),
        status: "Pending",
      });

      toast({
        title: "Application Submitted",
        description: `${data.studentName}'s application has been received.`,
      });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting application: ", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit the application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (id: string, status: ApplicationStatus) => {
    if (!user) return;
    try {
        const appDocRef = doc(db, "schools", user.uid, "applications", id);
        await updateDoc(appDocRef, { status });
        toast({ title: "Success", description: `Application status updated to ${status}.`});
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ title: "Error", description: "Could not update application status.", variant: "destructive"});
    }
  }


  return (
    <div>
      <PageHeader
        title="Student Applications"
        description="Review and manage all incoming student applications."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Application
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>New Student Application</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to apply for admission.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 pl-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Student's Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Anika Tabassum" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1990-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="className"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Applying for Class</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                    <SelectItem key={i + 1} value={`Class ${i + 1}`}>
                                    Class {i + 1}
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
                        name="guardianName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Guardian's Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Abdur Rahman" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="guardianPhone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Guardian's Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 01xxxxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Present Address</FormLabel>
                            <FormControl>
                                <Input placeholder="House, Road, Area, City" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="previousSchool"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Previous School (if any)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., XYZ Model School" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                    </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost">
                  Student Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading applications...</TableCell></TableRow>
            ) : applications.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No applications found.</TableCell></TableRow>
            ) : (
                applications.map((app) => (
                <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell>{app.className}</TableCell>
                    <TableCell>{app.submittedAt ? format(app.submittedAt, 'PP') : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[app.status]}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'Approved')}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'Rejected')}>Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
