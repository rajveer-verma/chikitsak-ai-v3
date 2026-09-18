
import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Home,
  LifeBuoy,
  MessagesSquare,
  Pill,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";



export function Sidebar({ className, userType = "patient", mobile = false }) {
  const patientLinks = [
    { name: "Dashboard", href: "/patient/dashboard", icon: Home },
    { name: "Check Symptoms", href: "/patient/symptom-checker", icon: Stethoscope },
    { name: "Mental Health", href: "/patient/mental-health", icon: Heart },
    { name: "First Aid", href: "/patient/first-aid", icon: LifeBuoy },
    { name: "Video Consult", href: "/patient/consult", icon: MessagesSquare },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Health Analytics", href: "/patient/analytics", icon: Activity },
    { name: "Profile", href: "/patient/profile", icon: Settings },
  ];

  const doctorLinks = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { name: "Patients", href: "/doctor/patients", icon: Users },
    { name: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
    { name: "Consultations", href: "/doctor/consults", icon: MessagesSquare },
    { name: "Medications", href: "/doctor/medications", icon: Pill },
    { name: "Profile", href: "/doctor/profile", icon: Settings },
  ];
  
  const links = userType === "patient" ? patientLinks : doctorLinks;

  return (
    <aside
      className={cn(
        "pb-12 min-h-screen",
        mobile ? "h-full" : "w-[300px] border-r border-border/40 hidden md:block",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {userType === "patient" ? "Patient" : "Doctor"} Menu
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary-light/20 rounded-md transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <link.icon className="h-4 w-4 mr-3" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
