import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Edit, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job } from "@shared/schema";

const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];
const courses = ["B.Tech", "M.Tech", "BCA", "MCA"];

export default function AdminJobs() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    title: "",
    description: "",
    location: "",
    package: "",
    minCgpa: "",
    allowedBranches: [] as string[],
    allowedCourses: [] as string[],
    deadline: "",
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setOpen(false);
      resetForm();
      toast({
        title: "Job created",
        description: "Job posting has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest("PATCH", `/api/jobs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setOpen(false);
      resetForm();
      setEditingJob(null);
      toast({
        title: "Job updated",
        description: "Job posting has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/jobs/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted",
        description: "Job posting has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      companyName: "",
      title: "",
      description: "",
      location: "",
      package: "",
      minCgpa: "",
      allowedBranches: [],
      allowedCourses: [],
      deadline: "",
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      companyName: job.companyName,
      title: job.title,
      description: job.description,
      location: job.location,
      package: job.package,
      minCgpa: job.minCgpa,
      allowedBranches: job.allowedBranches,
      allowedCourses: job.allowedCourses,
      deadline: job.deadline.toString().split("T")[0],
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      createJobMutation.mutate(formData);
    }
  };

  const toggleBranch = (branch: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter((b) => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
  };

  const toggleCourse = (course: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedCourses: prev.allowedCourses.includes(course)
        ? prev.allowedCourses.filter((c) => c !== course)
        : [...prev.allowedCourses, course],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Jobs</h1>
          <p className="text-muted-foreground">
            Create and manage job postings
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
              setEditingJob(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button data-testid="button-new-job">
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Job" : "Create New Job"}
              </DialogTitle>
              <DialogDescription>
                Fill in the job details and eligibility criteria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                    data-testid="input-company-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    data-testid="input-title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                  data-testid="input-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Package</Label>
                  <Input
                    id="package"
                    value={formData.package}
                    onChange={(e) =>
                      setFormData({ ...formData, package: e.target.value })
                    }
                    placeholder="e.g., 10-12 LPA"
                    required
                    data-testid="input-package"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCgpa">Minimum CGPA</Label>
                  <Input
                    id="minCgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) =>
                      setFormData({ ...formData, minCgpa: e.target.value })
                    }
                    required
                    data-testid="input-min-cgpa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    required
                    data-testid="input-deadline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Branches</Label>
                <div className="flex flex-wrap gap-2">
                  {branches.map((branch) => (
                    <Badge
                      key={branch}
                      variant={
                        formData.allowedBranches.includes(branch)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleBranch(branch)}
                      data-testid={`badge-branch-${branch}`}
                    >
                      {branch}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Courses</Label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <Badge
                      key={course}
                      variant={
                        formData.allowedCourses.includes(course)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCourse(course)}
                      data-testid={`badge-course-${course}`}
                    >
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createJobMutation.isPending || updateJobMutation.isPending
                  }
                  data-testid="button-submit-job"
                >
                  {editingJob ? "Update Job" : "Create Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {jobs && jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No jobs posted yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs?.map((job) => (
            <Card key={job.id} data-testid={`card-job-${job.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-primary">
                      {job.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {job.companyName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(job)}
                      data-testid={`button-edit-${job.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteJobMutation.mutate(job.id)}
                      disabled={deleteJobMutation.isPending}
                      data-testid={`button-delete-${job.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{job.location}</Badge>
                  <Badge variant="outline">{job.package}</Badge>
                  <Badge variant="outline">CGPA ≥ {job.minCgpa}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
