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
  BarChart3, 
  Plus, 
  Save, 
  Trash2, 
  Award,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Result {
  id: string
  roll_number: string
  class: string
  subject: string
  marks: number
  total_marks: number
  exam_type: string
  grade?: string
  created_at: string
}

interface ResultFormData {
  roll_number: string
  class: string
  subject: string
  marks: string
  total_marks: string
  exam_type: string
}

interface ResultManagementProps {
  schoolId: string
}

export function ResultManagement({ schoolId }: ResultManagementProps) {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<ResultFormData>({
    roll_number: '',
    class: '',
    subject: '',
    marks: '',
    total_marks: '100',
    exam_type: ''
  })
  const [bulkResults, setBulkResults] = useState<ResultFormData[]>([])
  const [showBulkEntry, setShowBulkEntry] = useState(false)

  const examTypes = [
    'First Terminal',
    'Second Terminal',
    'Final Exam',
    'Class Test',
    'Assignment',
    'Practical',
    'Oral Test'
  ]

  const subjects = [
    'Bangla',
    'English',
    'Mathematics',
    'Science',
    'Social Science',
    'Religion',
    'Physical Education',
    'ICT',
    'Arts & Crafts'
  ]

  const classes = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ]

  useEffect(() => {
    fetchResults()
  }, [schoolId])

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results')
    }
  }

  const calculateGrade = (marks: number, totalMarks: number): string => {
    const percentage = (marks / totalMarks) * 100
    
    if (percentage >= 80) return 'A+'
    if (percentage >= 70) return 'A'
    if (percentage >= 60) return 'A-'
    if (percentage >= 50) return 'B'
    if (percentage >= 40) return 'C'
    if (percentage >= 33) return 'D'
    return 'F'
  }

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800'
      case 'A': return 'bg-green-100 text-green-700'
      case 'A-': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-orange-100 text-orange-800'
      case 'D': return 'bg-red-100 text-red-700'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSingleResult = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const marks = parseInt(formData.marks)
      const totalMarks = parseInt(formData.total_marks)
      const grade = calculateGrade(marks, totalMarks)

      const { error } = await supabase
        .from('results')
        .insert({
          school_id: schoolId,
          roll_number: formData.roll_number,
          class: formData.class,
          subject: formData.subject,
          marks,
          total_marks: totalMarks,
          exam_type: formData.exam_type,
          grade
        })

      if (error) throw error

      setSuccess('Result added successfully!')
      setFormData({
        roll_number: '',
        class: '',
        subject: '',
        marks: '',
        total_marks: '100',
        exam_type: ''
      })
      fetchResults()
    } catch (err: any) {
      setError(err.message || 'Failed to add result')
    } finally {
      setLoading(false)
    }
  }

  const addBulkRow = () => {
    setBulkResults(prev => [...prev, {
      roll_number: '',
      class: formData.class,
      subject: formData.subject,
      marks: '',
      total_marks: formData.total_marks,
      exam_type: formData.exam_type
    }])
  }

  const updateBulkRow = (index: number, field: keyof ResultFormData, value: string) => {
    setBulkResults(prev => prev.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    ))
  }

  const removeBulkRow = (index: number) => {
    setBulkResults(prev => prev.filter((_, i) => i !== index))
  }

  const handleBulkSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const resultsToInsert = bulkResults.map(result => {
        const marks = parseInt(result.marks)
        const totalMarks = parseInt(result.total_marks)
        const grade = calculateGrade(marks, totalMarks)

        return {
          school_id: schoolId,
          roll_number: result.roll_number,
          class: result.class,
          subject: result.subject,
          marks,
          total_marks: totalMarks,
          exam_type: result.exam_type,
          grade
        }
      })

      const { error } = await supabase
        .from('results')
        .insert(resultsToInsert)

      if (error) throw error

      setSuccess(`${resultsToInsert.length} results added successfully!`)
      setBulkResults([])
      setShowBulkEntry(false)
      fetchResults()
    } catch (err: any) {
      setError(err.message || 'Failed to add bulk results')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return

    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId)

      if (error) throw error

      setResults(prev => prev.filter(r => r.id !== resultId))
      setSuccess('Result deleted successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to delete result')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Result Management
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={showBulkEntry ? "outline" : "default"}
                onClick={() => setShowBulkEntry(!showBulkEntry)}
              >
                {showBulkEntry ? 'Single Entry' : 'Bulk Entry'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Single Result Entry */}
      {!showBulkEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Add Single Result</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleResult} className="space-y-4">
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
                  <Label htmlFor="class">Class *</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="exam_type">Exam Type *</Label>
                  <Select
                    value={formData.exam_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value }))}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="marks">Marks Obtained *</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, marks: e.target.value }))}
                    placeholder="85"
                    min="0"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="total_marks">Total Marks *</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_marks: e.target.value }))}
                    placeholder="100"
                    min="1"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Adding Result...' : 'Add Result'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Entry */}
      {showBulkEntry && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bulk Result Entry</CardTitle>
              <Button onClick={addBulkRow} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Class (Common)</Label>
                <Select
                  value={formData.class}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject (Common)</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Exam Type (Common)</Label>
                <Select
                  value={formData.exam_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Total Marks (Common)</Label>
                <Input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_marks: e.target.value }))}
                  placeholder="100"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Bulk Rows */}
            <div className="space-y-2">
              {bulkResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <Input
                    placeholder="Roll Number"
                    value={result.roll_number}
                    onChange={(e) => updateBulkRow(index, 'roll_number', e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    value={result.marks}
                    onChange={(e) => updateBulkRow(index, 'marks', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">/ {result.total_marks}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBulkRow(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {bulkResults.length > 0 && (
              <Button
                onClick={handleBulkSubmit}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Adding Results...' : `Add ${bulkResults.length} Results`}
              </Button>
            )}

            {bulkResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No results added yet</p>
                <p className="text-sm">Fill common fields above and click "Add Row" to start</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No results added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 20).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Roll: {result.roll_number}</span>
                        <Badge variant="outline">{result.class}</Badge>
                        <Badge variant="secondary">{result.subject}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.exam_type} • {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {result.marks}/{result.total_marks}
                      </div>
                      <div className="text-sm text-gray-500">
                        {((result.marks / result.total_marks) * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <Badge className={getGradeColor(result.grade || '')}>
                      {result.grade}
                    </Badge>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteResult(result.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}