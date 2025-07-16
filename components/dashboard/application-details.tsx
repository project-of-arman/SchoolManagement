'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Edit, 
  ArrowLeft, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  Mail,
  User,
  BookOpen,
  Award,
  Printer,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

interface ApplicationDetailsProps {
  applicationId: string
  onBack: () => void
  onEdit: (application: Application) => void
  onStatusUpdate: (applicationId: string, status: string) => void
}

export function ApplicationDetails({ applicationId, onBack, onEdit, onStatusUpdate }: ApplicationDetailsProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('admission_applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (error) throw error
      setApplication(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading application details...</p>
      </div>
    )
  }

  if (error || !application) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Application not found'}</AlertDescription>
          </Alert>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden in print */}
      <Card className="print:hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Application Details
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getStatusColor(application.application_status)}>
                    {getStatusIcon(application.application_status)}
                    <span className="ml-1 capitalize">{application.application_status}</span>
                  </Badge>
                  <Badge variant="outline">
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => onEdit(application)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Printable Application Details */}
      <div id="printable-application" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Print Header - Only visible in print */}
        <div className="hidden print:block lg:col-span-2 text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold mb-2">Admission Application</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Application ID: {application.id}</p>
            <p>Date: {new Date(application.created_at).toLocaleDateString()}</p>
            <p>Status: <span className="font-semibold capitalize">{application.application_status}</span></p>
          </div>
        </div>

        {/* Student Photo */}
        {application.student_photo_url && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={application.student_photo_url}
                  alt="Student"
                  className="w-32 h-32 rounded-lg object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name (Bangla)</label>
                <p className="text-gray-900">{application.full_name_bangla}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Name (English)</label>
                <p className="text-gray-900">{application.full_name_english}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">
                  {new Date(application.date_of_birth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">{application.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Religion</label>
                <p className="text-gray-900">{application.religion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">National ID/Birth Cert</label>
                <p className="text-gray-900">{application.national_id_birth_cert}</p>
              </div>
            </div>

            {application.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{application.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Father's Information</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{application.father_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{application.father_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">NID</label>
                    <p className="text-gray-900">{application.father_nid}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-900">{application.father_occupation}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mother's Information</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{application.mother_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{application.mother_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">NID</label>
                    <p className="text-gray-900">{application.mother_nid}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-900">{application.mother_occupation}</p>
                </div>
              </div>
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
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Present Address</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Village/Ward</label>
                  <p className="text-gray-900">{application.present_village_ward}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Post Office</label>
                    <p className="text-gray-900">{application.present_post_office_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Upazila</label>
                    <p className="text-gray-900">{application.present_upazila}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">District</label>
                  <p className="text-gray-900">{application.present_district}</p>
                </div>
              </div>
            </div>

            {!application.permanent_same_as_present && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Permanent Address</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Village/Ward</label>
                    <p className="text-gray-900">{application.permanent_village_ward || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Post Office</label>
                      <p className="text-gray-900">{application.permanent_post_office_code || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Upazila</label>
                      <p className="text-gray-900">{application.permanent_upazila || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">District</label>
                    <p className="text-gray-900">{application.permanent_district || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guardian Information */}
        {application.has_different_guardian && application.guardian_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{application.guardian_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relation</label>
                  <p className="text-gray-900">{application.guardian_relation}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{application.guardian_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">{application.guardian_status}</p>
                </div>
              </div>
              {application.guardian_nid && (
                <div>
                  <label className="text-sm font-medium text-gray-500">NID</label>
                  <p className="text-gray-900">{application.guardian_nid}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Previous Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Previous Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Last School</label>
                <p className="text-gray-900">{application.last_school_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Class</label>
                <p className="text-gray-900">{application.last_class}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Year Passed</label>
                <p className="text-gray-900">{application.year_passed}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Education Board</label>
                <p className="text-gray-900">{application.education_board}</p>
              </div>
            </div>
            {application.previous_school_eiin && (
              <div>
                <label className="text-sm font-medium text-gray-500">Previous School EIIN</label>
                <p className="text-gray-900">{application.previous_school_eiin}</p>
              </div>
            )}
            {application.tc_ssc_roll && (
              <div>
                <label className="text-sm font-medium text-gray-500">TC/SSC Roll</label>
                <p className="text-gray-900">{application.tc_ssc_roll}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Exam Results & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Desired Class</label>
                <p className="text-gray-900">{application.desired_class}</p>
              </div>
              {application.desired_group && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Desired Group</label>
                  <p className="text-gray-900">{application.desired_group}</p>
                </div>
              )}
            </div>
            {application.desired_section && (
              <div>
                <label className="text-sm font-medium text-gray-500">Desired Section</label>
                <p className="text-gray-900">{application.desired_section}</p>
              </div>
            )}
            {application.jsc_ssc_group && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">JSC/SSC Group</label>
                  <p className="text-gray-900">{application.jsc_ssc_group}</p>
                </div>
                {application.gpa && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">GPA</label>
                    <p className="text-gray-900">{application.gpa}</p>
                  </div>
                )}
              </div>
            )}
            {application.result_education_board && (
              <div>
                <label className="text-sm font-medium text-gray-500">Result Education Board</label>
                <p className="text-gray-900">{application.result_education_board}</p>
              </div>
            )}
            {application.has_scholarship && (
              <div>
                <Badge variant="secondary">Has Scholarship</Badge>
              </div>
            )}
            {application.technical_other_details && (
              <div>
                <label className="text-sm font-medium text-gray-500">Technical/Other Details</label>
                <p className="text-gray-900">{application.technical_other_details}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {application.contact_via_sms && <Badge variant="outline">SMS</Badge>}
              {application.contact_via_email && <Badge variant="outline">Email</Badge>}
              {application.contact_via_phone && <Badge variant="outline">Phone</Badge>}
              {application.contact_via_post && <Badge variant="outline">Post</Badge>}
              {!application.contact_via_sms && !application.contact_via_email && 
               !application.contact_via_phone && !application.contact_via_post && (
                <span className="text-gray-500">No preferences specified</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Hidden in print */}
      {application.application_status === 'pending' && (
        <Card className="print:hidden">
          <CardContent className="p-6">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => onStatusUpdate(application.id, 'approved')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Application
              </Button>
              <Button
                variant="destructive"
                onClick={() => onStatusUpdate(application.id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}