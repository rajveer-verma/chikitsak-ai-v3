import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

const Medications = () => {
  const { user } = useRequireAuth("doctor");
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientList, setPatientList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    patient: "",
    patientUid: "",
    name: "",
    dosage: "",
    frequency: "",
    notes: "",
    status: "Active"
  });

  // Listen to doctor's medications from Firestore
  useEffect(() => {
    if (!user) return;

    // Fetch medications scoped to this doctor
    const q = query(
      collection(db, "medications"),
      where("doctorUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setMedications(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching medications:", error);
      setLoading(false);
    });

    // Also fetch patient profiles with UID for selection
    const patientsQuery = query(
      collection(db, "profiles"),
      where("role", "==", "patient")
    );

    const unsubPatients = onSnapshot(patientsQuery, (snapshot) => {
      const list = snapshot.docs.map(d => {
        const data = d.data();
        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();
        const displayName = fullName || data.email || "Patient";
        return {
          uid: d.id,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          displayName: displayName
        };
      }).filter(Boolean);
      setPatientList(list);
    });

    return () => {
      unsubscribe();
      unsubPatients();
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "patient") {
      const matched = patientList.find(p => p.displayName === value || p.email === value || p.uid === value);
      setForm(prev => ({
        ...prev,
        patient: value,
        patientUid: matched ? matched.uid : (prev.patientUid || "")
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = async () => {
    if (!user) return;

    if (!form.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a medication name.",
        variant: "destructive"
      });
      return;
    }

    let selectedUid = form.patientUid;
    if (!selectedUid && form.patient) {
      const matched = patientList.find(p => 
        p.displayName.toLowerCase() === form.patient.trim().toLowerCase() || 
        p.email.toLowerCase() === form.patient.trim().toLowerCase()
      );
      if (matched) {
        selectedUid = matched.uid;
      }
    }

    if (!selectedUid) {
      toast({
        title: "Patient Required",
        description: "Please select a registered patient from the list.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, "medications"), {
        doctorUid: user.uid,
        patientUid: selectedUid,
        patient: form.patient,
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        notes: form.notes,
        status: form.status || "Active",
        created_at: new Date().toISOString()
      });

      setShowModal(false);
      setForm({ patient: "", patientUid: "", name: "", dosage: "", frequency: "", notes: "", status: "Active" });
      toast({
        title: "Medication Added",
        description: `Prescribed ${form.name} for ${form.patient}`
      });
    } catch (error) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to save medication to database.",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await updateDoc(doc(db, "medications", id), {
        status: newStatus
      });
      toast({
        title: "Status Updated",
        description: `Medication marked as ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating medication status:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "medications", id));
      toast({
        title: "Medication Removed",
        description: "Medication record deleted from database."
      });
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const filteredMedications = medications.filter(med => {
    const patientName = med.patient || "";
    const medName = med.name || "";
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          medName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "All" || med.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="doctor" />
      <div className="flex flex-1">
        <Sidebar userType="doctor" />
        <main className="flex-1 p-6 max-w-7xl">
          <div className="mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              Medical Prescriptions
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Doctor medication management system (Live Firestore)</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 pl-10 bg-white"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 absolute left-3 top-3">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700"
              >
                <option value="All">All Medications</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-sm flex items-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Add Prescription
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <path d="M9 12h6"></path>
                <path d="M12 9v6"></path>
                <path d="M12 12a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"></path>
                <path d="M12 12a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"></path>
              </svg>
              <p className="text-gray-500 mt-4">No medications found. Click "Add Prescription" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedications.map((med) => (
                <div
                  key={med.id}
                  className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow transition-shadow duration-300 ${
                    med.status === "Active" ? "" : "opacity-75"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-medium text-gray-800">
                      {med.patient}
                    </h2>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        med.status === "Active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {med.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1">
                        <path d="m19 14-7 7-7-7"></path>
                        <path d="M12 21V4"></path>
                        <rect width="8" height="3" x="8" y="4" rx="1"></rect>
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Medication</p>
                        <p className="text-gray-700">{med.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1">
                        <path d="M9 12h.01"></path>
                        <path d="M15 12h.01"></path>
                        <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"></path>
                        <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"></path>
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Dosage</p>
                        <p className="text-gray-700">{med.dosage}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Frequency</p>
                        <p className="text-gray-700">{med.frequency}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Notes</p>
                        <p className="text-gray-700">{med.notes || "None"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => toggleStatus(med.id, med.status)}
                      className="text-sm px-3 py-1 rounded-lg hover:bg-gray-100 flex items-center text-gray-600 transition-colors duration-200"
                    >
                      {med.status === "Active" ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                          Deactivate
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M20 6 9 17l-5-5"></path>
                          </svg>
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-medium text-gray-800">
                    Add New Prescription
                  </h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Patient Name</label>
                    <input
                      name="patient"
                      placeholder="Enter patient full name"
                      value={form.patient}
                      onChange={handleChange}
                      list="patient-options"
                      className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                    {patientList.length > 0 && (
                      <datalist id="patient-options">
                        {patientList.map((p) => (
                          <option key={p.uid} value={p.displayName}>{p.email ? `(${p.email})` : ""}</option>
                        ))}
                      </datalist>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Medication Name</label>
                    <input
                      name="name"
                      placeholder="Enter medication name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-1">Dosage</label>
                      <input
                        name="dosage"
                        placeholder="e.g., 500mg"
                        value={form.dosage}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-1">Frequency</label>
                      <input
                        name="frequency"
                        placeholder="e.g., Twice a day"
                        value={form.frequency}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Notes</label>
                    <textarea
                      name="notes"
                      placeholder="Additional instructions..."
                      value={form.notes}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!form.patient || !form.name || !form.dosage || !form.frequency}
                    className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 ${
                      !form.patient || !form.name || !form.dosage || !form.frequency ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Add Prescription
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-gray-400 text-xs">
            <p>© {new Date().getFullYear()} Medical Prescription System</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Medications;
