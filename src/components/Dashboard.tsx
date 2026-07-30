"use client";

import React from "react";
import {
  BookOpen,
  Users,
  GitBranch,
  Calendar,
  Feather,
  Sparkles,
  Edit3,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";
import {
  ProjectDetail,
  Chapter,
  Character,
  CharacterRelationshipWithDetails,
  TimelineEventWithChapter,
} from "@/types";

interface DashboardProps {
  project: ProjectDetail | null;
  onNavigateView: (
    view:
      | "dashboard"
      | "manuscripts"
      | "characters"
      | "relationships"
      | "timeline"
      | "django-blueprint"
  ) => void;
  onEditProject: () => void;
  onNewChapter: () => void;
  onNewCharacter: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export function Dashboard({
  project,
  onNavigateView,
  onEditProject,
  onNewChapter,
  onNewCharacter,
  onSeedDemo,
  isSeeding,
}: DashboardProps) {
  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#121417]">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-amber-100 mb-2">
          Welcome to LoreVault
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
          An aesthetic, lightweight storytelling studio built for novelists,
          poets, and worldbuilders. No manuscript project is currently loaded.
        </p>
        <button
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>
            {isSeeding ? "Seeding Vault..." : "Load Sample Project: The Obsidian Crown"}
          </span>
        </button>
      </div>
    );
  }

  const completedChapters = project.chapters.filter(
    (c) => c.status === "Completed"
  ).length;
  const progressPercent = Math.min(
    100,
    ((project.totalWordCount || 0) / (project.targetWordCount || 50000)) * 100
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. HERO MANUSCRIPT BANNER */}
      <div className="relative bg-gradient-to-br from-[#1b1f26] via-[#16191f] to-[#121417] border border-white/10 hover:border-amber-500/30 rounded-2xl p-8 shadow-2xl overflow-hidden transition-all">
        {/* Subtle Decorative Background Element */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {project.genre}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                ID #{project.id} • Last modified{" "}
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-amber-100 tracking-wide">
              {project.title}
            </h1>

            <p className="text-xs text-neutral-300 leading-relaxed font-serif italic">
              &ldquo;{project.synopsis || "No synopsis recorded yet..."}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <button
              onClick={onEditProject}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 rounded-xl text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Blueprint</span>
            </button>

            <button
              onClick={() => onNavigateView("manuscripts")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 rounded-xl text-xs font-semibold shadow-lg shadow-amber-900/30 transition-all"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Open Manuscript Editor</span>
            </button>
          </div>
        </div>

        {/* Word Count Goal Progress */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-300 font-medium">
                Word Count Goal Progress
              </span>
            </div>
            <div className="font-mono text-amber-300 font-semibold">
              {(project.totalWordCount || 0).toLocaleString()} /{" "}
              {(project.targetWordCount || 50000).toLocaleString()} words (
              {progressPercent.toFixed(1)}%)
            </div>
          </div>

          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateView("manuscripts")}
          className="bg-[#181b20] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Chapters</span>
            <Feather className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-100">
            {project.chapters.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {completedChapters} completed draft{completedChapters !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          onClick={() => onNavigateView("characters")}
          className="bg-[#181b20] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Character Vault</span>
            <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-100">
            {project.characters.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Protagonists, rivals & allies
          </div>
        </div>

        <div
          onClick={() => onNavigateView("relationships")}
          className="bg-[#181b20] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Relationship Links</span>
            <GitBranch className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-100">
            {project.relationships.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Self-referential M2M graph
          </div>
        </div>

        <div
          onClick={() => onNavigateView("timeline")}
          className="bg-[#181b20] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Timeline Events</span>
            <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-serif text-2xl font-bold text-amber-100">
            {project.timelineEvents.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Chronological plot beats
          </div>
        </div>
      </div>

      {/* 3. RECENT MANUSCRIPT CHAPTERS & CHARACTER CARDS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Chapters */}
        <div className="bg-[#181b20] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-semibold text-sm text-amber-100">
                Manuscript Chapters
              </h3>
            </div>
            <button
              onClick={onNewChapter}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>
          </div>

          <div className="space-y-2">
            {project.chapters.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                No chapters recorded yet.
              </div>
            ) : (
              project.chapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => onNavigateView("manuscripts")}
                  className="p-3 bg-[#13161a] border border-white/5 rounded-xl flex items-center justify-between hover:border-amber-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-mono text-xs text-neutral-500 w-6">
                      #{ch.orderIndex}
                    </span>
                    <span className="font-serif text-sm text-amber-100 truncate">
                      {ch.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-neutral-400">
                      {(ch.wordCount || 0).toLocaleString()} words
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        ch.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : ch.status === "In Review"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-white/5 text-neutral-400"
                      }`}
                    >
                      {ch.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Character Highlights Preview */}
        <div className="bg-[#181b20] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-semibold text-sm text-amber-100">
                Key Character Profiles
              </h3>
            </div>
            <button
              onClick={onNewCharacter}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Character</span>
            </button>
          </div>

          <div className="space-y-2">
            {project.characters.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                No characters recorded yet.
              </div>
            ) : (
              project.characters.slice(0, 4).map((char) => (
                <div
                  key={char.id}
                  onClick={() => onNavigateView("characters")}
                  className="p-3 bg-[#13161a] border border-white/5 rounded-xl flex items-center justify-between hover:border-amber-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/30 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-serif text-sm font-medium text-amber-100 truncate">
                        {char.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono uppercase">
                        {char.role}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
