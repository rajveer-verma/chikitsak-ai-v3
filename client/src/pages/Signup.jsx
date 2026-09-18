
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export default function Signup() {
  // Redirect to login page with signup tab active
  return <Navigate to="/login?tab=signup" replace />;
}
