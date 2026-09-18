
import { Navbar } from "@/components/layout/Navbar";

export default function NotificationCenter() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600 mt-2">Coming soon</p>
      </main>
    </div>
  );
}
