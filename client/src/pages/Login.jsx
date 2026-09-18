

import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Login() {
  const location = useLocation();
  const { signIn, signUp } = useAuth();

  // Determine which tab to show
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "login";
  const role = searchParams.get("role") || "patient";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role,
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id.replace("signup-", "").replace("login-", "")]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                email={formData.email}
                password={formData.password}
                loading={loading}
                role={formData.role}
                onInputChange={handleInputChange}
                onSubmit={handleLogin}
                onTabChange={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm
                formData={formData}
                loading={loading}
                onInputChange={handleInputChange}
                onSubmit={handleSignup}
                onTabChange={setActiveTab}
                onRoleChange={(role) => setFormData((p) => ({ ...p, role }))}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
