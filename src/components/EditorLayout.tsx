"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Users,
  Maximize2,
  Check,
  ChevronRight,
  ChevronLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  Eye,
  Save,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { Chapter, Character, ChapterStatus } from "@/types";
import { useVaultStore } from "@/store/useVaultStore";

interface EditorLayoutProps {
  chapters: Chapter[];
  characters: Character[];
  activeChapterId: number | null;
  onSelectChapter: (id: number) => void;
  onSaveChapter: (
    id: number,
    data: { title?: string; content?: string; status?: ChapterStatus }
  ) => Promise<void>;
  onCreateChapter: () => void;
  onDeleteChapter: (id: number) => void;
  projectWordCount: number;
  projectTargetWordCount: number;
  onExportDocx?: () => void;
}

export function EditorLayout({
  chapters,
  characters,
  activeChapterId,
  onSelectChapter,
  onSaveChapter,
  onCreateChapter,
  onDeleteChapter,
  projectWordCount,
  projectTargetWordCount,
  onExportDocx,
}: EditorLayoutProps) {
  const isZenMode = useVaultStore((s) => s.isZenMode);
  const toggleZenMode = useVaultStore((s) => s.toggleZenMode);
  const isDrawerOpen = useVaultStore((s) => s.isCharacterDrawerOpen);
  const setDrawerOpen = useVaultStore((s) => s.setCharacterDrawerOpen);

  const activeChapter =
    chapters.find((c) => c.id === activeChapterId) || chapters[0] || null;

  const [title, setTitle] = useState(activeChapter?.title || "");
  const [content, setContent] = useState(activeChapter?.content || "");
  const [status, setStatus] = useState<ChapterStatus>(
    activeChapter?.status || "Draft"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [searchChar, setSearchChar] = useState("");

  useEffect(() => {
    if (activeChapter) {
      setTitle(activeChapter.title || "");
      setContent(activeChapter.content || "");
      setStatus(activeChapter.status || "Draft");
    }
  }, [activeChapter?.id]);

  const currentWordCount = content
    ? content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;

  const handleSave = async () => {
    if (!activeChapter) return;
    setIsSaving(true);
    try {
      await onSaveChapter(activeChapter.id, { title, content, status });
      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(""), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = (syntax: string, wrapper = false) => {
    const textarea = document.getElementById(
      "manuscript-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    let replacement = "";
    if (wrapper) {
      replacement = `${syntax}${selected || "text"}${syntax}`;
    } else {
      replacement = `${syntax} ${selected}`;
    }

    const newContent =
      content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
  };

  const filteredCharacters = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(searchChar.toLowerCase()) ||
      c.role.toLowerCase().includes(searchChar.toLowerCase()) ||
      c.internalDesire.toLowerCase().includes(searchChar.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#121417]">
      {/* 1. LIVE WORD-COUNT GOAL BAR AT THE TOP */}
      <header
        className={`bg-[#16191f] border-b border-white/5 px-6 py-2.5 flex items-center justify-between transition-all ${
          isZenMode ? "opacity-30 hover:opacity-100" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">
              Chapter Words:
            </span>
            <span className="font-mono text-xs text-amber-200 font-semibold bg-white/5 px-2 py-0.5 rounded">
              {currentWordCount.toLocaleString()}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Project Goal:</span>
            <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (projectWordCount / (projectTargetWordCount || 50000)) * 100
                  )}%`,
                }}
              />
            </div>
            <span className="font-mono text-xs text-neutral-300">
              {projectWordCount.toLocaleString()} /{" "}
              {(projectTargetWordCount || 50000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {saveMessage}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !activeChapter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Manuscript"}</span>
          </button>

          {onExportDocx && (
            <button
              onClick={onExportDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .docx</span>
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDrawerOpen
                ? "bg-amber-600 text-amber-100 border-amber-500"
                : "bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Characters ({characters.length})</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Chapter list sidebar + Distraction-free Editor + Character Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chapters Left Panel (Hidden in Zen Mode) */}
        {!isZenMode && (
          <div className="w-64 bg-[#14171c] border-r border-white/5 flex flex-col shrink-0 select-none">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Manuscript Chapters
              </span>
              <button
                onClick={onCreateChapter}
                className="p-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 transition-colors"
                title="Add Chapter"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chapters.map((ch) => {
                const isSelected = ch.id === activeChapter?.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => onSelectChapter(ch.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-600/15 text-amber-200 border-l-2 border-amber-500 font-medium"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-neutral-500">
                        {ch.orderIndex}.
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          ch.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : ch.status === "In Review"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-white/5 text-neutral-500"
                        }`}
                      >
                        {ch.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* THE DISTRACTION-FREE CHAPTER EDITOR */}
        <div className="flex-1 flex flex-col bg-[#121417] overflow-hidden relative">
          {activeChapter ? (
            <>
              {/* Formatting Toolbar */}
              <div
                className={`px-8 py-2.5 bg-[#14171c]/80 border-b border-white/5 flex items-center justify-between transition-opacity ${
                  isZenMode ? "opacity-20 hover:opacity-100" : ""
                }`}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => insertMarkdown("**", true)}
                    className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-amber-200"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown("*", true)}
                    className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-amber-200"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown("#")}
                    className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-amber-200"
                    title="Heading 1 (#)"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown("##")}
                    className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-amber-200"
                    title="Heading 2 (##)"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertMarkdown(">")}
                    className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-amber-200"
                    title="Blockquote (>)"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-3">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ChapterStatus)
                    }
                    className="bg-[#181b20] border border-white/10 rounded px-2.5 py-1 text-xs text-amber-200 font-medium focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete chapter "${activeChapter.title}"?`
                        )
                      ) {
                        onDeleteChapter(activeChapter.id);
                      }
                    }}
                    title="Delete Chapter"
                    className="p-1.5 text-neutral-500 hover:text-rose-400 rounded hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Distraction-Free Manuscript Area */}
              <div className="flex-1 overflow-y-auto px-6 py-12 flex justify-center">
                <div className="w-full max-w-3xl flex flex-col space-y-6">
                  {/* Chapter Title Input */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Chapter Title..."
                    className="w-full bg-transparent font-serif text-3xl md:text-4xl font-bold text-amber-100 placeholder-neutral-600 focus:outline-none border-b border-transparent focus:border-white/10 pb-2"
                  />

                  {/* Rich Text / Markdown Editor Area */}
                  <textarea
                    id="manuscript-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your story here... The veil is waiting."
                    className="w-full flex-1 min-h-[60vh] bg-transparent font-serif text-lg text-neutral-200 leading-relaxed placeholder-neutral-700 resize-none focus:outline-none scroll-pt-12"
                    style={{
                      fontFamily:
                        "'Playfair Display', 'Georgia', 'Merriweather', serif",
                      lineHeight: "1.95",
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
              <FileText className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="font-serif text-lg text-amber-200 mb-1">
                No Chapter Selected
              </p>
              <p className="text-xs max-w-sm mb-4">
                Select a chapter from the manuscript list or create a new chapter
                to begin drafting.
              </p>
              <button
                onClick={onCreateChapter}
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium"
              >
                + Create First Chapter
              </button>
            </div>
          )}
        </div>

        {/* 3. FLOATING CHARACTER DRAWER ON THE RIGHT */}
        {isDrawerOpen && (
          <aside className="w-80 bg-[#16191f] border-l border-white/5 flex flex-col h-full z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-semibold text-sm text-amber-100">
                  Character Reference Vault
                </h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-white/5">
              <input
                type="text"
                placeholder="Search characters by name or desire..."
                value={searchChar}
                onChange={(e) => setSearchChar(e.target.value)}
                className="w-full bg-[#1c2027] border border-white/10 rounded-md py-1.5 px-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filteredCharacters.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-500">
                  No characters found matching search.
                </div>
              ) : (
                filteredCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="p-3 bg-[#1b1f26] border border-white/10 rounded-lg space-y-2 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                      />
                      <div className="truncate">
                        <div className="font-serif font-medium text-xs text-amber-200 truncate">
                          {char.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono uppercase">
                          {char.role} • Age {char.age}
                        </div>
                      </div>
                    </div>

                    {char.internalDesire && (
                      <div className="text-[11px] text-neutral-300">
                        <strong className="text-amber-300 font-medium">
                          Desire:
                        </strong>{" "}
                        {char.internalDesire}
                      </div>
                    )}
                    {char.flaw && (
                      <div className="text-[11px] text-neutral-300">
                        <strong className="text-rose-300 font-medium">
                          Flaw:
                        </strong>{" "}
                        {char.flaw}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
