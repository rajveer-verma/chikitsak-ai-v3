
import { AtSign, Lock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";



export function SignupForm({
  formData,
  loading,
  onInputChange,
  onSubmit,
  onTabChange,
  onRoleChange,
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create a {formData.role === "doctor" ? "doctor" : "patient"} account
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-firstName">First Name</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-firstName"
                placeholder="John"
                className="pl-10"
                required
                value={formData.firstName}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-lastName">Last Name</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-lastName"
                placeholder="Doe"
                className="pl-10"
                required
                value={formData.lastName}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                placeholder="name@example.com"
                type="email"
                className="pl-10"
                required
                value={formData.email}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                className="pl-10"
                required
                value={formData.password}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="role-patient"
              name="role"
              value="patient"
              checked={formData.role === "patient"}
              onChange={() => onRoleChange("patient")}
              className="rounded-full border-gray-300"
            />
            <label htmlFor="role-patient" className="text-sm text-gray-600">
              Patient
            </label>

            <input
              type="radio"
              id="role-doctor"
              name="role"
              value="doctor"
              checked={formData.role === "doctor"}
              onChange={() => onRoleChange("doctor")}
              className="ml-4 rounded-full border-gray-300"
            />
            <label htmlFor="role-doctor" className="text-sm text-gray-600">
              Doctor
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="rounded border-gray-300" required />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
