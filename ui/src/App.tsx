import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import SignupPage from "./pages/SignupPage";
import ResetPassword from "@/pages/ResetPassword";
import SupportPage from "./pages/SupportPage";
import AdminContactPage from "./pages/AdminContactPage";
import CreateUserPage from "./pages/CreateUserPage";
import ThreatAnalysisPage from "./pages/ThreatAnalysisPage";
import Index from "./pages/Index";
import ReportsPage from "./pages/ReportsPage";

// Route protection
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster
        toastOptions={{
          className:
            "bg-blue-500 text-white rounded-lg shadow-md border-blue-200 dark:bg-blue-600 dark:border-gray-700 transition-all duration-200",
        }}
      />
      <Sonner
        toastOptions={{
          className:
            "bg-blue-500 text-white rounded-lg shadow-md border-blue-200 dark:bg-blue-600 dark:border-gray-700 transition-all duration-200",
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact_admin" element={<AdminContactPage />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/create-user"
              element={
                <AdminProtectedRoute allowedRoles={["admin"]}>
                  <CreateUserPage />
                </AdminProtectedRoute>
              }
            />
            <Route path="/threat-analysis" element={<ThreatAnalysisPage />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/reports" element={<ReportsPage/>}/>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
