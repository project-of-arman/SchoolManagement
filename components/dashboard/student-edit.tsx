'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit, 
  Save, 
  ArrowLeft,
  User,
  Phone,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

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

interface StudentEditProps {
  student: Student
  onBack: () => void
  onSave: (updatedStudent: Student) => void
}

export function StudentEdit({ student, onBack, onSave }: StudentEditProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    roll_number: student.roll_number || '',
    full_name: student.full_name || '',
    class: student.class || '',
    section: student.section || '',
    date_of_birth: student.date_of_birth || '',
    gender: student.gender || '',
    phone: student.phone || '',
    address: student.address || '',
    father_name: student.father_name || '',
    father_phone: student.father_phone || '',
    father_occupation: student.father_occupation || '',
    mother_name: student.mother_name || '',
    mother_phone: student.mother_phone || '',
    mother_occupation: student.mother_occupation || '',
    guardian_name: student.guardian_name || '',
    guardian_phone: student.guardian_phone || '',
    guardian_relation: student.guardian_relation || '',
    admission_date: student.admission_date || '',
    status: student.status || 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: updateError } = await supabase
        .from('students')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id)
        .select()
        .single()

      if (updateError) throw updateError

      toast({
        title: "Student Updated",
        description: `${formData.full_name}'s information has been successfully updated.`,
      })

      onSave(data)
    } catch (err: any) {
      setError(err.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit Student: {student.full_name}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete address"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
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
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Guardian Information (if different from parents)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}