
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CampusConnectLogo } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { School, Building, Globe, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

interface SchoolData {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export default function SchoolLandingPage({ params }: { params: { subdomain: string } }) {
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());

    async function fetchSchoolData() {
      const { subdomain } = params;
      if (!subdomain) {
        setLoading(false);
        setError("No subdomain provided.");
        return;
      };

      try {
        setLoading(true);
        const response = await fetch(`/api/schools/${subdomain}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('School not found');
          }
          throw new Error('Failed to fetch school data');
        }
        const data = await response.json();
        setSchool(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchoolData();
  }, [params]);

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading school information...</p>
        </div>
    );
  }

  if (error || !school) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <PageHeader title="School Not Found" description="The school you are looking for does not exist or the URL is incorrect." />
             <Button asChild>
                <Link href="/">Go to Homepage</Link>
            </Button>
        </div>
    );
  }

  const features = [
      { icon: <School className="h-6 w-6 text-primary"/>, text: "Modern Curriculum" },
      { icon: <Building className="h-6 w-6 text-primary"/>, text: "State-of-the-art Facilities" },
      { icon: <Globe className="h-6 w-6 text-primary"/>, text: "Global Community" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <header className="absolute top-0 left-0 w-full z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-white">
              <CampusConnectLogo className="h-6 w-6" />
              <span className="text-xl font-bold font-headline">CampusConnect</span>
            </Link>
        </div>
      </header>

      <main>
        <section className="relative h-64 md:h-96 w-full flex items-center justify-center text-white text-center">
            <Image
                src={school.bannerUrl || 'https://placehold.co/1200x400.png'}
                alt={`${school.name} Banner`}
                fill
                className="object-cover brightness-50"
                data-ai-hint="school building"
                priority
            />
            <div className="relative z-10 p-4">
                 <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-white/90 p-2 shadow-lg ring-4 ring-primary">
                    <Image
                        src={school.logoUrl || 'https://placehold.co/100x100.png'}
                        alt={`${school.name} Logo`}
                        width={96}
                        height={96}
                        className="rounded-full object-contain"
                        data-ai-hint="school logo"
                    />
                 </div>
                <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">{school.name}</h1>
                <p className="mt-2 text-lg md:text-xl text-white/90">Welcome to our institution's portal</p>
            </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold font-headline">Join Our Community</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                We are committed to providing quality education and fostering a supportive learning environment. Apply now to become a part of our family.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href={`/${school.subdomain}/apply`}>Apply Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                     <Link href="/login">School Login</Link>
                </Button>
            </div>
        </section>

        <section className="bg-secondary/50 py-16">
            <div className="container mx-auto px-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center shadow-sm">
                            <CardContent className="p-6 flex flex-col items-center gap-4">
                                {feature.icon}
                                <p className="font-semibold text-lg">{feature.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        </section>

      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {year} {school.name}. All rights reserved.
          </p>
           <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            Powered by <Link href="/" className="font-semibold text-primary hover:underline">CampusConnect</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
