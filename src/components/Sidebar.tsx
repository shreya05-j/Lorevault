"use client";

import React from "react";
import {
  BookOpen,
  Users,
  GitBranch,
  Calendar,
  Layers,
  Code2,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  Maximize2,
  Minimize2,
  BookMarked,
  Feather,
} from "lucide-react";
import { useVaultStore } from "@/store/useVaultStore";
import { ActiveView, ProjectSummary } from "@/types";

interface SidebarProps {
  projects: ProjectSummary[];
  activeProject: ProjectSummary | null;
  onNewProject: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export function Sidebar({
  projects,
  activeProject,
  onNewProject,
  onSeedDemo,
  isSeeding,
}: SidebarProps) {
  const activeView = useVaultStore((s) => s.activeView);
  const setActiveView = useVaultStore((s) => s.setActiveView);
  const activeProjectId = useVaultStore((s) => s.activeProjectId);
  const setActiveProjectId = useVaultStore((s) => s.setActiveProjectId);
  const isZenMode = useVaultStore((s) => s.isZenMode);
  const toggleZenMode = useVaultStore((s) => s.toggleZenMode);
  const soundscape = useVaultStore((s) => s.soundscape);
  const setSoundscape = useVaultStore((s) => s.setSoundscape);

  if (isZenMode) {
    return (
      <button
        onClick={toggleZenMode}
        title="Exit Zen Mode (Esc)"
        className="fixed top-4 left-4 z-50 p-2.5 bg-[#181b20]/80 hover:bg-[#22272e] border border-white/10 rounded-full text-amber-200 shadow-xl transition-all"
      >
        <Minimize2 className="w-4 h-4" />
      </button>
    );
  }

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: "dashboard", label: "Studio Overview", icon: Layers },
    {
      id: "manuscripts",
      label: "Manuscripts",
      icon: Feather,
      badge: activeProject ? `${activeProject.chapterCount}` : undefined,
    },
    {
      id: "characters",
      label: "Character Vault",
      icon: Users,
      badge: activeProject ? `${activeProject.characterCount}` : undefined,
    },
    { id: "relationships", label: "Relationship Map", icon: GitBranch },
    { id: "timeline", label: "Plot Timeline", icon: Calendar },
    { id: "django-blueprint", label: "Django Architecture", icon: Code2 },
  ];

  return (
    <aside className="w-64 bg-[#14171c] border-r border-white/5 flex flex-col h-screen select-none shrink-0">
      {/* Brand / Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md shadow-amber-900/30">
              <BookMarked className="w-4 h-4 text-amber-100" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg tracking-wide text-amber-100">
                LoreVault
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#8e9aab]">
                Storyteller&apos;s Studio
              </p>
            </div>
          </div>
          <button
            onClick={toggleZenMode}
            title="Enter Zen Writing Mode"
            className="p-1.5 text-neutral-400 hover:text-amber-200 rounded-md hover:bg-white/5 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher */}
        <div className="mt-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Active Project
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={activeProjectId || ""}
              onChange={(e) => setActiveProjectId(Number(e.target.value) || null)}
              className="w-full bg-[#1b1f26] border border-white/10 rounded-md py-1.5 px-2.5 text-xs text-amber-100 font-medium focus:outline-none focus:border-amber-500/50"
            >
              {projects.length === 0 && (
                <option value="">No projects available</option>
              )}
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title}
                </option>
              ))}
            </select>
            <button
              onClick={onNewProject}
              title="Create New Project"
              className="p-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-3 mb-2">
          Studio Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-amber-600/20 to-amber-900/10 text-amber-200 border-l-2 border-amber-500 shadow-sm"
                  : "text-neutral-300 hover:text-neutral-100 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-amber-400" : "text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-white/5 text-neutral-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Word Count Goal Progress Widget */}
      {activeProject && (
        <div className="p-4 border-t border-white/5 bg-[#171a21]/50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">Manuscript Word Goal</span>
            <span className="font-mono text-amber-300 font-semibold">
              {(
                ((activeProject.totalWordCount || 0) /
                  (activeProject.targetWordCount || 50000)) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  ((activeProject.totalWordCount || 0) /
                    (activeProject.targetWordCount || 50000)) *
                    100
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-neutral-400 mt-1 font-mono">
            <span>
              {(activeProject.totalWordCount || 0).toLocaleString()} words
            </span>
            <span>
              Target: {(activeProject.targetWordCount || 50000).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Ambient Soundscape Controls & Seed */}
      <div className="p-3 border-t border-white/5 bg-[#111317]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Ambient Sound
          </span>
          <div className="flex gap-1">
            {(["off", "rain", "library", "fireplace"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSoundscape(mode)}
                title={`Ambient: ${mode}`}
                className={`px-2 py-1 rounded text-[10px] capitalize transition-colors ${
                  soundscape === mode
                    ? "bg-amber-600/30 text-amber-200 border border-amber-500/30"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                }`}
              >
                {mode === "off" ? "Off" : mode}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-200 hover:text-amber-100 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSeeding ? "Seeding..." : "Load The Obsidian Crown Demo"}</span>
        </button>
      </div>
    </aside>
  );
}
