import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Bell, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job, Notification, StudentProfile } from "@shared/schema";

export default function StudentDashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<
    Notification[]
  >({
    queryKey: ["/api/notifications"],
  });

  const { data: applications } = useQuery<any[]>({
    queryKey: ["/api/applications/my"],
  });

  const eligibleJobs = jobs?.filter((job) => {
    if (!profile) return false;
    const cgpaEligible = parseFloat(profile.cgpa) >= parseFloat(job.minCgpa);
    const branchEligible = job.allowedBranches.includes(profile.branch);
    const courseEligible = job.allowedCourses.includes(profile.course);
    return cgpaEligible && branchEligible && courseEligible;
  });

  const recentActivities = [
    ...(applications?.slice(0, 3).map((app) => ({
      type: "application",
      text: "Applied to a job",
      time: new Date(app.appliedAt).toLocaleDateString(),
    })) || []),
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground">
          Track your placement journey here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Opportunities
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-gold" />
            </div>
          </CardHeader>
          <CardContent>
            {jobsLoading || profileLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary" data-testid="text-eligible-count">
                  {eligibleJobs?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your profile
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Applications
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-applications-count">
              {applications?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notifications
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary" data-testid="text-notifications-count">
                  {notifications?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  New updates
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-gold mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications from Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-l-4 border-l-gold bg-muted/50 rounded-md"
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
