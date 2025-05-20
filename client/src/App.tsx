import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ArabicThemeProvider from "@/components/ArabicThemeProvider";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/pages/dashboard";
import AttendancePage from "@/pages/attendance";
import ReportsPage from "@/pages/reports";
import BehaviorPage from "@/pages/behavior";
import AnnouncementsPage from "@/pages/announcements";
import SchedulePage from "@/pages/schedule";

function Router() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="lg:pr-64 p-4 pt-16 lg:pt-4">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/attendance" component={AttendancePage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/behavior" component={BehaviorPage} />
          <Route path="/announcements" component={AnnouncementsPage} />
          <Route path="/schedule" component={SchedulePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-8 lg:pr-64">
        <p>نظام إدارة مدرسة جابر بن حيان © 2025 سامي بن عازم الرويلي – جميع الحقوق محفوظة.</p>
        <p className="text-sm mt-2">الحساب التجريبي: <strong>Usar: sami</strong> | <strong>Pass: 12345</strong></p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ArabicThemeProvider>
          <Toaster />
          <Router />
        </ArabicThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
