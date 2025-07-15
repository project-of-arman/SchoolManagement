'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Edit, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Calendar,
  Star,
  Upload,Bell ,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ContentManagementProps {
  schoolId: string
  section: string
  content: any
  onContentUpdate: (section: string, content: any) => void
}

export function ContentManagement({ 
  schoolId, 
  section, 
  content, 
  onContentUpdate 
}: ContentManagementProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(content || {})
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('school_content')
        .upsert({
          school_id: schoolId,
          section,
          content: formData,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      onContentUpdate(section, formData)
      setEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save content')
    } finally {
      setLoading(false)
    }
  }

  const renderAboutSection = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Section Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="About Our School"
          disabled={!editing}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="School description..."
          rows={4}
          disabled={!editing}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vision">Vision</Label>
          <Textarea
            id="vision"
            value={formData.vision || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
            placeholder="School vision..."
            rows={3}
            disabled={!editing}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="mission">Mission</Label>
          <Textarea
            id="mission"
            value={formData.mission || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
            placeholder="School mission..."
            rows={3}
            disabled={!editing}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="students">Total Students</Label>
          <Input
            id="students"
            value={formData.stats?.students || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              stats: { ...prev.stats, students: e.target.value }
            }))}
            placeholder="500+"
            disabled={!editing}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="teachers">Total Teachers</Label>
          <Input
            id="teachers"
            value={formData.stats?.teachers || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              stats: { ...prev.stats, teachers: e.target.value }
            }))}
            placeholder="25+"
            disabled={!editing}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )

  const renderGallerySection = () => {
    const images = formData.images || []

    const addImage = () => {
      const newImage = {
        id: Date.now(),
        url: '',
        title: '',
        description: ''
      }
      setFormData(prev => ({
        ...prev,
        images: [...images, newImage]
      }))
    }

    const removeImage = (index: number) => {
      setFormData(prev => ({
        ...prev,
        images: images.filter((_: any, i: number) => i !== index)
      }))
    }

    const updateImage = (index: number, field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        images: images.map((img: any, i: number) => 
          i === index ? { ...img, [field]: value } : img
        )
      }))
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Gallery Images</h3>
          {editing && (
            <Button onClick={addImage} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image: any, index: number) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                {editing && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                <div className="space-y-3">
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={image.url || ''}
                      onChange={(e) => updateImage(index, 'url', e.target.value)}
                      placeholder="https://images.pexels.com/..."
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={image.title || ''}
                      onChange={(e) => updateImage(index, 'title', e.target.value)}
                      placeholder="Image title"
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  {image.url && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg'
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No images in gallery</p>
            {editing && (
              <Button onClick={addImage} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Image
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderNoticesSection = () => {
    const notices = formData.items || []

    const addNotice = () => {
      const newNotice = {
        id: Date.now(),
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        priority: 'normal'
      }
      setFormData(prev => ({
        ...prev,
        items: [...notices, newNotice]
      }))
    }

    const removeNotice = (index: number) => {
      setFormData(prev => ({
        ...prev,
        items: notices.filter((_: any, i: number) => i !== index)
      }))
    }

    const updateNotice = (index: number, field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        items: notices.map((notice: any, i: number) => 
          i === index ? { ...notice, [field]: value } : notice
        )
      }))
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">School Notices</h3>
          {editing && (
            <Button onClick={addNotice} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notices.map((notice: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={notice.priority === 'high' ? 'destructive' : 'secondary'}>
                    {notice.priority || 'normal'}
                  </Badge>
                  {editing && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeNotice(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={notice.title || ''}
                      onChange={(e) => updateNotice(index, 'title', e.target.value)}
                      placeholder="Notice title"
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={notice.description || ''}
                      onChange={(e) => updateNotice(index, 'description', e.target.value)}
                      placeholder="Notice description"
                      rows={3}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={notice.date || ''}
                        onChange={(e) => updateNotice(index, 'date', e.target.value)}
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <select
                        value={notice.priority || 'normal'}
                        onChange={(e) => updateNotice(index, 'priority', e.target.value)}
                        disabled={!editing}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notices published</p>
            {editing && (
              <Button onClick={addNotice} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Notice
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderFeaturedStudents = () => {
    const students = formData.featured || []

    const addStudent = () => {
      const newStudent = {
        id: Date.now(),
        name: '',
        class: '',
        achievement: '',
        photo: '',
        description: ''
      }
      setFormData(prev => ({
        ...prev,
        featured: [...students, newStudent]
      }))
    }

    const removeStudent = (index: number) => {
      setFormData(prev => ({
        ...prev,
        featured: students.filter((_: any, i: number) => i !== index)
      }))
    }

    const updateStudent = (index: number, field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        featured: students.map((student: any, i: number) => 
          i === index ? { ...student, [field]: value } : student
        )
      }))
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Featured Students</h3>
          {editing && (
            <Button onClick={addStudent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                {editing && (
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeStudent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label>Student Name</Label>
                    <Input
                      value={student.name || ''}
                      onChange={(e) => updateStudent(index, 'name', e.target.value)}
                      placeholder="Student name"
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Class</Label>
                      <Input
                        value={student.class || ''}
                        onChange={(e) => updateStudent(index, 'class', e.target.value)}
                        placeholder="Class 10"
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Achievement</Label>
                      <Input
                        value={student.achievement || ''}
                        onChange={(e) => updateStudent(index, 'achievement', e.target.value)}
                        placeholder="Top Student"
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Photo URL</Label>
                    <Input
                      value={student.photo || ''}
                      onChange={(e) => updateStudent(index, 'photo', e.target.value)}
                      placeholder="https://images.pexels.com/..."
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={student.description || ''}
                      onChange={(e) => updateStudent(index, 'description', e.target.value)}
                      placeholder="Student description..."
                      rows={2}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>

                  {student.photo && (
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-student.jpg'
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No featured students</p>
            {editing && (
              <Button onClick={addStudent} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (section) {
      case 'about-section':
        return renderAboutSection()
      case 'gallery':
        return renderGallerySection()
      case 'notices':
        return renderNoticesSection()
      case 'featured-students':
        return renderFeaturedStudents()
      default:
        return <div>Content section not found</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="capitalize">
            {section.replace('-', ' ')} Management
          </CardTitle>
          <div className="flex space-x-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditing(false)
                    setFormData(content || {})
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {renderContent()}
      </CardContent>
    </Card>
  )
}