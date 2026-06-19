# Godot Review Checklist

Use this checklist before finalizing Godot game changes.

## Project Compatibility

- Confirm the Godot major version before using APIs.
- Check whether the project uses GDScript, C#, visual scripting, or mixed scripts.
- For C#/.NET projects, verify the .NET SDK/Godot .NET edition expectation and run `dotnet build` when available.
- Preserve existing directory conventions for scenes, scripts, resources, shaders, art, and audio.

## Planning and State

- Large tasks have clear target files, status, dependencies, and verification criteria.
- `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, and `ASSETS.md` are read and updated when the project uses a resumable game-generation workflow.
- Asset manifests include path, intended in-game size, owner task, and source/reference notes.

## Tooling and Automation

- Prefer documented project commands before ad hoc Godot invocations.
- Use available Godot MCP/editor automation for scene creation, node hierarchy changes, project runs, and log capture.
- If MCP/editor automation is unavailable, note the limitation and validate manual edits with command-line checks.

## Scene Integrity

- Scene files load without missing scripts/resources.
- `ext_resource` paths point to existing files.
- Godot 4.4+ UID references remain consistent with moved, renamed, or newly created resources.
- Node names and paths used by scripts match the scene tree.
- Signal connections reference existing methods.
- Exported properties in scenes match script property names and expected types.
- Automated node additions preserve intended ownership, signal connections, groups, and scene-local paths.

## Gameplay Behavior

- Input actions exist in `project.godot` and are documented or discoverable.
- Physics changes use `_physics_process` where deterministic physics timing matters.
- Frame-dependent visual work uses `_process` only when appropriate.
- Randomness is seeded intentionally for tests or left non-deterministic for gameplay where appropriate.

## Assets

- Visual targets or art direction match what the game will actually implement; unbuildable reference details are removed or descoped.
- Sprite2D/3D, mesh, material, animation, and UI texture references point to imported assets that exist.
- Asset moves or renames update script, scene, resource, and UID references.
- Generated cache/import artifacts are only committed when the repository convention requires them.

## UI and UX

- UI scales across common viewport sizes.
- Text remains readable and does not overflow critical controls.
- Mouse, touch, keyboard, or gamepad support matches the platform target.
- Important game states provide visual and/or audio feedback.

## Persistence

- Save files use `user://`.
- Loading handles missing or malformed save data gracefully.
- Versioned save data has a migration or fallback path if schema changed.

## Testing

- Run Godot headless load/check commands when available.
- Use editor/MCP project execution when available to capture runtime console output and metadata.
- Run project test addons such as GUT or WAT if present.
- For visual changes, capture a screenshot or describe why one was not possible.
- Review screenshots/video for scale, clipping, z-order, camera framing, missing assets, animation state, and UI readability before marking work done.
- If visual QA fails repeatedly, replan around architecture/assets or escalate instead of silently accepting the failure.
