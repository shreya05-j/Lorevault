import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// 1. PROJECTS (Books / Anthologies)
// ============================================================================
export const projectsTable = pgTable(
  "lorevault_projects",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull().default("default-user"),
    title: varchar("title", { length: 255 }).notNull(),
    genre: varchar("genre", { length: 100 }).notNull().default("Dark Academia / Fantasy"),
    synopsis: text("synopsis").notNull().default(""),
    targetWordCount: integer("target_word_count").notNull().default(50000),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("projects_user_id_idx").on(table.userId)]
);

// ============================================================================
// 2. CHAPTERS
// ============================================================================
export const chaptersTable = pgTable(
  "lorevault_chapters",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull().default(""),
    orderIndex: integer("order_index").notNull().default(0),
    wordCount: integer("word_count").notNull().default(0),
    status: varchar("status", { length: 32 }).notNull().default("Draft"), // 'Draft' | 'In Review' | 'Completed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("chapters_project_id_idx").on(table.projectId),
    index("chapters_order_index_idx").on(table.orderIndex),
  ]
);

// ============================================================================
// 3. CHARACTERS
// ============================================================================
export const charactersTable = pgTable(
  "lorevault_characters",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().default("Supporting"), // 'Protagonist' | 'Antagonist' | 'Supporting' | 'Minor'
    age: varchar("age", { length: 100 }).notNull().default("Unknown"),
    physicalDescription: text("physical_description").notNull().default(""),
    backstory: text("backstory").notNull().default(""),
    internalDesire: text("internal_desire").notNull().default(""),
    flaw: text("flaw").notNull().default(""),
    avatarUrl: varchar("avatar_url", { length: 1024 }).notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("characters_project_id_idx").on(table.projectId),
    index("characters_role_idx").on(table.role),
  ]
);

// ============================================================================
// 4. CHARACTER RELATIONSHIPS (M2M Self-Referential)
// ============================================================================
export const characterRelationshipsTable = pgTable(
  "lorevault_character_relationships",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    characterFromId: integer("character_from_id")
      .notNull()
      .references(() => charactersTable.id, { onDelete: "cascade" }),
    characterToId: integer("character_to_id")
      .notNull()
      .references(() => charactersTable.id, { onDelete: "cascade" }),
    relationshipType: varchar("relationship_type", { length: 64 })
      .notNull()
      .default("Ally"), // 'Rival' | 'Ally' | 'Family' | 'Lovers'
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("relationships_project_id_idx").on(table.projectId),
    index("relationships_from_idx").on(table.characterFromId),
    index("relationships_to_idx").on(table.characterToId),
  ]
);

// ============================================================================
// 5. PLOTLINE TIMELINE EVENTS
// ============================================================================
export const timelineEventsTable = pgTable(
  "lorevault_timeline_events",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    chapterId: integer("chapter_id").references(() => chaptersTable.id, {
      onDelete: "set null",
    }),
    eventTitle: varchar("event_title", { length: 255 }).notNull(),
    description: text("description").notNull().default(""),
    timestampInStory: varchar("timestamp_in_story", { length: 255 })
      .notNull()
      .default("Day 1"),
    sequenceOrder: integer("sequence_order").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("timeline_project_id_idx").on(table.projectId),
    index("timeline_sequence_order_idx").on(table.sequenceOrder),
  ]
);

// ============================================================================
// RELATIONS DEFINITIONS (for Drizzle ORM queries)
// ============================================================================
export const projectsRelations = relations(projectsTable, ({ many }) => ({
  chapters: many(chaptersTable),
  characters: many(charactersTable),
  relationships: many(characterRelationshipsTable),
  timelineEvents: many(timelineEventsTable),
}));

export const chaptersRelations = relations(chaptersTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [chaptersTable.projectId],
    references: [projectsTable.id],
  }),
  timelineEvents: many(timelineEventsTable),
}));

export const charactersRelations = relations(charactersTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [charactersTable.projectId],
    references: [projectsTable.id],
  }),
  relationshipsInitiated: many(characterRelationshipsTable, {
    relationName: "characterFrom",
  }),
  relationshipsReceived: many(characterRelationshipsTable, {
    relationName: "characterTo",
  }),
}));

export const characterRelationshipsRelations = relations(
  characterRelationshipsTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [characterRelationshipsTable.projectId],
      references: [projectsTable.id],
    }),
    characterFrom: one(charactersTable, {
      fields: [characterRelationshipsTable.characterFromId],
      references: [charactersTable.id],
      relationName: "characterFrom",
    }),
    characterTo: one(charactersTable, {
      fields: [characterRelationshipsTable.characterToId],
      references: [charactersTable.id],
      relationName: "characterTo",
    }),
  })
);

export const timelineEventsRelations = relations(
  timelineEventsTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [timelineEventsTable.projectId],
      references: [projectsTable.id],
    }),
    chapter: one(chaptersTable, {
      fields: [timelineEventsTable.chapterId],
      references: [chaptersTable.id],
    }),
  })
);
