'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  UserPlus, 
  Edit,
  Eye, 
  Trash2, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { StudentDetails } from './student-details'
import { StudentEdit } from './student-edit'

interface Student {
  id: string
  roll_number: string
  full_name: string
  class: string
  section?: string
  date_of_birth?: string
  gender?: string
  phone?: string
  address?: string
  father_name?: string
  father_phone?: string
  father_occupation?: string
  mother_name?: string
  mother_phone?: string
  mother_occupation?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_relation?: string
  admission_date?: string
  status: string
  created_at: string
}

interface StudentManagementProps {
  schoolId: string
  section: 'students' | 'create-student' | 'student-details' | 'student-edit'
  studentId?: string
}

export function StudentManagement({ schoolId, section, studentId }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'edit'>('list')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    roll_number: '',
    full_name: '',
    class: '',
    section: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    father_name: '',
    father_phone: '',
    father_occupation: '',
    mother_name: '',
    mother_phone: '',
    mother_occupation: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'active'
  })

  useEffect(() => {
    if (section === 'students') {
      fetchStudents()
    }
  }, [schoolId, section])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if roll number already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId)
        .eq('roll_number', formData.roll_number)

      if (existingStudent && existingStudent.length > 0) {
        throw new Error('Roll number already exists')
      }

      const { error } = await supabase
        .from('students')
        .insert({
          ...formData,
          school_id: schoolId
        })

      if (error) throw error

      // Reset form
      setFormData({
        roll_number: '',
        full_name: '',
        class: '',
        section: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: '',
        father_name: '',
        father_phone: '',
        father_occupation: '',
        mother_name: '',
        mother_phone: '',
        mother_occupation: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_relation: '',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'active'
      })

      toast({
        title: "Student Created",
        description: `${formData.full_name} has been successfully added to the system.`,
      })

      // Refresh students list
      fetchStudents()
    } catch (err: any) {
      setError(err.message || 'Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setCurrentView('details')
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setCurrentView('edit')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedStudent(null)
    fetchStudents() // Refresh the list
  }

  const handleStudentSaved = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s))
    setSelectedStudent(updatedStudent)
    setCurrentView('details')
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error

      setStudents(prev => prev.filter(s => s.id !== studentId))
      
      toast({
        title: "Student Deleted",
        description: "Student record has been successfully deleted.",
      })
    } catch (err: any) {
      setError(err.message || 'Failed to delete student')
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !filterClass || student.class === filterClass
    return matchesSearch && matchesClass
  })

  const uniqueClasses = [...new Set(students.map(s => s.class))].filter(Boolean)

  // Handle different views
  if (section === 'students' && currentView === 'details' && selectedStudent) {
    return (
      <StudentDetails
        studentId={selectedStudent.id}
        onBack={handleBackToList}
        onEdit={handleEditStudent}
      />
    )
  }

  if (section === 'students' && currentView === 'edit' && selectedStudent) {
    return (
      <StudentEdit
        student={selectedStudent}
        onBack={handleBackToList}
        onSave={handleStudentSaved}
      />
    )
  }

  if (section === 'create-student') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateStudent} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="roll_number">Roll Number *</Label>
                  <Input
                    id="roll_number"
                    value={formData.roll_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, roll_number: e.target.value }))}
                    placeholder="2024001"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Student's full name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    placeholder="Class 10"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="A"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+880-XXX-XXXXXX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Complete address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Father's Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Father's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="father_name">Father's Name</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, father_name: e.target.value }))}
                    placeholder="Father's full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="father_phone">Father's Phone</Label>
                  <Input
                    id="father_phone"
                    type="tel"
                    value={formData.father_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, father_phone: e.target.value }))}
                    placeholder="+880-XXX-XXXXXX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="father_occupation">Father's Occupation</Label>
                  <Input
                    id="father_occupation"
                    value={formData.father_occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, father_occupation: e.target.value }))}
                    placeholder="Occupation"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Mother's Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mother's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mother_name">Mother's Name</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, mother_name: e.target.value }))}
                    placeholder="Mother's full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mother_phone">Mother's Phone</Label>
                  <Input
                    id="mother_phone"
                    type="tel"
                    value={formData.mother_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, mother_phone: e.target.value }))}
                    placeholder="+880-XXX-XXXXXX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mother_occupation">Mother's Occupation</Label>
                  <Input
                    id="mother_occupation"
                    value={formData.mother_occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, mother_occupation: e.target.value }))}
                    placeholder="Occupation"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Information (if different) */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Guardian Information (if different from parents)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="guardian_name">Guardian's Name</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
                    placeholder="Guardian's full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_phone">Guardian's Phone</Label>
                  <Input
                    id="guardian_phone"
                    type="tel"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone: e.target.value }))}
                    placeholder="+880-XXX-XXXXXX"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_relation">Relation</Label>
                  <Input
                    id="guardian_relation"
                    value={formData.guardian_relation}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardian_relation: e.target.value }))}
                    placeholder="Uncle, Aunt, etc."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Admission Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Admission Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission_date">Admission Date</Label>
                  <Input
                    id="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Creating Student...' : 'Create Student Record'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Manage Students ({filteredStudents.length})
          </CardTitle>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                {uniqueClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No students found</p>
            <p className="text-sm">
              {searchTerm || filterClass ? 'Try adjusting your filters' : 'Use "Add Student" to create student records'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Roll: {student.roll_number}</Badge>
                            <Badge variant="secondary">{student.class}{student.section && ` - ${student.section}`}</Badge>
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'secondary'}
                              className={student.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {student.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {student.father_name && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Father: {student.father_name}</span>
                          </div>
                        )}
                        {student.admission_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Admitted: {new Date(student.admission_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {student.address && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{student.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}