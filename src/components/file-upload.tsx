"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

type FileUploadProps = {
  id: string;
  label: string;
  accept?: string;
};

export function FileUpload({ id, label, accept }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input id={id} type="file" className="hidden" accept={accept} />
        </label>
      </div>
    </div>
  );
}
