
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Trash2, CalendarIcon } from "lucide-react";
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
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FileUpload } from "@/components/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  admissionNo: string;
  rollNumber: string;
  section: string;
  className: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: any; 
  religion: string;
  mobileNumber: string;
  admissionDate: any;
  bloodGroup: string;
  
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  motherOccupation: string;

  guardianIs: 'father' | 'mother' | 'other';
  guardianName: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianOccupation?: string;
  guardianAddress?: string;

  status: "Active" | "Inactive";
}

const initialStudentState = {
    id: '',
    admissionNo: '',
    rollNumber: '',
    section: '',
    className: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: null,
    religion: '',
    mobileNumber: '',
    admissionDate: null,
    bloodGroup: '',
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianIs: 'father' as 'father' | 'mother' | 'other',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianOccupation: '',
    guardianAddress: '',
    status: 'Active' as 'Active' | 'Inactive',
};


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'status'>>(initialStudentState);
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
    if (!newStudent.firstName || !newStudent.className || !newStudent.rollNumber || !currentUser) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    };

    let guardianData = {
        guardianIs: newStudent.guardianIs,
        guardianName: '',
        guardianAddress: '',
        guardianPhone: '',
        guardianOccupation: '',
        guardianRelation: '',
    };

    if (newStudent.guardianIs === 'father') {
        guardianData.guardianName = newStudent.fatherName;
        guardianData.guardianPhone = newStudent.fatherPhone;
        guardianData.guardianOccupation = newStudent.fatherOccupation;
    } else if (newStudent.guardianIs === 'mother') {
        guardianData.guardianName = newStudent.motherName;
        guardianData.guardianPhone = newStudent.motherPhone;
        guardianData.guardianOccupation = newStudent.motherOccupation;
    } else {
        guardianData.guardianName = newStudent.guardianName;
        guardianData.guardianAddress = newStudent.guardianAddress;
        guardianData.guardianPhone = newStudent.guardianPhone;
        guardianData.guardianOccupation = newStudent.guardianOccupation;
        guardianData.guardianRelation = newStudent.guardianRelation;
    }


    try {
      const studentsCollection = collection(db, "schools", currentUser.uid, "students");
      await addDoc(studentsCollection, {
        ...newStudent,
        ...guardianData,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success", description: "Student added successfully." });
      setNewStudent(initialStudentState);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewStudent(prev => ({...prev, [id]: value}));
  }

  const handleSelectChange = (id: string, value: string) => {
    setNewStudent(prev => ({...prev, [id]: value}));
  }

  const handleDateChange = (id: string, date: Date | undefined) => {
      if(date) {
        setNewStudent(prev => ({ ...prev, [id]: date }));
      }
  }


  return (
    <div>
      <PageHeader
        title="Student Management"
        description="Add, view, and manage your school's students."
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setNewStudent(initialStudentState)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                    Fill in the details below to add a new student.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent}>
                  <Tabs defaultValue="student-details">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student-details">Student Details</TabsTrigger>
                        <TabsTrigger value="guardian-details">Parent / Guardian Details</TabsTrigger>
                    </TabsList>
                    <div className="max-h-[60vh] overflow-y-auto p-1">
                    <TabsContent value="student-details">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                            <div className="space-y-2"><Label>Admission No</Label><Input id="admissionNo" value={newStudent.admissionNo} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label>Roll Number *</Label><Input id="rollNumber" value={newStudent.rollNumber} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Section</Label><Input id="section" value={newStudent.section} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label>Class *</Label><Input id="className" value={newStudent.className} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>First Name *</Label><Input id="firstName" value={newStudent.firstName} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input id="lastName" value={newStudent.lastName} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label>Gender</Label>
                                <Select onValueChange={(v) => handleSelectChange('gender', v)} value={newStudent.gender}>
                                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2 flex flex-col"><Label>Date of Birth</Label>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal", !newStudent.dateOfBirth && "text-muted-foreground")}>{newStudent.dateOfBirth ? format(newStudent.dateOfBirth, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newStudent.dateOfBirth} onSelect={(d) => handleDateChange('dateOfBirth', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2"><Label>Religion</Label><Input id="religion" value={newStudent.religion} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label>Mobile Number</Label><Input id="mobileNumber" type="tel" value={newStudent.mobileNumber} onChange={handleInputChange} /></div>
                             <div className="space-y-2 flex flex-col"><Label>Admission Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal", !newStudent.admissionDate && "text-muted-foreground")}>{newStudent.admissionDate ? format(newStudent.admissionDate, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newStudent.admissionDate} onSelect={(d) => handleDateChange('admissionDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2"><Label>Blood Group</Label><Input id="bloodGroup" value={newStudent.bloodGroup} onChange={handleInputChange} /></div>
                            <div className="md:col-span-3"><FileUpload id="student-photo" label="Student Photo" /></div>
                        </div>
                    </TabsContent>
                     <TabsContent value="guardian-details">
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                <h3 className="md:col-span-3 font-semibold">Father's Details</h3>
                                <div className="space-y-2"><Label>Father Name</Label><Input id="fatherName" value={newStudent.fatherName} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Father Phone</Label><Input id="fatherPhone" type="tel" value={newStudent.fatherPhone} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Father Occupation</Label><Input id="fatherOccupation" value={newStudent.fatherOccupation} onChange={handleInputChange} /></div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                <h3 className="md:col-span-3 font-semibold">Mother's Details</h3>
                                <div className="space-y-2"><Label>Mother Name</Label><Input id="motherName" value={newStudent.motherName} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Mother Phone</Label><Input id="motherPhone" type="tel" value={newStudent.motherPhone} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label>Mother Occupation</Label><Input id="motherOccupation" value={newStudent.motherOccupation} onChange={handleInputChange} /></div>
                            </div>

                            <div className="p-4 border rounded-md space-y-4">
                               <h3 className="font-semibold">Guardian Details</h3>
                               <RadioGroup defaultValue="father" value={newStudent.guardianIs} onValueChange={(v) => handleSelectChange('guardianIs', v as 'father'|'mother'|'other')}>
                                   <div className="flex items-center space-x-2"><RadioGroupItem value="father" id="g-father" /><Label htmlFor="g-father">Father is Guardian</Label></div>
                                   <div className="flex items-center space-x-2"><RadioGroupItem value="mother" id="g-mother" /><Label htmlFor="g-mother">Mother is Guardian</Label></div>
                                   <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="g-other" /><Label htmlFor="g-other">Other Guardian</Label></div>
                               </RadioGroup>
                               
                               {newStudent.guardianIs === 'other' && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                        <div className="space-y-2"><Label>Guardian Name</Label><Input id="guardianName" value={newStudent.guardianName} onChange={handleInputChange} /></div>
                                        <div className="space-y-2"><Label>Guardian Relation</Label><Input id="guardianRelation" value={newStudent.guardianRelation} onChange={handleInputChange} /></div>
                                        <div className="space-y-2"><Label>Guardian Phone</Label><Input id="guardianPhone" value={newStudent.guardianPhone} onChange={handleInputChange} /></div>
                                        <div className="space-y-2"><Label>Guardian Occupation</Label><Input id="guardianOccupation" value={newStudent.guardianOccupation} onChange={handleInputChange} /></div>
                                        <div className="md:col-span-2 space-y-2"><Label>Guardian Address</Label><Textarea id="guardianAddress" value={newStudent.guardianAddress} onChange={handleInputChange} /></div>
                                   </div>
                               )}
                               {newStudent.guardianIs !== 'other' && (
                                   <div className="pt-4 border-t">
                                     <div className="space-y-2"><Label>Guardian Address</Label><Textarea id="guardianAddress" value={newStudent.guardianAddress} onChange={handleInputChange} /></div>
                                   </div>
                               )}
                            </div>
                        </div>
                    </TabsContent>
                    </div>
                  </Tabs>
                  <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
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
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
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
              &quot;{selectedStudent?.firstName} {selectedStudent?.lastName}&quot; and all associated data.
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

    