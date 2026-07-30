"use client";

import React, { useState } from "react";
import {
  Calendar,
  BookOpen,
  Plus,
  Clock,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
} from "lucide-react";
import { TimelineEventWithChapter, Chapter } from "@/types";

interface TimelineProps {
  events: TimelineEventWithChapter[];
  chapters: Chapter[];
  onAddEvent: () => void;
  onEditEvent: (ev: TimelineEventWithChapter) => void;
  onDeleteEvent: (id: number) => void;
  onReorder: (id: number, direction: "up" | "down") => void;
}

export function Timeline({
  events,
  chapters,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onReorder,
}: TimelineProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    null
  );

  const filteredEvents = selectedChapterId
    ? events.filter((ev) => ev.chapterId === selectedChapterId)
    : events;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-amber-100 tracking-wide">
            Plot Timeline & Story Chronology
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Map out in-universe historical dates, plot beats, and character
            developments across your manuscript.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Chapter Filter */}
          <div className="flex items-center gap-1.5 bg-[#181b20] border border-white/10 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedChapterId || ""}
              onChange={(e) =>
                setSelectedChapterId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="bg-transparent text-xs text-amber-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Chapters ({events.length} events)</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch. {ch.orderIndex}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onAddEvent}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plot Event</span>
          </button>
        </div>
      </div>

      {/* Timeline Visual Track */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#16191f] border border-white/10 rounded-2xl p-8">
          <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-amber-200 mb-1">
            No Plot Events Recorded
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Create your first plot event to begin tracking chronological story
            beats and manuscript timelines.
          </p>
          <button
            onClick={onAddEvent}
            className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium"
          >
            + Create First Timeline Event
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-amber-500/30 ml-4 md:ml-24 space-y-8 pb-12">
          {filteredEvents.map((ev, index) => (
            <div
              key={ev.id}
              className="relative pl-6 md:pl-10 group transition-all"
            >
              {/* Timeline Indicator Circle */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#181b20] border-2 border-amber-500 shadow-md group-hover:bg-amber-500 transition-colors" />

              {/* Timestamp label on desktop left margin */}
              <div className="hidden md:block absolute -left-48 top-1 w-40 text-right pr-4">
                <div className="text-xs font-mono text-amber-300/80 font-medium truncate">
                  {ev.timestampInStory}
                </div>
                <div className="text-[10px] text-neutral-500">
                  Sequence #{ev.sequenceOrder}
                </div>
              </div>

              {/* Event Card */}
              <div className="bg-[#181b20] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 shadow-lg space-y-3 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">
                      #{ev.sequenceOrder}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-amber-100">
                      {ev.eventTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {ev.chapterTitle && (
                      <span className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 text-neutral-300 px-2.5 py-1 rounded-full font-serif">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>{ev.chapterTitle}</span>
                      </span>
                    )}

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-0.5 bg-black/30 rounded p-0.5">
                      <button
                        onClick={() => onReorder(ev.id, "up")}
                        disabled={index === 0}
                        title="Move Up in Chronology"
                        className="p-1 text-neutral-400 hover:text-amber-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onReorder(ev.id, "down")}
                        disabled={index === filteredEvents.length - 1}
                        title="Move Down in Chronology"
                        className="p-1 text-neutral-400 hover:text-amber-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onEditEvent(ev)}
                      title="Edit Event"
                      className="p-1.5 text-neutral-400 hover:text-amber-300 rounded hover:bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete event "${ev.eventTitle}" from timeline?`
                          )
                        ) {
                          onDeleteEvent(ev.id);
                        }
                      }}
                      title="Delete Event"
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded hover:bg-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile Timestamp display */}
                <div className="md:hidden flex items-center gap-1.5 text-xs font-mono text-amber-300/80">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ev.timestampInStory}</span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
