# FYD Web Story Learn Language Roadmap

## Current Shape

This project is currently a static web prototype with 3 core parts:

- `aetheria_english_quest_homepage.html`: landing page and entry point
- `gameplay_intro.html` + `story_engine.js`: gameplay runtime for chapter 1
- `dialogue_node_editor.html` + `intro_story.json`: branching story editor and sample story data

The architecture is already usable for rapid iteration because the content layer is mostly separated from the runtime layer.

## Immediate Risks

These are the main issues to fix before expanding the content:

1. Story data is duplicated between `intro_story.json` and the large `fallbackStory` block inside `gameplay_intro.html`.
2. The engine is still minimal: no save/load, no conditional branching, no chapter registry, no validation layer.
3. The editor can export JSON, but it does not enforce schema integrity before gameplay uses the data.
4. The project has no shared documentation yet, so feature growth can drift quickly.

## Development Priorities

### Phase 1: Stabilize the prototype

Goal: make the current chapter reliable and easier to maintain.

- Remove or greatly reduce the inline `fallbackStory` in `gameplay_intro.html`
- Define one canonical story schema for nodes, choices, effects, and state
- Add a lightweight story validator in the runtime or editor
- Standardize IDs and required fields for every node and choice
- Add a simple `README.md` later if we want onboarding for other contributors

Deliverable:

- One runtime path
- One source of truth for story data
- One documented JSON structure

### Phase 2: Upgrade the engine

Goal: make the story system support real game progression.

- Add save/load using `localStorage`
- Add restart chapter action
- Add conditional choice visibility based on flags/stats
- Add conditional node jumps
- Add simple chapter completion state
- Add basic error UI when story data is invalid or missing

Suggested engine features:

- `conditions` on choices
- `conditions` on nodes
- `ending` node type
- `chapterId` and `nextChapterId`

### Phase 3: Strengthen the editor

Goal: make content production faster and safer.

- Add schema validation before export
- Highlight broken links and missing node IDs
- Show orphan nodes
- Allow editing chapter metadata
- Support import from uploaded JSON file, not just text area and sample fetch
- Add a playable preview mode from inside the editor

Deliverable:

- Content can be authored in the editor with fewer runtime surprises

### Phase 4: Build a multi-chapter structure

Goal: move from one demo chapter to a scalable course flow.

- Create a `stories/` folder for separate chapter JSON files
- Add a chapter manifest file, for example `stories/index.json`
- Convert homepage CTAs into real chapter navigation
- Add chapter unlock logic and progress display
- Keep `story_engine.js` generic so new chapters do not require HTML duplication

Suggested folder direction:

```text
/
  aetheria_english_quest_homepage.html
  gameplay.html
  story_engine.js
  dialogue_node_editor.html
  stories/
    index.json
    chapter-01.json
    chapter-02.json
```

### Phase 5: Add learning features

Goal: make it a real English-learning product instead of only a branching story demo.

- Add vocabulary tracking per chapter
- Add grammar tags on choices and scenes
- Add listening/audio support
- Add pronunciation or speaking tasks later
- Add score summary at the end of a chapter
- Add review mode for wrong answers

## Recommended Next Implementation Order

If we continue now, the cleanest order is:

1. Remove story duplication and define the story schema.
2. Add save/load and restart support to the runtime.
3. Add validation and broken-link warnings to the editor.
4. Convert `gameplay_intro.html` into a reusable `gameplay.html`.
5. Move to multi-chapter content files.

## Working Rules For This Repo

To keep the project coherent while we build:

- Keep gameplay logic in `story_engine.js`, not spread across HTML files.
- Keep content in JSON files, not duplicated inline.
- Keep the editor compatible with the exact runtime schema.
- Prefer extending the schema over hardcoding chapter-specific behavior.
- Treat homepage, gameplay, and editor as separate surfaces with clear responsibilities.

## Next Concrete Task

The best next code task is:

`Remove the duplicated fallback story from gameplay HTML and formalize a single JSON-driven story schema.`

That gives the biggest maintainability gain with the lowest implementation risk.
