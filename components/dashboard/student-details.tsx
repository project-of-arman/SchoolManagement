'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GraduationCap, 
  Edit, 
  ArrowLeft, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  Mail,
  User,
  BookOpen,
  Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface StudentDetailsProps {
  studentId: string
  onBack: () => void
  onEdit: (student: Student) => void
}

export function StudentDetails({ studentId, onBack, onEdit }: StudentDetailsProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (error) throw error
      setStudent(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'transferred': return 'bg-blue-100 text-blue-800'
      case 'graduated': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading student details...</p>
      </div>
    )
  }

  if (error || !student) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Student not found'}</AlertDescription>
          </Alert>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {student.full_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">Roll: {student.roll_number}</Badge>
                  <Badge variant="secondary">{student.class}{student.section && ` - ${student.section}`}</Badge>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => onEdit(student)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Student
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{student.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Roll Number</label>
                <p className="text-gray-900">{student.roll_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Class</label>
                <p className="text-gray-900">{student.class}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Section</label>
                <p className="text-gray-900">{student.section || 'Not specified'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">
                  {student.date_of_birth 
                    ? new Date(student.date_of_birth).toLocaleDateString()
                    : 'Not specified'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 capitalize">{student.gender || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(student.status)}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{student.phone}</p>
                </div>
              </div>
            )}

            {student.address && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{student.address}</p>
                </div>
              </div>
            )}

            {student.admission_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Admission Date</label>
                  <p className="text-gray-900">
                    {new Date(student.admission_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Father's Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Father's Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.father_name ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{student.father_name}</p>
                </div>
                {student.father_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{student.father_phone}</p>
                  </div>
                )}
                {student.father_occupation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                    <p className="text-gray-900">{student.father_occupation}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">No father information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Mother's Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Mother's Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.mother_name ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{student.mother_name}</p>
                </div>
                {student.mother_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{student.mother_phone}</p>
                  </div>
                )}
                {student.mother_occupation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                    <p className="text-gray-900">{student.mother_occupation}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">No mother information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Guardian Information */}
        {(student.guardian_name || student.guardian_phone) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {student.guardian_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{student.guardian_name}</p>
                  </div>
                )}
                {student.guardian_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{student.guardian_phone}</p>
                  </div>
                )}
                {student.guardian_relation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relation</label>
                    <p className="text-gray-900">{student.guardian_relation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Class</label>
                <p className="text-gray-900">{student.class}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Section</label>
                <p className="text-gray-900">{student.section || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Roll Number</label>
                <p className="text-gray-900">{student.roll_number}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Admission Date</label>
                  <p className="text-gray-900">
                    {student.admission_date 
                      ? new Date(student.admission_date).toLocaleDateString()
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Record Created</label>
                  <p className="text-gray-900">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}