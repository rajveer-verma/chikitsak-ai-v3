
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Heart, Stethoscope, Sparkles, Activity, Brain } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 md:px-0">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold bg-primary-light/50 text-primary">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI-Powered Healthcare
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                  Your AI Medical Companion
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-md">
                  Chikitsak AI provides instant medical advice, mental health support, and connects you with healthcare professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/login?role=patient">Login</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login?role=doctor">Login</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative rounded-2xl bg-gradient-to-br from-health-lightblue via-white to-health-purple p-[2px] shadow-xl">
                  <div className="h-[400px] w-full rounded-2xl bg-white p-6 sm:p-8">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center mb-6">
                          <div className="h-10 w-10 rounded-full bg-primary-light/50 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-semibold text-gray-900">AI Symptom Checker</h3>
                            <p className="text-sm text-gray-500">Get instant answers about your symptoms</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4 rounded-lg border bg-gray-50/50 p-4">
                          <p className="text-gray-800">I've been experiencing a sharp headache for 2 days along with mild fever.</p>
                          <p className="text-gray-500 text-sm">Analyzing symptoms...</p>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div className="h-2 w-2/3 rounded-full bg-primary animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-health-purple/20 p-3 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm font-medium">Mental Health</span>
                        </div>
                        
                        <div className="rounded-lg border bg-health-pink/20 p-3 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm font-medium">Health Analytics</span>
                        </div>
                        
                        <div className="rounded-lg border bg-health-peach/20 p-3 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm font-medium">AI Advice</span>
                        </div>
                        
                        <div className="rounded-lg border bg-health-lightblue/20 p-3 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm font-medium">Doctor Consult</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto max-w-6xl px-6 md:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Experience the future of healthcare with our AI-powered solutions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 rounded-md bg-primary-light/50 flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Symptom Analysis</h3>
                <p className="text-gray-600">AI-powered symptom checker provides instant advice and guidance</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 rounded-md bg-health-purple/30 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mental Health Support</h3>
                <p className="text-gray-600">Access mental wellness tools and connect with professionals</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 rounded-md bg-health-pink/30 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Health Analytics</h3>
                <p className="text-gray-600">Track your health vitals and receive personalized insights</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-6 md:px-0">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-6 max-w-2xl mx-auto">Join thousands of users who trust Chikitsak AI for their healthcare needs</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">Create an Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto max-w-6xl px-6 md:px-0">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">C</span>
                </div>
                <span className="font-semibold text-xl">Chikitsak AI</span>
              </div>
              <p className="mt-2 text-gray-600 max-w-md">Your AI-powered medical companion for instant healthcare guidance and support.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link to="/" className="hover:text-primary">Features</Link></li>
                  <li><Link to="/" className="hover:text-primary">Testimonials</Link></li>
                  <li><Link to="/" className="hover:text-primary">Pricing</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link to="/" className="hover:text-primary">Help Center</Link></li>
                  <li><Link to="/" className="hover:text-primary">Privacy</Link></li>
                  <li><Link to="/" className="hover:text-primary">Terms</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><Link to="/" className="hover:text-primary">About</Link></li>
                  <li><Link to="/" className="hover:text-primary">Careers</Link></li>
                  <li><Link to="/" className="hover:text-primary">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Chikitsak AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
