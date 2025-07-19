"use client";

import { NodeData } from "@/lib/types";
import {
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus,
  Search,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeView: "dashboard" | "mindmap" | "calendar";
  setActiveView: (view: "dashboard" | "mindmap" | "calendar") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  tasks: NodeData[];
  onCreateTestTask: () => void;
  setDraggedTask: (task: NodeData | null) => void;
}

export default function Sidebar({
  activeView,
  setActiveView,
  sidebarCollapsed,
  setSidebarCollapsed,
  tasks,
  onCreateTestTask,
  setDraggedTask,
}: SidebarProps) {
  return (
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
            className="p-2 hover:bg-gray-100 rounded-md transition-colors border border-gray-300 hover:border-gray-400"
            title={
              sidebarCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
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
            <Home size={16} className={sidebarCollapsed ? "" : "mr-3"} />
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
            <Brain size={16} className={sidebarCollapsed ? "" : "mr-3"} />
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
            <Calendar size={16} className={sidebarCollapsed ? "" : "mr-3"} />
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
          <div className="flex-1 px-4">
            <div className="flex items-center justify-between py-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tâches & Idées
              </h3>
              <button
                onClick={onCreateTestTask}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title="Ajouter une tâche de test"
              >
                <Plus size={12} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 max-h-[90dvh] overflow-y-auto scrollbar-hidden">
              {tasks.filter((task) => !task.isScheduled).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Brain size={20} className="mx-auto mb-2 opacity-50" />
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
                        <div className="w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
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
      {/* <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded text-gray-500 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-teal-100 transition-colors">
                +
              </div>
            ))}
          </div>
          <div className="w-6 h-6 bg-teal-500 rounded text-white flex items-center justify-center text-xs font-medium cursor-pointer">
            +
          </div>
        </div>
      </div> */}
    </div>
  );
}
