"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: "Active" | "Inactive";
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherSubject, setNewTeacherSubject] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const { toast } = useToast();

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const teachersCollection = collection(db, "schools", currentUser.uid, "teachers");
      const unsubscribe = onSnapshot(teachersCollection, (snapshot) => {
        const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[];
        setTeachers(teachersData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching teachers:", error);
        toast({ title: "Error", description: "Could not fetch teachers.", variant: "destructive" });
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTeachers([]);
      setIsLoading(false);
    }
  }, [currentUser, toast]);


  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail || !newTeacherSubject || !currentUser) return;
    try {
      const teachersCollection = collection(db, "schools", currentUser.uid, "teachers");
      await addDoc(teachersCollection, {
        name: newTeacherName,
        email: newTeacherEmail,
        subject: newTeacherSubject,
        status: "Active",
      });

      toast({ title: "Success", description: "Teacher added successfully." });
      setNewTeacherName("");
      setNewTeacherEmail("");
      setNewTeacherSubject("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding teacher: ", error);
      toast({ title: "Error", description: "Could not add teacher.", variant: "destructive" });
    }
  };

  const toggleTeacherStatus = async (teacher: Teacher) => {
    if(!currentUser) return;
    const newStatus = teacher.status === "Active" ? "Inactive" : "Active";
    try {
      const teacherDoc = doc(db, "schools", currentUser.uid, "teachers", teacher.id);
      await updateDoc(teacherDoc, { status: newStatus });
      toast({ title: "Success", description: `Teacher status set to ${newStatus}.` });
    } catch (error) {
        console.error("Error updating teacher status: ", error);
        toast({ title: "Error", description: "Could not update teacher status.", variant: "destructive" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Teacher Management"
        description="Add, view, and manage your school's teaching staff."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Teacher
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                    Fill in the details below to add a new teacher to your staff.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTeacher}>
                  <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                      Name
                      </Label>
                      <Input id="name" placeholder="e.g. John Doe" className="col-span-3" value={newTeacherName} onChange={(e) => setNewTeacherName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                      Email
                      </Label>
                      <Input id="email" type="email" placeholder="teacher@example.com" className="col-span-3" value={newTeacherEmail} onChange={(e) => setNewTeacherEmail(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">
                      Subject
                      </Label>
                      <Input id="subject" placeholder="e.g. Physics" className="col-span-3" value={newTeacherSubject} onChange={(e) => setNewTeacherSubject(e.target.value)} />
                  </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Teacher</Button>
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
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading teachers...</TableCell></TableRow>
            ) : teachers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No teachers found. Add one to get started.</TableCell></TableRow>
            ) : (
                teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>
                    <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>
                        {teacher.status}
                    </Badge>
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
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
                        <DropdownMenuItem>View Payments</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleTeacherStatus(teacher)}>
                            {teacher.status === 'Active' ? 'Set as Inactive' : 'Set as Active'}
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
    </div>
  );
}
