import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Home,
  Briefcase,
  MessageSquare,
  FileText,
  User,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface AppSidebarProps {
  userRole: "student" | "admin";
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const [location] = useLocation();

  const studentMenuItems = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Forums", url: "/forums", icon: MessageSquare },
    { title: "PPTs", url: "/ppts", icon: FileText },
    { title: "Resume & Profile", url: "/profile", icon: User },
    { title: "Calendar", url: "/calendar", icon: Calendar },
  ];

  const adminMenuItems = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Jobs", url: "/admin/jobs", icon: Briefcase },
    { title: "Forums", url: "/admin/forums", icon: MessageSquare },
    { title: "PPTs", url: "/admin/ppts", icon: FileText },
    { title: "Analysis", url: "/admin/analysis", icon: BarChart3 },
    { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  ];

  const menuItems = userRole === "student" ? studentMenuItems : adminMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          {userRole === "student" ? "Student Portal" : "Admin Portal"}
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
