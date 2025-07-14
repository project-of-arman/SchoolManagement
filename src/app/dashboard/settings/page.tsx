import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your school's profile and payment information."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>
                Update your school's public information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input id="school-name" defaultValue="Sunrise International School" readOnly />
                <p className="text-sm text-muted-foreground">
                  School name is used for your subdomain and cannot be changed.
                </p>
              </div>
              <FileUpload id="school-logo" label="School Logo" />
              <FileUpload id="school-banner" label="School Banner Image" />

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Manual Payment Details</CardTitle>
              <CardDescription>
                Numbers for students to send bKash/Nagad/Rocket payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bkash">bKash Number</Label>
                <Input id="bkash" placeholder="e.g., 01xxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nagad">Nagad Number</Label>
                <Input id="nagad" placeholder="e.g., 01xxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rocket">Rocket Number</Label>
                <Input id="rocket" placeholder="e.g., 01xxxxxxxxx" />
              </div>
              <Button>Update Payment Info</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
