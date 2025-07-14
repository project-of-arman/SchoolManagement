
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampusConnectLogo } from '@/components/icons';
import { ArrowRight, Star, Users, Briefcase, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Multi-Tenant Architecture',
      description: 'Each school gets its own dedicated subdomain and isolated data for ultimate security and branding.',
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: 'Complete Admin Control',
      description: 'Manage students, teachers, and staff with powerful and intuitive administrative tools.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Effortless Management',
      description: 'Handle applications, fees, certificates, and results all from a single, unified dashboard.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <CampusConnectLogo className="h-8 w-8" />
          <span className="text-xl font-bold font-headline">CampusConnect</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-headline tracking-tight text-foreground">
            The Modern Operating System for <br />
            <span className="text-primary">Educational Institutions</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            CampusConnect provides a powerful, all-in-one SaaS platform to manage your school effortlessly. From admissions to results, we've got you covered.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Your Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#">Request a Demo</Link>
            </Button>
          </div>
          <div className="mt-6 flex justify-center items-center gap-2">
            <div className="flex -space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
            <span className="text-sm text-muted-foreground">Trusted by over 100+ schools</span>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">
                Everything you need, nothing you don't.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our features are designed to streamline your school's operations from top to bottom.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <CampusConnectLogo className="h-6 w-6" />
            <span className="text-md font-bold font-headline">CampusConnect</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            &copy; {currentYear} CampusConnect SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
