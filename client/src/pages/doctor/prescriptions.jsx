import React, { useState, useEffect } from "react";
import { Search, Calendar, User, UserPlus, Clock, PlusCircle, X, Check, AlertTriangle, Pill, FileText, Clipboard, Edit, Trash2 } from "lucide-react";
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

const PrescriptionDashboard = () => {
  const { user, userProfile } = useRequireAuth("doctor");
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientList, setPatientList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");
  const [editId, setEditId] = useState(null);

  const doctorName = userProfile ? `Dr. ${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() : "Doctor";
  
  const defaultForm = {
    patient: "",
    patientUid: "",
    age: "",
    doctor: doctorName,
    specialty: userProfile?.speciality || "General Physician",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    notes: "",
    status: "Pending",
    priority: "Normal",
    date: new Date().toISOString().split('T')[0],
    expiry: "",
  };
  
  const [form, setForm] = useState({...defaultForm});

  // Listen to doctor's prescriptions in real-time from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "prescriptions"),
      where("doctorUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setPrescriptions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching prescriptions:", error);
      setLoading(false);
    });

    // Fetch patients with UID for selection
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

  const handleChange = (e, medicationIndex = null) => {
    const { name, value } = e.target;
    
    if (medicationIndex !== null) {
      const updatedMedications = [...form.medications];
      updatedMedications[medicationIndex] = {
        ...updatedMedications[medicationIndex],
        [name]: value
      };
      setForm({ ...form, medications: updatedMedications });
    } else if (name === "patient") {
      const matched = patientList.find(p => p.displayName === value || p.email === value || p.uid === value);
      setForm(prev => ({
        ...prev,
        patient: value,
        patientUid: matched ? matched.uid : (prev.patientUid || "")
      }));
    } else {
      setForm({ ...form, [name]: value });
    }

    // Auto-calculate expiry date when setting date and first medication duration
    if (name === "date" || (name === "duration" && medicationIndex === 0)) {
      const date = name === "date" ? value : form.date;
      const duration = name === "duration" ? 
        parseInt(value.match(/\d+/)?.[0] || 0) : 
        parseInt(form.medications[0]?.duration?.match(/\d+/)?.[0] || 0);
      
      if (date && duration) {
        const expiryDate = new Date(date);
        expiryDate.setDate(expiryDate.getDate() + duration);
        setForm(prev => ({ 
          ...prev, 
          expiry: expiryDate.toISOString().split('T')[0] 
        }));
      }
    }
  };

  const handleAddMedication = () => {
    setForm({ 
      ...form, 
      medications: [
        ...form.medications, 
        { name: "", dosage: "", frequency: "", duration: "" }
      ] 
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...form.medications];
    updatedMedications.splice(index, 1);
    setForm({ ...form, medications: updatedMedications });
  };

  const handleSubmit = async () => {
    if (!user) return;

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
      if (editId) {
        await updateDoc(doc(db, "prescriptions", editId), {
          ...form,
          patientUid: selectedUid,
          updated_at: new Date().toISOString()
        });
        toast({ title: "Prescription Updated", description: "Changes saved to database." });
        setEditId(null);
      } else {
        await addDoc(collection(db, "prescriptions"), {
          ...form,
          patientUid: selectedUid,
          doctorUid: user.uid,
          doctor: doctorName,
          created_at: new Date().toISOString()
        });
        toast({ title: "Prescription Created", description: `Prescription for ${form.patient} created successfully.` });
      }
      
      setForm({...defaultForm, doctor: doctorName});
      setShowModal(false);
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast({ title: "Error", description: "Failed to save prescription.", variant: "destructive" });
    }
  };

  const handleEdit = (prescription) => {
    setForm({...prescription});
    setEditId(prescription.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "prescriptions", deleteId));
      toast({ title: "Prescription Deleted", description: "Prescription removed from database." });
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "prescriptions", id), {
        status: newStatus
      });
      toast({ title: "Status Updated", description: `Prescription marked as ${newStatus}` });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter and sort logic
  const filteredPrescriptions = prescriptions
    .filter(prescription => {
      const pat = (prescription.patient || "").toLowerCase();
      const docName = (prescription.doctor || "").toLowerCase();
      const pId = (prescription.id || "").toLowerCase();
      const meds = prescription.medications || [];
      const term = searchTerm.toLowerCase();

      const matchesSearch = 
        pat.includes(term) ||
        docName.includes(term) ||
        pId.includes(term) ||
        meds.some(med => (med.name || "").toLowerCase().includes(term));
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "pending" && prescription.status === "Pending") ||
        (activeTab === "filled" && prescription.status === "Filled") ||
        (activeTab === "expired" && prescription.status === "Expired");
      
      const matchesFilter = 
        filterStatus === "All" || prescription.status === filterStatus;
      
      return matchesSearch && matchesTab && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc" 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === "priority") {
        const priorityOrder = { "High": 0, "Normal": 1, "Low": 2 };
        return sortOrder === "asc"
          ? (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
          : (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      } else {
        return sortOrder === "asc"
          ? (a[sortBy] || "").localeCompare(b[sortBy] || "")
          : (b[sortBy] || "").localeCompare(a[sortBy] || "");
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "Filled": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Low": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  // Calculate stats
  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === "Pending").length,
    filled: prescriptions.filter(p => p.status === "Filled").length,
    expired: prescriptions.filter(p => p.status === "Expired").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="doctor" />
      <div className="flex flex-1">
        <Sidebar userType="doctor" />
        <main className="flex-1 p-6 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
              <p className="text-sm text-gray-500">Create, manage, and track prescriptions in Firestore</p>
            </div>
            <button
              onClick={() => {
                setForm({...defaultForm, doctor: doctorName});
                setEditId(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center"
            >
              <PlusCircle size={16} className="mr-2" />
              New Prescription
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FileText size={20} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Prescriptions</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <Clock size={20} className="text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <h3 className="text-2xl font-bold">{stats.pending}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Check size={20} className="text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Filled</p>
                  <h3 className="text-2xl font-bold">{stats.filled}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <AlertTriangle size={20} className="text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <h3 className="text-2xl font-bold">{stats.expired}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter, Sort, and Tabs */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === "pending"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab("filled")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === "filled"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Filled ({stats.filled})
                </button>
                <button
                  onClick={() => setActiveTab("expired")}
                  className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === "expired"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Expired ({stats.expired})
                </button>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="patient-asc">Patient Name (A-Z)</option>
                  <option value="patient-desc">Patient Name (Z-A)</option>
                  <option value="priority-asc">Priority (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prescriptions List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText size={48} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No prescriptions found</h3>
              <p className="text-gray-500 mt-1">Get started by creating a new prescription.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((p) => (
                <div key={p.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-5 hover:border-blue-200 transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg text-gray-900">{p.patient}</h3>
                        {p.age && <span className="text-sm text-gray-500">({p.age} yrs)</span>}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                        <span className={`text-xs font-semibold ${getPriorityColor(p.priority)}`}>
                          {p.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Doctor: {p.doctor} | {p.specialty} | Date: {p.date} {p.expiry && `| Expiry: ${p.expiry}`}
                      </p>
                    </div>

                    <div className="flex space-x-2 mt-3 md:mt-0">
                      <select
                        value={p.status}
                        onChange={(e) => handleChangeStatus(p.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-gray-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Filled">Filled</option>
                        <option value="Expired">Expired</option>
                      </select>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prescribed Medications:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {p.medications?.map((m, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100 text-sm">
                          <p className="font-medium text-gray-900 flex items-center">
                            <Pill size={14} className="mr-1.5 text-blue-500" />
                            {m.name} ({m.dosage})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Frequency: {m.frequency} {m.duration && `| Duration: ${m.duration}`}
                          </p>
                        </div>
                      ))}
                    </div>

                    {p.notes && (
                      <p className="text-xs text-gray-600 mt-3 italic">
                        Notes: {p.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal for Add / Edit */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editId ? "Edit Prescription" : "Create New Prescription"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name</label>
                      <input
                        type="text"
                        name="patient"
                        value={form.patient}
                        onChange={handleChange}
                        list="patients-datalist"
                        placeholder="Enter patient full name"
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                      {patientList.length > 0 && (
                        <datalist id="patients-datalist">
                          {patientList.map((pat) => (
                            <option key={pat.uid} value={pat.displayName}>{pat.email ? `(${pat.email})` : ""}</option>
                          ))}
                        </datalist>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Patient Age</label>
                      <input
                        type="text"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="e.g. 45"
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Filled">Filled</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 text-sm"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-medium text-gray-700">Medications</label>
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center"
                      >
                        <PlusCircle size={14} className="mr-1" /> Add Another Medication
                      </button>
                    </div>

                    {form.medications.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2 bg-gray-50 p-3 rounded border">
                        <input
                          placeholder="Name (e.g. Amoxicillin)"
                          name="name"
                          value={med.name}
                          onChange={(e) => handleChange(e, idx)}
                          className="border p-1.5 rounded text-xs"
                        />
                        <input
                          placeholder="Dosage (e.g. 500mg)"
                          name="dosage"
                          value={med.dosage}
                          onChange={(e) => handleChange(e, idx)}
                          className="border p-1.5 rounded text-xs"
                        />
                        <input
                          placeholder="Frequency (e.g. 3x daily)"
                          name="frequency"
                          value={med.frequency}
                          onChange={(e) => handleChange(e, idx)}
                          className="border p-1.5 rounded text-xs"
                        />
                        <div className="flex space-x-1">
                          <input
                            placeholder="Duration (e.g. 7 days)"
                            name="duration"
                            value={med.duration}
                            onChange={(e) => handleChange(e, idx)}
                            className="border p-1.5 rounded text-xs flex-1"
                          />
                          {form.medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedication(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Notes & Instructions</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Take after meals..."
                      className="w-full border rounded-lg p-2 text-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.patient || form.medications.some(m => !m.name)}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {editId ? "Save Changes" : "Create Prescription"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Prescription</h3>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this prescription from database?</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrescriptionDashboard;
