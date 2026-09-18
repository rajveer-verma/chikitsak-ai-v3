import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAuth(role) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // user === null means auth has been checked and no one is logged in
    if (user === null) {
      setIsAuthenticated(false);
      navigate("/login");
      return;
    }

    if (user) {
      if (role && userProfile) {
        const userRole = userProfile.role;
        if (userRole && userRole !== role) {
          // Wrong role — redirect to the correct dashboard
          setIsAuthenticated(false);
          navigate(userRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
          return;
        }
      }
      setIsAuthenticated(true);
    }
  }, [user, userProfile, navigate, role]);

  return { user, userProfile, isAuthenticated };
}
