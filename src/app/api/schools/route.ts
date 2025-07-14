import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { getApps } from "firebase/app";

export async function GET(request: Request) {
  try {
    // Ensure Firebase is initialized
    if (!getApps().length) {
      throw new Error("Firebase has not been initialized.");
    }

    const schoolsRef = collection(db, "schools");
    const q = query(schoolsRef);
    const querySnapshot = await getDocs(q);

    const schools = querySnapshot.docs.map(doc => {
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
