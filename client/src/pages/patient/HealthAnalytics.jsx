import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";

// Simple implementation of Card component
const Card = ({ children, className }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-sm border border-border ${className || ""}`}>
      {children}
    </div>
  );
};

const initialData = [
  { date: "Jan", weight: 70, bloodPressure: 120, sleep: 7, calories: 2100 },
  { date: "Feb", weight: 71, bloodPressure: 118, sleep: 7.5, calories: 2200 },
  { date: "Mar", weight: 70.5, bloodPressure: 122, sleep: 6.5, calories: 2050 },
  { date: "Apr", weight: 69.8, bloodPressure: 119, sleep: 8, calories: 1950 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const initialNutritionData = [
  { name: "Protein", value: 30 },
  { name: "Carbs", value: 45 },
  { name: "Fats", value: 25 },
];

const dietPlans = {
  weightLoss: {
    vegetarian: [
      { meal: "Breakfast", foods: "Greek yogurt with berries and nuts", calories: 300 },
      { meal: "Snack", foods: "Apple with almond butter", calories: 200 },
      { meal: "Lunch", foods: "Quinoa salad with mixed vegetables and chickpeas", calories: 450 },
      { meal: "Snack", foods: "Hummus with carrot sticks", calories: 150 },
      { meal: "Dinner", foods: "Grilled tofu with roasted vegetables and brown rice", calories: 400 },
    ],
    nonVegetarian: [
      { meal: "Breakfast", foods: "Egg white omelet with spinach and whole grain toast", calories: 300 },
      { meal: "Snack", foods: "Protein shake with banana", calories: 200 },
      { meal: "Lunch", foods: "Grilled chicken salad with olive oil dressing", calories: 450 },
      { meal: "Snack", foods: "Greek yogurt with berries", calories: 150 },
      { meal: "Dinner", foods: "Baked salmon with steamed broccoli and quinoa", calories: 400 },
    ]
  },
  weightGain: {
    vegetarian: [
      { meal: "Breakfast", foods: "Smoothie with bananas, oats, peanut butter, and milk", calories: 500 },
      { meal: "Snack", foods: "Trail mix with dried fruits and nuts", calories: 350 },
      { meal: "Lunch", foods: "Lentil curry with rice and avocado", calories: 650 },
      { meal: "Snack", foods: "Protein bar and fruit", calories: 300 },
      { meal: "Dinner", foods: "Bean and cheese burrito with guacamole and sweet potato", calories: 700 },
    ],
    nonVegetarian: [
      { meal: "Breakfast", foods: "Eggs, whole grain toast with avocado, and fruit", calories: 500 },
      { meal: "Snack", foods: "Protein shake with peanut butter and banana", calories: 350 },
      { meal: "Lunch", foods: "Grilled chicken, brown rice, and avocado", calories: 650 },
      { meal: "Snack", foods: "Tuna sandwich on whole grain bread", calories: 300 },
      { meal: "Dinner", foods: "Steak with baked potato and vegetables", calories: 700 },
    ]
  }
};

import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";

export default function HealthAnalytics() {
  const { user, userProfile, isAuthenticated } = useRequireAuth("patient");
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(initialData);
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [nutritionData, setNutritionData] = useState(initialNutritionData);
  const [newEntry, setNewEntry] = useState({
    date: "",
    weight: "",
    bloodPressure: "",
    sleep: "",
    calories: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDietPlan, setSelectedDietPlan] = useState("weightLoss");
  const [dietPreference, setDietPreference] = useState("vegetarian");
  const [isNutritionFormOpen, setIsNutritionFormOpen] = useState(false);
  const [newNutritionEntry, setNewNutritionEntry] = useState({
    protein: 30,
    carbs: 45,
    fats: 25,
  });

  // Listen to patient's real health metrics from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "healthMetrics"),
      where("patientUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const metrics = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
        setHealthData(metrics);
        setIsUsingRealData(true);
      } else {
        setHealthData(initialData);
        setIsUsingRealData(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching health metrics:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: name === "date" ? value : parseFloat(value) || ""
    }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setNewNutritionEntry(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const updateNutritionData = () => {
    const { protein, carbs, fats } = newNutritionEntry;
    if (protein + carbs + fats !== 100) {
      alert("Total nutrition percentages must equal 100%");
      return;
    }
    
    setNutritionData([
      { name: "Protein", value: protein },
      { name: "Carbs", value: carbs },
      { name: "Fats", value: fats },
    ]);
    
    setIsNutritionFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEntry.date || !newEntry.weight || !newEntry.bloodPressure || !newEntry.sleep || !newEntry.calories) {
      alert("Please fill all fields");
      return;
    }
    
    if (user) {
      try {
        await addDoc(collection(db, "healthMetrics"), {
          ...newEntry,
          patientUid: user.uid,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving health metric to Firestore:", err);
      }
    } else {
      setHealthData(prev => [...prev, newEntry]);
    }
    setNewEntry({ date: "", weight: "", bloodPressure: "", sleep: "", calories: "" });
    setIsFormOpen(false);
  };

  const calculateBMI = () => {
    const lastEntry = healthData[healthData.length - 1];
    // Assuming height is 1.75m for calculation
    const height = 1.75;
    const weight = lastEntry?.weight || 70;
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };

  const getBMIStatus = () => {
    const bmi = calculateBMI();
    if (bmi < 18.5) return { status: "Underweight", color: "text-yellow-600" };
    if (bmi < 25) return { status: "Normal", color: "text-green-600" };
    if (bmi < 30) return { status: "Overweight", color: "text-orange-600" };
    return { status: "Obese", color: "text-red-600" };
  };

  const getCalorieRecommendation = () => {
    const lastEntry = healthData[healthData.length - 1];
    const bmiStatus = getBMIStatus();
    
    if (bmiStatus.status === "Underweight") {
      return {
        recommendation: "Increase your daily calories by 300-500 calories.",
        target: (lastEntry?.calories || 2000) + 400,
        color: "text-blue-600"
      };
    } else if (bmiStatus.status === "Overweight" || bmiStatus.status === "Obese") {
      return {
        recommendation: "Consider reducing your daily calories by 300-500 calories.",
        target: Math.max((lastEntry?.calories || 2000) - 400, 1500),
        color: "text-blue-600"
      };
    } else {
      return {
        recommendation: "Your calorie intake is appropriate for your BMI.",
        target: lastEntry?.calories || 2000,
        color: "text-green-600"
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = userProfile?.first_name || "Rajesh";
  const lastName = userProfile?.last_name || "Sharma";
  const userName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" userName={userName} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar userType="patient" />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800">Health Analytics</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ml-3 ${isUsingRealData ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
              {isUsingRealData ? '✓ Live Patient Data' : 'Demo Baseline'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md"
            >
              {isFormOpen ? "Close Form" : "Add Health Data"}
            </button>
          </div>
        </div>

        {isFormOpen && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Add Health Data</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">Month</label>
                  <input
                    type="text"
                    name="date"
                    placeholder="e.g., May"
                    value={newEntry.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="e.g., 70.5"
                    value={newEntry.weight}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">Blood Pressure</label>
                  <input
                    type="number"
                    name="bloodPressure"
                    placeholder="e.g., 120"
                    value={newEntry.bloodPressure}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">Sleep (hours)</label>
                  <input
                    type="number"
                    name="sleep"
                    placeholder="e.g., 7.5"
                    value={newEntry.sleep}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    placeholder="e.g., 2000"
                    value={newEntry.calories}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Overview Card */}
        <Card className="p-6 mb-6 border-t-4 border-blue-600">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Current Weight</h3>
              <p className="text-3xl font-bold text-blue-600">{healthData[healthData.length - 1]?.weight || 0} kg</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">BMI</h3>
              <p className="text-3xl font-bold text-blue-600">{calculateBMI()}</p>
              <p className={`text-sm font-medium ${getBMIStatus().color}`}>{getBMIStatus().status}</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Daily Calories</h3>
              <p className="text-3xl font-bold text-blue-600">{healthData[healthData.length - 1]?.calories || 0}</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Sleep</h3>
              <p className="text-3xl font-bold text-blue-600">{healthData[healthData.length - 1]?.sleep || 0} hrs</p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Weight Tracking</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#4b6cb7" />
                  <YAxis domain={['auto', 'auto']} stroke="#4b6cb7" />
                  <Tooltip contentStyle={{ backgroundColor: "#f0f9ff", borderColor: "#93c5fd" }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Recent Entries:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-2 text-blue-700">Month</th>
                      <th className="text-right text-blue-700">Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.slice(-5).map((entry, index) => (
                      <tr key={index} className="border-b border-blue-100">
                        <td className="py-2">{entry.date}</td>
                        <td className="text-right">{entry.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Blood Pressure</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#4b6cb7" />
                  <YAxis domain={['auto', 'auto']} stroke="#4b6cb7" />
                  <Tooltip contentStyle={{ backgroundColor: "#f0f9ff", borderColor: "#93c5fd" }} />
                  <Line
                    type="monotone"
                    dataKey="bloodPressure"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Recent Entries:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-2 text-blue-700">Month</th>
                      <th className="text-right text-blue-700">BP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.slice(-5).map((entry, index) => (
                      <tr key={index} className="border-b border-blue-100">
                        <td className="py-2">{entry.date}</td>
                        <td className="text-right">{entry.bloodPressure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Sleep Pattern</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#4b6cb7" />
                  <YAxis domain={['auto', 'auto']} stroke="#4b6cb7" />
                  <Tooltip contentStyle={{ backgroundColor: "#f0f9ff", borderColor: "#93c5fd" }} />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={{ fill: "#eab308" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Recent Entries:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-2 text-blue-700">Month</th>
                      <th className="text-right text-blue-700">Sleep (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.slice(-5).map((entry, index) => (
                      <tr key={index} className="border-b border-blue-100">
                        <td className="py-2">{entry.date}</td>
                        <td className="text-right">{entry.sleep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Calorie Tracking</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="date" stroke="#4b6cb7" />
                  <YAxis domain={['auto', 'auto']} stroke="#4b6cb7" />
                  <Tooltip contentStyle={{ backgroundColor: "#f0f9ff", borderColor: "#93c5fd" }} />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Recent Entries:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-2 text-blue-700">Month</th>
                      <th className="text-right text-blue-700">Calories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.slice(-5).map((entry, index) => (
                      <tr key={index} className="border-b border-blue-100">
                        <td className="py-2">{entry.date}</td>
                        <td className="text-right">{entry.calories}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800">Nutrition Breakdown</h3>
              <button 
                onClick={() => setIsNutritionFormOpen(!isNutritionFormOpen)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isNutritionFormOpen ? "Cancel" : "Update"}
              </button>
            </div>

            {isNutritionFormOpen ? (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-900">Protein (%)</label>
                    <input
                      type="number"
                      name="protein"
                      value={newNutritionEntry.protein}
                      onChange={handleNutritionChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-900">Carbs (%)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={newNutritionEntry.carbs}
                      onChange={handleNutritionChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-900">Fats (%)</label>
                    <input
                      type="number"
                      name="fats"
                      value={newNutritionEntry.fats}
                      onChange={handleNutritionChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={updateNutritionData}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nutritionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {nutritionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-blue-900 mb-1">
                    Based on your current BMI and goals, we recommend:
                  </p>
                  <p className={`text-sm font-medium ${getCalorieRecommendation().color}`}>
                    {getCalorieRecommendation().recommendation}
                  </p>
                  <p className="text-sm text-blue-900 mt-2">
                    Target daily calories: <span className="font-bold">{getCalorieRecommendation().target}</span>
                  </p>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Health Overview</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium mb-2 text-blue-800">Weight Trend</h4>
                {healthData.length >= 2 && (
                  <p>
                    {healthData[healthData.length - 1].weight > healthData[healthData.length - 2].weight 
                      ? "⬆️ Your weight has increased since last entry. " 
                      : healthData[healthData.length - 1].weight < healthData[healthData.length - 2].weight
                        ? "⬇️ Your weight has decreased since last entry. "
                        : "➡️ Your weight remains stable. "}
                    Current: {healthData[healthData.length - 1].weight} kg
                  </p>
                )}
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium mb-2 text-green-800">Blood Pressure Status</h4>
                {healthData.length >= 1 && (
                  <p>
                    {healthData[healthData.length - 1].bloodPressure > 130
                      ? "⚠️ Blood pressure is above recommended levels."
                      : healthData[healthData.length - 1].bloodPressure < 90
                        ? "⚠️ Blood pressure is below recommended levels."
                        : "✅ Blood pressure is within normal range."}
                  </p>
                )}
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-medium mb-2 text-yellow-800">Sleep Health</h4>
                {healthData.length >= 1 && (
                  <p>
                    {healthData[healthData.length - 1].sleep < 6
                      ? "⚠️ You might need more sleep for optimal health."
                      : healthData[healthData.length - 1].sleep > 9
                        ? "ℹ️ You're sleeping more than average."
                        : "✅ Your sleep duration is within recommended range."}
                  </p>
                )}
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <h4 className="font-medium mb-2 text-red-800">Calorie Intake</h4>
                {healthData.length >= 1 && (
                  <p>
                    {healthData[healthData.length - 1].calories > 2500
                      ? "⚠️ Your calorie intake is higher than recommended."
                      : healthData[healthData.length - 1].calories < 1500
                        ? "⚠️ Your calorie intake is lower than recommended."
                        : "✅ Your calorie intake is within a healthy range."}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Diet Management Section */}
        <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-800">Diet Management</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 col-span-3 md:col-span-1">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Diet Recommendations</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-blue-900">Select Goal:</label>
              <select
                value={selectedDietPlan}
                onChange={(e) => setSelectedDietPlan(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weightLoss">Weight Loss</option>
                <option value="weightGain">Weight Gain</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-blue-900">Preference:</label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="nonVegetarian">Non-Vegetarian</option>
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Recommended Daily Calories:</h4>
              <p className="text-2xl font-bold text-blue-600">
                {selectedDietPlan === "weightLoss" ? "1,500 - 1,800" : "2,500 - 3,000"}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                {selectedDietPlan === "weightLoss" 
                  ? "Calorie deficit to promote gradual, healthy weight loss" 
                  : "Calorie surplus to support muscle growth and weight gain"}
              </p>
            </div>
          </Card>

          <Card className="p-6 col-span-3 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              {selectedDietPlan === "weightLoss" ? "Weight Loss" : "Weight Gain"} Diet Plan - {dietPreference === "vegetarian" ? "Vegetarian" : "Non-Vegetarian"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200 bg-blue-50">
                    <th className="text-left py-3 px-4 text-blue-700">Meal</th>
                    <th className="text-left py-3 px-4 text-blue-700">Foods</th>
                    <th className="text-right py-3 px-4 text-blue-700">Calories</th>
                  </tr>
                </thead>
                <tbody>
                  {dietPlans[selectedDietPlan][dietPreference].map((meal, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="py-3 px-4 font-medium">{meal.meal}</td>
                      <td className="py-3 px-4">{meal.foods}</td>
                      <td className="py-3 px-4 text-right">{meal.calories}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-blue-300 bg-blue-100">
                    <td className="py-3 px-4 font-bold text-blue-800">Total</td>
                    <td></td>
                    <td className="py-3 px-4 text-right font-bold text-blue-800">
                      {dietPlans[selectedDietPlan][dietPreference].reduce((total, meal) => total + meal.calories, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-800 mb-2">Health Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {selectedDietPlan === "weightLoss" ? (
                  <>
                    <li>• Drink plenty of water throughout the day to stay hydrated and manage hunger.</li>
                    <li>• Focus on high-protein foods to maintain muscle mass during weight loss.</li>
                    <li>• Include fiber-rich foods to help you feel full longer.</li>
                    <li>• Limit processed foods and added sugars.</li>
                    <li>• Consider intermittent fasting after consulting with a healthcare provider.</li>
                  </>
                ) : (
                  <>
                    <li>• Focus on nutrient-dense calories, not just high-calorie foods.</li>
                    <li>• Eat more frequently - 5-6 meals per day instead of 3 larger ones.</li>
                    <li>• Prioritize protein intake to support muscle growth.</li>
                    <li>• Include healthy fats like nuts, avocados, and olive oil.</li>
                    <li>• Consider a pre-bedtime protein-rich snack to prevent muscle breakdown during sleep.</li>
                  </>
                )}
              </ul>
            </div>
          </Card>
        </div>

        {/* Additional Health Tips Section */}
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Health Insights</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Weight Management</h4>
              <p className="text-sm text-blue-700">
                {getBMIStatus().status === "Normal" 
                  ? "Your BMI is within a healthy range. Focus on maintaining your current weight through balanced nutrition and regular physical activity."
                  : getBMIStatus().status === "Underweight"
                    ? "Your BMI indicates you're underweight. Consider increasing your caloric intake with nutrient-dense foods and consult with a healthcare provider."
                    : "Your BMI indicates you could benefit from weight loss. Focus on creating a moderate calorie deficit through diet and exercise."}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Sleep Optimization</h4>
              <p className="text-sm text-blue-700">
                {healthData[healthData.length - 1]?.sleep < 7
                  ? "Your sleep duration is below recommendations. Try to establish a consistent sleep schedule and aim for 7-9 hours per night."
                  : "You're getting adequate sleep. Maintain your good sleep habits and consider sleep quality improvements like reducing screen time before bed."}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Nutrition Balance</h4>
              <p className="text-sm text-blue-700">
                Your current macronutrient breakdown is {nutritionData[0].value}% protein, {nutritionData[1].value}% carbs, and {nutritionData[2].value}% fats. 
                {getBMIStatus().status === "Overweight" || getBMIStatus().status === "Obese"
                  ? " Consider increasing protein intake while reducing carbohydrates to support weight management."
                  : " This is a balanced distribution for your current health status."}
              </p>
            </div>
          </div>
        </Card>
        </main>
      </div>
    </div>
  );
}
