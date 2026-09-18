import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ambulance, Phone, AlertTriangle, ShieldAlert, Heart, LifeBuoy, Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function Emergency() {
  useRequireAuth("patient");
  const { toast } = useToast();
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "Emergency Services", phone: "112" },
    { name: "Ambulance", phone: "108" },
    { name: "Dr. Sharma", phone: "9876543210" }
  ]);

  // Medical ID states
  const [isEditingMedicalId, setIsEditingMedicalId] = useState(false);
  const [medicalId, setMedicalId] = useState({
    bloodType: "B+",
    allergies: "Sulfa Drugs",
    conditions: "Hypertension",
    medications: "Amlodipine"
  });
  const [editMedicalId, setEditMedicalId] = useState({
    bloodType: "B+",
    allergies: "Sulfa Drugs",
    conditions: "Hypertension",
    medications: "Amlodipine"
  });

  const handleAddContact = () => {
    if (!contactName || !contactPhone) {
      toast({
        title: "Error",
        description: "Please fill in both name and phone number",
        variant: "destructive"
      });
      return;
    }

    setEmergencyContacts([...emergencyContacts, { name: contactName, phone: contactPhone }]);
    setContactName("");
    setContactPhone("");
    
    toast({
      title: "Contact Added",
      description: `${contactName} has been added to your emergency contacts.`
    });
  };

  const handleCallEmergency = () => {
    toast({
      title: "Calling Emergency Services",
      description: "This would initiate a call to emergency services in a real application."
    });
  };

  const handleEditMedicalId = () => {
    setIsEditingMedicalId(true);
    setEditMedicalId({...medicalId});
  };

  const handleSaveMedicalId = () => {
    setMedicalId({...editMedicalId});
    setIsEditingMedicalId(false);
    toast({
      title: "Medical ID Updated",
      description: "Your medical ID information has been updated successfully."
    });
  };

  const handleMedicalIdChange = (field, value) => {
    setEditMedicalId(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />
      <div className="flex flex-1">
        <Sidebar userType="patient" />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive mr-2" />
              <h1 className="text-3xl font-bold text-destructive">Emergency</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-destructive/10 border-destructive/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-destructive">
                    <Ambulance className="mr-2 h-5 w-5" />
                    Emergency Call
                  </CardTitle>
                  <CardDescription>Call for immediate assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full"
                    onClick={handleCallEmergency}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call Emergency Services (112)
                  </Button>
                  <p className="text-xs mt-3 text-muted-foreground">
                    Press only in case of genuine emergency. This will connect you directly to national emergency services.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-300 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-orange-600">
                    <ShieldAlert className="mr-2 h-5 w-5" />
                    Medical ID
                  </CardTitle>
                  <CardDescription>Important medical information</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isEditingMedicalId ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Blood Type:</span>
                          <span>{medicalId.bloodType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Allergies:</span>
                          <span>{medicalId.allergies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Conditions:</span>
                          <span>{medicalId.conditions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Medications:</span>
                          <span>{medicalId.medications}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={handleEditMedicalId}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Medical ID
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Blood Type</label>
                          <Input 
                            value={editMedicalId.bloodType}
                            onChange={(e) => handleMedicalIdChange('bloodType', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Allergies</label>
                          <Input 
                            value={editMedicalId.allergies}
                            onChange={(e) => handleMedicalIdChange('allergies', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Conditions</label>
                          <Input 
                            value={editMedicalId.conditions}
                            onChange={(e) => handleMedicalIdChange('conditions', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Medications</label>
                          <Input 
                            value={editMedicalId.medications}
                            onChange={(e) => handleMedicalIdChange('medications', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={handleSaveMedicalId}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Medical ID
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-red-500" />
                    Medical Contact
                  </CardTitle>
                  <CardDescription>Your primary physician</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Dr. Priya Patel</p>
                      <p className="text-sm text-muted-foreground">General Physician</p>
                    </div>
                    <Button className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="contacts" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
                <TabsTrigger value="firstaid">First Aid Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contacts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Emergency Contacts</CardTitle>
                    <CardDescription>
                      People to contact in case of an emergency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Contact Name
                          </label>
                          <Input
                            id="name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Enter contact name"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddContact}>Add Contact</Button>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Saved Contacts</h3>
                      <div className="divide-y">
                        {emergencyContacts.map((contact, index) => (
                          <div key={index} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.phone}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="firstaid">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LifeBuoy className="mr-2 h-5 w-5 text-red-500" /> 
                      First Aid Guidelines
                    </CardTitle>
                    <CardDescription>
                      Basic emergency procedures while waiting for professional help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">CPR Basic Steps</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Check if the person is responsive and breathing</li>
                        <li>Call emergency services (112 or 108)</li>
                        <li>Place the person on their back on a firm surface</li>
                        <li>Position your hands in the center of the chest</li>
                        <li>Perform chest compressions (100-120 compressions per minute)</li>
                        <li>Continue until emergency services arrive</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Choking</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Stand behind the person and slightly to one side</li>
                        <li>Support their chest with one hand</li>
                        <li>Lean them forward so the object can come out of their mouth</li>
                        <li>Give up to 5 sharp blows between their shoulder blades</li>
                        <li>Check if the blockage has cleared after each blow</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Severe Bleeding</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Apply direct pressure to the wound</li>
                        <li>Use a clean cloth, gauze, or your hand if necessary</li>
                        <li>Maintain pressure until help arrives</li>
                        <li>If blood soaks through, add more material without removing the original dressing</li>
                        <li>If possible, elevate the injured area above the level of the heart</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Heat Stroke (Common in India)</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Move the person to a cool, shaded area</li>
                        <li>Remove excess clothing</li>
                        <li>Apply cool water to the skin and fan them</li>
                        <li>Place ice packs on armpits, groin, neck, and back</li>
                        <li>Have them drink cool water if they're conscious</li>
                        <li>Seek medical attention immediately</li>
                      </ol>
                    </div>
                    
                    <Button className="w-full">Learn More First Aid Techniques</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
