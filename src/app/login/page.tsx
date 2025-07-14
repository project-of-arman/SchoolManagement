import { LoginForm } from "@/components/auth/login-form";
import { CampusConnectLogo } from "@/components/icons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <CampusConnectLogo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">
            CampusConnect
          </span>
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}
