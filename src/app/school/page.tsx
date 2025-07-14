import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, ClipboardList, Wallet, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's a snapshot of your school's activity."
      >
        <Button asChild>
          <Link href="/school/applications/new">New Application <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,254"
          description="+20.1% from last month"
          Icon={Users}
        />
        <StatCard
          title="Pending Applications"
          value="32"
          description="Awaiting review"
          Icon={ClipboardList}
        />
        <StatCard
          title="Total Teachers"
          value="78"
          description="5 active positions"
          Icon={UserCheck}
        />
        <StatCard
          title="Monthly Fees Collected"
          value="$54,230"
          description="+12% from last month"
          Icon={Wallet}
        />
      </div>
      <div className="mt-8">
        {/* Here you could add more components like recent activity or charts */}
      </div>
    </div>
  );
}
