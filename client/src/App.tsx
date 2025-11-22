import { useState, useEffect, createContext, useContext } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Preloader } from "@/components/preloader";
import { AppSidebar } from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

import StudentDashboard from "@/pages/student/dashboard";
import StudentJobs from "@/pages/student/jobs";
import StudentForums from "@/pages/student/forums";
import StudentPPTs from "@/pages/student/ppts";
import StudentProfile from "@/pages/student/profile";
import StudentCalendar from "@/pages/student/calendar";

import AdminJobs from "@/pages/admin/jobs";
import AdminForums from "@/pages/admin/forums";
import AdminPPTs from "@/pages/admin/ppts";
import AdminCalendar from "@/pages/admin/calendar";
import AdminAnalysis from "@/pages/admin/analysis";
import AdminDashboard from "./pages/admin/dashboard";

interface AuthContextType {
  user: any | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, logout: () => { } });

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={user.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar user={user} onLogout={logout} />
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            {user?.role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
          </DashboardLayout>
        </ProtectedRoute>
      </Route>


      <Route path="/jobs">
        <ProtectedRoute>
          <DashboardLayout>
            <StudentJobs />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/forums">
        <ProtectedRoute>
          <DashboardLayout>
            <StudentForums />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/ppts">
        <ProtectedRoute>
          <DashboardLayout>
            <StudentPPTs />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <DashboardLayout>
            <StudentProfile />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/calendar">
        <ProtectedRoute>
          <DashboardLayout>
            <StudentCalendar />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>


      <Route path="/admin/jobs">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminJobs />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/forums">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminForums />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/ppts">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminPPTs />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/calendar">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminCalendar />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/analysis">
        <ProtectedRoute>
          <DashboardLayout>
            <AdminAnalysis />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
