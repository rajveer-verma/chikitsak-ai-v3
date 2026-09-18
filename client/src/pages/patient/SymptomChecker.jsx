const rawBackendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BACKEND_URL = rawBackendUrl.endsWith("/") ? rawBackendUrl : `${rawBackendUrl}/`;

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";



const emergencySymptoms = [
  "chest pain", 
  "difficulty breathing", 
  "severe bleeding", 
  "confusion", 
  "loss of consciousness",
  "severe headache",
  "inability to move",
  "numbness on one side",
  "slurred speech",
  "seizure"
];

export default function SymptomChecker() {
  useRequireAuth("patient");

  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [severity, setSeverity] = useState("mild");
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState(null);

  const addSymptom = () => {
    if (!currentSymptom) {
      toast({
        title: "Missing Information",
        description: "Please enter a symptom",
        variant: "destructive",
      });
      return;
    }

    const newSymptom = {
      id: Date.now(),
      name: currentSymptom,
      severity,
      duration,
    };

    setSymptoms([...symptoms, newSymptom]);
    setCurrentSymptom("");
    setDuration("");
  };

  const removeSymptom = (id) => {
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  const checkSymptoms = async () => {
    if (symptoms.length === 0) {
      toast({
        title: "No Symptoms",
        description: "Please add at least one symptom",
        variant: "destructive",
      });
      return;
    }

    for (const symptom of symptoms) {
      if (emergencySymptoms.some((es) => symptom.name.toLowerCase().includes(es.toLowerCase()))) {
        setResult({
          title: "Seek Immediate Medical Attention",
          description: `Your symptom "${symptom.name}" may indicate a serious medical condition.`,
          urgency: "high",
        });
        toast({
          title: "Emergency Warning",
          description: "You may have a serious condition. Please seek immediate medical attention.",
          variant: "destructive",
        });
        return;
      }
    }

    const severeSymptomsLongDuration = symptoms.filter((s) => {
      const match = s.duration.match(/(\d+)\s*(day|days)/i);
      const days = match ? parseInt(match[1]) : 0;
      return s.severity === "severe" && days >= 3;
    });

    if (severeSymptomsLongDuration.length > 0) {
      setResult({
        title: "Medical Attention Recommended",
        description: "Severe symptoms lasting for several days detected. Please consult a doctor.",
        urgency: "high",
      });
      toast({
        title: "Warning",
        description: "Severe symptoms detected. Medical consultation recommended.",
        variant: "destructive",
      });
      return;
    }

    const symptomNames = symptoms.map((s) => s.name);

    try {
      const response = await fetch(`${BACKEND_URL}api/symptoms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: symptomNames }),
      });

      if (response.ok) {
        const data = await response.json();
        const topMatch = data.length > 0 ? data[0] : null;

        if (topMatch) {
          const { disease, matches } = topMatch;
          let urgency = "low";

          if (matches >= 15) urgency = "high";
          else if (matches >= 8) urgency = "medium";

          setResult({
            title: `Possible Condition: ${disease}`,
            description: `Based on your symptoms, ${disease} is a likely match with ${matches} symptom overlaps.`,
            urgency,
          });

          toast({
            title: `Likely Condition: ${disease}`,
            description: `This condition had the highest number of symptom matches (${matches}).`,
            variant: urgency === "high" ? "destructive" : "default",
          });
        } else {
          setResult({
            title: "No Clear Match Found",
            description: "We couldn't identify a specific condition based on your symptoms.",
            urgency: "low",
          });

          toast({
            title: "No Match Found",
            description: "Try entering more detailed symptoms.",
            variant: "default",
          });
        }
      } else {
        throw new Error("Backend error while fetching diagnosis.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "low": return "bg-green-50 border-green-200 text-green-800";
      case "medium": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "high": return "bg-red-50 border-red-200 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />
      <div className="flex flex-1">
        <Sidebar userType="patient" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2">Symptom Checker</h1>
          <p className="text-gray-600 mb-8">Track and assess your symptoms</p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add Symptoms</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Symptom</label>
                  <Input value={currentSymptom} onChange={(e) => setCurrentSymptom(e.target.value)} placeholder="Enter symptom" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <div className="flex gap-2">
                    {["mild", "moderate", "severe"].map((s) => (
                      <Button key={s} variant={severity === s ? "default" : "outline"} onClick={() => setSeverity(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 2 days" />
                </div>
                <Button onClick={addSymptom} className="w-full">Add Symptom</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Symptoms</h2>
              {symptoms.length === 0 ? (
                <p className="text-gray-500">No symptoms added yet</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="p-4 rounded-lg border flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{symptom.name}</h3>
                        <p className="text-sm text-gray-600">
                          Severity: {symptom.severity}, Duration: {symptom.duration}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeSymptom(symptom.id)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={checkSymptoms} className="w-full">Check Symptoms</Button>
            </Card>
          </div>

          {result && (
            <div className={`mt-8 p-6 rounded-lg border ${getUrgencyClass(result.urgency)}`}>
              <h2 className="text-xl font-semibold">{result.title}</h2>
              <p className="text-sm text-gray-600">{result.description}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
