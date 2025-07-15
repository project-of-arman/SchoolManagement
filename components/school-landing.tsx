'use client'

import { useState, useEffect } from 'react'
import { Navbar } from './ui/navbar'
import { HeroCarousel } from './ui/hero-carousel'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MapPin, Users, Calendar, BookOpen, Award, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SchoolLandingProps {
  school: {
    id: string
    name: string
    slug: string
    settings: any
  }
  content: Array<{
    section: string
    content: any
  }>
}

export function SchoolLanding({ school, content }: SchoolLandingProps) {
  const [activeSection, setActiveSection] = useState('home')

  const getContentBySection = (section: string) => {
    return content.find(c => c.section === section)?.content || {}
  }

  const heroContent = getContentBySection('hero')
  const aboutContent = getContentBySection('about')
  const galleryContent = getContentBySection('gallery')
  const studentsContent = getContentBySection('students')
  const locationContent = getContentBySection('location')
  const noticesContent = getContentBySection('notices')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'gallery', 'students', 'location', 'notices']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar schoolSlug={school.slug} schoolName={school.name} />
      
      {/* Hero Section */}
      <section id="home" className="relative">
        <HeroCarousel images={heroContent.images || []} />
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Our School</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {aboutContent.title || 'Excellence in Education'}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {aboutContent.description || 'We are committed to providing quality education and nurturing young minds to become responsible citizens of tomorrow.'}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">
                    Vision: {aboutContent.vision || 'Building future leaders through quality education'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">
                    Mission: {aboutContent.mission || 'Empowering students with knowledge and values'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-green-600">
                    {aboutContent.stats?.students || '500+'}
                  </span>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Teachers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-green-600">
                    {aboutContent.stats?.teachers || '25+'}
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">School Gallery</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(galleryContent.images || []).map((image: any, index: number) => (
              <div key={index} className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src={image.url}
                  alt={image.title || 'Gallery image'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-semibold">{image.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section id="students" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Students</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(studentsContent.featured || []).map((student: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={student.photo || '/placeholder-student.jpg'}
                      alt={student.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{student.name}</h3>
                  <p className="text-gray-600 mb-3">{student.class}</p>
                  <Badge variant="secondary">{student.achievement}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Find Us</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-gray-600">
                      {locationContent.address || 'School Address, City, Bangladesh'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">{locationContent.phone || '+880-XXX-XXXXXX'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">{locationContent.email || 'info@school.edu.bd'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">School Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday - Thursday</span>
                  <span className="text-gray-900 font-semibold">8:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Friday</span>
                  <span className="text-gray-900 font-semibold">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-900 font-semibold">9:00 AM - 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notices Section */}
      <section id="notices" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Notices</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            {(noticesContent.items || []).map((notice: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{notice.date}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{notice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join Us?</h2>
          <p className="text-xl text-green-100 mb-8">
            Start your educational journey with us today. Apply now for admission.
          </p>
          <Link href={`/${school.slug}/application`}>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Apply for Admission
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 {school.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}