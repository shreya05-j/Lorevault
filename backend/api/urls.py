"""
LoreVault Django REST Framework Routing (urls.py)
=================================================
Configures DRF Routers for standard and nested project endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    ProjectViewSet,
    ChapterViewSet,
    CharacterViewSet,
    CharacterRelationshipViewSet,
    TimelineEventViewSet,
)

# Root level router
router = DefaultRouter(trailing_slash=False)
router.register(r"projects", ProjectViewSet, basename="project")

# Nested project router
projects_router = routers.NestedSimpleRouter(router, r"projects", lookup="project", trailing_slash=False)
projects_router.register(r"chapters", ChapterViewSet, basename="project-chapters")
projects_router.register(r"characters", CharacterViewSet, basename="project-characters")
projects_router.register(r"relationships", CharacterRelationshipViewSet, basename="project-relationships")
projects_router.register(r"timeline", TimelineEventViewSet, basename="project-timeline")

urlpatterns = [
    path("", include(router.urls)),
    path("", include(projects_router.urls)),
    path("seed", ProjectViewSet.as_view({"post": "seed"})),
]
