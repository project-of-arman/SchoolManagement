'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit, 
  Save, 
  ArrowLeft,
  User,
  Users,
  MapPin,
  BookOpen,
  Award,
  Mail
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface Application {
  id: string
  school_id: string
  student_photo_url?: string
  full_name_bangla: string
  full_name_english: string
  father_name: string
  mother_name: string
  religion: string
  date_of_birth: string
  gender: string
  national_id_birth_cert: string
  father_nid: string
  mother_nid: string
  father_phone: string
  mother_phone: string
  father_occupation: string
  mother_occupation: string
  email?: string
  present_village_ward: string
  present_post_office_code: string
  present_upazila: string
  present_district: string
  permanent_same_as_present: boolean
  permanent_village_ward?: string
  permanent_post_office_code?: string
  permanent_upazila?: string
  permanent_district?: string
  has_different_guardian: boolean
  guardian_name?: string
  guardian_nid?: string
  guardian_phone?: string
  guardian_relation?: string
  guardian_status?: string
  last_school_name: string
  last_class: string
  year_passed: string
  education_board: string
  previous_school_eiin?: string
  tc_ssc_roll?: string
  jsc_ssc_group?: string
  gpa?: number
  result_education_board?: string
  has_scholarship: boolean
  technical_other_details?: string
  contact_via_sms: boolean
  contact_via_email: boolean
  contact_via_phone: boolean
  contact_via_post: boolean
  desired_class: string
  desired_group?: string
  desired_section?: string
  terms_accepted: boolean
  application_status: string
  created_at: string
  updated_at: string
}

interface ApplicationEditProps {
  application: Application
  onBack: () => void
  onSave: (updatedApplication: Application) => void
}

