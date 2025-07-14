
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const schoolsCollection = await adminDb.collection("schools").get();

    if (schoolsCollection.empty) {
        return NextResponse.json([], { status: 200 });
    }

    const schools = schoolsCollection.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        subdomain: data.subdomain,
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
      };
    });

    return NextResponse.json(schools, { status: 200 });

  } catch (error) {
    console.error("Error fetching schools data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
