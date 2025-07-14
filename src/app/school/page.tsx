
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, ClipboardList, Wallet, UserCheck, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    applications: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const subscriptions: (() => void)[] = [];
    const collectionsToWatch = ['students', 'applications', 'teachers'];

    collectionsToWatch.forEach(col => {
      try {
        const q = collection(db, "schools", user.uid, col);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setStats(prevStats => ({ ...prevStats, [col]: snapshot.size }));
          setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${col}:`, error);
            toast({ title: "Error", description: `Could not fetch ${col} count.`, variant: "destructive" });
            setLoading(false);
        });
        subscriptions.push(unsubscribe);
      } catch (error) {
          console.error(`Error setting up listener for ${col}:`, error);
          toast({ title: "Error", description: `Failed to listen to ${col} data.`, variant: "destructive" });
      }
    });

    // Dummy data for fees until implemented
    setLoading(false);

    return () => {
      subscriptions.forEach(unsub => unsub());
    };
  }, [user, toast]);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's a snapshot of your school's activity."
      >
        <Button asChild>
          <Link href="/school/applications"><PlusCircle className="mr-2 h-4 w-4" />Create Application</Link>
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.students.toLocaleString()}
          description="Enrolled in your school"
          Icon={Users}
        />
        <StatCard
          title="Pending Applications"
          value={loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.applications.toLocaleString()}
          description="Awaiting review"
          Icon={ClipboardList}
        />
        <StatCard
          title="Total Teachers"
          value={loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.teachers.toLocaleString()}
          description="Active and inactive staff"
          Icon={UserCheck}
        />
        <StatCard
          title="Monthly Fees Collected"
          value={loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "$0"}
          description="Feature coming soon"
          Icon={Wallet}
        />
      </div>
      <div className="mt-8">
        {/* Here you could add more components like recent activity or charts */}
      </div>
    </div>
  );
}
