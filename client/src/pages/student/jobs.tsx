import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, DollarSign, Calendar, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, StudentProfile } from "@shared/schema";

export default function StudentJobs() {
  const { toast } = useToast();

  const { data: profile } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/applications/my"],
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest("POST", "/api/applications", { jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/my"] });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isEligible = (job: Job) => {
    if (!profile) return false;
    const cgpaEligible = parseFloat(profile.cgpa) >= parseFloat(job.minCgpa);
    const branchEligible = job.allowedBranches.includes(profile.branch);
    const courseEligible = job.allowedCourses.includes(profile.course);
    return cgpaEligible && branchEligible && courseEligible;
  };

  const hasApplied = (jobId: string) => {
    return applications?.some((app) => app.jobId === jobId);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Browse and apply to available positions
        </p>
      </div>

      {jobs && jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No jobs available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs?.map((job) => {
            const eligible = isEligible(job);
            const applied = hasApplied(job.id);

            return (
              <Card
                key={job.id}
                className="hover-elevate transition-shadow"
                data-testid={`card-job-${job.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-primary">
                        {job.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.companyName}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground line-clamp-3">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.package}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-2">Eligibility:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">CGPA ≥ {job.minCgpa}</Badge>
                      {job.allowedBranches.map((branch) => (
                        <Badge key={branch} variant="secondary">
                          {branch}
                        </Badge>
                      ))}
                      {job.allowedCourses.map((course) => (
                        <Badge key={course} variant="secondary">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!eligible || applied || applyMutation.isPending}
                    onClick={() => applyMutation.mutate(job.id)}
                    data-testid={`button-apply-${job.id}`}
                  >
                    {applied
                      ? "Already Applied"
                      : !eligible
                      ? "Not Eligible"
                      : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
