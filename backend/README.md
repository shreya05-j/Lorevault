# LoreVault — Django & DRF Backend Architecture

This directory contains the production-ready **Django REST Framework (DRF)** backend architecture and implementation for **LoreVault**:
- `models.py`: Complete Django ORM relational schema with foreign keys, M2M self-referential relationships, and cascades.
- `serializers.py`: DRF Serializers including nested serializers for relationship graph and timeline visualization.
- `views.py`: DRF ViewSets with project-based filtering and custom ordering logic.
- `urls.py`: Complete nested URL router configuration.

---

## 1. Relational Schema & Models

### `Project` (Books / Anthologies)
- Primary Key: `UUIDField`
- Fields: `user_id`, `title`, `genre`, `synopsis`, `target_word_count`, `created_at`, `updated_at`.
- Computed Property: `total_word_count` (sum of all chapter word counts).

### `Chapter`
- Foreign Key: `Project` (`on_delete=CASCADE`)
- Fields: `title`, `content` (Markdown/Rich Text), `order_index`, `word_count`, `status` (`Draft`, `In Review`, `Completed`).
- Auto-computes `word_count` on save.

### `Character`
- Foreign Key: `Project` (`on_delete=CASCADE`)
- Fields: `name`, `role` (`Protagonist`, `Antagonist`, `Supporting`, `Minor`), `age`, `physical_description`, `backstory`, `internal_desire`, `flaw`, `avatar_url`.

### `CharacterRelationship` (M2M Self-Referential)
- Foreign Keys: `Project`, `character_from`, `character_to` (`on_delete=CASCADE`)
- Fields: `relationship_type` (`Rival`, `Ally`, `Family`, `Lovers`), `notes`.

### `TimelineEvent`
- Foreign Keys: `Project`, `Chapter` (`on_delete=SET_NULL`, optional FK)
- Fields: `event_title`, `description`, `timestamp_in_story`, `sequence_order`.

---

## 2. DRF REST Endpoints

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET / POST** | `/api/projects/` | List all projects / Create new project |
| **GET / PUT / DELETE** | `/api/projects/{id}/` | Get full project detail with nested chapters, characters, timeline |
| **GET / POST** | `/api/projects/{id}/chapters/` | List or create chapter |
| **POST** | `/api/projects/{id}/chapters/reorder/` | Batch reorder `order_index` for chapters |
| **GET / POST** | `/api/projects/{id}/characters/` | List or create characters (filter by `?role=`) |
| **GET / POST** | `/api/projects/{id}/relationships/` | List or create M2M character relationships |
| **GET / POST** | `/api/projects/{id}/timeline/` | List or create timeline events |
