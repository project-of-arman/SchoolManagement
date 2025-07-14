"use client";

import { useState, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/use-auth";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "./ui/progress";
import Image from "next/image";
import { Button } from "./ui/button";

type FileUploadProps = {
  id: string;
  label: string;
  accept?: string;
  onUploadComplete: (url: string) => void;
  initialUrl?: string | null;
};

export function FileUpload({ id, label, accept = "image/*", onUploadComplete, initialUrl }: FileUploadProps) {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(initialUrl || null);
  }, [initialUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start upload
      setIsUploading(true);
      const storageRef = ref(storage, `schools/${user.uid}/student-photos/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setIsUploading(false);
          // TODO: Add toast notification for error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            onUploadComplete(downloadURL);
            setPreviewUrl(downloadURL); // Update preview to final URL
            setIsUploading(false);
          });
        }
      );
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    onUploadComplete(""); // Notify parent component that the image is cleared
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center justify-center w-full">
        {previewUrl ? (
          <div className="relative w-full h-32 rounded-lg">
             <Image src={previewUrl} alt="Preview" layout="fill" objectFit="contain" className="rounded-lg" />
             <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={clearPreview}
              >
                <X className="h-4 w-4"/>
                <span className="sr-only">Remove Image</span>
             </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors"
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center w-full px-4">
                 <Progress value={uploadProgress} className="w-full" />
                 <p className="mt-2 text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG (MAX. 2MB)
                  </p>
                </div>
            )}
            <input id={id} type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isUploading} />
          </label>
        )}
      </div>
    </div>
  );
}
