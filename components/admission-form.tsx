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
  FileText, 
  Upload, 
  User, 
  Users, 
  Phone, 
  Calendar,
  GraduationCap,
  Shield,
  CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AdmissionFormProps {
  schoolId: string
  schoolSlug: string
  onSuccess: () => void
}

interface FormData {
  image: string
  full_name: string
  father_name: string
  mother_name: string
  father_phone: string
  mother_phone: string
  father_occupation: string
  mother_occupation: string
  class: string
  group: string
  date_of_birth: string
  gender: string
  has_guardian: boolean
  guardian_full_name: string
  guardian_phone: string
  guardian_relation: string
}

export function AdmissionForm({ schoolId, schoolSlug, onSuccess }: AdmissionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    image: '',
    full_name: '',
    father_name: '',
    mother_name: '',
    father_phone: '',
    mother_phone: '',
    father_occupation: '',
    mother_occupation: '',
    class: '',
    group: '',
    date_of_birth: '',
    gender: '',
    has_guardian: false,
    guardian_full_name: '',
    guardian_phone: '',
    guardian_relation: ''
  })

  const occupationOptions = [
    'Farmer',
    'Doctor', 
    'Teacher',
    'Business',
    'Engineer',
    'Government Service',
    'Private Service',
    'Housewife',
    'None',
    'Others'
  ]

  const classOptions = [
    'Class 6',
    'Class 7', 
    'Class 8',
    'Class 9'
  ]

  const groupOptions = [
    'Science',
    'Commerce',
    'Arts'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      const requiredFields = [
        'full_name', 'father_name', 'mother_name', 'father_phone', 
        'mother_phone', 'father_occupation', 'mother_occupation', 
        'class', 'date_of_birth', 'gender'
      ]

      for (const field of requiredFields) {
        if (!formData[field as keyof FormData]) {
          throw new Error(`${field.replace('_', ' ')} is required`)
        }
      }

      // If Class 9 is selected, group is required
      if (formData.class === 'Class 9' && !formData.group) {
        throw new Error('Group selection is required for Class 9')
      }

      // If guardian info is checked, validate guardian fields
      if (formData.has_guardian) {
        if (!formData.guardian_full_name || !formData.guardian_phone || !formData.guardian_relation) {
          throw new Error('All guardian information fields are required when guardian info is provided')
        }
      }

      // Prepare admission data
      const admissionData = {
        school_id: schoolId,
        roll_number: `ADM-${Date.now()}`, // Generate temporary admission number
        application_type: 'admission',
        message: `Admission Application for ${formData.class}`,
        status: 'pending',
        payment_info: {
          student_info: {
            image: formData.image,
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            class: formData.class,
            group: formData.group || null
          },
          parent_info: {
            father_name: formData.father_name,
            father_phone: formData.father_phone,
            father_occupation: formData.father_occupation,
            mother_name: formData.mother_name,
            mother_phone: formData.mother_phone,
            mother_occupation: formData.mother_occupation
          },
          guardian_info: formData.has_guardian ? {
            guardian_full_name: formData.guardian_full_name,
            guardian_phone: formData.guardian_phone,
            guardian_relation: formData.guardian_relation
          } : null,
          application_date: new Date().toISOString()
        }
      }

      const { error: insertError } = await supabase
        .from('applications')
        .insert(admissionData)

      if (insertError) throw insertError

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to submit admission application')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-center justify-center">
            <GraduationCap className="h-6 w-6 mr-2" />
            Admission Application Form
          </CardTitle>
          <p className="text-center text-gray-600">
            Fill out all required information to apply for admission
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Student Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Upload className="h-5 w-5 mr-2" />
                  Student Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="image">Photo URL *</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => updateFormData('image', e.target.value)}
                    placeholder="https://images.pexels.com/photos/..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please provide a direct link to the student's photo
                  </p>
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
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

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => updateFormData('full_name', e.target.value)}
                      placeholder="Student's full name"
                      required
                      className="mt-1"
                    />
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
                </div>

                <div>
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={formData.class}
                      onValueChange={(value) => updateFormData('class', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((classOption) => (
                          <SelectItem key={classOption} value={classOption}>
                            {classOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.class === 'Class 9' && (
                    <div>
                      <Label htmlFor="group">Group *</Label>
                      <Select
                        value={formData.group}
                        onValueChange={(value) => updateFormData('group', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupOptions.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Father's Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Father's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="father_name">Father's Name *</Label>
                      <Input
                        id="father_name"
                        value={formData.father_name}
                        onChange={(e) => updateFormData('father_name', e.target.value)}
                        placeholder="Father's full name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="father_phone">Father's Phone *</Label>
                      <Input
                        id="father_phone"
                        type="tel"
                        value={formData.father_phone}
                        onChange={(e) => updateFormData('father_phone', e.target.value)}
                        placeholder="+880-XXX-XXXXXX"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="father_occupation">Father's Occupation *</Label>
                      <Select
                        value={formData.father_occupation}
                        onValueChange={(value) => updateFormData('father_occupation', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                        <SelectContent>
                          {occupationOptions.map((occupation) => (
                            <SelectItem key={occupation} value={occupation}>
                              {occupation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Mother's Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Mother's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="mother_name">Mother's Name *</Label>
                      <Input
                        id="mother_name"
                        value={formData.mother_name}
                        onChange={(e) => updateFormData('mother_name', e.target.value)}
                        placeholder="Mother's full name"
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
                        placeholder="+880-XXX-XXXXXX"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mother_occupation">Mother's Occupation *</Label>
                      <Select
                        value={formData.mother_occupation}
                        onValueChange={(value) => updateFormData('mother_occupation', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                        <SelectContent>
                          {occupationOptions.map((occupation) => (
                            <SelectItem key={occupation} value={occupation}>
                              {occupation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 mr-2" />
                  Guardian Information (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_guardian"
                    checked={formData.has_guardian}
                    onCheckedChange={(checked) => updateFormData('has_guardian', checked as boolean)}
                  />
                  <Label htmlFor="has_guardian">
                    I have a guardian (different from parents)
                  </Label>
                </div>

                {formData.has_guardian && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="guardian_full_name">Guardian's Name *</Label>
                      <Input
                        id="guardian_full_name"
                        value={formData.guardian_full_name}
                        onChange={(e) => updateFormData('guardian_full_name', e.target.value)}
                        placeholder="Guardian's full name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="guardian_phone">Guardian's Phone *</Label>
                      <Input
                        id="guardian_phone"
                        type="tel"
                        value={formData.guardian_phone}
                        onChange={(e) => updateFormData('guardian_phone', e.target.value)}
                        placeholder="+880-XXX-XXXXXX"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="guardian_relation">Relation *</Label>
                      <Input
                        id="guardian_relation"
                        value={formData.guardian_relation}
                        onChange={(e) => updateFormData('guardian_relation', e.target.value)}
                        placeholder="Uncle, Aunt, Grandfather, etc."
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Important Information
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• All fields marked with (*) are required</li>
                <li>• Please ensure all information is accurate and complete</li>
                <li>• Group selection is only required for Class 9 students</li>
                <li>• Guardian information is optional but recommended if applicable</li>
                <li>• You will receive a confirmation after successful submission</li>
                <li>• The school administration will contact you regarding the next steps</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Submit Admission Application
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}