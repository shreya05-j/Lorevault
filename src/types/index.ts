// ============================================================================
// LOREVAULT CORE TYPES & INTERFACES
// ============================================================================

export type ChapterStatus = "Draft" | "In Review" | "Completed";

export type CharacterRole = "Protagonist" | "Antagonist" | "Supporting" | "Minor";

export type RelationshipType = "Rival" | "Ally" | "Family" | "Lovers";

// ============================================================================
// 1. PROJECT (Book / Anthology)
// ============================================================================
export interface Project {
  id: number;
  userId: string;
  title: string;
  genre: string;
  synopsis: string;
  targetWordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends Project {
  chapterCount: number;
  characterCount: number;
  totalWordCount: number;
}

export interface ProjectDetail extends Project {
  totalWordCount: number;
  chapters: Chapter[];
  characters: Character[];
  relationships: CharacterRelationshipWithDetails[];
  timelineEvents: TimelineEventWithChapter[];
}

export interface NewProjectPayload {
  title: string;
  genre?: string;
  synopsis?: string;
  targetWordCount?: number;
}

// ============================================================================
// 2. CHAPTER
// ============================================================================
export interface Chapter {
  id: number;
  projectId: number;
  title: string;
  content: string;
  orderIndex: number;
  wordCount: number;
  status: ChapterStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewChapterPayload {
  title: string;
  content?: string;
  orderIndex?: number;
  status?: ChapterStatus;
}

export interface ReorderChaptersItem {
  id: number;
  orderIndex: number;
}

// ============================================================================
// 3. CHARACTER
// ============================================================================
export interface Character {
  id: number;
  projectId: number;
  name: string;
  role: CharacterRole;
  age: string;
  physicalDescription: string;
  backstory: string;
  internalDesire: string;
  flaw: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterSummary {
  id: number;
  name: string;
  role: CharacterRole;
  avatarUrl: string;
}

export interface NewCharacterPayload {
  name: string;
  role?: CharacterRole;
  age?: string;
  physicalDescription?: string;
  backstory?: string;
  internalDesire?: string;
  flaw?: string;
  avatarUrl?: string;
}

// ============================================================================
// 4. CHARACTER RELATIONSHIP (M2M Self-Referential)
// ============================================================================
export interface CharacterRelationship {
  id: number;
  projectId: number;
  characterFromId: number;
  characterToId: number;
  relationshipType: RelationshipType;
  notes: string;
  createdAt: string;
}

export interface CharacterRelationshipWithDetails extends CharacterRelationship {
  characterFrom: CharacterSummary;
  characterTo: CharacterSummary;
}

export interface NewCharacterRelationshipPayload {
  characterFromId: number;
  characterToId: number;
  relationshipType: RelationshipType;
  notes?: string;
}

// ============================================================================
// 5. PLOTLINE TIMELINE EVENT
// ============================================================================
export interface TimelineEvent {
  id: number;
  projectId: number;
  chapterId: number | null;
  eventTitle: string;
  description: string;
  timestampInStory: string;
  sequenceOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEventWithChapter extends TimelineEvent {
  chapterTitle?: string | null;
}

export interface NewTimelineEventPayload {
  chapterId?: number | null;
  eventTitle: string;
  description?: string;
  timestampInStory?: string;
  sequenceOrder?: number;
}

// ============================================================================
// 6. UI NAVIGATION & STATE
// ============================================================================
export type ActiveView =
  | "dashboard"
  | "manuscripts"
  | "characters"
  | "relationships"
  | "timeline"
  | "django-blueprint";
