"""
LoreVault Django ORM Models
===========================
Complete Relational Schema for the LoreVault Storyteller Application.
Built with Django ORM for PostgreSQL with full foreign key cascades,
indexing, and custom ordering methods.
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid


class Project(models.Model):
    """
    Represents a novel, anthology, or storytelling project.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=128, db_index=True, help_text="Owner User ID", default="default-user")
    title = models.CharField(max_length=255, db_index=True)
    genre = models.CharField(max_length=100, blank=True, default="Dark Academia / Fantasy")
    synopsis = models.TextField(blank=True, default="")
    target_word_count = models.PositiveIntegerField(
        default=50000,
        validators=[MinValueValidator(1)],
        help_text="Target word count goal for the project"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lorevault_projects"
        ordering = ["-updated_at"]
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")

    def __str__(self):
        return f"{self.title} ({self.genre})"

    @property
    def total_word_count(self):
        return sum(chapter.word_count for chapter in self.chapters.all())


class Chapter(models.Model):
    """
    Represents a single chapter or manuscript division within a project.
    """
    class Status(models.TextChoices):
        DRAFT = "Draft", _("Draft")
        IN_REVIEW = "In Review", _("In Review")
        COMPLETED = "Completed", _("Completed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="chapters",
        db_index=True
    )
    title = models.CharField(max_length=255)
    content = models.TextField(
        blank=True,
        default="",
        help_text="Rich text or Markdown manuscript body"
    )
    order_index = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Sequential ordering index within the project"
    )
    word_count = models.PositiveIntegerField(default=0, editable=False)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lorevault_chapters"
        ordering = ["project", "order_index", "created_at"]
        unique_together = [["project", "order_index"]]
        verbose_name = _("Chapter")
        verbose_name_plural = _("Chapters")

    def __str__(self):
        return f"Ch. {self.order_index}: {self.title}"

    def save(self, *args, **kwargs):
        # Automatically calculate word count from content content
        if self.content:
            words = self.content.strip().split()
            self.word_count = len(words)
        else:
            self.word_count = 0
        super().save(*args, **kwargs)


class Character(models.Model):
    """
    Represents a character profile belonging to a story project.
    """
    class Role(models.TextChoices):
        PROTAGONIST = "Protagonist", _("Protagonist")
        ANTAGONIST = "Antagonist", _("Antagonist")
        SUPPORTING = "Supporting", _("Supporting")
        MINOR = "Minor", _("Minor")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="characters",
        db_index=True
    )
    name = models.CharField(max_length=255, db_index=True)
    role = models.CharField(
        max_length=32,
        choices=Role.choices,
        default=Role.SUPPORTING,
        db_index=True
    )
    age = models.CharField(max_length=100, blank=True, default="Unknown")
    physical_description = models.TextField(blank=True, default="")
    backstory = models.TextField(blank=True, default="")
    internal_desire = models.TextField(
        blank=True,
        default="",
        help_text="Core motivation or goal driving the character"
    )
    flaw = models.TextField(
        blank=True,
        default="",
        help_text="Fatal flaw or emotional vulnerability"
    )
    avatar_url = models.URLField(max_length=1024, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lorevault_characters"
        ordering = ["project", "name"]
        verbose_name = _("Character")
        verbose_name_plural = _("Characters")

    def __str__(self):
        return f"{self.name} ({self.role})"


class CharacterRelationship(models.Model):
    """
    M2M Self-referential relationship connecting two characters.
    """
    class RelationshipType(models.TextChoices):
        RIVAL = "Rival", _("Rival")
        ALLY = "Ally", _("Ally")
        FAMILY = "Family", _("Family")
        LOVERS = "Lovers", _("Lovers")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="relationships",
        db_index=True
    )
    character_from = models.ForeignKey(
        Character,
        on_delete=models.CASCADE,
        related_name="relationships_initiated"
    )
    character_to = models.ForeignKey(
        Character,
        on_delete=models.CASCADE,
        related_name="relationships_received"
    )
    relationship_type = models.CharField(
        max_length=64,
        choices=RelationshipType.choices,
        default=RelationshipType.ALLY,
        db_index=True
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lorevault_character_relationships"
        ordering = ["project", "relationship_type"]
        unique_together = [["character_from", "character_to"]]
        verbose_name = _("Character Relationship")
        verbose_name_plural = _("Character Relationships")

    def __str__(self):
        return f"{self.character_from.name} -> {self.character_to.name} ({self.relationship_type})"


class TimelineEvent(models.Model):
    """
    Represents a chronological plot event in the story timeline,
    optionally linked to a specific chapter.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="timeline_events",
        db_index=True
    )
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="timeline_events"
    )
    event_title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    timestamp_in_story = models.CharField(
        max_length=255,
        help_text="In-universe date or timestamp (e.g. 'Year 142 of the Eclipse, Day 4')",
        default="Day 1"
    )
    sequence_order = models.PositiveIntegerField(
        default=1,
        db_index=True,
        help_text="Chronological sequence order of the event"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lorevault_timeline_events"
        ordering = ["project", "sequence_order", "id"]
        verbose_name = _("Timeline Event")
        verbose_name_plural = _("Timeline Events")

    def __str__(self):
        return f"[{self.sequence_order}] {self.event_title} ({self.timestamp_in_story})"
