"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  User,
  GitBranch,
  Calendar,
  Sparkles,
  Feather,
} from "lucide-react";
import {
  Project,
  Character,
  Chapter,
  TimelineEventWithChapter,
  CharacterRole,
  RelationshipType,
  ChapterStatus,
} from "@/types";

// ============================================================================
// 1. PROJECT MODAL
// ============================================================================
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    genre: string;
    synopsis: string;
    targetWordCount: number;
  }) => Promise<void>;
  initialData?: Project | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Dark Academia / Fantasy");
  const [synopsis, setSynopsis] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setGenre(initialData.genre);
      setSynopsis(initialData.synopsis);
      setTargetWordCount(initialData.targetWordCount);
    } else {
      setTitle("");
      setGenre("Dark Academia / Fantasy");
      setSynopsis("");
      setTargetWordCount(50000);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ title, genre, synopsis, targetWordCount });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181b20] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-semibold text-amber-100">
              {initialData ? "Edit Project Blueprint" : "Create New Manuscript Project"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Manuscript Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Obsidian Crown"
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Genre / Tone
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Dark Academia / Gothic Fantasy"
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Target Word Count Goal
              </label>
              <input
                type="number"
                min={1000}
                step={5000}
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Synopsis & Elevator Pitch
            </label>
            <textarea
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Summarize the core conflict, setting, and stakes..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CHARACTER MODAL
// ============================================================================
interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Character>) => Promise<void>;
  initialData?: Character | null;
}

export function CharacterModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CharacterModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<CharacterRole>("Supporting");
  const [age, setAge] = useState("24");
  const [physicalDescription, setPhysicalDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [internalDesire, setInternalDesire] = useState("");
  const [flaw, setFlaw] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setAge(initialData.age || "");
      setPhysicalDescription(initialData.physicalDescription || "");
      setBackstory(initialData.backstory || "");
      setInternalDesire(initialData.internalDesire || "");
      setFlaw(initialData.flaw || "");
      setAvatarUrl(initialData.avatarUrl || "");
    } else {
      setName("");
      setRole("Supporting");
      setAge("Unknown");
      setPhysicalDescription("");
      setBackstory("");
      setInternalDesire("");
      setFlaw("");
      setAvatarUrl(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
      );
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        role,
        age,
        physicalDescription,
        backstory,
        internalDesire,
        flaw,
        avatarUrl,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181b20] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-semibold text-amber-100">
              {initialData ? "Edit Character Profile" : "Create Character Profile"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Character Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lysandra Vance"
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Story Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CharacterRole)}
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
              >
                <option value="Protagonist">Protagonist</option>
                <option value="Antagonist">Antagonist</option>
                <option value="Supporting">Supporting</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Age / Chronological Status
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 23 or Ageless (340)"
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Portrait / Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Internal Desire / Core Motivation
            </label>
            <input
              type="text"
              value={internalDesire}
              onChange={(e) => setInternalDesire(e.target.value)}
              placeholder="What does they want more than anything?"
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Fatal Flaw / Vulnerability
            </label>
            <input
              type="text"
              value={flaw}
              onChange={(e) => setFlaw(e.target.value)}
              placeholder="Hubris, paranoia, impulsive obsession..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Physical Appearance
            </label>
            <textarea
              rows={2}
              value={physicalDescription}
              onChange={(e) => setPhysicalDescription(e.target.value)}
              placeholder="Ink-stained fingers, piercing hazel eyes behind brass spectacles..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Backstory & Secrets
            </label>
            <textarea
              rows={3}
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Deep lore, family origin, and hidden secrets..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Character"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CHAPTER MODAL
// ============================================================================
interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; status: ChapterStatus }) => Promise<void>;
}

