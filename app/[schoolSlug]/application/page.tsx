'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSchoolBySlug } from '@/lib/auth'
import Link from 'next/link'

export default function ApplicationPage({ params }: { params: { schoolSlug: string } }) {
  const [formData, setFormData] = useState({
    rollNumber: '',
    applicationType: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const applicationTypes = [
    { value: 'transfer_certificate', label: 'Transfer Certificate (TC)' },
    { value: 'fee_discount', label: 'Fee Discount Application' },
    { value: 'general_certificate', label: 'General Certificate' },
    { value: 'admit_card', label: 'Admit Card' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const school = await getSchoolBySlug(params.schoolSlug)
      
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          school_id: school.id,
          roll_number: formData.rollNumber,
          application_type: formData.applicationType,
          message: formData.message,
          status: 'pending'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ rollNumber: '', applicationType: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your application has been successfully submitted. The school administration will review it and contact you soon.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setSuccess(false)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Submit Another Application
              </Button>
              <Link href={`/${params.schoolSlug}`}>
                <Button variant="outline" className="w-full">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/${params.schoolSlug}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Application</h1>
          <p className="text-gray-600">
            Fill out this form to submit your application. No login required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                  placeholder="Enter your roll number"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="applicationType">Application Type *</Label>
                <Select
                  value={formData.applicationType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, applicationType: value }))}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Additional Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide any additional information about your application..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Application Process</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your application will be reviewed by the school administration</li>
                  <li>• You may be contacted for additional information</li>
                  <li>• Some applications may require payment verification</li>
                  <li>• Processing time is typically 3-5 business days</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}