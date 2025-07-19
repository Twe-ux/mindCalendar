"use client";

import DashboardView from "@/components/Dashboard/DashboardView";
import { CalendarEvent, NodeData } from "@/lib/types";
import { Brain, LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<NodeData[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fonction pour charger les données depuis MongoDB
  const fetchData = useCallback(async () => {
    if (session?.user?.email) {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les tâches
        const tasksResponse = await fetch("/api/mindmap");
        if (!tasksResponse.ok)
          throw new Error("Erreur lors du chargement des tâches");
        const tasksData = await tasksResponse.json();

        // Récupérer les événements
        const eventsResponse = await fetch("/api/calendar");
        if (!eventsResponse.ok)
          throw new Error("Erreur lors du chargement des événements");
        const eventsData = await eventsResponse.json();

        // Transformer les données pour correspondre aux interfaces
        const formattedTasks = tasksData.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || "",
          color: task.color,
          priority: task.priority,
          tags: task.tags || [],
          executionPeriod: task.executionPeriod,
          isScheduled: task.isScheduled,
          x: task.x || 0,
          y: task.y || 0,
        }));

        const formattedEvents = eventsData.map((event: any) => ({
          id: event._id,
          userId: event.userId,
          title: event.title,
          description: event.description || "",
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          mindMapNodeId: event.mindMapNodeId,
          isFromMindMap: event.isFromMindMap,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));

        setTasks(formattedTasks);
        setEvents(formattedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [session?.user?.email]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
          <p className="text-white font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              MindMap Calendar
            </h1>
            <p className="text-gray-600 mt-2">
              Transformez vos idées en tâches planifiées
            </p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <User size={20} className="mr-2" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/google-sync?action=import");
      const result = await response.json();

      if (response.ok) {
        console.log("Synchronisation réussie:", result.message);
        // Recharger les données après la sync
        fetchData();
      } else {
        console.error("Erreur de synchronisation:", result.error);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-teal-500 p-1"
      style={{
        background:
          "linear-gradient(135deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
      }}
    >
      {/* Header */}
      <header className="h-12 flex items-center justify-center mb-1">
        <div className="w-full flex justify-between items-center px-8">
          <div className="flex items-center space-x-6">
            <a
              href="/mindmap"
              className="text-white hover:text-teal-200 cursor-pointer transition-colors"
            >
              <Brain size={20} />
            </a>
            <a
              href="/calendar"
              className="text-white hover:text-teal-200 cursor-pointer transition-colors"
            >
              📅
            </a>
          </div>

          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-white text-lg font-semibold tracking-wider">
            DASHBOARD
          </h1>

          <div className="flex items-center space-x-4">
            <img
              src={session.user?.image || ""}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
            <button
              onClick={() => signOut()}
              className="text-white hover:text-teal-200 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="bg-white border-4 border-teal-500 rounded-2xl overflow-hidden h-[calc(100vh-60px)] shadow-inset-custom">
        {/* Error Message */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Dashboard Content - Page complète */}
        <DashboardView
          tasks={tasks}
          events={events}
          isSyncing={isSyncing}
          onGoogleSync={handleGoogleSync}
        />
      </main>
    </div>
  );
}
