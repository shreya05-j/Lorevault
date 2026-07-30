"use client";

import React, { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
  BookOpen,
  Plus,
  Sparkles,
  Users,
  Feather,
  GitBranch,
  Calendar,
  Loader2,
  Code2,
} from "lucide-react";
import {
  ProjectSummary,
  ProjectDetail,
  Character,
  Chapter,
  TimelineEventWithChapter,
  CharacterRelationshipWithDetails,
  ChapterStatus,
  CharacterRole,
  RelationshipType,
} from "@/types";
import { useVaultStore } from "@/store/useVaultStore";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { EditorLayout } from "@/components/EditorLayout";
import { CharacterCard } from "@/components/CharacterCard";
import { RelationshipGraph } from "@/components/RelationshipGraph";
import { Timeline } from "@/components/Timeline";
import { DjangoBlueprintModal } from "@/components/DjangoBlueprintModal";
import {
  ProjectModal,
  CharacterModal,
  ChapterModal,
  RelationshipModal,
  TimelineModal,
} from "@/components/Modals";

export default function Home() {
  const queryClient = useQueryClient();

  // Zustand State
  const activeProjectId = useVaultStore((s) => s.activeProjectId);
  const setActiveProjectId = useVaultStore((s) => s.setActiveProjectId);
  const activeView = useVaultStore((s) => s.activeView);
  const setActiveView = useVaultStore((s) => s.setActiveView);
  const selectedChapterId = useVaultStore((s) => s.selectedChapterId);
  const setSelectedChapterId = useVaultStore((s) => s.setSelectedChapterId);

  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDetail | null>(
    null
  );
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimelineEvent, setEditingTimelineEvent] =
    useState<TimelineEventWithChapter | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");

  // 1. Fetch Projects List
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
  } = useQuery<ProjectSummary[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  // Default select first project if none active
  useEffect(() => {
    if (activeProjectId === null && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId, setActiveProjectId]);

  // 2. Fetch Active Project Details
  const {
    data: activeProject = null,
    isLoading: isProjectDetailLoading,
    refetch: refetchProjectDetail,
  } = useQuery<ProjectDetail | null>({
    queryKey: ["project", activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const res = await fetch(`/api/projects/${activeProjectId}`);
      if (!res.ok) throw new Error("Failed to load project detail");
      return res.json();
    },
    enabled: !!activeProjectId,
  });

  // Default select first chapter when switching projects
  useEffect(() => {
    if (
      activeProject &&
      activeProject.chapters.length > 0 &&
      !selectedChapterId
    ) {
      setSelectedChapterId(activeProject.chapters[0].id);
    }
  }, [activeProject, selectedChapterId, setSelectedChapterId]);

  // 3. MUTATIONS
  // Create / Edit Project
  const saveProjectMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      genre: string;
      synopsis: string;
      targetWordCount: number;
    }) => {
      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return res.json();
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const newProj = await res.json();
        setActiveProjectId(newProj.id);
        return newProj;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
      setEditingProject(null);
    },
  });

  // Seed Sample Project ("The Obsidian Crown")
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (data.projectId) {
        setActiveProjectId(data.projectId);
      }
      refetchProjects();
    },
  });

  // Create Chapter
  const createChapterMutation = useMutation({
    mutationFn: async (data: { title: string; status: ChapterStatus }) => {
      if (!activeProjectId) return;
      const res = await fetch(`/api/projects/${activeProjectId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newCh = await res.json();
      setSelectedChapterId(newCh.id);
      return newCh;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  // Save Chapter content & status
  const saveChapterMutation = useMutation({
    mutationFn: async (params: {
      id: number;
      data: { title?: string; content?: string; status?: ChapterStatus };
    }) => {
      if (!activeProjectId) return;
      const res = await fetch(
        `/api/projects/${activeProjectId}/chapters/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params.data),
        }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  // Delete Chapter
  const deleteChapterMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeProjectId) return;
      await fetch(`/api/projects/${activeProjectId}/chapters/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  // Save Character
  const saveCharacterMutation = useMutation({
    mutationFn: async (data: Partial<Character>) => {
      if (!activeProjectId) return;
      if (editingCharacter) {
        const res = await fetch(
          `/api/projects/${activeProjectId}/characters/${editingCharacter.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        return res.json();
      } else {
        const res = await fetch(`/api/projects/${activeProjectId}/characters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
      setEditingCharacter(null);
    },
  });

  // Delete Character
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeProjectId) return;
      await fetch(`/api/projects/${activeProjectId}/characters/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  // Create Relationship
  const createRelationshipMutation = useMutation({
    mutationFn: async (data: {
      characterFromId: number;
      characterToId: number;
      relationshipType: RelationshipType;
      notes: string;
    }) => {
      if (!activeProjectId) return;
      const res = await fetch(
        `/api/projects/${activeProjectId}/relationships`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  // Delete Relationship
  const deleteRelationshipMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeProjectId) return;
      await fetch(`/api/projects/${activeProjectId}/relationships/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  // Save Timeline Event
  const saveTimelineMutation = useMutation({
    mutationFn: async (data: {
      eventTitle: string;
      description: string;
      timestampInStory: string;
      chapterId: number | null;
    }) => {
      if (!activeProjectId) return;
      if (editingTimelineEvent) {
        const res = await fetch(
          `/api/projects/${activeProjectId}/timeline/${editingTimelineEvent.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        return res.json();
      } else {
        const res = await fetch(`/api/projects/${activeProjectId}/timeline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
      setEditingTimelineEvent(null);
    },
  });

  // Delete Timeline Event
  const deleteTimelineMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeProjectId) return;
      await fetch(`/api/projects/${activeProjectId}/timeline/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  // Reorder Timeline Events
  const handleReorderTimeline = async (id: number, direction: "up" | "down") => {
    if (!activeProject) return;
    const events = [...activeProject.timelineEvents];
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= events.length) return;

    const currentSeq = events[idx].sequenceOrder;
    const swapSeq = events[swapIdx].sequenceOrder;

    await fetch(`/api/projects/${activeProject.id}/timeline/${events[idx].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequenceOrder: swapSeq }),
    });

    await fetch(
      `/api/projects/${activeProject.id}/timeline/${events[swapIdx].id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequenceOrder: currentSeq }),
      }
    );

    queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
  };

  const handleExportDocx = async () => {
    if (!activeProject) return;
    
    const sortedChapters = [...(activeProject.chapters || [])].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    const children: any[] = [];
    
    children.push(
      new Paragraph({
        text: activeProject.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      })
    );

    for (const chapter of sortedChapters) {
      children.push(
        new Paragraph({
          text: chapter.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const content = chapter.content || "";
      const paragraphs = content.split('\n');
      for (const p of paragraphs) {
        if (p.trim()) {
          children.push(
            new Paragraph({
              children: [new TextRun(p.trim())],
              spacing: { after: 120 },
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${activeProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
  };

  // Filtered characters for Character Vault Page
  const filteredCharacters = activeProject
    ? roleFilter
      ? activeProject.characters.filter((c) => c.role === roleFilter)
      : activeProject.characters
    : [];

  return (
    <div className="flex h-screen bg-[#121417] overflow-hidden text-neutral-100">
      {/* LEFT SIDEBAR NAV */}
      <Sidebar
        projects={projects}
        activeProject={
          activeProject
            ? {
                ...activeProject,
                chapterCount: activeProject.chapters.length,
                characterCount: activeProject.characters.length,
              }
            : null
        }
        onNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onSeedDemo={() => seedMutation.mutate()}
        isSeeding={seedMutation.isPending}
      />

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {isProjectsLoading || isProjectDetailLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="font-serif text-sm">Opening LoreVault Studio...</p>
          </div>
        ) : (
          <>
            {activeView === "dashboard" && (
              <Dashboard
                project={activeProject}
                onNavigateView={(view) => setActiveView(view)}
                onEditProject={() => {
                  setEditingProject(activeProject);
                  setIsProjectModalOpen(true);
                }}
                onNewChapter={() => setIsChapterModalOpen(true)}
                onNewCharacter={() => {
                  setEditingCharacter(null);
                  setIsCharacterModalOpen(true);
                }}
                onSeedDemo={() => seedMutation.mutate()}
                isSeeding={seedMutation.isPending}
              />
            )}

            {activeView === "manuscripts" && (
              <EditorLayout
                chapters={activeProject?.chapters || []}
                characters={activeProject?.characters || []}
                activeChapterId={selectedChapterId}
                onSelectChapter={(id) => setSelectedChapterId(id)}
                onSaveChapter={async (id, data) => {
                  await saveChapterMutation.mutateAsync({ id, data });
                }}
                onCreateChapter={() => setIsChapterModalOpen(true)}
                onDeleteChapter={(id) => deleteChapterMutation.mutate(id)}
                projectWordCount={activeProject?.totalWordCount || 0}
                projectTargetWordCount={activeProject?.targetWordCount || 50000}
                onExportDocx={handleExportDocx}
              />
            )}

            {activeView === "characters" && (
              <div className="p-8 max-w-6xl mx-auto space-y-8 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-amber-100 tracking-wide">
                      Character Vault
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Aesthetic profiles for protagonists, antagonists, and
                      supporting figures. Filter by role or expand for flaws &
                      backstory.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Filter Pills */}
                    <div className="flex items-center gap-1 bg-[#181b20] border border-white/10 rounded-lg p-1">
                      {[
                        { label: "All", value: "" },
                        { label: "Protagonist", value: "Protagonist" },
                        { label: "Antagonist", value: "Antagonist" },
                        { label: "Supporting", value: "Supporting" },
                        { label: "Minor", value: "Minor" },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setRoleFilter(tab.value)}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            roleFilter === tab.value
                              ? "bg-amber-600/30 text-amber-200 font-medium border border-amber-500/30"
                              : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setEditingCharacter(null);
                        setIsCharacterModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 rounded-lg text-xs font-semibold shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Character</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Character Profile Cards */}
                {filteredCharacters.length === 0 ? (
                  <div className="text-center py-16 bg-[#16191f] border border-white/10 rounded-2xl p-8">
                    <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <h3 className="font-serif text-lg text-amber-200 mb-1">
                      No Characters Found
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                      Create your first character profile to define desires,
                      fatal flaws, and physical appearance.
                    </p>
                    <button
                      onClick={() => {
                        setEditingCharacter(null);
                        setIsCharacterModalOpen(true);
                      }}
                      className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium"
                    >
                      + Create First Character
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCharacters.map((char) => (
                      <CharacterCard
                        key={char.id}
                        character={char}
                        onEdit={(c) => {
                          setEditingCharacter(c);
                          setIsCharacterModalOpen(true);
                        }}
                        onDelete={(id) => deleteCharacterMutation.mutate(id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === "relationships" && (
              <RelationshipGraph
                characters={activeProject?.characters || []}
                relationships={activeProject?.relationships || []}
                onAddRelationship={() => setIsRelationshipModalOpen(true)}
                onDeleteRelationship={(id) =>
                  deleteRelationshipMutation.mutate(id)
                }
              />
            )}

            {activeView === "timeline" && (
              <Timeline
                events={activeProject?.timelineEvents || []}
                chapters={activeProject?.chapters || []}
                onAddEvent={() => {
                  setEditingTimelineEvent(null);
                  setIsTimelineModalOpen(true);
                }}
                onEditEvent={(ev) => {
                  setEditingTimelineEvent(ev);
                  setIsTimelineModalOpen(true);
                }}
                onDeleteEvent={(id) => deleteTimelineMutation.mutate(id)}
                onReorder={(id, direction) =>
                  handleReorderTimeline(id, direction)
                }
              />
            )}

            {activeView === "django-blueprint" && <DjangoBlueprintModal />}
          </>
        )}
      </main>

      {/* ALL INTERACTIVE MODALS */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={async (data) => {
          await saveProjectMutation.mutateAsync(data);
        }}
        initialData={editingProject}
      />

      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false);
          setEditingCharacter(null);
        }}
        onSave={async (data) => {
          await saveCharacterMutation.mutateAsync(data);
        }}
        initialData={editingCharacter}
      />

      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        onSave={async (data) => {
          await createChapterMutation.mutateAsync(data);
        }}
      />

      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        onSave={async (data) => {
          await createRelationshipMutation.mutateAsync(data);
        }}
        characters={activeProject?.characters || []}
      />

      <TimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false);
          setEditingTimelineEvent(null);
        }}
        onSave={async (data) => {
          await saveTimelineMutation.mutateAsync(data);
        }}
        chapters={activeProject?.chapters || []}
        initialData={editingTimelineEvent}
      />
    </div>
  );
}
