import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef } from "react";
import type { StudentProfile } from "@shared/schema";

const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];
const courses = ["B.Tech", "M.Tech", "BCA", "MCA"];

export default function StudentProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    rollNumber: "",
    cgpa: "",
    branch: "",
    course: "",
    phone: "",
  });

  const { data: profile, isLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<StudentProfile>) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/profile/resume", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      uploadResumeMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      rollNumber: formData.rollNumber,
      cgpa: formData.cgpa,
      branch: formData.branch,
      course: formData.course,
      phone: formData.phone,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Profile & Resume
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and upload resume
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber || profile?.rollNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value })
                  }
                  placeholder="e.g., 21CSE001"
                  required
                  data-testid="input-roll-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa || profile?.cgpa || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cgpa: e.target.value })
                  }
                  placeholder="e.g., 8.5"
                  required
                  data-testid="input-cgpa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch || profile?.branch || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger data-testid="select-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={formData.course || profile?.course || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, course: value })
                  }
                >
                  <SelectTrigger data-testid="select-course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || profile?.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g., +91 9876543210"
                  data-testid="input-phone"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover-elevate transition-all"
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-resume"
                />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">
                  Click to upload resume
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF only, max 10MB
                </p>
              </div>

              {uploadResumeMutation.isPending && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Uploading...
                  </p>
                </div>
              )}

              {profile?.resumeUrl && (
                <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Resume uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(profile.resumeUrl!, "_blank")}
                    data-testid="button-view-resume"
                  >
                    View
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
