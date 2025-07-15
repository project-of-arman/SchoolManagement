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
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  if (user) {
    router.push('/school/dashboard');
    return null; // Or a loading indicator
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/school/dashboard");
    } catch (error: any) {
      console.error("Login failed", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  async function handleGoogleSignIn() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user is new, if so, create a school doc for them
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
      }

      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/school/dashboard");
    } catch (error: any) {
      console.error("Google sign-in failed", error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
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
        <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your school's dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@school.com" {...field} />
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
              {form.formState.isSubmitting ? "Logging In..." : "Log In"}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
          <GoogleIcon className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>

        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/sign-up" className="underline text-primary">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
