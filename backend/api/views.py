"""
LoreVault Django REST Framework ViewSets
========================================
Implements REST API endpoints for LoreVault:
- /api/projects/
- /api/projects/{id}/
- /api/projects/{id}/chapters/ (+ reordering action)
- /api/projects/{id}/characters/
- /api/projects/{id}/relationships/
- /api/projects/{id}/timeline/
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import (
    Project,
    Chapter,
    Character,
    CharacterRelationship,
    TimelineEvent,
)
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ChapterSerializer,
    CharacterSerializer,
    CharacterRelationshipSerializer,
    TimelineEventSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Projects (Books/Anthologies).
    Endpoints:
    - GET /api/projects/ : List all projects
    - POST /api/projects/ : Create a new project
    - GET /api/projects/{id}/ : Get detail view with chapters, characters, timeline
    - PUT /PATCH /api/projects/{id}/ : Update project metadata
    - DELETE /api/projects/{id}/ : Delete project and cascade all contents
    """
    queryset = Project.objects.all().prefetch_related(
        "chapters", "characters", "relationships", "timeline_events"
    )
    permission_classes = [permissions.AllowAny]  # Adjust for JWT/Token auth in production

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        return ProjectDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    @action(detail=False, methods=["post"])
    def seed(self, request):
        if Project.objects.filter(title="The Obsidian Crown: A Tale of Aether & Ink").exists():
            proj = Project.objects.filter(title="The Obsidian Crown: A Tale of Aether & Ink").first()
            return Response({"message": "Sample project already exists.", "projectId": proj.id})
        
        with transaction.atomic():
            project = Project.objects.create(
                title="The Obsidian Crown: A Tale of Aether & Ink",
                genre="Dark Academia / Gothic Fantasy",
                synopsis="In the candlelit library vaults of the Scholomance of Oakhaven, five scholar-magi uncover a forbidden ledger...",
                target_word_count=80000,
            )
            
            ch1_content = "# Chapter I: The Ash-Stained Codex\n\nThe smell of beeswax..."
            ch2_content = "# Chapter II: Whispers in the Scriptorium\n\nThe rain beat a relentless rhythm..."
            ch3_content = "# Chapter III: Blood on the Astral Quadrant\n\nMidnight brought no silence to Oakhaven..."
            ch4_content = "# Chapter IV: The Alchemist's Ultimatum\n\n\"There is no neutrality in the pursuit of truth\"..."

            ch1 = Chapter.objects.create(project=project, title="The Ash-Stained Codex", content=ch1_content, order_index=1, status="Completed")
            ch2 = Chapter.objects.create(project=project, title="Whispers in the Scriptorium", content=ch2_content, order_index=2, status="In Review")
            ch3 = Chapter.objects.create(project=project, title="Blood on the Astral Quadrant", content=ch3_content, order_index=3, status="Draft")
            ch4 = Chapter.objects.create(project=project, title="The Alchemist's Ultimatum", content=ch4_content, order_index=4, status="Draft")

            c1 = Character.objects.create(project=project, name="Lysandra Vance", role="Protagonist", age="23", physical_description="Tall and slender...", backstory="Daughter of a disgraced High Syntactician...", internal_desire="To decipher the Lost Tenth Phoneme...", flaw="Intellectual hubris...", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80")
            c2 = Character.objects.create(project=project, name="Archivist Kaelen Thorne", role="Antagonist", age="42", physical_description="Imposing stature...", backstory="Appointed Keeper...", internal_desire="To seal the Oakhaven Scriptorium...", flaw="Paranoia...", avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80")
            c3 = Character.objects.create(project=project, name="Julian Aurelius", role="Supporting", age="25", physical_description="Aristocratic jawline...", backstory="Younger son...", internal_desire="To escape his father's shadow...", flaw="Reckless impulsivity...", avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80")
            c4 = Character.objects.create(project=project, name="Seraphina Grey", role="Supporting", age="22", physical_description="Quiet demeanor...", backstory="Raised in the botanical gardens...", internal_desire="To cultivate the Lunar Nightshade...", flaw="Extreme secrecy...", avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80")
            c5 = Character.objects.create(project=project, name="Master Vane", role="Minor", age="68", physical_description="Frail and stooped...", backstory="The retired Chancellor...", internal_desire="To die with a quiet conscience...", flaw="Cowardice...", avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80")

            CharacterRelationship.objects.create(project=project, character_from=c1, character_to=c3, relationship_type="Lovers", notes="Secret nocturnal rendezvous...")
            CharacterRelationship.objects.create(project=project, character_from=c1, character_to=c2, relationship_type="Rival", notes="Thorne suspects Lysandra...")
            CharacterRelationship.objects.create(project=project, character_from=c3, character_to=c4, relationship_type="Ally", notes="Seraphina supplies rare alchemical reagents...")
            
            TimelineEvent.objects.create(project=project, chapter=ch1, event_title="The Autumn Equinox Matriculation", timestamp_in_story="Year 142 of the Eclipse, Autumn - Day 1", sequence_order=1)
            TimelineEvent.objects.create(project=project, chapter=ch1, event_title="Discovery of the Black Codex in Vault IV", timestamp_in_story="Year 142 of the Eclipse, Autumn - Day 3 (Midnight)", sequence_order=2)
            TimelineEvent.objects.create(project=project, chapter=ch2, event_title="The Alchemical Explosion in the South Wing", timestamp_in_story="Year 142 of the Eclipse, Autumn - Day 7", sequence_order=3)

        return Response({"message": "Sample project seeded successfully!", "projectId": project.id})


class NestedProjectViewSet(viewsets.ModelViewSet):
    """
    Base viewset for nested resources under /api/projects/{project_pk}/...
    Ensures that all created or queried objects belong to the given project.
    """
    permission_classes = [permissions.AllowAny]

    def get_project(self):
        project_pk = self.kwargs.get("project_pk")
        return get_object_or_404(Project, pk=project_pk)

    def get_queryset(self):
        return super().get_queryset().filter(project=self.get_project())

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


class ChapterViewSet(NestedProjectViewSet):
    """
    Endpoints:
    - GET /api/projects/{project_pk}/chapters/
    - POST /api/projects/{project_pk}/chapters/
    - GET/PUT/DELETE /api/projects/{project_pk}/chapters/{id}/
    - POST /api/projects/{project_pk}/chapters/reorder/ : Bulk reorder order_index
    """
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        order_index = serializer.validated_data.get("order_index", 0)
        if not order_index:
            last = Chapter.objects.filter(project=project).order_by("-order_index").first()
            order_index = (last.order_index + 1) if last else 1
        serializer.save(project=project, order_index=order_index)

    @action(detail=False, methods=["post"], url_path="reorder")
    @transaction.atomic
    def reorder(self, request, *args, **kwargs):
        """
        Reorder chapters for a project.
        Payload example: {"order": [{"id": "<uuid>", "order_index": 1}, ...]}
        """
        project = self.get_project()
        order_list = request.data.get("order", [])
        if not isinstance(order_list, list):
            return Response(
                {"detail": "Expected an 'order' array of {id, order_index} objects."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_ids = []
        for item in order_list:
            chapter_id = item.get("id")
            order_index = item.get("order_index")
            if chapter_id is None or order_index is None:
                continue
            Chapter.objects.filter(project=project, id=chapter_id).update(
                order_index=int(order_index)
            )
            updated_ids.append(chapter_id)

        chapters = Chapter.objects.filter(project=project).order_by("order_index")
        serializer = self.get_serializer(chapters, many=True)
        return Response(
            {"message": "Chapters reordered successfully.", "chapters": serializer.data},
            status=status.HTTP_200_OK,
        )


class CharacterViewSet(NestedProjectViewSet):
    """
    Endpoints:
    - GET /api/projects/{project_pk}/characters/
    - POST /api/projects/{project_pk}/characters/
    - GET/PUT/DELETE /api/projects/{project_pk}/characters/{id}/
    """
    queryset = Character.objects.all().prefetch_related(
        "relationships_initiated", "relationships_received"
    )
    serializer_class = CharacterSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class CharacterRelationshipViewSet(NestedProjectViewSet):
    """
    Endpoints:
    - GET /api/projects/{project_pk}/relationships/
    - POST /api/projects/{project_pk}/relationships/
    - GET/PUT/DELETE /api/projects/{project_pk}/relationships/{id}/
    """
    queryset = CharacterRelationship.objects.all().select_related(
        "character_from", "character_to"
    )
    serializer_class = CharacterRelationshipSerializer


class TimelineEventViewSet(NestedProjectViewSet):
    """
    Endpoints:
    - GET /api/projects/{project_pk}/timeline/
    - POST /api/projects/{project_pk}/timeline/
    - GET/PUT/DELETE /api/projects/{project_pk}/timeline/{id}/
    """
    queryset = TimelineEvent.objects.all().select_related("chapter")
    serializer_class = TimelineEventSerializer

    def perform_create(self, serializer):
        project = self.get_project()
        sequence_order = serializer.validated_data.get("sequence_order", 0)
        if not sequence_order:
            last = TimelineEvent.objects.filter(project=project).order_by("-sequence_order").first()
            sequence_order = (last.sequence_order + 1) if last else 1
        serializer.save(project=project, sequence_order=sequence_order)
