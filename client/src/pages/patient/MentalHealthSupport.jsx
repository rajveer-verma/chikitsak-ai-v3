import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Smile, Moon, Plus, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";



const resources = [
  {
    title: "Meditation Exercises",
    description: "Guided meditation sessions to help reduce stress and anxiety",
    icon: <Brain className="w-6 h-6" />,
    link: "#meditation"
  },
  {
    title: "Mood Tracking",
    description: "Track your daily mood and identify patterns",
    icon: <Heart className="w-6 h-6" />,
    link: "#mood"
  },
  {
    title: "Relaxation Techniques",
    description: "Simple techniques for stress relief and relaxation",
    icon: <Moon className="w-6 h-6" />,
    link: "#relaxation"
  },
  {
    title: "Self-Care Tips",
    description: "Daily practices to maintain mental well-being",
    icon: <Smile className="w-6 h-6" />,
    link: "#selfcare"
  }
];

// GAD-7 questions
const gadQuestions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid something awful might happen"
];

// Score interpretation
const getGADInterpretation = (score) => {
  if (score >= 0 && score <= 4) return { level: "Minimal Anxiety", severity: "low" };
  if (score >= 5 && score <= 9) return { level: "Mild Anxiety", severity: "mild" };
  if (score >= 10 && score <= 14) return { level: "Moderate Anxiety", severity: "moderate" };
  return { level: "Severe Anxiety", severity: "severe" };
};

// Meditation exercises data
const meditationExercises = [
  {
    title: "Mindful Breathing",
    duration: "5 minutes",
    description: "Focus on your breath to calm your mind and reduce stress.",
    steps: [
      "Find a comfortable seated position.",
      "Close your eyes and take a deep breath in through your nose.",
      "Exhale slowly through your mouth.",
      "Continue breathing deeply, focusing on the sensation of air entering and leaving your body.",
      "If your mind wanders, gently bring your attention back to your breath.",
      "Continue for 5 minutes."
    ]
  },
  {
    title: "Body Scan Meditation",
    duration: "10 minutes",
    description: "Progressively scan your body to release tension and promote relaxation.",
    steps: [
      "Lie down or sit in a comfortable position.",
      "Close your eyes and take a few deep breaths.",
      "Bring your attention to your feet, noticing any sensations.",
      "Slowly move your attention up your body (ankles, calves, knees, etc.).",
      "For any area of tension, breathe into that area and imagine releasing the tension.",
      "Continue until you've scanned your entire body."
    ]
  },
  {
    title: "Loving-Kindness Meditation",
    duration: "7 minutes",
    description: "Cultivate feelings of compassion for yourself and others.",
    steps: [
      "Find a comfortable position and close your eyes.",
      "Begin by directing loving thoughts toward yourself: 'May I be happy, may I be healthy, may I be safe.'",
      "Extend these wishes to someone you care about.",
      "Gradually extend these wishes to acquaintances, then to difficult people in your life.",
      "Finally, extend these wishes to all beings."
    ]
  }
];

// Relaxation techniques data
const relaxationTechniques = [
  {
    title: "Progressive Muscle Relaxation",
    duration: "15 minutes",
    description: "Systematically tense and relax muscle groups to reduce physical tension.",
    steps: [
      "Sit or lie down in a comfortable position.",
      "Starting with your feet, tense the muscles can for 5 seconds.",
      "Release the tension and notice how your muscles feel when relaxed.",
      "Move up to your calves, then thighs, and continue through your body.",
      "End with your facial muscles, tensing and relaxing your forehead, cheeks, and jaw."
    ]
  },
  {
    title: "4-7-8 Breathing Technique",
    duration: "5 minutes",
    description: "A breathing pattern that promotes relaxation and can help with anxiety.",
    steps: [
      "Sit in a comfortable position with your back straight.",
      "Place the tip of your tongue against the ridge behind your upper front teeth.",
      "Exhale completely through your mouth, making a whoosh sound.",
      "Close your mouth and inhale through your nose for a count of 4.",
      "Hold your breath for a count of 7.",
      "Exhale completely through your mouth for a count of 8.",
      "Repeat this cycle 3-4 times."
    ]
  },
  {
    title: "Guided Visualization",
    duration: "10 minutes",
    description: "Use your imagination to create a peaceful scene or experience.",
    steps: [
      "Find a quiet, comfortable place to sit or lie down.",
      "Close your eyes and take several deep breaths.",
      "Imagine a peaceful place (beach, forest, garden, etc.).",
      "Engage all your senses: What do you see, hear, smell, feel?",
      "Spend time exploring this peaceful place in your mind.",
      "When ready, slowly bring your awareness back to the present."
    ]
  }
];

