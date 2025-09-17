import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { ErrorBoundary } from "@/components/error-boundary";

// Pages
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Jobs from "./pages/Jobs";
import Internships from "./pages/Internships";
import Trainings from "./pages/Trainings";
import Workshops from "./pages/Workshops";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Applications from "./pages/Applications";
import { AuthGuard } from "./components/auth-guard";
import { PermissionGuard } from "./components/permission-guard";
import Statistics from "./pages/Statistics";
import Feedbacks from "./pages/Feedbacks";
import Documents from "./pages/Documents";
import Alumni from "./pages/Alumni";
import Analytics from "./pages/Analytics";
import Offers from "./pages/Offers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="placement-portal-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <AuthGuard>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/companies" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Companies />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/jobs" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Jobs />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/internships" element={
              <AuthGuard>
                <MainLayout>
                  <Internships />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/trainings" element={
              <AuthGuard>
                <MainLayout>
                  <Trainings />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/workshops" element={
              <AuthGuard>
                <MainLayout>
                  <Workshops />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/reports" element={
              <AuthGuard>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </AuthGuard>
            } />
            {/* Removed Admin/Student Offers static pages */}
            <Route path="/applications" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Applications />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/statistics" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Statistics />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/feedbacks" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Feedbacks />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/documents" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Documents />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/alumni" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Alumni />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/offers" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Offers />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            <Route path="/analytics" element={
              <AuthGuard>
                <MainLayout>
                  <PermissionGuard>
                    <Analytics />
                  </PermissionGuard>
                </MainLayout>
              </AuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
