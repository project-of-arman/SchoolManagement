
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, ArrowUpDown } from "lucide-react";
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
import Link from "next/link";

type Application = {
  id: string;
  studentName: string;
  class: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
};

const mockApplications: Application[] = [
  { id: "1", studentName: "Jamal Khan", class: "Class 5", submitted: "2024-07-20", status: "Approved" },
  { id: "2", studentName: "Fatima Ahmed", class: "Class 8", submitted: "2024-07-19", status: "Pending" },
  { id: "3", studentName: "Rohan Das", class: "Class 1", submitted: "2024-07-18", status: "Pending" },
  { id: "4", studentName: "Ayesha Chowdhury", class: "Class 10", submitted: "2024-07-17", status: "Rejected" },
  { id: "5", studentName: "Imran Hossain", class: "Class 3", submitted: "2024-07-16", status: "Approved" },
];

const statusVariant = {
    Pending: "secondary",
    Approved: "default",
    Rejected: "destructive",
} as const;


export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [isLoading, setIsLoading] = useState(false); // Will be true when fetching from Firebase

  // In the future, this would fetch data from Firestore
  // useEffect(() => { ... fetch logic here ... }, [user]);

  return (
    <div>
      <PageHeader
        title="Student Applications"
        description="Review and manage all incoming student applications."
      >
        <Button asChild>
          <Link href="/school/applications/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
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
                    <TableCell>{app.class}</TableCell>
                    <TableCell>{new Date(app.submitted).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem>Approve</DropdownMenuItem>
                          <DropdownMenuItem>Reject</DropdownMenuItem>
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
