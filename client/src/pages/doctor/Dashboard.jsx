import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DoctorDashboard() {
  const { user, userProfile, isAuthenticated } = useRequireAuth("doctor");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(null);
  
  // Get user name from Firestore profile
  const firstName = userProfile?.first_name || "Doctor";
  const lastName = userProfile?.last_name || "";
  const doctorName = `${firstName} ${lastName}`.trim();
  
  // Interactive states
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to Chikitsak AI Doctor Portal", read: false },
    { id: 2, text: "Check your consultations tab for patient video calls", read: false }
  ]);
  
  // Added state to control notifications dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [appointments, setAppointments] = useState([]);
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    yesterdayAppointments: 0,
    newPatients: 0,
    criticalCases: 0
  });
  
  // For the chart toggles
  const [selectedChart, setSelectedChart] = useState("weekly");
  
  // Modal for New Appointment
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // Listen to doctor's real appointments from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const isSameDay = (d1, d2) =>
          d1.getDate() === d2.getDate() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getFullYear() === d2.getFullYear();

        let todayCount = 0;
        let yesterdayCount = 0;
        const patientSet = new Set();
        let criticalCount = 0;

        const apps = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let parsedDate = null;
          let dateStr = "Scheduled";

          if (data.date) {
            if (typeof data.date.toDate === "function") {
              parsedDate = data.date.toDate();
            } else {
              parsedDate = new Date(data.date);
            }
          }

          if (parsedDate && !isNaN(parsedDate.getTime())) {
            if (isSameDay(parsedDate, today)) {
              todayCount++;
              dateStr = "Today";
            } else if (isSameDay(parsedDate, yesterday)) {
              yesterdayCount++;
              dateStr = "Yesterday";
            } else {
              dateStr = parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }
          }

          if (data.patientUid) {
            patientSet.add(data.patientUid);
          }

          if (data.status === "critical" || data.status === "ongoing") {
            criticalCount++;
          }

          return {
            id: docSnap.id,
            name: data.patientName || "Patient",
            type: data.speciality || "Consultation",
            time: data.time || "10:00 AM",
            day: dateStr,
            colorClass: data.status === "completed" ? "border-green-500" : (dateStr === "Today" ? "border-primary" : "border-health-purple"),
            details: data.notes || (data.meetLink ? `Online Meet: ${data.meetLink}` : "Initial consultation"),
            notes: data.prescription || `Status: ${data.status || "upcoming"}`
          };
        });

        setAppointments(apps);
        setStats({
          todayAppointments: todayCount,
          yesterdayAppointments: yesterdayCount,
          newPatients: patientSet.size,
          criticalCases: criticalCount
        });
      },
      (error) => {
        console.error("Error fetching doctor appointments:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);
  
  useEffect(() => {
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(note => note.id === id ? {...note, read: true} : note));
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(note => ({...note, read: true})));
  };
  
  const handleAppointmentClick = (id) => {
    if (showAppointmentDetails === id) {
      setShowAppointmentDetails(null);
    } else {
      setShowAppointmentDetails(id);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const handleNewAppointment = () => {
    setShowNewAppointmentModal(true);
  };
  
  const renderTab = () => {
    switch(activeTab) {
      case "dashboard":
        return renderDashboard();
      case "patients":
        return (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">Patient Management</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Patient List</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search patients..." 
                    className="border rounded-lg px-4 py-2 pl-10 text-sm"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{apt.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">March 28, 2025</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary hover:text-primary-dark mr-4">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Notes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-4">Practice Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium mb-4">Patient Growth</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* Added a simple SVG chart representation */}
                  <svg width="100%" height="100%" viewBox="0 0 400 200">
                    <path d="M 50,150 L 100,120 L 150,130 L 200,80 L 250,90 L 300,60 L 350,40" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="3" />
                    <line x1="50" y1="150" x2="350" y2="150" stroke="#d1d5db" strokeWidth="1" />
                    <line x1="50" y1="30" x2="50" y2="150" stroke="#d1d5db" strokeWidth="1" />
                    <text x="50" y="170" fontSize="12" fill="#6b7280">Week 1</text>
                    <text x="120" y="170" fontSize="12" fill="#6b7280">Week 2</text>
                    <text x="190" y="170" fontSize="12" fill="#6b7280">Week 3</text>
                    <text x="260" y="170" fontSize="12" fill="#6b7280">Week 4</text>
                    <text x="330" y="170" fontSize="12" fill="#6b7280">Week 5</text>
                    <text x="30" y="150" fontSize="12" fill="#6b7280">0</text>
                    <text x="30" y="120" fontSize="12" fill="#6b7280">10</text>
                    <text x="30" y="90" fontSize="12" fill="#6b7280">20</text>
                    <text x="30" y="60" fontSize="12" fill="#6b7280">30</text>
                    <text x="30" y="30" fontSize="12" fill="#6b7280">40</text>
                  </svg>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button 
                    className={`px-4 py-2 rounded ${selectedChart === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedChart('weekly')}
                  >
                    Weekly
                  </button>
                  <button 
                    className={`px-4 py-2 rounded ${selectedChart === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedChart('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-4 py-2 rounded ${selectedChart === 'yearly' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedChart('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-medium mb-4">Common Diagnoses</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* Added a simple pie chart representation */}
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <g transform="translate(100, 100)">
                      {/* Pie segments */}
                      <path d="M 0 0 L 0 -80 A 80 80 0 0 1 69.3 -40 Z" fill="#3b82f6" />
                      <path d="M 0 0 L 69.3 -40 A 80 80 0 0 1 69.3 40 Z" fill="#10b981" />
                      <path d="M 0 0 L 69.3 40 A 80 80 0 0 1 -69.3 40 Z" fill="#ef4444" />
                      <path d="M 0 0 L -69.3 40 A 80 80 0 0 1 -69.3 -40 Z" fill="#f59e0b" />
                      <path d="M 0 0 L -69.3 -40 A 80 80 0 0 1 0 -80 Z" fill="#8b5cf6" />
                    </g>
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                    <span className="text-sm">Anxiety (32%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 mr-2"></div>
                    <span className="text-sm">Depression (25%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 mr-2"></div>
                    <span className="text-sm">ADHD (18%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
                    <span className="text-sm">Insomnia (15%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 mr-2"></div>
                    <span className="text-sm">Others (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };
  
  const renderDashboard = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2">Today's Appointments</h3>
            <div className="text-3xl font-bold text-primary">{stats.todayAppointments}</div>
            <p className="text-sm text-gray-500">{stats.todayAppointments - stats.yesterdayAppointments} more than yesterday</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2">New Patients</h3>
            <div className="text-3xl font-bold text-primary">{stats.newPatients}</div>
            <p className="text-sm text-gray-500">This week</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-2">Critical Cases</h3>
            <div className="text-3xl font-bold text-destructive">{stats.criticalCases}</div>
            <p className="text-sm text-gray-500">Requires attention</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map(appointment => (
                  <div key={appointment.id}>
                    <div 
                      className={`flex cursor-pointer border-l-4 ${appointment.colorClass} pl-4 py-2 hover:bg-gray-50`}
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{appointment.name}</p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.time}</p>
                        <p className="text-sm text-gray-500">{appointment.day}</p>
                      </div>
                    </div>
                    
                    {showAppointmentDetails === appointment.id && (
                      <div className="mt-2 pl-6 pr-2 py-3 bg-gray-50 rounded-md text-sm">
                        <p className="font-medium mb-1">Details:</p>
                        <p className="text-gray-600 mb-2">{appointment.details}</p>
                        <p className="font-medium mb-1">Notes:</p>
                        <p className="text-gray-600">{appointment.notes}</p>
                        <div className="mt-3 flex space-x-2">
                          <button className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary-dark">
                            Edit Details
                          </button>
                          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
                            Send Reminder
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">No upcoming appointments scheduled</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">Patient Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">GAD-7 Scores</p>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </div>
                <div className="w-24 h-12 bg-gray-100 rounded-md flex items-center justify-center relative group-hover:bg-gray-200">
                  {/* Simple mini chart */}
                  <svg width="80" height="30" viewBox="0 0 80 30">
                    <polyline 
                      points="5,25 15,18 25,22 35,10 45,15 55,8 65,12 75,5" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2" 
                    />
                  </svg>
                  <div className="absolute opacity-0 group-hover:opacity-100 top-0 right-0 mt-1 mr-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">Medications Adherence</p>
                  <p className="text-sm text-gray-500">Last month</p>
                </div>
                <div className="w-24 h-12 bg-gray-100 rounded-md flex items-center justify-center relative group-hover:bg-gray-200">
                  {/* Circular progress indicator */}
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#3b82f6" strokeWidth="5" 
                            strokeDasharray="94.2" strokeDashoffset="17" transform="rotate(-90 20 20)" />
                    <text x="20" y="24" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold">82%</text>
                  </svg>
                  <div className="absolute opacity-0 group-hover:opacity-100 top-0 right-0 mt-1 mr-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">Appointment Attendance</p>
                  <p className="text-sm text-gray-500">Last month</p>
                </div>
                <div className="w-24 h-12 bg-gray-100 rounded-md flex items-center justify-center relative group-hover:bg-gray-200">
                  {/* Circular progress indicator */}
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#10b981" strokeWidth="5" 
                            strokeDasharray="94.2" strokeDashoffset="5.7" transform="rotate(-90 20 20)" />
                    <text x="20" y="24" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="bold">94%</text>
                  </svg>
                  <div className="absolute opacity-0 group-hover:opacity-100 top-0 right-0 mt-1 mr-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center">
                <span>View All Insights</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar userType="doctor" userName={doctorName} />
      
      <div className="flex flex-1">
        <Sidebar userType="doctor" />
        
        <main className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {lastName || doctorName}</h1>
              <p className="text-gray-600">Here's your dashboard for today</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2 items-center">
              <div className="relative">
                <button 
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-50 relative"
                  onClick={toggleNotifications}
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Dropdown for notifications - fixed to show based on state */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
                    <div className="py-2 px-4 bg-gray-50 rounded-t-md border-b">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Notifications</h3>
                        <button 
                          className="text-sm text-primary"
                          onClick={markAllNotificationsAsRead}
                        >
                          Mark all
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                            {notification.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                        </div>
                      ))}
                    </div>
                    <div className="py-2 px-4 border-t text-center">
                      <button className="text-sm text-primary">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark flex items-center"
                onClick={handleNewAppointment}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>New Appointment</span>
              </button>
            </div>
          </div>
          
          <div className="mb-6 bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'patients' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('patients')}
            >
              Patients
            </button>
            <button 
              className={`px-4 py-2 rounded ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
          
          {renderTab()}
        </main>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Schedule New Appointment</h3>
              <button 
                onClick={() => setShowNewAppointmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="patient">
                  Patient
                </label>
                <select 
                  id="patient" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a patient</option>
                  <option value="amit">Amit Singh</option>
                  <option value="mohit">Mohit Kumar</option>
                  <option value="priya">Priya Desai</option>
                  <option value="new">+ Add new patient</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="appointmentType">
                  Appointment Type
                </label>
                <select 
                  id="appointmentType" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="telehealth">Telehealth</option>
                  <option value="newpatient">New Patient</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="date">
                    Date
                  </label>
                  <input 
                    type="date" 
                    id="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="time">
                    Time
                  </label>
                  <input 
                    type="time" 
                    id="time" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea 
                  id="notes" 
                  rows="3" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any notes or special instructions..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  onClick={() => setShowNewAppointmentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  onClick={() => {
                    // Here you would typically save the appointment
                    alert("Appointment scheduled successfully!");
                    setShowNewAppointmentModal(false);
                  }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
