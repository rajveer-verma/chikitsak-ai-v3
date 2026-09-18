import { Link } from "react-router-dom";
import { Bell, Menu, User } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

export function Navbar({ userType, userName }) {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <Sidebar userType={userType} mobile />
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.ico" alt="Chikitsak AI Logo" className="w-8 h-8 object-contain rounded-md" />
            <span className="font-semibold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Chikitsak AI</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">

          {userType ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-destructive"></span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to={`/${userType}/profile`}>
                  <User className="h-4 w-4" />
                  <span>{userName || "Profile"}</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
