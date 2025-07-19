"use client";

import CalendarComponent from "@/components/Calendar/CalendarComponent";
import MindMapComponent from "@/components/MindMap/MindMapComponent";
import { CalendarEvent, NodeData } from "@/lib/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Plus,
  RotateCw,
  Search,
  Settings,
  User,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeView, setActiveView] = useState<
    "dashboard" | "mindmap" | "calendar"
  >("dashboard");
  const [tasks, setTasks] = useState<NodeData[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<NodeData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const createTestTask = async () => {
    if (!session?.user?.email) return;

    try {
      const testTask = {
        title: `Tâche test ${Date.now()}`,
        description: "Tâche créée pour tester la sauvegarde MongoDB",
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: "#15a990",
        priority: "medium",
        tags: ["test"],
        isScheduled: false,
        connections: [],
      };

      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testTask),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prev) => [
          ...prev,
          {
            id: newTask._id,
            title: newTask.title,
            description: newTask.description || "",
            color: newTask.color,
            priority: newTask.priority,
            tags: newTask.tags || [],
            isScheduled: newTask.isScheduled,
          },
        ]);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Erreur: ${errorData.error}`);
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskData = event.active.data.current as NodeData;
    setDraggedTask(taskData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTask(null);

    if (event.over && event.over.id === "calendar-drop-zone") {
      const taskData = event.active.data.current as NodeData;
      if (taskData && !taskData.isScheduled) {
        scheduleTask(taskData.id, new Date());
      }
    }
  };

  const scheduleTask = async (taskId: string, date: Date) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const eventData = {
        title: task.title,
        description: task.description,
        startDate: date,
        endDate: new Date(date.getTime() + 2 * 60 * 60 * 1000),
        mindMapNodeId: task.id,
        isFromMindMap: true,
      };

      const eventResponse = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!eventResponse.ok)
        throw new Error("Erreur lors de la création de l'événement");
      const newEvent = await eventResponse.json();

      const taskResponse = await fetch("/api/mindmap", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, isScheduled: true }),
      });

      if (!taskResponse.ok)
        throw new Error("Erreur lors de la mise à jour de la tâche");

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isScheduled: true } : t))
      );

      setEvents((prev) => [
        ...prev,
        {
          id: newEvent._id,
          userId: newEvent.userId,
          title: newEvent.title,
          description: newEvent.description || "",
          startDate: new Date(newEvent.startDate),
          endDate: new Date(newEvent.endDate),
          mindMapNodeId: newEvent.mindMapNodeId,
          isFromMindMap: newEvent.isFromMindMap,
          createdAt: new Date(newEvent.createdAt),
          updatedAt: new Date(newEvent.updatedAt),
        },
      ]);
    } catch (err) {
      console.error("Erreur lors de la planification:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la planification"
      );
    }
  };

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/google-sync?action=import");
      const result = await response.json();

      if (response.ok) {
        console.log("Synchronisation réussie:", result.message);
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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="min-h-screen bg-teal-500 p-1"
        style={{
          background:
            "linear-gradient(135deg, rgb(21, 169, 144) 0%, rgb(17, 94, 89) 100%)",
        }}
      >
        {/* Header */}
        {/* <header className="h-12 flex items-center justify-center mb-1">
          <div className="w-full flex justify-between items-center px-8">
            <div className="flex items-center space-x-6">
              <Home
                size={20}
                className="text-white hover:text-teal-200 cursor-pointer transition-colors"
              />
              <Brain
                size={20}
                className="text-white hover:text-teal-200 cursor-pointer transition-colors"
              />
              <Calendar
                size={20}
                className="text-white hover:text-teal-200 cursor-pointer transition-colors"
              />
            </div>

            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-white text-lg font-semibold tracking-wider">
              MINDCALENDAR
            </h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={createTestTask}
                className="text-white hover:text-teal-200 transition-colors text-sm font-medium"
              >
                Test
              </button>
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
        </header> */}

        {/* Main Container */}
        <main
          className="bg-teal-500 border-4 border-teal-500 rounded-2xl overflow-hidden h-[100vh-10px)]"
          style={{
            boxShadow: "inset 0px 1px 8px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex h-full">
            {/* Sidebar */}
            <div
              className={`${
                sidebarCollapsed ? "w-16" : "w-80"
              } bg-white transition-all duration-300 ease-out flex flex-col min-h-full`}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {!sidebarCollapsed && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <Settings size={16} className="text-white" />
                      </div>
                      <h2 className="text-sm font-bold text-gray-700 tracking-wide">
                        PARAMÈTRES
                      </h2>
                    </div>
                  )}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {sidebarCollapsed ? (
                      <ChevronRight size={14} />
                    ) : (
                      <ChevronLeft size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? "justify-center" : "justify-start"
                    } px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeView === "dashboard"
                        ? "bg-teal-500 text-white"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <Home
                      size={16}
                      className={sidebarCollapsed ? "" : "mr-3"}
                    />
                    {!sidebarCollapsed && "Dashboard"}
                  </button>
                  <button
                    onClick={() => setActiveView("mindmap")}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? "justify-center" : "justify-start"
                    } px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeView === "mindmap"
                        ? "bg-teal-500 text-white"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <Brain
                      size={16}
                      className={sidebarCollapsed ? "" : "mr-3"}
                    />
                    {!sidebarCollapsed && "Mind Map"}
                  </button>
                  <button
                    onClick={() => setActiveView("calendar")}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? "justify-center" : "justify-start"
                    } px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeView === "calendar"
                        ? "bg-teal-500 text-white"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    <Calendar
                      size={16}
                      className={sidebarCollapsed ? "" : "mr-3"}
                    />
                    {!sidebarCollapsed && "Calendrier"}
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              {!sidebarCollapsed && (
                <div className="px-4 mb-4">
                  <div className="flex rounded-lg overflow-hidden bg-teal-500">
                    <div className="bg-teal-500 px-3 py-2 flex items-center">
                      <Search size={14} className="text-white" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher une tâche"
                      className="flex-1 px-3 py-2 bg-teal-500 text-white placeholder-white/70 text-sm border-0 outline-0"
                    />
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              {!sidebarCollapsed &&
                (activeView === "mindmap" || activeView === "calendar") && (
                  <div className="flex-1 px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tâches & Idées
                      </h3>
                      <button
                        onClick={createTestTask}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Ajouter une tâche de test"
                      >
                        <Plus size={12} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {tasks.filter((task) => !task.isScheduled).length ===
                      0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Brain
                            size={20}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p className="text-xs">Aucune tâche en attente</p>
                        </div>
                      ) : (
                        tasks
                          .filter((task) => !task.isScheduled)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="group p-3 bg-white rounded-lg border border-gray-200 hover:bg-teal-50/70 transition-all duration-200 cursor-pointer"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify(task)
                                );
                                setDraggedTask(task);
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-gray-600">
                                    {task.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <h4 className="text-sm font-medium text-gray-800 truncate">
                                      {task.title}
                                    </h4>
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                        task.priority === "high"
                                          ? "bg-red-100 text-red-700"
                                          : task.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {task.description}
                                  </p>
                                </div>
                                <div className="flex flex-col items-center text-xs text-gray-400">
                                  <span>12h15</span>
                                  <div className="w-4 h-4 bg-teal-500 rounded-full text-white text-xs flex items-center justify-center mt-1">
                                    1
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

              {/* Bottom Section */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 overflow-x-auto">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-gray-200 rounded text-gray-500 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-teal-100 transition-colors"
                      >
                        +
                      </div>
                    ))}
                  </div>
                  <div className="w-6 h-6 bg-teal-500 rounded text-white flex items-center justify-center text-xs font-medium cursor-pointer">
                    +
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white">
              {/* Error Message */}
              {error && (
                <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xs font-medium">
                        !
                      </span>
                    </div>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <ChevronRight size={14} className="rotate-45" />
                  </button>
                </div>
              )}

              {/* Content Area */}
              <div className="flex-1 overflow-hidden h-full">
                {activeView === "dashboard" && (
                  <div className="h-full overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Tâches totales
                              </p>
                              <p className="text-3xl font-bold text-teal-600">
                                {tasks.length}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                              <Brain size={24} className="text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Événements
                              </p>
                              <p className="text-3xl font-bold text-teal-600">
                                {events.length}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                              <Calendar size={24} className="text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Planifiées
                              </p>
                              <p className="text-3xl font-bold text-teal-600">
                                {tasks.filter((t) => t.isScheduled).length}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                              <RotateCw size={24} className="text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                En attente
                              </p>
                              <p className="text-3xl font-bold text-teal-600">
                                {tasks.filter((t) => !t.isScheduled).length}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                              <Plus size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Settings Section */}
                      <div className="bg-white rounded-xl p-8 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                          <Settings className="mr-3" size={24} />
                          Réglages et préférences
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  Synchronisation Google Calendar
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Synchroniser automatiquement avec Google
                                  Calendar
                                </p>
                              </div>
                              <button
                                onClick={handleGoogleSync}
                                disabled={isSyncing}
                                className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all duration-200"
                              >
                                <RotateCw
                                  size={16}
                                  className={`mr-2 ${
                                    isSyncing ? "animate-spin" : ""
                                  }`}
                                />
                                {isSyncing ? "Sync..." : "Synchroniser"}
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  Notifications
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Recevoir des notifications pour les tâches
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  defaultChecked
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeView === "mindmap" && (
                  <div className="h-full">
                    <MindMapComponent
                      tasks={tasks}
                      onTaskUpdate={(updatedTasks) => {
                        setTasks(updatedTasks);
                        fetchData();
                      }}
                    />
                  </div>
                )}

                {activeView === "calendar" && (
                  <div id="calendar-drop-zone" className="h-full">
                    <CalendarComponent
                      events={events}
                      onSelectEvent={(event) =>
                        console.log("Event selected:", event)
                      }
                      onSelectSlot={(slot) =>
                        console.log("Slot selected:", slot)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <DragOverlay>
          {draggedTask ? (
            <div className="bg-white border-2 border-teal-500 rounded-lg p-3 shadow-lg opacity-90">
              <h4 className="font-medium text-sm">{draggedTask.title}</h4>
              <p className="text-xs text-gray-600">{draggedTask.description}</p>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
