"""
LoreVault Django REST Framework Serializers
===========================================
Serializers for Projects, Chapters, Characters, CharacterRelationships,
and TimelineEvents. Includes nested serializers for relationship visualization
and summary statistics.
"""

from rest_framework import serializers
from .models import (
    Project,
    Chapter,
    Character,
    CharacterRelationship,
    TimelineEvent,
)


class ChapterSerializer(serializers.ModelSerializer):
    """
    Serializer for Chapter entity. Automatically computes word_count.
    """
    class Meta:
        model = Chapter
        fields = [
            "id",
            "project",
            "title",
            "content",
            "order_index",
            "word_count",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["project", "word_count", "created_at", "updated_at"]

    def validate_order_index(self, value):
        if value < 0:
            raise serializers.ValidationError("Order index must be zero or positive.")
        return value


class CharacterSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight nested serializer for character references in relationships.
    """
    class Meta:
        model = Character
        fields = ["id", "name", "role", "avatar_url"]


class CharacterRelationshipSerializer(serializers.ModelSerializer):
    """
    Serializer for CharacterRelationships including nested summary details.
    """
    character_from_detail = CharacterSummarySerializer(
        source="character_from", read_only=True
    )
    character_to_detail = CharacterSummarySerializer(
        source="character_to", read_only=True
    )

    character_from_id = serializers.PrimaryKeyRelatedField(
        source="character_from", queryset=Character.objects.all()
    )
    character_to_id = serializers.PrimaryKeyRelatedField(
        source="character_to", queryset=Character.objects.all()
    )

    class Meta:
        model = CharacterRelationship
        fields = [
            "id",
            "project",
            "character_from_id",
            "character_to_id",
            "character_from_detail",
            "character_to_detail",
            "relationship_type",
            "notes",
            "created_at",
        ]
        read_only_fields = ["project", "created_at"]

    def validate(self, attrs):
        char_from = attrs.get("character_from")
        char_to = attrs.get("character_to")
        if char_from and char_to and char_from == char_to:
            raise serializers.ValidationError(
                {"character_to": "A character cannot have a relationship with themselves."}
            )
        return attrs


class CharacterSerializer(serializers.ModelSerializer):
    """
    Complete serializer for Character profiles, including their relationships.
    """
    relationships_initiated = CharacterRelationshipSerializer(many=True, read_only=True)
    relationships_received = CharacterRelationshipSerializer(many=True, read_only=True)

    class Meta:
        model = Character
        fields = [
            "id",
            "project",
            "name",
            "role",
            "age",
            "physical_description",
            "backstory",
            "internal_desire",
            "flaw",
            "avatar_url",
            "relationships_initiated",
            "relationships_received",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["project", "created_at", "updated_at"]


class TimelineEventSerializer(serializers.ModelSerializer):
    """
    Serializer for chronological plot events with chapter title lookup.
    """
    chapter_title = serializers.CharField(
        source="chapter.title", read_only=True, default=None
    )

    chapter_id = serializers.PrimaryKeyRelatedField(
        source="chapter", queryset=Chapter.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = TimelineEvent
        fields = [
            "id",
            "project",
            "chapter_id",
            "chapter_title",
            "event_title",
            "description",
            "timestamp_in_story",
            "sequence_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["project", "created_at", "updated_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Summary serializer for listing projects with chapter count and word count.
    """
    chapter_count = serializers.IntegerField(
        source="chapters.count", read_only=True
    )
    character_count = serializers.IntegerField(
        source="characters.count", read_only=True
    )
    total_word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "user_id",
            "title",
            "genre",
            "synopsis",
            "target_word_count",
            "chapter_count",
            "character_count",
            "total_word_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Deep serializer for a single Project, including all nested entities.
    """
    chapters = ChapterSerializer(many=True, read_only=True)
    characters = CharacterSerializer(many=True, read_only=True)
    relationships = CharacterRelationshipSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    total_word_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "user_id",
            "title",
            "genre",
            "synopsis",
            "target_word_count",
            "total_word_count",
            "chapters",
            "characters",
            "relationships",
            "timeline_events",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
