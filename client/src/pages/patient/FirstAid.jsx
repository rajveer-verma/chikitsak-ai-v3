import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search,
  LifeBuoy,
  Heart,
  BandageIcon,
  ThermometerIcon,
  AlertTriangle,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

// ----------------------------------------------------------------------
// FIRST AID DATA
// ----------------------------------------------------------------------

const firstAidData = [
  {
    id: "cuts",
    title: "Cuts & Wounds",
    icon: BandageIcon,
    color: "text-red-500",
    bgColor: "bg-red-50",
    content: [
      {
        title: "Clean the wound",
        steps: [
          "Wash your hands thoroughly with soap and water",
          "Clean the cut with mild soap and water",
          "Rinse under clean running water for 5-10 minutes",
          "Remove any dirt or debris gently with tweezers cleaned with alcohol"
        ]
      },
      {
        title: "Stop the bleeding",
        steps: [
          "Apply gentle pressure with a clean cloth or bandage",
          "Keep pressure on the wound until bleeding stops",
          "If blood soaks through, add another bandage on top without removing the first"
        ]
      },
      {
        title: "Protect the wound",
        steps: [
          "Apply antibiotic ointment to prevent infection",
          "Cover with a sterile bandage",
          "Change the bandage daily or whenever it gets wet or dirty"
        ]
      }
    ]
  },
  {
    id: "burns",
    title: "Burns",
    icon: ThermometerIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    content: [
      {
        title: "For minor burns (redness, mild swelling)",
        steps: [
          "Cool the burn with cool (not cold) running water for 10-15 minutes",
          "Don't use ice can damage tissue",
          "Apply aloe vera gel or moisturizer",
          "Take over-the-counter pain reliever if needed",
          "Cover with a sterile, non-stick bandage"
        ]
      },
      {
        title: "For major burns (severe, deep, or large)",
        steps: [
          "Call emergency services immediately",
          "Don't remove burned clothing stuck to the skin",
          "Cover the burn with a clean, dry sheet or bandage",
          "Elevate the burned area above heart level if possible",
          "Watch for signs of shock (pale skin, weakness, rapid pulse)"
        ]
      }
    ]
  },
  {
    id: "choking",
    title: "Choking",
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    content: [
      {
        title: "If the person can speak or cough",
        steps: [
          "Encourage them to keep coughing",
          "Don't interfere with their attempts to expel the object",
          "Stay with them and monitor their condition"
        ]
      },
      {
        title: "If the person cannot speak or cough",
        steps: [
          "Stand behind the person and wrap your arms around their waist",
          "Make a fist with one hand and place it thumb-side against their abdomen, above the navel",
          "Grasp your fist with your other hand",
          "Perform quick, upward thrusts into their abdomen",
          "Repeat until the object is expelled or the person becomes unconscious",
          "If they become unconscious, call emergency services and begin CPR"
        ]
      }
    ]
  },
  {
    id: "cpr",
    title: "CPR Basics",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    content: [
      {
        title: "Check responsiveness",
        steps: [
          "Tap the person's shoulder and shout 'Are you OK?'",
          "If no response, call emergency services or ask someone else to",
          "Check for normal breathing"
        ]
      },
      {
        title: "Chest compressions",
        steps: [
          "Place the person on their back on a firm surface",
          "Kneel beside them with shoulders directly over their chest",
          "Place the heel of one hand on the center of their chest",
          "Place your other hand on top and interlock fingers",
          "Keep arms straight and position shoulders directly above hands",
          "Compress chest at least 2 inches (5 cm) deep",
          "Deliver compressions at a rate of 100-120 per minute",
          "Allow chest to fully recoil after each compression"
        ]
      },
      {
        title: "Rescue breaths (if trained)",
        steps: [
          "After 30 compressions, open the airway using head-tilt/chin-lift",
          "Pinch the nose shut and make a complete seal over their mouth with yours",
          "Blow in for about 1 second to make the chest rise",
          "Deliver a second breath",
          "Continue cycle of 30 compressions and 2 breaths until help arrives"
        ]
      }
    ]
  }
];

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

