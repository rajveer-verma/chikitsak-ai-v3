import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic, Phone, User2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VideoConsult() {
  const { isAuthenticated } = useRequireAuth("patient");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  const startConsultation = () => {
    const meetUrl = "https://meet.google.com/new";
    window.open(meetUrl, "_blank");
    toast({
      title: "Starting Google Meet",
      description: "Opening Google Meet in a new tab...",
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />
      <div className="flex flex-1">
        <Sidebar userType="patient" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2">Video Consultation</h1>
          <p className="text-gray-600 mb-8">Connect with healthcare providers through Google Meet</p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Start Consultation</h2>
              <p className="text-gray-600 mb-6">
                You will be redirected to Google Meet to start your consultation.
                Make sure you:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Have a stable internet connection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Are in a quiet environment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Have a working camera and microphone
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={startConsultation}
              >
                Start Google Meet Consultation
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Important Notes</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    1
                  </div>
                  <p>Allow browser permissions for camera and microphone when prompted</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    2
                  </div>
                  <p>Sign in to your Google account if required</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    3
                  </div>
                  <p>Share the meeting link with your healthcare provider if needed</p>
                </li>
              </ul>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
