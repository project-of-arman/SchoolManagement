import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { School, Globe, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <School className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">SchoolSaaS</span>
            </div>
            <div className="space-x-4">
              <Button variant="outline">Contact</Button>
              <Link href="/signup">
                <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Complete School Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower Bangladeshi schools with modern technology. Each school gets their own website, 
            application system, and management dashboard.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for modern school management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-green-600" />
                  School Website
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Beautiful, responsive websites for each school with custom domain support
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-green-600" />
                  Student Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Online application system for certificates, fee discounts, and more
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-green-600" />
                  Role-Based Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Secure dashboards for administrators, teachers, and staff
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo School */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Try Our Demo School
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience the full functionality with our demo school
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/demo-school">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Visit Demo School
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Create Your School
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <School className="h-6 w-6" />
              <span className="text-xl font-bold">SchoolSaaS</span>
            </div>
            <p className="text-gray-400">
              © 2024 SchoolSaaS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}