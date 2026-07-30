"use client";

import React, { useState } from "react";
import { Code2, Copy, Check, Terminal, FileCode, Server } from "lucide-react";

export function DjangoBlueprintModal() {
  const [activeTab, setActiveTab] = useState<
    "models" | "serializers" | "views" | "urls" | "spec"
  >("models");
  const [copied, setCopied] = useState(false);

  const codeContents: Record<string, string> = {
    models: `# LoreVault — Django ORM Relational Schema (backend/models.py)
from django.db import models
from django.core.validators import MinValueValidator
import uuid

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=128, db_index=True)
    title = models.CharField(max_length=255, db_index=True)
    genre = models.CharField(max_length=100, blank=True, default="Dark Academia / Fantasy")
    synopsis = models.TextField(blank=True, default="")
    target_word_count = models.PositiveIntegerField(default=50000, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_word_count(self):
        return sum(chapter.word_count for chapter in self.chapters.all())

class Chapter(models.Model):
    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        IN_REVIEW = "In Review", "In Review"
        COMPLETED = "Completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="chapters")
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    order_index = models.PositiveIntegerField(default=0, db_index=True)
    word_count = models.PositiveIntegerField(default=0, editable=False)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.content:
            self.word_count = len(self.content.strip().split())
        else:
            self.word_count = 0
        super().save(*args, **kwargs)

class Character(models.Model):
    class Role(models.TextChoices):
        PROTAGONIST = "Protagonist", "Protagonist"
        ANTAGONIST = "Antagonist", "Antagonist"
        SUPPORTING = "Supporting", "Supporting"
        MINOR = "Minor", "Minor"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="characters")
    name = models.CharField(max_length=255, db_index=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.SUPPORTING)
    age = models.CharField(max_length=100, blank=True, default="Unknown")
    physical_description = models.TextField(blank=True, default="")
    backstory = models.TextField(blank=True, default="")
    internal_desire = models.TextField(blank=True, default="")
    flaw = models.TextField(blank=True, default="")
    avatar_url = models.URLField(max_length=1024, blank=True, default="")

class CharacterRelationship(models.Model):
    class RelationshipType(models.TextChoices):
        RIVAL = "Rival", "Rival"
        ALLY = "Ally", "Ally"
        FAMILY = "Family", "Family"
        LOVERS = "Lovers", "Lovers"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="relationships")
    character_from = models.ForeignKey(Character, on_delete=models.CASCADE, related_name="relationships_initiated")
    character_to = models.ForeignKey(Character, on_delete=models.CASCADE, related_name="relationships_received")
    relationship_type = models.CharField(max_length=64, choices=RelationshipType.choices, default=RelationshipType.ALLY)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["character_from", "character_to"]]

class TimelineEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="timeline_events")
    chapter = models.ForeignKey(Chapter, on_delete=models.SET_NULL, null=True, blank=True, related_name="timeline_events")
    event_title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    timestamp_in_story = models.CharField(max_length=255, default="Day 1")
    sequence_order = models.PositiveIntegerField(default=1, db_index=True)
`,
    serializers: `# LoreVault — Django REST Framework Serializers (backend/serializers.py)
from rest_framework import serializers
from .models import Project, Chapter, Character, CharacterRelationship, TimelineEvent

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ["id", "project", "title", "content", "order_index", "word_count", "status", "created_at", "updated_at"]
        read_only_fields = ["word_count", "created_at", "updated_at"]

class CharacterSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = ["id", "name", "role", "avatar_url"]

class CharacterRelationshipSerializer(serializers.ModelSerializer):
    character_from_detail = CharacterSummarySerializer(source="character_from", read_only=True)
    character_to_detail = CharacterSummarySerializer(source="character_to", read_only=True)

    class Meta:
        model = CharacterRelationship
        fields = ["id", "project", "character_from", "character_to", "character_from_detail", "character_to_detail", "relationship_type", "notes"]

class CharacterSerializer(serializers.ModelSerializer):
    relationships_initiated = CharacterRelationshipSerializer(many=True, read_only=True)
    relationships_received = CharacterRelationshipSerializer(many=True, read_only=True)

    class Meta:
        model = Character
        fields = ["id", "project", "name", "role", "age", "physical_description", "backstory", "internal_desire", "flaw", "avatar_url", "relationships_initiated", "relationships_received"]

class TimelineEventSerializer(serializers.ModelSerializer):
    chapter_title = serializers.CharField(source="chapter.title", read_only=True, default=None)

    class Meta:
        model = TimelineEvent
        fields = ["id", "project", "chapter", "chapter_title", "event_title", "description", "timestamp_in_story", "sequence_order"]

class ProjectDetailSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    characters = CharacterSerializer(many=True, read_only=True)
    relationships = CharacterRelationshipSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    total_word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "user_id", "title", "genre", "synopsis", "target_word_count", "total_word_count", "chapters", "characters", "relationships", "timeline_events"]
`,
    views: `# LoreVault — Django REST Framework ViewSets (backend/views.py)
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Project, Chapter, Character, CharacterRelationship, TimelineEvent
from .serializers import ProjectDetailSerializer, ChapterSerializer, CharacterSerializer, CharacterRelationshipSerializer, TimelineEventSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related("chapters", "characters", "relationships", "timeline_events")
    serializer_class = ProjectDetailSerializer

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    @action(detail=False, methods=["post"], url_path="reorder")
    @transaction.atomic
    def reorder(self, request, *args, **kwargs):
        """
        Batch reorder order_index for project chapters.
        """
        order_list = request.data.get("order", [])
        for item in order_list:
            Chapter.objects.filter(id=item.get("id")).update(order_index=int(item.get("order_index")))
        return Response({"message": "Chapters reordered successfully."}, status=status.HTTP_200_OK)

class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer

class CharacterRelationshipViewSet(viewsets.ModelViewSet):
    queryset = CharacterRelationship.objects.all().select_related("character_from", "character_to")
    serializer_class = CharacterRelationshipSerializer

class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all().select_related("chapter")
    serializer_class = TimelineEventSerializer
`,
    urls: `# LoreVault — Django REST Framework Routing (backend/urls.py)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ProjectViewSet, ChapterViewSet, CharacterViewSet, CharacterRelationshipViewSet, TimelineEventViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")

projects_router = routers.NestedSimpleRouter(router, r"projects", lookup="project")
projects_router.register(r"chapters", ChapterViewSet, basename="project-chapters")
projects_router.register(r"characters", CharacterViewSet, basename="project-characters")
projects_router.register(r"relationships", CharacterRelationshipViewSet, basename="project-relationships")
projects_router.register(r"timeline", TimelineEventViewSet, basename="project-timeline")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/", include(projects_router.urls)),
]
`,
  };

  const handleCopy = () => {
    if (activeTab === "spec") return;
    navigator.clipboard.writeText(codeContents[activeTab] || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-mono font-semibold uppercase">
              Production Architecture
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Django 5.0 + DRF + PostgreSQL
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-amber-100 tracking-wide mt-1">
            Django Backend Blueprint & REST Specification
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Complete architectural blueprint implementation requested in Section
            1–3. Also stored directly in <code className="text-amber-300">backend/</code>.
          </p>
        </div>

        {activeTab !== "spec" && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Python Code</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        {[
          { id: "models", label: "models.py", icon: FileCode },
          { id: "serializers", label: "serializers.py", icon: FileCode },
          { id: "views", label: "views.py", icon: FileCode },
          { id: "urls", label: "urls.py", icon: FileCode },
          { id: "spec", label: "REST API Spec", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                isActive
                  ? "bg-amber-600/20 text-amber-200 border border-amber-500/40"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "spec" ? (
        <div className="bg-[#16191f] border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-serif text-lg font-semibold text-amber-100">
            DRF Endpoints Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 font-mono uppercase">
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr>
                  <td className="py-3 px-4 text-emerald-400">GET / POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/</td>
                  <td className="py-3 px-4 text-neutral-300">list / create</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    List all projects with word counts or create a new manuscript project
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400">GET / PUT / DELETE</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/</td>
                  <td className="py-3 px-4 text-neutral-300">retrieve / update / delete</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    Fetch project detail including nested chapters, characters, and relationships
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400">GET / POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/chapters/</td>
                  <td className="py-3 px-4 text-neutral-300">list / create</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    Ordered list of chapters; auto-calculating word_count on save
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-amber-400">POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/chapters/reorder/</td>
                  <td className="py-3 px-4 text-neutral-300">reorder</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    Batch update order_index values for chapters
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400">GET / POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/characters/</td>
                  <td className="py-3 px-4 text-neutral-300">list / create</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    Manage character cards with filtering by role (?role=Protagonist)
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400">GET / POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/relationships/</td>
                  <td className="py-3 px-4 text-neutral-300">list / create</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    M2M self-referential relationships between two characters
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-emerald-400">GET / POST</td>
                  <td className="py-3 px-4 text-amber-200">/api/projects/&#123;id&#125;/timeline/</td>
                  <td className="py-3 px-4 text-neutral-300">list / create</td>
                  <td className="py-3 px-4 text-neutral-400 font-sans">
                    Chronological plot events with sequence order and chapter linking
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#14171c] border border-white/10 rounded-2xl p-6 overflow-hidden shadow-xl">
          <pre className="text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-[580px] select-all">
            {codeContents[activeTab]}
          </pre>
        </div>
      )}
    </div>
  );
}