export function ChapterModal({ isOpen, onClose, onSave }: ChapterModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ChapterStatus>("Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setStatus("Draft");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ title, status });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181b20] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-semibold text-amber-100">
              Create New Chapter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Chapter Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter V: The Alchemical Veil"
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ChapterStatus)}
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
            >
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 4. RELATIONSHIP MODAL
// ============================================================================
interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    characterFromId: number;
    characterToId: number;
    relationshipType: RelationshipType;
    notes: string;
  }) => Promise<void>;
  characters: Character[];
}

export function RelationshipModal({
  isOpen,
  onClose,
  onSave,
  characters,
}: RelationshipModalProps) {
  const [characterFromId, setCharacterFromId] = useState<number>(
    characters[0]?.id || 0
  );
  const [characterToId, setCharacterToId] = useState<number>(
    characters[1]?.id || characters[0]?.id || 0
  );
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>("Ally");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCharacterFromId(characters[0]?.id || 0);
      setCharacterToId(characters[1]?.id || characters[0]?.id || 0);
      setRelationshipType("Ally");
      setNotes("");
    }
  }, [isOpen, characters]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterFromId || !characterToId || characterFromId === characterToId)
      return;
    setIsSubmitting(true);
    try {
      await onSave({
        characterFromId,
        characterToId,
        relationshipType,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181b20] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-semibold text-amber-100">
              Define Character Relationship (M2M)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                From Character *
              </label>
              <select
                value={characterFromId}
                onChange={(e) => setCharacterFromId(Number(e.target.value))}
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
              >
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                To Character *
              </label>
              <select
                value={characterToId}
                onChange={(e) => setCharacterToId(Number(e.target.value))}
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
              >
                {characters.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    disabled={c.id === characterFromId}
                  >
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Relationship Dynamic
            </label>
            <select
              value={relationshipType}
              onChange={(e) =>
                setRelationshipType(e.target.value as RelationshipType)
              }
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
            >
              <option value="Rival">Rival (Conflict / Antagonism)</option>
              <option value="Ally">Ally (Shared Trust / Cooperation)</option>
              <option value="Family">Family (Kinship / Blood Oath)</option>
              <option value="Lovers">Lovers (Romance / Devotion)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Relationship Notes & Lore
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Secret rendezvous in the Nocturnal Glasshouse; old betrayal..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || characterFromId === characterToId}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Connection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TIMELINE EVENT MODAL
// ============================================================================
interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    eventTitle: string;
    description: string;
    timestampInStory: string;
    chapterId: number | null;
  }) => Promise<void>;
  chapters: Chapter[];
  initialData?: TimelineEventWithChapter | null;
}

export function TimelineModal({
  isOpen,
  onClose,
  onSave,
  chapters,
  initialData,
}: TimelineModalProps) {
  const [eventTitle, setEventTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timestampInStory, setTimestampInStory] = useState("Day 1");
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setEventTitle(initialData.eventTitle);
      setDescription(initialData.description || "");
      setTimestampInStory(initialData.timestampInStory || "Day 1");
      setChapterId(initialData.chapterId || null);
    } else {
      setEventTitle("");
      setDescription("");
      setTimestampInStory("Year 142 of the Eclipse, Autumn");
      setChapterId(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        eventTitle,
        description,
        timestampInStory,
        chapterId,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181b20] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-semibold text-amber-100">
              {initialData ? "Edit Plot Event" : "Create Timeline Event"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Event Title / Plot Beat *
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Discovery of the Black Codex in Vault IV"
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                In-Story Date / Timestamp
              </label>
              <input
                type="text"
                value={timestampInStory}
                onChange={(e) => setTimestampInStory(e.target.value)}
                placeholder="Year 142 of the Eclipse, Autumn - Day 3"
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Linked Chapter (Optional FK)
              </label>
              <select
                value={chapterId || ""}
                onChange={(e) =>
                  setChapterId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
              >
                <option value="">No chapter link</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Ch. {ch.orderIndex}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Event Description & Historical Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happens during this scene or historical moment..."
              className="w-full bg-[#13161a] border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
