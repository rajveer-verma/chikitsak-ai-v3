import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, MessageSquare, Video, Phone, Calendar } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

export default function Consultations() {
  const { user, userProfile, isAuthenticated } = useRequireAuth("doctor");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // Get doctor's name
  const firstName = userProfile?.first_name || "Doctor";
  const lastName = userProfile?.last_name || "";
  const doctorName = `${firstName} ${lastName}`.trim();

  const parseTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Listen to doctor's appointments in real-time
  useEffect(() => {
    if (!user) return;

    // Load appointments where doctorUid matches the logged-in doctor
    const q = query(
      collection(db, "appointments"),
      where("doctorUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: parseTimestamp(doc.data().date)
      })).sort((a, b) => b.created_at?.localeCompare(a.created_at) || 0);
      
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching doctor appointments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to messages for the selected appointment in real-time
  useEffect(() => {
    if (!selectedAppointment) {
      setChatMessages([]);
      return;
    }

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
      
      // Auto-scroll to bottom of chat
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [selectedAppointment]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAppointment) return;

    try {
      const messageText = newMessage.trim();
      setNewMessage("");

      await addDoc(collection(db, "appointments", selectedAppointment.id, "messages"), {
        sender: "doctor",
        senderId: user.uid,
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      
      // Update last message metadata on the main appointment doc
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

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatMessageTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="doctor" userName={doctorName} />
      
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar userType="doctor" />
        
        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Active Chats List */}
          <Card className="w-1/3 flex flex-col h-full">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Active Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                  <User className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">No booked appointments or active chats yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {appointments.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppointment(app)}
                      className={`p-4 cursor-pointer hover:bg-accent/40 transition-colors flex items-center justify-between ${
                        selectedAppointment?.id === app.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {getInitials(app.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-semibold text-sm">{app.patientName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {app.lastMessage || `${app.speciality} Consult`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">
                          {app.time}
                        </span>
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          app.status === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'
                        } mt-1`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="flex-1 flex flex-col h-full overflow-hidden">
            {selectedAppointment ? (
              <>
                {/* Chat Header */}
                <div className="border-b p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(selectedAppointment.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{selectedAppointment.patientName}</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                        Connected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => window.open(selectedAppointment.meetLink || "https://meet.google.com/new", "_blank")}>
                      <Video className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6 bg-accent/10">
                  <div className="space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No messages yet. Send a message to start the consultation.
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "doctor" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender === "doctor"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border text-card-foreground shadow-sm"
                            }`}
                          >
                            <p className="text-sm text-left break-words">{message.message}</p>
                            <span className="text-[10px] opacity-70 mt-1 block text-right">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input Box */}
                <div className="p-4 border-t bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      className="min-h-[44px] max-h-[120px] flex-1 resize-none py-3"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-11 w-11 shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 text-primary opacity-30" />
                <h3 className="text-lg font-semibold mb-1">No Consultation Selected</h3>
                <p className="text-sm max-w-sm">
                  Select a patient from the left column to view the conversation history and start consulting in real-time.
                </p>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