export default function FirstAid() {
  useRequireAuth("patient");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { speak, stop, speaking, supported } = useTextToSpeech();

  const filteredData = searchTerm
    ? firstAidData.filter((category) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.content.some(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.steps.some((step) =>
              step.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      )
    : firstAidData;

  const generateSpeechText = (category, procedure) => {
    let speechText = `${procedure.title}. `;
    procedure.steps.forEach((step, index) => {
      speechText += `Step ${index + 1}: ${step}. `;
    });
    return speechText;
  };

  const speakCategory = (category) => {
    const categoryData = firstAidData.find((c) => c.id === category);
    if (!categoryData) return;

    let speechText = `${categoryData.title} procedures. `;
    categoryData.content.forEach((procedure) => {
      speechText += `${procedure.title}. `;
      procedure.steps.forEach((step, index) => {
        speechText += `Step ${index + 1}: ${step}. `;
      });
      speechText += " Next procedure. ";
    });

    speak(speechText);
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar userType="patient" />

      <div className="flex flex-1">
        <Sidebar userType="patient" />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* --------------------------------------- */}
            {/* HEADER */}
            {/* --------------------------------------- */}
            <div className="flex items-center mb-6">
              <LifeBuoy className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-3xl font-bold">First Aid Assistant</h1>
            </div>

            {/* --------------------------------------- */}
            {/* SEARCH BAR */}
            {/* --------------------------------------- */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

                <Input
                  className="pl-10"
                  placeholder="Search for first aid procedures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                Find step-by-step guides for common first aid situations. In
                case of serious emergency, always call 112.
              </p>

              {supported && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center">
                  <Volume2 className="h-4 w-4 mr-1" />
                  <span>
                    Text-to-speech available. Click the speaker icon to hear
                    instructions.
                  </span>
                </div>
              )}
            </div>

            {/* --------------------------------------- */}
            {/* CATEGORY VIEW */}
            {/* --------------------------------------- */}
            {selectedCategory ? (
              <div className="space-y-6">
                {/* Back Button + Read All */}
                <div className="flex justify-between items-center mb-4">
                  <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                    ← Back to all categories
                  </Button>

                  {supported && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        speaking ? stop() : speakCategory(selectedCategory)
                      }
                      className="flex items-center"
                    >
                      {speaking ? (
                        <>
                          <VolumeX className="h-4 w-4 mr-2" />
                          Stop Audio
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Read All Instructions
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Selected Category Content */}
                {firstAidData
                  .filter((category) => category.id === selectedCategory)
                  .map((category) => (
                    <div key={category.id} className="space-y-6">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full ${category.bgColor} mr-3`}>
                          <category.icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                      </div>

                      {category.content.map((item, index) => (
                        <Card key={index}>
                          <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle>{item.title}</CardTitle>

                            {supported && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  speaking
                                    ? stop()
                                    : speak(generateSpeechText(category.id, item))
                                }
                              >
                                {speaking ? (
                                  <VolumeX className="h-4 w-4" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </CardHeader>

                          <CardContent>
                            <ol className="list-decimal pl-5 space-y-2">
                              {item.steps.map((step, stepIdx) => (
                                <li key={stepIdx}>{step}</li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
              </div>
            ) : (
              /* --------------------------------------- */
              /* ALL CATEGORIES GRID */
              /* --------------------------------------- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredData.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className={`p-3 rounded-full ${category.bgColor} mr-3`}>
                        <category.icon className={`h-6 w-6 ${category.color}`} />
                      </div>

                      <CardTitle className="mt-2">{category.title}</CardTitle>

                      <CardDescription>
                        {category.content.length} procedure
                        {category.content.length > 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {category.content[0].title}
                        {category.content.length > 1 ? " and more..." : ""}
                      </p>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                      <Button variant="ghost" className="flex-1">
                        View Guide
                      </Button>

                      {supported && (
                        <Button
                          variant="ghost"
                          className="ml-2 p-0 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            speaking ? stop() : speakCategory(category.id);
                          }}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* --------------------------------------- */}
            {/* NOTICE BOX */}
            {/* --------------------------------------- */}
            <div className="mt-10 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    This guide is for informational purposes only. For real
                    emergencies, always call 112 or local emergency services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
