"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { Separator } from "../ui/separator";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  schoolName: z
    .string()
    .min(3, { message: "School name must be at least 3 characters." })
    .regex(/^[a-zA-Z0-9\s]+$/, "School name can only contain letters, numbers, and spaces."),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [subdomain, setSubdomain] = useState("");
  const { user, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);


  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("schoolName", name);
    const generatedSubdomain = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    setSubdomain(generatedSubdomain);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!subdomain) {
      toast({
        title: "Error",
        description: "School name is required to generate a subdomain.",
        variant: "destructive",
      });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create school document in Firestore
      await setDoc(doc(db, "schools", user.uid), {
        name: values.schoolName,
        ownerId: user.uid,
        ownerEmail: values.email,
        subdomain: subdomain,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Registration Successful",
        description: "Your school has been created. Redirecting to dashboard...",
      });
      // No need to push here, useEffect will handle it

    } catch (error: any) {
       console.error("Sign up failed", error);
       toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  async function handleGoogleSignUp() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const schoolDocRef = doc(db, "schools", user.uid);
      const schoolDoc = await getDoc(schoolDocRef);

      if (!schoolDoc.exists()) {
        const schoolName = user.displayName || "My School";
        const subdomain = schoolName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
        await setDoc(schoolDocRef, {
            name: schoolName,
            ownerId: user.uid,
            ownerEmail: user.email,
            subdomain: subdomain,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Registration Successful",
            description: "Your school has been created. Redirecting to dashboard...",
        });
      } else {
        toast({
            title: "Welcome Back!",
            description: "Redirecting to your dashboard...",
        });
      }
      // No need to push here, useEffect will handle it
    } catch (error: any) {
        console.error("Google sign-up failed", error);
        toast({
            title: "Google Sign-Up Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  }

  if (loading) {
    return <Card className="w-full max-w-md shadow-lg"><CardContent><div className="flex justify-center p-8">Loading...</div></CardContent></Card>; 
  }

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-5.12 1.9-4.4 0-7.9-3.53-7.9-7.9s3.5-7.9 7.9-7.9c2.4 0 3.82.94 4.78 1.84l2.54-2.54C18.46 1.18 15.92 0 12.48 0 5.88 0 .04 5.88.04 12.48s5.84 12.48 12.44 12.48c3.47 0 6.28-1.17 8.35-3.37 2.17-2.2 2.8-5.4 2.8-8.38v-3.28h-9.28z"
      ></path>
    </svg>
  );

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Create Your School</CardTitle>
        <CardDescription>
          Start managing your institution in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sunrise International School"
                      {...field}
                      onChange={handleSchoolNameChange}
                    />
                  </FormControl>
                  <FormDescription>
                    {subdomain ? (
                      <span>
                        Your subdomain will be:{" "}
                        <span className="font-bold text-primary">{subdomain}</span>
                        .schoolsaas.app
                      </span>
                    ) : (
                      "Your school's unique web address will be generated from this."
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@sunrise.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating School..." : "Create School" }
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
          <GoogleIcon className="mr-2 h-5 w-5" />
          Sign up with Google
        </Button>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Log In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
