
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

const initialStudentState: Student = {
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
  const [studentFormData, setStudentFormData] = useState<Student>(initialStudentState);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
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
        const studentsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to JS Dates
            dateOfBirth: data.dateOfBirth?.toDate ? data.dateOfBirth.toDate() : null,
            admissionDate: data.admissionDate?.toDate ? data.admissionDate.toDate() : null,
        } as Student
        });
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


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dialogMode === 'add') {
      await handleAddStudent();
    } else {
      await handleUpdateStudent();
    }
  }

  const handleAddStudent = async () => {
    if (!studentFormData.firstName || !studentFormData.className || !studentFormData.rollNumber || !currentUser) {
        toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    };

    try {
      const studentsCollection = collection(db, "schools", currentUser.uid, "students");
      // remove id before adding
      const { id, ...studentData } = studentFormData;
      await addDoc(studentsCollection, {
        ...studentData,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success", description: "Student added successfully." });
      setStudentFormData(initialStudentState);
      setIsStudentDialogOpen(false);
    } catch (error) {
      console.error("Error adding student: ", error);
      toast({ title: "Error", description: "Could not add student.", variant: "destructive" });
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentFormData.id || !currentUser) return;
    try {
        const studentDoc = doc(db, "schools", currentUser.uid, "students", studentFormData.id);
        const { id, ...studentData } = studentFormData;
        await updateDoc(studentDoc, studentData);
        toast({ title: "Success", description: "Student details updated." });
        setIsStudentDialogOpen(false);
        setStudentFormData(initialStudentState);
    } catch (error) {
        console.error("Error updating student: ", error);
        toast({ title: "Error", description: "Could not update student details.", variant: "destructive" });
    }
  }

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

  const openAddDialog = () => {
    setDialogMode('add');
    setStudentFormData(initialStudentState);
    setIsStudentDialogOpen(true);
  }

  const openEditDialog = (student: Student) => {
    setDialogMode('edit');
    setStudentFormData(student);
    setIsStudentDialogOpen(true);
  }

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setStudentFormData(prev => ({...prev, [id]: value}));
  }

  const handleSelectChange = (id: string, value: string) => {
    setStudentFormData(prev => ({...prev, [id]: value}));
  }

  const handleDateChange = (id: string, date: Date | undefined) => {
      if(date) {
        setStudentFormData(prev => ({ ...prev, [id]: date }));
      }
  }

  const handleGuardianRadioChange = (value: 'father' | 'mother' | 'other') => {
    setStudentFormData(prev => {
        const newFormData = {...prev, guardianIs: value};
        if (value === 'father') {
            newFormData.guardianName = newFormData.fatherName;
            newFormData.guardianPhone = newFormData.fatherPhone;
            newFormData.guardianOccupation = newFormData.fatherOccupation;
        } else if (value === 'mother') {
            newFormData.guardianName = newFormData.motherName;
            newFormData.guardianPhone = newFormData.motherPhone;
            newFormData.guardianOccupation = newFormData.motherOccupation;
        } else {
             newFormData.guardianName = '';
             newFormData.guardianPhone = '';
             newFormData.guardianOccupation = '';
             newFormData.guardianRelation = '';
        }
        return newFormData;
    })
  }


  return (
    <div>
      <PageHeader
        title="Student Management"
        description="Add, view, and manage your school's students."
      >
        <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
        </Button>
      </PageHeader>
      
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
          <DialogContent className="max-w-4xl">
              <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add New Student' : 'Edit Student Details'}</DialogTitle>
              <DialogDescription>
                  {dialogMode === 'add' ? 'Fill in the details below to add a new student.' : `Editing details for ${studentFormData.firstName} ${studentFormData.lastName}.`}
              </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit}>
                <Tabs defaultValue="student-details">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="student-details">Student Details</TabsTrigger>
                      <TabsTrigger value="guardian-details">Parent / Guardian Details</TabsTrigger>
                  </TabsList>
                  <div className="max-h-[60vh] overflow-y-auto p-1">
                  <TabsContent value="student-details">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                          <div className="space-y-2"><Label>Admission No</Label><Input id="admissionNo" value={studentFormData.admissionNo} onChange={handleInputChange} /></div>
                          <div className="space-y-2"><Label>Roll Number *</Label><Input id="rollNumber" value={studentFormData.rollNumber} onChange={handleInputChange} required /></div>
                          <div className="space-y-2"><Label>Section</Label><Input id="section" value={studentFormData.section} onChange={handleInputChange} /></div>
                          <div className="space-y-2"><Label>Class *</Label><Input id="className" value={studentFormData.className} onChange={handleInputChange} required /></div>
                          <div className="space-y-2"><Label>First Name *</Label><Input id="firstName" value={studentFormData.firstName} onChange={handleInputChange} required /></div>
                          <div className="space-y-2"><Label>Last Name</Label><Input id="lastName" value={studentFormData.lastName} onChange={handleInputChange} /></div>
                          <div className="space-y-2"><Label>Gender</Label>
                              <Select onValueChange={(v) => handleSelectChange('gender', v)} value={studentFormData.gender}>
                                  <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                              </Select>
                          </div>
                           <div className="space-y-2 flex flex-col"><Label>Date of Birth</Label>
                              <Popover>
                                  <PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal", !studentFormData.dateOfBirth && "text-muted-foreground")}>{studentFormData.dateOfBirth ? format(studentFormData.dateOfBirth, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={studentFormData.dateOfBirth} onSelect={(d) => handleDateChange('dateOfBirth', d)} initialFocus /></PopoverContent>
                              </Popover>
                          </div>
                          <div className="space-y-2"><Label>Religion</Label><Input id="religion" value={studentFormData.religion} onChange={handleInputChange} /></div>
                          <div className="space-y-2"><Label>Mobile Number</Label><Input id="mobileNumber" type="tel" value={studentFormData.mobileNumber} onChange={handleInputChange} /></div>
                           <div className="space-y-2 flex flex-col"><Label>Admission Date</Label>
                              <Popover>
                                  <PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal", !studentFormData.admissionDate && "text-muted-foreground")}>{studentFormData.admissionDate ? format(studentFormData.admissionDate, "PPP") : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={studentFormData.admissionDate} onSelect={(d) => handleDateChange('admissionDate', d)} initialFocus /></PopoverContent>
                              </Popover>
                          </div>
                          <div className="space-y-2"><Label>Blood Group</Label><Input id="bloodGroup" value={studentFormData.bloodGroup} onChange={handleInputChange} /></div>
                          <div className="md:col-span-3"><FileUpload id="student-photo" label="Student Photo" /></div>
                      </div>
                  </TabsContent>
                   <TabsContent value="guardian-details">
                      <div className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                              <h3 className="md:col-span-3 font-semibold">Father's Details</h3>
                              <div className="space-y-2"><Label>Father Name</Label><Input id="fatherName" value={studentFormData.fatherName} onChange={handleInputChange} /></div>
                              <div className="space-y-2"><Label>Father Phone</Label><Input id="fatherPhone" type="tel" value={studentFormData.fatherPhone} onChange={handleInputChange} /></div>
                              <div className="space-y-2"><Label>Father Occupation</Label><Input id="fatherOccupation" value={studentFormData.fatherOccupation} onChange={handleInputChange} /></div>
                          </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                              <h3 className="md:col-span-3 font-semibold">Mother's Details</h3>
                              <div className="space-y-2"><Label>Mother Name</Label><Input id="motherName" value={studentFormData.motherName} onChange={handleInputChange} /></div>
                              <div className="space-y-2"><Label>Mother Phone</Label><Input id="motherPhone" type="tel" value={studentFormData.motherPhone} onChange={handleInputChange} /></div>
                              <div className="space-y-2"><Label>Mother Occupation</Label><Input id="motherOccupation" value={studentFormData.motherOccupation} onChange={handleInputChange} /></div>
                          </div>

                          <div className="p-4 border rounded-md space-y-4">
                             <h3 className="font-semibold">Guardian Details</h3>
                             <RadioGroup value={studentFormData.guardianIs} onValueChange={(v) => handleGuardianRadioChange(v as 'father'|'mother'|'other')}>
                                 <div className="flex items-center space-x-2"><RadioGroupItem value="father" id="g-father" /><Label htmlFor="g-father">Father is Guardian</Label></div>
                                 <div className="flex items-center space-x-2"><RadioGroupItem value="mother" id="g-mother" /><Label htmlFor="g-mother">Mother is Guardian</Label></div>
                                 <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="g-other" /><Label htmlFor="g-other">Other Guardian</Label></div>
                             </RadioGroup>
                             
                             {studentFormData.guardianIs === 'other' && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                      <div className="space-y-2"><Label>Guardian Name</Label><Input id="guardianName" value={studentFormData.guardianName} onChange={handleInputChange} /></div>
                                      <div className="space-y-2"><Label>Guardian Relation</Label><Input id="guardianRelation" value={studentFormData.guardianRelation} onChange={handleInputChange} /></div>
                                      <div className="space-y-2"><Label>Guardian Phone</Label><Input id="guardianPhone" value={studentFormData.guardianPhone} onChange={handleInputChange} /></div>
                                      <div className="space-y-2"><Label>Guardian Occupation</Label><Input id="guardianOccupation" value={studentFormData.guardianOccupation} onChange={handleInputChange} /></div>
                                      <div className="md:col-span-2 space-y-2"><Label>Guardian Address</Label><Textarea id="guardianAddress" value={studentFormData.guardianAddress} onChange={handleInputChange} /></div>
                                 </div>
                             )}
                             {studentFormData.guardianIs !== 'other' && (
                                 <div className="pt-4 border-t">
                                   <div className="space-y-2"><Label>Guardian Address</Label><Textarea id="guardianAddress" value={studentFormData.guardianAddress} onChange={handleInputChange} /></div>
                                 </div>
                             )}
                          </div>
                      </div>
                  </TabsContent>
                  </div>
                </Tabs>
                <DialogFooter className="pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={() => setIsStudentDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Student</Button>
                </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>


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
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>Edit</DropdownMenuItem>
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
