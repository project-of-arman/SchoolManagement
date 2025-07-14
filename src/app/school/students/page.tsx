
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Trash2 } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Student {
  id: string;
  name: string;
  className: string;
  rollNumber: string;
  guardianName: string;
  status: "Active" | "Inactive";
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({ name: '', className: '', rollNumber: '', guardianName: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const studentsCollection = collection(db, "schools", currentUser.uid, "students");
      const unsubscribe = onSnapshot(studentsCollection, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(studentsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching students:", error);
        toast({ title: "Error", description: "Could not fetch students.", variant: "destructive" });
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setStudents([]);
      setIsLoading(false);
    }
  }, [currentUser, toast]);


  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.className || !newStudent.rollNumber || !currentUser) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    };
    try {
      const studentsCollection = collection(db, "schools", currentUser.uid, "students");
      await addDoc(studentsCollection, {
        ...newStudent,
        status: "Active",
      });

      toast({ title: "Success", description: "Student added successfully." });
      setNewStudent({ name: '', className: '', rollNumber: '', guardianName: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding student: ", error);
      toast({ title: "Error", description: "Could not add student.", variant: "destructive" });
    }
  };

  const toggleStudentStatus = async (student: Student) => {
    if(!currentUser) return;
    const newStatus = student.status === "Active" ? "Inactive" : "Active";
    try {
      const studentDoc = doc(db, "schools", currentUser.uid, "students", student.id);
      await updateDoc(studentDoc, { status: newStatus });
      toast({ title: "Success", description: `Student status set to ${newStatus}.` });
    } catch (error) {
        console.error("Error updating student status: ", error);
        toast({ title: "Error", description: "Could not update student status.", variant: "destructive" });
    }
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent || !currentUser) return;
    try {
        const studentDoc = doc(db, "schools", currentUser.uid, "students", selectedStudent.id);
        await deleteDoc(studentDoc);
        toast({ title: "Success", description: "Student removed successfully." });
    } catch (error) {
        console.error("Error removing student: ", error);
        toast({ title: "Error", description: "Could not remove student.", variant: "destructive" });
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
    }
  }

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewStudent(prev => ({...prev, [id]: value}));
  }

  return (
    <div>
      <PageHeader
        title="Student Management"
        description="Add, view, and manage your school's students."
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                    Fill in the details below to add a new student.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Name</Label>
                          <Input id="name" placeholder="e.g. Jamal Khan" className="col-span-3" value={newStudent.name} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="className" className="text-right">Class</Label>
                          <Input id="className" placeholder="e.g. Class 5" className="col-span-3" value={newStudent.className} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="rollNumber" className="text-right">Roll No.</Label>
                          <Input id="rollNumber" placeholder="e.g. 21" className="col-span-3" value={newStudent.rollNumber} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="guardianName" className="text-right">Guardian</Label>
                          <Input id="guardianName" placeholder="e.g. Kamal Khan" className="col-span-3" value={newStudent.guardianName} onChange={handleInputChange} />
                      </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Student</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading students...</TableCell></TableRow>
            ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No students found. Add one to get started.</TableCell></TableRow>
            ) : (
                students.map((student) => (
                <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.guardianName}</TableCell>
                    <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                        {student.status}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStudentStatus(student)}>
                            {student.status === 'Active' ? 'Set as Inactive' : 'Set as Active'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(student)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the student
              &quot;{selectedStudent?.name}&quot; and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90">
                Yes, remove student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