// Self-care tips data
const selfCareTips = [
  {
    title: "Physical Self-Care",
    description: "Taking care of your body to improve mental well-being.",
    tips: [
      "Get 7-9 hours of sleep each night",
      "Eat nutritious meals regularly",
      "Exercise for at least 30 minutes daily",
      "Stay hydrated throughout the day",
      "Take breaks from screens and digital devices"
    ]
  },
  {
    title: "Emotional Self-Care",
    description: "Practices that help you connect with and process your emotions.",
    tips: [
      "Journal about your feelings regularly",
      "Talk to a trusted friend about your emotions",
      "Practice mindfulness or meditation",
      "Engage in creative expression (art, music, writing)",
      "Allow yourself to cry when needed"
    ]
  },
  {
    title: "Social Self-Care",
    description: "Maintaining healthy relationships and social connections.",
    tips: [
      "Spend time with supportive friends and family",
      "Set and maintain healthy boundaries",
      "Ask for help when you need it",
      "Join groups or communities with shared interests",
      "Practice active listening in conversations"
    ]
  },
  {
    title: "Practical Self-Care",
    description: "Organizing your life to reduce stress and increase well-being.",
    tips: [
      "Create a comfortable living environment",
      "Establish routines for daily tasks",
      "Take breaks during work or study",
      "Manage your time effectively",
      "Declutter your physical space regularly"
    ]
  }
];

// Mood tracking data structure


