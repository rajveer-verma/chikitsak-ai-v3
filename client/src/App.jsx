import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Patient pages
import PatientDashboard from "./pages/patient/Dashboard";
import SymptomChecker from "./pages/patient/SymptomChecker";
import MentalHealthSupport from "./pages/patient/MentalHealthSupport";
import Emergency from "./pages/patient/Emergency";
import FirstAid from "./pages/patient/FirstAid";
import VideoConsult from "./pages/patient/VideoConsult";
import BookAppointment from "./pages/patient/BookAppointment";
import HealthAnalytics from "./pages/patient/HealthAnalytics";
import PatientProfile from "./pages/patient/Profile";

// Doctor pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import PatientManagement from "./pages/doctor/PatientManagement";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorMedications from "./pages/doctor/Medications";  // Renamed from DoctorProfile
import DoctorConsultations from "./pages/doctor/Consultations";  
import PrescriptionsPage from "@/pages/doctor/prescriptions";

// Shared pages
import NotificationCenter from "./pages/NotificationCenter";

import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering!");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/patient/symptom-checker" element={<SymptomChecker />} />
              <Route path="/patient/mental-health" element={<MentalHealthSupport />} />
              <Route path="/patient/emergency" element={<Emergency />} />
              <Route path="/patient/first-aid" element={<FirstAid />} />
              <Route path="/patient/consult" element={<VideoConsult />} />
              <Route path="/patient/appointments" element={<BookAppointment />} />
              <Route path="/patient/analytics" element={<HealthAnalytics />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/doctor/patients" element={<PatientManagement />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/doctor/consult" element={<DoctorConsultations />} />
              <Route path="/doctor/consults" element={<DoctorConsultations />} />
              <Route path="/doctor/medications" element={<DoctorMedications />} />
              <Route path="/doctor/prescriptions" element={<PrescriptionsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
