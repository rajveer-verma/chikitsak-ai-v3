import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Search, MapPin, Phone, Clock, Calendar as CalendarIcon, 
  Star, Award, FileText, User, Trash, RefreshCw, Video, MessageSquare, CheckCircle,
  Send, X, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";



// List of specialities for filter
const specialities = [
  "All Specialities",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic Surgeon",
  "Gynecologist",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "ENT Specialist"
];

// Generate avatar initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const parseTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Helper to check if an appointment is for today
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export default function BookAppointment() {
  const { user, userProfile } = useRequireAuth("patient");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("All Specialities");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("book");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  const [realDoctors, setRealDoctors] = useState([]);

  // Fetch real doctors from Firestore
  useEffect(() => {
    console.log("Setting up profiles query for doctors...");
    const q = query(collection(db, "profiles"), where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Profiles snapshot received, size:", snapshot.size);
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();
        return {
          id: doc.id,
          name: fullName ? `Dr. ${fullName}` : (data.email || "Doctor"),
          speciality: data.speciality || "General Physician",
          experience: data.experience || 5,
          rating: data.rating || 5.0,
          location: data.location || "Online Consultation",
          availableTimes: ["10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
          image: "https://cdnjs.cloudflare.com/ajax/libs/octicons/8.5.0/svg/person.svg",
          fees: data.fees || 500,
          languages: data.languages || ["Hindi", "English"],
          meetLink: data.meetLink || "https://meet.google.com/new"
        };
      });
      setRealDoctors(docs);
    }, (error) => {
      console.error("Error fetching doctor profiles:", error);
    });
    return () => unsubscribe();
  }, []);

  // Listen to patient's appointments from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "appointments"),
      where("patientUid", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: parseTimestamp(doc.data().date)
      }));
      setAppointments(apps);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to message history for selected appointment in real-time
  useEffect(() => {
    if (!selectedAppointment || !isChatOpen) return;
    const q = query(
      collection(db, "appointments", selectedAppointment.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: parseTimestamp(doc.data().timestamp)
      }));
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedAppointment, isChatOpen]);

  // Scroll to bottom of chat when messages change or chat is opened
  useEffect(() => {
    if (chatEndRef.current && isChatOpen) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Real registered doctors from Firestore
  const allDoctors = realDoctors;

  // Filter doctors based on search and speciality
  const filteredDoctors = allDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpeciality = selectedSpeciality === "All Specialities" || 
                             doctor.speciality === selectedSpeciality;
    
    return matchesSearch && matchesSpeciality;
  });

  // Memoize filtered appointments
  const { upcomingAppointments, ongoingAppointments, pastAppointments } = appointments.reduce((acc, appointment) => {
    if (appointment.status === "completed") {
      acc.pastAppointments.push(appointment);
    } else if (isToday(new Date(appointment.date))) {
      acc.ongoingAppointments.push(appointment);
    } else if (appointment.status === "upcoming" && new Date(appointment.date) > new Date()) {
      acc.upcomingAppointments.push(appointment);
    }
    return acc;
  }, { upcomingAppointments: [], ongoingAppointments: [], pastAppointments: [] });

  // Get appointment-specific chat messages
  const getAppointmentChatMessages = (appointmentId) => {
    return chatMessages;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedDoctor || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date, doctor, and time slot.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newAppointment = {
        patientUid: user.uid,
        patientName: `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim(),
        doctorUid: selectedDoctor.id, // UID string or number ID
        doctorName: selectedDoctor.name,
        date: selectedDate.toISOString(),
        time: selectedTime,
        speciality: selectedDoctor.speciality || selectedDoctor.speciality,
        status: isToday(selectedDate) ? "ongoing" : "upcoming",
        meetLink: selectedDoctor.meetLink || "https://meet.google.com/new",
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "appointments"), newAppointment);

      // Add welcome message from doctor to Firestore
      await addDoc(collection(db, "appointments", docRef.id, "messages"), {
        sender: "doctor",
        senderId: selectedDoctor.id,
        message: `Hello! This is ${selectedDoctor.name}. Thank you for booking an appointment. I look forward to our session on ${selectedDate.toLocaleDateString()} at ${selectedTime}. Feel free to message me here if you have any questions before our appointment.`,
        timestamp: new Date().toISOString(),
        isRead: false
      });

      toast({
        title: "Appointment Booked Successfully!",
        description: `Your appointment with ${selectedDoctor.name} is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });

      // Reset selection
      setSelectedDoctor(null);
      setSelectedTime(null);
      setIsLoading(false);
      
      // Switch to appointments tab
      setActiveTab("appointments");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Failed to book appointment",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "cancelled"
      });
      
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle booking again (reuse previous doctor info)
  const handleBookAgain = (appointment) => {
    const doctor = allDoctors.find(d => d.id === appointment.doctorUid || d.name === appointment.doctorName);
    if (doctor) {
      setSelectedDoctor(doctor);
      setSelectedDate(new Date());
      setSelectedTime(null);
      // Switch to book tab
      setActiveTab("book");
      // Close dialog if open
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Doctor Not Available",
        description: "This doctor is no longer available for booking.",
        variant: "destructive"
      });
    }
  };

  // Handle marking appointment
  const handleMarkCompleted = async (appointmentId) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "completed",
        notes: "Follow-up appointment completed successfully. Patient showing good recovery.",
        prescription: "1. Continue previous medications\n2. Follow up in 2 weeks if symptoms persist"
      });
      
      toast({
        title: "Appointment Completed",
        description: "Your appointment has been marked completed.",
      });
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  // Handle viewing prescription
  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  // Join video consultation - redirects to Google Meet
  const handleJoinConsultation = (appointment) => {
    if (appointment.meetLink) {
      toast({
        title: "Joining Video Call",
        description: "Redirecting to Google Meet...",
      });
      
      // Redirect to Google Meet in a new tab
      window.open(appointment.meetLink, "_blank", "noopener,noreferrer");
    } else {
      toast({
        title: "Video Link Not Available",
        description: "The video link for this appointment is not available.",
        variant: "destructive"
      });
    }
  };

  // Open chat for an appointment
  const handleOpenChat = (appointment) => {
    setSelectedAppointment(appointment);
    setIsChatOpen(true);
  };

  // Send a new chat message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAppointment) return;
    
    try {
      const messageText = newMessage.trim();
      setNewMessage("");

      const messageDoc = {
        sender: "patient",
        senderId: user.uid,
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      // Save to Firestore
      await addDoc(collection(db, "appointments", selectedAppointment.id, "messages"), messageDoc);

      // Update last message metadata on main appointment doc
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        lastMessage: messageText,
        lastMessageAt: new Date().toISOString()
      });


    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Format timestamp for chat messages
  const formatMessageTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get unread message count for an appointment
  const getUnreadCount = (appointmentId) => {
    return 0; // Simple fallback
  };

  // Render an appointment card
  const renderAppointmentCard = (appointment, isPast = false) => (
    <Card key={appointment.id} className={`border-l-4 ${isPast ? 'border-l-muted' : appointment.status === 'ongoing' ? 'border-l-green-500' : 'border-l-primary'}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(appointment.doctorName)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{appointment.doctorName}</h3>
          </div>
          <Badge variant="outline" className="font-normal">{appointment.speciality}</Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {isToday(new Date(appointment.date)) ? 'Today' : formatDate(new Date(appointment.date))} • {appointment.time}
        </div>
        
        {/* Different button sets based on appointment type */}
        {isPast ? (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewPrescription(appointment)}
            >
              <FileText className="h-3 w-3 mr-1" /> View Prescription
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleBookAgain(appointment)}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Book Again
            </Button>
          </div>
        ) : appointment.status === 'ongoing' ? (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 relative"
                onClick={() => handleOpenChat(appointment)}
              >
                <MessageSquare className="h-3 w-3 mr-1" /> Chat
                {getUnreadCount(appointment.id) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {getUnreadCount(appointment.id)}
                  </span>
                )}
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => handleJoinConsultation(appointment)}
              >
                <Video className="h-3 w-3 mr-1" /> Join Meet
              </Button>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleMarkCompleted(appointment.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Mark
            </Button>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => handleOpenChat(appointment)}
            >
              <MessageSquare className="h-3 w-3 mr-1" /> Chat
              {getUnreadCount(appointment.id) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {getUnreadCount(appointment.id)}
                </span>
              )}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleCancelAppointment(appointment.id)}
            >
              <Trash className="h-3 w-3 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />
      <div className="flex flex-1">
        <Sidebar userType="patient" />
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="book">Book Appointment</TabsTrigger>
              <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="book" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Book an Appointment</h1>
                <div className="flex items-center gap-4">
                  <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
                    <SelectTrigger className="w-40 md:w-60">
                      <SelectValue placeholder="Speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map((speciality) => (
                        <SelectItem key={speciality} value={speciality}>
                          {speciality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search doctors, specialities..."
                      className="w-40 md:w-60 pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Available Doctors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                              <div 
                                key={doctor.id}
                                className={`flex items-start p-4 rounded-lg border transition-colors cursor-pointer ${
                                  selectedDoctor?.id === doctor.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/30 hover:bg-accent/50'
                                }`}
                                onClick={() => {
                                  setSelectedDoctor(doctor);
                                  setSelectedTime(null);
                                }}
                              >
                                <div className="flex-shrink-0 mr-4">
                                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                                    <AvatarImage src={doctor.image} alt={doctor.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {getInitials(doctor.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                    <Badge variant="outline" className="font-normal">₹{doctor.fees}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {doctor.speciality} • {doctor.experience} years exp
                                  </p>
                                  <div className="flex items-center gap-1 mb-2">
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
                                      <Star className="h-3 w-3 mr-1 fill-green-800" /> {doctor.rating}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Speaks: {doctor.languages.join(", ")}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" /> {doctor.location}
                                  </div>
                                  {doctor.meetLink && (
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                      <Video className="h-3 w-3 mr-1" /> Online Consultation Available
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10">
                              <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                              <Button 
                                variant="link" 
                                onClick={() => {
                                  setSearchQuery("");
                                  setSelectedSpeciality("All Specialities");
                                }}
                              >
                                Clear filters
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Select Date & Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="border rounded-md mb-4"
                          disabled={(date) => {
                            // Disable past dates
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      
                        {selectedDoctor && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedDoctor.availableTimes.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setSelectedTime(time)}
                                >
                                  <Clock className="h-3 w-3 mr-1" /> {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {!selectedDoctor && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Please select a doctor to view available time slots
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {selectedDoctor && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Doctor:</span>
                              <span className="font-medium">{selectedDoctor.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Speciality:</span>
                              <span>{selectedDoctor.speciality}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Date:</span>
                              <span>{selectedDate ? formatDate(selectedDate) : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Time:</span>
                              <span>{selectedTime || "Not selected"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Consultation Fee:</span>
                              <span className="font-medium">₹{selectedDoctor.fees}</span>
                            </div>
                            <div className="border-t pt-3 mt-3">
                              <Button 
                                className="w-full" 
                                disabled={!selectedDate || !selectedTime || isLoading}
                                onClick={handleBooking}
                              >
                                {isLoading ? "Booking..." : "Confirm Booking"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-6">
              <h1 className="text-3xl font-bold">My Appointments</h1>
              
              {/* Ongoing appointments */}
              {ongoingAppointments.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Today's Appointments</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ongoingAppointments.map(appointment => renderAppointmentCard(appointment))}
                  </div>
                </div>
              )}
              
              {/* Upcoming appointments */}
              {upcomingAppointments.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingAppointments.map(appointment => renderAppointmentCard(appointment))}
                  </div>
                </div>
              )}
              
              {/* Past appointments */}
              {pastAppointments.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Past Appointments</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastAppointments.map(appointment => renderAppointmentCard(appointment, true))}
                  </div>
                </div>
              )}
              
              {/* No appointments message */}
              {appointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No appointments yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't booked any appointments yet.</p>
                  <Button onClick={() => setActiveTab("book")}>Book Now</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      

      {/* Prescription Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prescription & Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Doctor's Notes</h3>
              <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-md">
                {selectedAppointment?.notes || "No notes available"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Prescription</h3>
              <pre className="text-sm text-muted-foreground font-mono bg-accent/50 p-3 rounded-md whitespace-pre-wrap">
                {selectedAppointment?.prescription || "No prescription available"}
              </pre>
            </div>
          </div>
          <div className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedAppointment && (
              <Button 
                variant="secondary"
                onClick={() => handleBookAgain(selectedAppointment)}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Book Follow-up
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-md h-[80vh] flex flex-col">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {selectedAppointment && getInitials(selectedAppointment.doctorName)}
                </AvatarFallback>
              </Avatar>
              {selectedAppointment?.doctorName}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pt-4">
            <div className="space-y-4 pb-4">
              {selectedAppointment && getAppointmentChatMessages(selectedAppointment.id).map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'patient' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <span className="text-xs opacity-70 mt-1 block text-right">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <div className="pt-4 border-t mt-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex space-x-2"
            >
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-10 flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
