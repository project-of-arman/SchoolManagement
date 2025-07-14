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
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      email: "",
      password: "",
    },
  });

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
      router.push("/dashboard");

    } catch (error: any) {
       console.error("Sign up failed", error);
       toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

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
