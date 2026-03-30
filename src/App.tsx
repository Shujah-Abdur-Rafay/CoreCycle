import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserRoleProvider } from "@/hooks/useUserRole";
import { SimulatedUserProvider } from "@/components/admin/UserProfileSwitcher";
import Index from "./pages/Index";
import WasteOverview from "./pages/learn/WasteOverview";
import WhatsChanged from "./pages/learn/WhatsChanged";
import HowWeHelp from "./pages/learn/HowWeHelp";
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/CoursePlayer";
import ForSMEs from "./pages/ForSMEs";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Certificates from "./pages/Certificates";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import AIQuizManagement from "./pages/admin/AIQuizManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserRoleProvider>
          <SimulatedUserProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/learn/waste-overview" element={<WasteOverview />} />
                <Route path="/learn/whats-changed" element={<WhatsChanged />} />
                <Route path="/learn/how-we-help" element={<HowWeHelp />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CoursePlayer />} />
                <Route path="/for-smes" element={<ForSMEs />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/admin/ai-quizzes" element={<AIQuizManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SimulatedUserProvider>
        </UserRoleProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
