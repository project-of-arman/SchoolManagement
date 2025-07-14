"use client"
import { Studio } from "studio/studio";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">School Landing Page</h1>
      <p className="text-lg">Welcome to the school page for School ID: {schoolId}</p>
    </div>
  );
}
