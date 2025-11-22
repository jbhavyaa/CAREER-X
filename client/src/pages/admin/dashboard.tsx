import { Users, Briefcase, TrendingUp, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job, Placement, Event } from "@shared/schema";

export default function AdminDashboard() {
    const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
        queryKey: ["/api/jobs"],
    });

    const { data: placements, isLoading: placementsLoading } = useQuery<Placement[]>({
        queryKey: ["/api/placements"],
    });
    const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
        queryKey: ["/api/events"],
    });

    const activeJobsCount = jobs?.length || 0;
    const placementsCount = placements?.reduce((sum, record) => sum + record.studentsPlaced, 0) || 0;
    const upcomingEventsCount = events?.length || 0;

    const stats = [
        {
            title: "Total Students",
            value: "450", // Mock value as requested
            icon: Users,
            color: "text-primary",
            isLoading: false,
        },
        {
            title: "Active Jobs",
            value: activeJobsCount.toString(),
            icon: Briefcase,
            color: "text-accent",
            isLoading: jobsLoading,
        },
        {
            title: "Placements",
            value: placementsCount.toString(),
            icon: TrendingUp,
            color: "text-chart-4",
            isLoading: placementsLoading,
        },
        {
            title: "Upcoming Events",
            value: upcomingEventsCount.toString(),
            icon: Calendar,
            color: "text-chart-2",
            isLoading: eventsLoading,
        },
    ];

    const recentActivity = [
        { id: 1, action: "New job posted", company: "Google", time: "2 hours ago" },
        { id: 2, action: "Student applied", student: "Priya Sharma", time: "3 hours ago" },
        { id: 3, action: "Forum post moderated", time: "5 hours ago" },
        { id: 4, action: "Event scheduled", event: "Microsoft Drive", time: "1 day ago" },
    ];
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-muted-foreground">Manage placements and track statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} data-testid={`card-${stat.title.toLowerCase().replace(' ', '-')}`}>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                            <CardDescription>{stat.title}</CardDescription>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            {stat.isLoading ? (
                                <Skeleton className="h-9 w-16" />
                            ) : (
                                <div className="text-3xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(' ', '-')}`}>
                                    {stat.value}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions and updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                                <div>
                                    <p className="font-medium text-sm">{activity.action}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {"company" in activity && activity.company}
                                        {"student" in activity && activity.student}
                                        {"event" in activity && activity.event}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your placement portal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" data-testid="button-add-job">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Add New Job
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-schedule-event">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Event
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Analytics
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-moderate-forums">
                            <Users className="w-4 h-4 mr-2" />
                            Moderate Forums
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}