export function ApplicationEdit({ application, onBack, onSave }: ApplicationEditProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const [formData, setFormData] = useState(application)

  const religions = ['Islam', 'Hindu', 'Christian', 'Buddhist', 'Other']
  const occupations = ['Farmer', 'Doctor', 'Teacher', 'Business', 'Engineer', 'Government Service', 'Private Service', 'Housewife', 'None', 'Other']
  const guardianRelations = ['Father', 'Mother', 'Uncle', 'Aunt', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Other']
  const guardianStatuses = ['Alive', 'Dead', 'Abroad', 'Not applicable']
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9']
  const groups = ['Science', 'Commerce', 'Arts']
  const boards = ['Dhaka', 'Chittagong', 'Comilla', 'Jessore', 'Rajshahi', 'Barisal', 'Sylhet', 'Dinajpur', 'Madrasah', 'Technical']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: updateError } = await supabase
        .from('admission_applications')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id)
        .select()
        .single()

      if (updateError) throw updateError

      toast({
        title: "Application Updated",
        description: "The application has been successfully updated.",
      })

      onSave(data)
    } catch (err: any) {
      setError(err.message || 'Failed to update application')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof Application, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-copy present address to permanent if checkbox is checked
    if (field === 'permanent_same_as_present' && value === true) {
      setFormData(prev => ({
        ...prev,
        permanent_village_ward: prev.present_village_ward,
        permanent_post_office_code: prev.present_post_office_code,
        permanent_upazila: prev.present_upazila,
        permanent_district: prev.present_district
      }))
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
              Edit Application: {application.full_name_english}
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

        {/* Student Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Student Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="student_photo_url">Photo URL</Label>
              <Input
                id="student_photo_url"
                type="url"
                value={formData.student_photo_url || ''}
                onChange={(e) => updateFormData('student_photo_url', e.target.value)}
                placeholder="https://images.pexels.com/..."
                className="mt-1"
              />
              {formData.student_photo_url && (
                <div className="mt-3">
                  <img
                    src={formData.student_photo_url}
                    alt="Student preview"
                    className="w-24 h-24 rounded-lg object-cover border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name_bangla">Full Name (Bangla) *</Label>
                <Input
                  id="full_name_bangla"
                  value={formData.full_name_bangla}
                  onChange={(e) => updateFormData('full_name_bangla', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="full_name_english">Full Name (English) *</Label>
                <Input
                  id="full_name_english"
                  value={formData.full_name_english}
                  onChange={(e) => updateFormData('full_name_english', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="father_name">Father's Name *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => updateFormData('father_name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="mother_name">Mother's Name *</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => updateFormData('mother_name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="religion">Religion *</Label>
                <Select
                  value={formData.religion}
                  onValueChange={(value) => updateFormData('religion', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((religion) => (
                      <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData('gender', value)}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="national_id_birth_cert">National ID/Birth Certificate *</Label>
                <Input
                  id="national_id_birth_cert"
                  value={formData.national_id_birth_cert}
                  onChange={(e) => updateFormData('national_id_birth_cert', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="father_nid">Father's NID *</Label>
                <Input
                  id="father_nid"
                  value={formData.father_nid}
                  onChange={(e) => updateFormData('father_nid', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="mother_nid">Mother's NID *</Label>
                <Input
                  id="mother_nid"
                  value={formData.mother_nid}
                  onChange={(e) => updateFormData('mother_nid', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="father_phone">Father's Phone *</Label>
                <Input
                  id="father_phone"
                  type="tel"
                  value={formData.father_phone}
                  onChange={(e) => updateFormData('father_phone', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="mother_phone">Mother's Phone *</Label>
                <Input
                  id="mother_phone"
                  type="tel"
                  value={formData.mother_phone}
                  onChange={(e) => updateFormData('mother_phone', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="father_occupation">Father's Occupation *</Label>
                <Select
                  value={formData.father_occupation}
                  onValueChange={(value) => updateFormData('father_occupation', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map((occupation) => (
                      <SelectItem key={occupation} value={occupation}>{occupation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mother_occupation">Mother's Occupation *</Label>
                <Select
                  value={formData.mother_occupation}
                  onValueChange={(value) => updateFormData('mother_occupation', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map((occupation) => (
                      <SelectItem key={occupation} value={occupation}>{occupation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Present Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Present Address *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="present_village_ward">Village/Ward *</Label>
                  <Input
                    id="present_village_ward"
                    value={formData.present_village_ward}
                    onChange={(e) => updateFormData('present_village_ward', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="present_post_office_code">Post Office + Code *</Label>
                  <Input
                    id="present_post_office_code"
                    value={formData.present_post_office_code}
                    onChange={(e) => updateFormData('present_post_office_code', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="present_upazila">Upazila *</Label>
                  <Input
                    id="present_upazila"
                    value={formData.present_upazila}
                    onChange={(e) => updateFormData('present_upazila', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="present_district">District *</Label>
                  <Input
                    id="present_district"
                    value={formData.present_district}
                    onChange={(e) => updateFormData('present_district', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="permanent_same_as_present"
                  checked={formData.permanent_same_as_present}
                  onCheckedChange={(checked) => updateFormData('permanent_same_as_present', checked as boolean)}
                />
                <Label htmlFor="permanent_same_as_present">
                  Permanent address is same as present address
                </Label>
              </div>

              {!formData.permanent_same_as_present && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="permanent_village_ward">Village/Ward</Label>
                      <Input
                        id="permanent_village_ward"
                        value={formData.permanent_village_ward || ''}
                        onChange={(e) => updateFormData('permanent_village_ward', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="permanent_post_office_code">Post Office + Code</Label>
                      <Input
                        id="permanent_post_office_code"
                        value={formData.permanent_post_office_code || ''}
                        onChange={(e) => updateFormData('permanent_post_office_code', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="permanent_upazila">Upazila</Label>
                      <Input
                        id="permanent_upazila"
                        value={formData.permanent_upazila || ''}
                        onChange={(e) => updateFormData('permanent_upazila', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="permanent_district">District</Label>
                      <Input
                        id="permanent_district"
                        value={formData.permanent_district || ''}
                        onChange={(e) => updateFormData('permanent_district', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Guardian Information (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_different_guardian"
                checked={formData.has_different_guardian}
                onCheckedChange={(checked) => updateFormData('has_different_guardian', checked as boolean)}
              />
              <Label htmlFor="has_different_guardian">
                I have a guardian different from parents
              </Label>
            </div>

            {formData.has_different_guardian && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name || ''}
                    onChange={(e) => updateFormData('guardian_name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_nid">Guardian NID</Label>
                  <Input
                    id="guardian_nid"
                    value={formData.guardian_nid || ''}
                    onChange={(e) => updateFormData('guardian_nid', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    type="tel"
                    value={formData.guardian_phone || ''}
                    onChange={(e) => updateFormData('guardian_phone', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_relation">Relation</Label>
                  <Select
                    value={formData.guardian_relation || ''}
                    onValueChange={(value) => updateFormData('guardian_relation', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {guardianRelations.map((relation) => (
                        <SelectItem key={relation} value={relation}>{relation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guardian_status">Guardian Status</Label>
                  <Select
                    value={formData.guardian_status || ''}
                    onValueChange={(value) => updateFormData('guardian_status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {guardianStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Previous Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last_school_name">Last School Name *</Label>
                <Input
                  id="last_school_name"
                  value={formData.last_school_name}
                  onChange={(e) => updateFormData('last_school_name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="last_class">Last Class *</Label>
                <Input
                  id="last_class"
                  value={formData.last_class}
                  onChange={(e) => updateFormData('last_class', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="year_passed">Year Passed *</Label>
                <Input
                  id="year_passed"
                  value={formData.year_passed}
                  onChange={(e) => updateFormData('year_passed', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="education_board">Board *</Label>
                <Select
                  value={formData.education_board}
                  onValueChange={(value) => updateFormData('education_board', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="previous_school_eiin">EIIN of Previous School</Label>
                <Input
                  id="previous_school_eiin"
                  value={formData.previous_school_eiin || ''}
                  onChange={(e) => updateFormData('previous_school_eiin', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tc_ssc_roll">TC/SSC Roll (Optional)</Label>
                <Input
                  id="tc_ssc_roll"
                  value={formData.tc_ssc_roll || ''}
                  onChange={(e) => updateFormData('tc_ssc_roll', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Results & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Exam Results & Class Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="desired_class">Desired Class *</Label>
                <Select
                  value={formData.desired_class}
                  onValueChange={(value) => updateFormData('desired_class', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="desired_group">Group</Label>
                <Select
                  value={formData.desired_group || ''}
                  onValueChange={(value) => updateFormData('desired_group', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="desired_section">Section (Optional)</Label>
                <Input
                  id="desired_section"
                  value={formData.desired_section || ''}
                  onChange={(e) => updateFormData('desired_section', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="jsc_ssc_group">JSC/SSC Group</Label>
                <Select
                  value={formData.jsc_ssc_group || ''}
                  onValueChange={(value) => updateFormData('jsc_ssc_group', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={formData.gpa || ''}
                  onChange={(e) => updateFormData('gpa', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="result_education_board">Result Education Board</Label>
                <Select
                  value={formData.result_education_board || ''}
                  onValueChange={(value) => updateFormData('result_education_board', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_scholarship"
                checked={formData.has_scholarship}
                onCheckedChange={(checked) => updateFormData('has_scholarship', checked as boolean)}
              />
              <Label htmlFor="has_scholarship">
                Has Scholarship
              </Label>
            </div>

            <div>
              <Label htmlFor="technical_other_details">Technical/Other Details</Label>
              <Textarea
                id="technical_other_details"
                value={formData.technical_other_details || ''}
                onChange={(e) => updateFormData('technical_other_details', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_via_sms"
                  checked={formData.contact_via_sms}
                  onCheckedChange={(checked) => updateFormData('contact_via_sms', checked as boolean)}
                />
                <Label htmlFor="contact_via_sms">SMS</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_via_email"
                  checked={formData.contact_via_email}
                  onCheckedChange={(checked) => updateFormData('contact_via_email', checked as boolean)}
                />
                <Label htmlFor="contact_via_email">Email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_via_phone"
                  checked={formData.contact_via_phone}
                  onCheckedChange={(checked) => updateFormData('contact_via_phone', checked as boolean)}
                />
                <Label htmlFor="contact_via_phone">Phone</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_via_post"
                  checked={formData.contact_via_post}
                  onCheckedChange={(checked) => updateFormData('contact_via_post', checked as boolean)}
                />
                <Label htmlFor="contact_via_post">Post</Label>
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