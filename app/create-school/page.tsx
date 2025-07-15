'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { School, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'
import Link from 'next/link'

export default function CreateSchoolPage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const router = useRouter()

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, schoolName: name }))
    if (name && !formData.slug) {
      const generatedSlug = generateSlug(name)
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
      checkSlugAvailability(generatedSlug)
    }
  }

  const handleSlugChange = (slug: string) => {
    const cleanSlug = generateSlug(slug)
    setFormData(prev => ({ ...prev, slug: cleanSlug }))
    if (cleanSlug) {
      checkSlugAvailability(cleanSlug)
    } else {
      setSlugAvailable(null)
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setCheckingSlug(true)
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .eq('slug', slug)
        .single()

      setSlugAvailable(!data)
    } catch (err) {
      setSlugAvailable(true) // If no record found, slug is available
    } finally {
      setCheckingSlug(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if user is authenticated
      const user = await getUser()
      if (!user) {
        setError('You must be logged in to create a school')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.schoolName || !formData.slug || !formData.email) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Check slug availability one more time
      const { data: existingSchool } = await supabase
        .from('schools')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existingSchool) {
        setError('This slug is already taken. Please choose a different one.')
        setLoading(false)
        return
      }

      // Create school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.schoolName,
          slug: formData.slug,
          owner_id: user.id,
          settings: {
            theme: 'green',
            contact: {
              phone: formData.phone,
              email: formData.email,
              address: formData.address
            },
            description: formData.description
          }
        })
        .select()
        .single()

      if (schoolError) throw schoolError

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || formData.email,
          role: 'school_owner',
          school_id: school.id,
          full_name: user.user_metadata?.full_name || 'School Owner'
        })

      if (userError) throw userError

      // Create default content sections
      const defaultContent = [
        {
          school_id: school.id,
          section: 'hero',
          content: {
            images: [
              {
                url: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg',
                title: `Welcome to ${formData.schoolName}`,
                description: 'Excellence in Education'
              }
            ]
          }
        },
        {
          school_id: school.id,
          section: 'about',
          content: {
            title: `About ${formData.schoolName}`,
            description: formData.description || 'We are committed to providing quality education and nurturing young minds to become responsible citizens of tomorrow.',
            vision: 'To be a leading educational institution',
            mission: 'Empowering students with knowledge and values',
            stats: {
              students: '500+',
              teachers: '25+'
            }
          }
        },
        {
          school_id: school.id,
          section: 'gallery',
          content: {
            images: [
              {
                url: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg',
                title: 'Science Laboratory'
              },
              {
                url: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg',
                title: 'Modern Classroom'
              }
            ]
          }
        },
        {
          school_id: school.id,
          section: 'notices',
          content: {
            items: [
              {
                title: 'Welcome to Our New Website',
                description: 'We are excited to launch our new school website with modern features.',
                date: new Date().toISOString().split('T')[0]
              }
            ]
          }
        },
        {
          school_id: school.id,
          section: 'students',
          content: {
            featured: []
          }
        },
        {
          school_id: school.id,
          section: 'location',
          content: {
            address: formData.address || 'School Address, City, Bangladesh',
            phone: formData.phone || '+880-XXX-XXXXXX',
            email: formData.email
          }
        }
      ]

      const { error: contentError } = await supabase
        .from('school_content')
        .insert(defaultContent)

      if (contentError) throw contentError

      // Redirect to the new school's dashboard
      router.push(`/${formData.slug}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Failed to create school')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <School className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">SchoolSaaS</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your School Website</h1>
          <p className="text-gray-600">
            Set up your school's online presence in minutes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              School Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="schoolName">School Name *</Label>
                <Input
                  id="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your school name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Website URL *</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    schoolsaas.app/
                  </span>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="your-school-name"
                    required
                    className="rounded-l-none"
                    minLength={3}
                    maxLength={50}
                    pattern="[a-z0-9-]+"
                  />
                </div>
                {checkingSlug && (
                  <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                )}
                {slugAvailable === true && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Available
                  </p>
                )}
                {slugAvailable === false && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Not available
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed. Minimum 3 characters.
                </p>
              </div>

              <div>
                <Label htmlFor="description">School Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your school..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="school@example.com"
                    required
                    className="mt-1"
                  />
                </div>

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
              </div>

              <div>
                <Label htmlFor="address">School Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete address of your school..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your own school website at schoolsaas.app/{formData.slug || 'your-slug'}</li>
                  <li>• Admin dashboard to manage content and applications</li>
                  <li>• Student application system</li>
                  <li>• Teacher management tools</li>
                  <li>• Result management system</li>
                  <li>• Payment verification system</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || slugAvailable === false || checkingSlug}
              >
                {loading ? 'Creating School...' : 'Create School Website'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 text-sm"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}