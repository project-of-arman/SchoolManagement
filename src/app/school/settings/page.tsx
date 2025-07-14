
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface SchoolProfile {
    name: string;
    subdomain: string;
}

interface PaymentDetails {
    bkash: string;
    nagad: string;
    rocket: string;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPayments, setSavingPayments] = useState(false);

    const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({ name: '', subdomain: ''});
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ bkash: '', nagad: '', rocket: '' });

    useEffect(() => {
        if (user) {
            const fetchSettings = async () => {
                setLoading(true);
                try {
                    const schoolDocRef = doc(db, "schools", user.uid);
                    const schoolDoc = await getDoc(schoolDocRef);
                    if (schoolDoc.exists()) {
                        const data = schoolDoc.data();
                        setSchoolProfile({
                            name: data.name || '',
                            subdomain: data.subdomain || '',
                        });
                        setPaymentDetails({
                            bkash: data.paymentDetails?.bkash || '',
                            nagad: data.paymentDetails?.nagad || '',
                            rocket: data.paymentDetails?.rocket || '',
                        });
                    }
                } catch (error) {
                    console.error("Error fetching settings: ", error);
                    toast({ title: "Error", description: "Could not fetch school settings.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            };
            fetchSettings();
        }
    }, [user, toast]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingProfile(true);
        try {
            // Note: In a real app, logo/banner would upload to Firebase Storage
            // and we'd save the URL here. We are skipping that for now.
            toast({ title: "Success", description: "Profile settings saved. (Image uploads not implemented)" });
        } catch (error) {
            console.error("Error saving profile: ", error);
            toast({ title: "Error", description: "Could not save profile settings.", variant: "destructive" });
        } finally {
            setSavingProfile(false);
        }
    };
    
    const handlePaymentSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSavingPayments(true);
        try {
            const schoolDocRef = doc(db, "schools", user.uid);
            await updateDoc(schoolDocRef, { paymentDetails });
            toast({ title: "Success", description: "Payment information updated successfully." });
        } catch (error) {
            console.error("Error updating payment info: ", error);
            toast({ title: "Error", description: "Could not update payment information.", variant: "destructive" });
        } finally {
            setSavingPayments(false);
        }
    };


  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your school's profile and payment information."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleProfileSave}>
                <CardHeader>
                    <CardTitle>School Profile</CardTitle>
                    <CardDescription>
                        Update your school's public information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                 {loading ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                 ) : (
                    <>
                    <div className="space-y-2">
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" value={schoolProfile.name} readOnly />
                        <p className="text-sm text-muted-foreground">
                        Your subdomain is <span className='font-semibold text-primary'>{schoolProfile.subdomain}</span>.schoolsaas.app
                        </p>
                    </div>
                    <FileUpload id="school-logo" label="School Logo" />
                    <FileUpload id="school-banner" label="School Banner Image" />
                    </>
                 )}
                    <Button type="submit" disabled={loading || savingProfile}>
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </form>
          </Card>
        </div>
        <div>
          <Card>
            <form onSubmit={handlePaymentSave}>
                <CardHeader>
                    <CardTitle>Manual Payment Details</CardTitle>
                    <CardDescription>
                        Numbers for students to send bKash/Nagad/Rocket payments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                 {loading ? (
                    <div className="space-y-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                 ) : (
                    <>
                    <div className="space-y-2">
                        <Label htmlFor="bkash">bKash Number</Label>
                        <Input id="bkash" placeholder="e.g., 01xxxxxxxxx" value={paymentDetails.bkash} onChange={e => setPaymentDetails({...paymentDetails, bkash: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nagad">Nagad Number</Label>
                        <Input id="nagad" placeholder="e.g., 01xxxxxxxxx" value={paymentDetails.nagad} onChange={e => setPaymentDetails({...paymentDetails, nagad: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rocket">Rocket Number</Label>
                        <Input id="rocket" placeholder="e.g., 01xxxxxxxxx" value={paymentDetails.rocket} onChange={e => setPaymentDetails({...paymentDetails, rocket: e.target.value})} />
                    </div>
                    </>
                 )}
                    <Button type="submit" disabled={loading || savingPayments}>
                        {savingPayments ? 'Updating...' : 'Update Payment Info'}
                    </Button>
                </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
