
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { subdomain: string } }
) {
  try {
    const subdomain = params.subdomain;
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }
    
    const schoolsRef = collection(db, "schools");
    const q = query(schoolsRef, where("subdomain", "==", subdomain), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolDoc = querySnapshot.docs[0];
    const schoolData = { id: schoolDoc.id, ...schoolDoc.data() };

    // Select only public-facing fields to return
    const publicData = {
        id: schoolData.id,
        name: schoolData.name,
        subdomain: schoolData.subdomain,
        logoUrl: schoolData.logoUrl,
        bannerUrl: schoolData.bannerUrl,
    };

    return NextResponse.json(publicData, { status: 200 });

  } catch (error) {
    console.error("Error fetching school data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