export default function MentalHealthSupport() {
  useRequireAuth("patient");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showGAD, setShowGAD] = useState(false);
  const [gadResponses, setGadResponses] = useState(Array(7).fill(0));
  const [testCompleted, setTestCompleted] = useState(false);
  
  // States for meditation exercises
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [meditationTimer, setMeditationTimer] = useState(null);
  const [meditationInProgress, setMeditationInProgress] = useState(false);
  const [meditationProgress, setMeditationProgress] = useState(0);
  const [meditationTotalTime, setMeditationTotalTime] = useState(0);
  
  // States for mood tracking
  const [moodEntries, setMoodEntries] = useState([]);
  const [currentMood, setCurrentMood] = useState(5);
  const [moodActivities, setMoodActivities] = useState([]);
  const [moodNotes, setMoodNotes] = useState("");
  const [newActivity, setNewActivity] = useState("");
  
  // States for relaxation techniques
  const [selectedRelaxation, setSelectedRelaxation] = useState(null);
  const [relaxationTimer, setRelaxationTimer] = useState(null);
  const [relaxationInProgress, setRelaxationInProgress] = useState(false);
  const [relaxationProgress, setRelaxationProgress] = useState(0);
  const [relaxationTotalTime, setRelaxationTotalTime] = useState(0);
  
  // State for self-care tips
  const [selectedSelfCare, setSelectedSelfCare] = useState(null);
  
  // Timer effect for meditation
  useEffect(() => {
    let interval;
    
    if (meditationInProgress && meditationTimer && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prevTime => {
          if (prevTime && prevTime > 0) {
            // Calculate progress percentage
            const newProgress = ((meditationTotalTime - (prevTime - 1)) / meditationTotalTime) * 100;
            setMeditationProgress(newProgress);
            return prevTime - 1;
          }
          return 0;
        });
      }, 1000);
    } else if (meditationTimer === 0) {
      setMeditationInProgress(false);
      setMeditationProgress(100);
      toast({
        title: "Meditation Complete",
        description: "Great job completing your meditation session!",
      });
    }
    
    return () => clearInterval(interval);
  }, [meditationInProgress, meditationTimer, meditationTotalTime]);
  
  // Timer effect for relaxation
  useEffect(() => {
    let interval;
    
    if (relaxationInProgress && relaxationTimer && relaxationTimer > 0) {
      interval = setInterval(() => {
        setRelaxationTimer(prevTime => {
          if (prevTime && prevTime > 0) {
            // Calculate progress percentage
            const newProgress = ((relaxationTotalTime - (prevTime - 1)) / relaxationTotalTime) * 100;
            setRelaxationProgress(newProgress);
            return prevTime - 1;
          }
          return 0;
        });
      }, 1000);
    } else if (relaxationTimer === 0) {
      setRelaxationInProgress(false);
      setRelaxationProgress(100);
      toast({
        title: "Relaxation Complete",
        description: "Great job completing your relaxation exercise!",
      });
    }
    
    return () => clearInterval(interval);
  }, [relaxationInProgress, relaxationTimer, relaxationTotalTime]);
  
  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowGAD(false);
    setTestCompleted(false);
    // Reset all other states
    setSelectedMeditation(null);
    setMeditationTimer(null);
    setMeditationInProgress(false);
    setMeditationProgress(0);
    setSelectedRelaxation(null);
    setRelaxationTimer(null);
    setRelaxationInProgress(false);
    setRelaxationProgress(0);
    setSelectedSelfCare(null);
  };
  
  const handleGADClick = () => {
    setSelectedResource(null);
    setShowGAD(true);
    setTestCompleted(false);
  };
  
  const handleGADResponse = (questionIndex, value) => {
    const newResponses = [...gadResponses];
    newResponses[questionIndex] = value;
    setGadResponses(newResponses);
  };
  
  const calculateGADScore = () => {
    return gadResponses.reduce((sum, value) => sum + value, 0);
  };
  
  const submitGADTest = () => {
    const score = calculateGADScore();
    const interpretation = getGADInterpretation(score);
    
    toast({
      title: "GAD-7 Assessment Complete",
      description: `Your score: ${score} - ${interpretation.level}`,
      variant: interpretation.severity === "severe" ? "destructive" : "default"
    });
    
    setTestCompleted(true);
  };

  // Format time for display (MM)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Start meditation timer
  const startMeditation = (index) => {
    const duration = parseInt(meditationExercises[index].duration.split(" ")[0]);
    const totalSeconds = duration * 60; // Convert minutes to seconds
    setSelectedMeditation(index);
    setMeditationTimer(totalSeconds);
    setMeditationTotalTime(totalSeconds);
    setMeditationProgress(0);
    setMeditationInProgress(true);
    
    toast({
      title: "Meditation Started",
      description: `${meditationExercises[index].title} - ${meditationExercises[index].duration}`,
    });
  };
  
  // Cancel meditation
  const cancelMeditation = () => {
    setMeditationInProgress(false);
    setMeditationTimer(null);
    setMeditationProgress(0);
    toast({
      title: "Meditation Cancelled",
      description: "You can restart your meditation anytime.",
      variant: "destructive"
    });
  };
  
  // Add mood entry
  const addMoodEntry = () => {
    if (moodActivities.length === 0 && moodNotes.trim() === "") {
      toast({
        title: "Add More Details",
        description: "Please add activities or notes to track your mood better.",
        variant: "destructive"
      });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      mood: currentMood,
      activities: [...moodActivities],
      notes: moodNotes
    };
    
    setMoodEntries([...moodEntries, newEntry]);
    setCurrentMood(5);
    setMoodActivities([]);
    setMoodNotes("");
    
    toast({
      title: "Mood Tracked",
      description: "Your mood entry has been saved successfully.",
    });
  };
  
  // Add activity to mood entry
  const addActivity = () => {
    if (newActivity.trim() !== "" && !moodActivities.includes(newActivity)) {
      setMoodActivities([...moodActivities, newActivity]);
      setNewActivity("");
    }
  };
  
  // Remove activity from mood entry
  const removeActivity = (activity) => {
    setMoodActivities(moodActivities.filter(a => a !== activity));
  };
  
  // Start relaxation technique timer
  const startRelaxation = (index) => {
    const duration = parseInt(relaxationTechniques[index].duration.split(" ")[0]);
    const totalSeconds = duration * 60; // Convert minutes to seconds
    setSelectedRelaxation(index);
    setRelaxationTimer(totalSeconds);
    setRelaxationTotalTime(totalSeconds);
    setRelaxationProgress(0);
    setRelaxationInProgress(true);
    
    toast({
      title: "Relaxation Started",
      description: `${relaxationTechniques[index].title} - ${relaxationTechniques[index].duration}`,
    });
  };
  
  // Cancel relaxation
  const cancelRelaxation = () => {
    setRelaxationInProgress(false);
    setRelaxationTimer(null);
    setRelaxationProgress(0);
    toast({
      title: "Relaxation Cancelled",
      description: "You can restart your relaxation exercise anytime.",
      variant: "destructive"
    });
  };

  // Get mood emoji based on score
  const getMoodEmoji = (score) => {
    if (score <= 2) return "😞";
    if (score <= 4) return "😟";
    if (score <= 6) return "😐";
    if (score <= 8) return "🙂";
    return "😄";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />
      <div className="flex flex-1">
        <Sidebar userType="patient" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2">Mental Health Support</h1>
          <p className="text-gray-600 mb-8">Access mental health resources and support</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {resources.map((resource) => (
              <Card 
                key={resource.title}
                className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedResource?.title === resource.title ? "border-primary border-2" : ""
                }`}
                onClick={() => handleResourceClick(resource)}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {resource.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </Card>
            ))}
            
            <Card 
              className={`p-6 hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 ${
                showGAD ? "border-primary border-2 border-solid" : ""
              }`}
              onClick={handleGADClick}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">GAD-7 Assessment</h3>
              <p className="text-sm text-gray-600">Take a Generalized Anxiety Disorder assessment</p>
            </Card>
          </div>

          {/* Meditation Exercises Content */}
          {selectedResource?.title === "Meditation Exercises" && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 text-primary"><Brain className="w-6 h-6" /></div>
                Meditation Exercises
              </h2>
              <p className="mb-6 text-gray-600">
                Guided meditation sessions to help reduce stress and anxiety. Select an exercise to begin.
              </p>
              
              {selectedMeditation === null ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meditationExercises.map((exercise, index) => (
                    <Card key={index} className="p-4 hover:shadow-md cursor-pointer" onClick={() => setSelectedMeditation(index)}>
                      <h3 className="font-semibold mb-2">{exercise.title}</h3>
                      <div className="text-sm mb-2 text-gray-500">{exercise.duration}</div>
                      <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                      <Button onClick={(e) => { e.stopPropagation(); startMeditation(index); }}>
                        Start Exercise
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setSelectedMeditation(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Exercises
                  </Button>
                  
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                      {meditationExercises[selectedMeditation].title}
                    </h3>
                    <div className="text-sm mb-2 text-gray-500">
                      {meditationExercises[selectedMeditation].duration}
                    </div>
                    <p className="mb-6">{meditationExercises[selectedMeditation].description}</p>
                    
                    <h4 className="font-medium mb-3">Steps:</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-6">
                      {meditationExercises[selectedMeditation].steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                    
                    {meditationInProgress ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p>
                            Meditation in progress... 
                            {meditationTimer !== null && (
                              <span className="font-medium ml-2">{formatTime(meditationTimer)}</span>
                            )}
                          </p>
                          <Button variant="destructive" onClick={cancelMeditation}>Stop</Button>
                        </div>
                        <Progress value={meditationProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button onClick={() => startMeditation(selectedMeditation)}>
                        Start Meditation
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {/* Mood Tracking Content */}
          {selectedResource?.title === "Mood Tracking" && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 text-primary"><Heart className="w-6 h-6" /></div>
                Mood Tracking
              </h2>
              <p className="mb-6 text-gray-600">
                Track your daily mood and identify patterns that affect your mental well-being.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">How are you feeling today?</h3>
                  
                  <div className="text-center mb-2">
                    <span className="text-4xl">{getMoodEmoji(currentMood)}</span>
                    <p className="mt-2">
                      {currentMood <= 2 ? "Very Low" : 
                       currentMood <= 4 ? "Low" : 
                       currentMood <= 6 ? "Neutral" : 
                       currentMood <= 8 ? "Good" : "Excellent"}
                    </p>
                  </div>
                  
                  <div className="px-4">
                    <Slider 
                      value={[currentMood]} 
                      min={1} 
                      max={10} 
                      step={1}
                      onValueChange={(value) => setCurrentMood(value[0])}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="activities">What activities affected your mood?</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="activities" 
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        placeholder="e.g., Exercise, Reading, Work"
                      />
                      <Button onClick={addActivity} type="button">Add</Button>
                    </div>
                    
                    {moodActivities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {moodActivities.map((activity, index) => (
                          <div key={index} className="bg-muted px-3 py-1 rounded-full flex items-center text-sm">
                            {activity}
                            <button 
                              onClick={() => removeActivity(activity)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      id="notes" 
                      value={moodNotes}
                      onChange={(e) => setMoodNotes(e.target.value)}
                      placeholder="Add any additional notes about your mood or day..."
                      rows={4}
                    />
                  </div>
                  
                  <Button onClick={addMoodEntry} className="w-full">Save Mood Entry</Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Mood History</h3>
                  
                  {moodEntries.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No mood entries yet. Start tracking your mood!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {moodEntries.map((entry, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{formatDate(entry.date)}</span>
                            <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          </div>
                          
                          {entry.activities.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-500 mb-1">Activities:</p>
                              <div className="flex flex-wrap gap-1">
                                {entry.activities.map((activity, i) => (
                                  <span key={i} className="bg-muted px-2 py-0.5 rounded-full text-xs">
                                    {activity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {entry.notes && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Notes:</p>
                              <p className="text-sm">{entry.notes}</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
          
          {/* Relaxation Techniques Content */}
          {selectedResource?.title === "Relaxation Techniques" && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 text-primary"><Moon className="w-6 h-6" /></div>
                Relaxation Techniques
              </h2>
              <p className="mb-6 text-gray-600">
                Simple techniques for stress relief and relaxation. Choose a technique to practice.
              </p>
              
              {selectedRelaxation === null ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relaxationTechniques.map((technique, index) => (
                    <Card key={index} className="p-4 hover:shadow-md cursor-pointer" onClick={() => setSelectedRelaxation(index)}>
                      <h3 className="font-semibold mb-2">{technique.title}</h3>
                      <div className="text-sm mb-2 text-gray-500">{technique.duration}</div>
                      <p className="text-sm text-gray-600 mb-4">{technique.description}</p>
                      <Button onClick={(e) => { e.stopPropagation(); startRelaxation(index); }}>
                        Start Technique
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setSelectedRelaxation(null)}
                  >
variant="outline" 
                    className="mb-4"
                    onClick={() => setSelectedRelaxation(null)}
              
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Techniques
                  </Button>
                  
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                      {relaxationTechniques[selectedRelaxation].title}
                    </h3>
                    <div className="text-sm mb-2 text-gray-500">
                      {relaxationTechniques[selectedRelaxation].duration}
                    </div>
                    <p className="mb-6">{relaxationTechniques[selectedRelaxation].description}</p>
                    
                    <h4 className="font-medium mb-3">Steps:</h4>
                    <ol className="list-decimal pl-5 space-y-2 mb-6">
                      {relaxationTechniques[selectedRelaxation].steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                    
                    {relaxationInProgress ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p>
                            Relaxation in progress... 
                            {relaxationTimer !== null && (
                              <span className="font-medium ml-2">{formatTime(relaxationTimer)}</span>
                            )}
                          </p>
                          <Button variant="destructive" onClick={cancelRelaxation}>Stop</Button>
                        </div>
                        <Progress value={relaxationProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button onClick={() => startRelaxation(selectedRelaxation)}>
                        Start Relaxation
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {/* Self-Care Tips Content */}
          {selectedResource?.title === "Self-Care Tips" && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 text-primary"><Smile className="w-6 h-6" /></div>
                Self-Care Tips
              </h2>
              <p className="mb-6 text-gray-600">
                Daily practices to maintain your mental well-being and improve your quality of life.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {selfCareTips.map((category, index) => (
                  <Card 
                    key={index} 
                    className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedSelfCare === index ? "border-primary border-2" : ""
                    }`}
                    onClick={() => setSelectedSelfCare(index)}
                  >
                    <h3 className="font-semibold mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </Card>
                ))}
              </div>
              
              {selectedSelfCare !== null && (
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">{selfCareTips[selectedSelfCare].title}</h3>
                  <p className="mb-6">{selfCareTips[selectedSelfCare].description}</p>
                  
                  <div className="space-y-4">
                    {selfCareTips[selectedSelfCare].tips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-1 mr-3 text-primary">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                            {index + 1}
                          </div>
                        </div>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-gray-600">
                      Remember: Self-care is not selfish. Taking care of your mental health is just health. Try to incorporate at least one of these tips into your daily routine.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {/* GAD-7 Assessment Content */}
          {showGAD && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <div className="mr-3 text-yellow-500"><AlertCircle className="w-6 h-6" /></div>
                GAD-7 Anxiety Assessment
              </h2>
              <p className="mb-2 text-gray-600">
                Over the last 2 weeks, how often have you been bothered by the following problems?
              </p>
              <p className="mb-6 text-sm text-gray-500">
                This is a standard screening tool for anxiety. Your results are private and stored only on your device.
              </p>
              
              {!testCompleted ? (
                <div className="space-y-8">
                  {gadQuestions.map((question, index) => (
                    <div key={index}>
                      <p className="mb-3 font-medium">{index + 1}. {question}</p>
                      <RadioGroup
                        value={gadResponses[index].toString()}
                        onValueChange={(value) => handleGADResponse(index, parseInt(value))}
                        className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id={`q${index}-0`} />
                          <Label htmlFor={`q${index}-0`}>Not at all</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id={`q${index}-1`} />
                          <Label htmlFor={`q${index}-1`}>Several days</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id={`q${index}-2`} />
                          <Label htmlFor={`q${index}-2`}>More than half the days</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id={`q${index}-3`} />
                          <Label htmlFor={`q${index}-3`}>Nearly every day</Label>
                        </div>
                      </RadioGroup>
                      {index < gadQuestions.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                  
                  <Button onClick={submitGADTest} className="mt-8">
                    Submit Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-muted rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Your Results</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span>Score: {calculateGADScore()}/21</span>
                      <span className="font-medium">{getGADInterpretation(calculateGADScore()).level}</span>
                    </div>
                    
                    <Progress 
                      value={(calculateGADScore() / 21) * 100} 
                      className="h-2"
                      color={
                        calculateGADScore() <= 4 ? "bg-green-500" :
                        calculateGADScore() <= 9 ? "bg-yellow-500" :
                        calculateGADScore() <= 14 ? "bg-orange-500" : "bg-red-500"
                      }
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Minimal (0-4)</span>
                      <span>Mild (5-9)</span>
                      <span>Moderate (10-14)</span>
                      <span>Severe (15-21)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">What This Means</h3>
                    
                    {calculateGADScore() <= 4 ? (
                      <p>Your results suggest minimal symptoms of anxiety. Continue with your self-care practices and monitor your mental health.</p>
                    ) : calculateGADScore() <= 9 ? (
                      <p>Your results suggest mild anxiety. Consider using the resources in this app to help manage your symptoms.</p>
                    ) : calculateGADScore() <= 14 ? (
                      <p>Your results suggest moderate anxiety. Consider scheduling an appointment with a mental health professional to discuss your symptoms.</p>
                    ) : (
                      <p>Your results suggest severe anxiety. We recommend reaching out to a mental health professional to discuss these symptoms.</p>
                    )}
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-yellow-700">
                            Note: This assessment is not a diagnosis. Only a licensed healthcare provider can diagnose anxiety disorders.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button onClick={() => {
                      setGadResponses(Array(7).fill(0));
                      setTestCompleted(false);
                    }}>
                      Retake Assessment
                    </Button>
                    <Button variant="outline" onClick={() => setShowGAD(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {/* Default content when nothing is selected */}
          {!selectedResource && !showGAD && (
            <Card className="p-6 text-center">
              <div className="py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">Welcome to Mental Health Support</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                  Select one of the resources above to get started with tools and exercises designed to support your mental well-being.
                </p>
                <Button onClick={() => handleResourceClick(resources[0])}>
                  Get Started
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
