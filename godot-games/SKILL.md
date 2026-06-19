---
name: godot-games
description: Build, debug, test, and polish Godot game projects. Use when working on Godot Engine games, including .tscn scenes, .gd GDScript, .tres/.res resources, project.godot configuration, input maps, UI/control scenes, 2D/3D gameplay, physics, animation, signals, autoloads, exports, Godot editor/MCP automation, or Godot-specific debugging and validation.
---

# Godot Games

## Overview

Use this skill to make safe, idiomatic changes in Godot projects while preserving scene/resource integrity. Prefer small, testable edits and validate with Godot's command-line tools when available.

This skill also covers the Godot Game Development workflow described by MCP Market and incorporates useful Godogen patterns: end-to-end Godot assistance for scene tree architecture, physics systems, GDScript/C# patterns, scene/node orchestration, editor execution, console-output debugging, UID-aware resources, asset planning, screenshot-driven QA, and resumable task state.

## Workflow

1. **Identify the Godot version and project shape.** Read `project.godot`, note `config/features`, application settings, language choices, and whether this is a standard or .NET/C# Godot project. Do not assume Godot 3 and Godot 4 APIs are interchangeable.
2. **Check available Godot tooling.** Prefer repository-documented commands first. If Godot MCP tools, editor automation, capture scripts, or local Godot API docs are available, use them instead of fragile manual scene edits or guessed APIs.
3. **Resume from project state when present.** For large game-generation work, read `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, and `ASSETS.md` if they exist; keep them current when the repo uses that workflow.
4. **Map scene ownership before editing.** For a feature or bug, identify the main scene, instanced child scenes, attached scripts, autoload singletons, resources, UID references, input actions, and assets involved.
5. **Edit text resources carefully.** `.tscn`, `.tres`, `.csproj`, and `project.godot` are structured files; preserve `ext_resource`, `sub_resource`, node paths, unique IDs, and indentation. Prefer Godot-generated structure when possible.
6. **Keep gameplay logic deterministic where practical.** Separate input, simulation, presentation, and persistence concerns. Use exported properties for designer-tunable values.
7. **Validate visually and programmatically.** Run formatting/linting if configured, then run Godot headless checks or tests. For visible gameplay/UI changes, capture screenshots or video and inspect actual frames instead of trusting code alone.

## Large Feature and Game-Generation Workflow

For broad requests such as building a playable prototype, adding a full level, or generating many assets, use a resumable Godogen-style workflow without overloading small bug fixes:

- Create or update a compact plan with task status, dependencies, target files, verification criteria, and asset assignments. Keep state in project files such as `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, and `ASSETS.md` when those files already exist or the task is large enough to need them.
- Start from a concrete visual target: define the camera, core gameplay moment, object scale, environment layers, and HUD positions before generating or placing assets. Exclude visual elements the game will not actually implement.
- De-risk unknowns first. Prototype risky mechanics, shaders, C#/.NET build setup, imports, exports, or platform constraints in isolation before expanding the main scene graph.
- Treat generated assets as runtime inputs with an explicit manifest: path, intended in-game size, ownership task, source/reference image, and retry notes. Keep runtime assets under the project asset tree and scratch/reference-only files outside it unless the project convention differs.
- For final presentation or user-facing milestones, produce a short proof artifact when tooling allows: screenshot sequence, captured gameplay clip, or recorded validation notes.

## MCP and Editor Automation

When project tooling exposes Godot-specific MCP commands or editor automation, use them to reduce hand-authored scene mistakes:

- Create scenes and node hierarchies programmatically when adding new gameplay objects, UI screens, `CanvasLayer` flows, 2D platformer pieces, or 3D environment structures.
- Launch or run the project through the editor/MCP integration when available, and capture console output, runtime errors, warnings, and metadata for debugging.
- For Godot 4.4 and newer projects, preserve and update UID-based resource references consistently. Do not replace UID references with path-only assumptions unless the project already does so.
- Prefer automation for repetitive scene tasks such as adding nodes, attaching scripts, connecting signals, assigning exported properties, and wiring resources.
- If MCP/editor tools are not available, fall back to careful text edits and explicit command-line validation.

## Implementation Guidance

### Scripts: GDScript and C#

- Use the scripting language already chosen by the project. Godogen-style Godot projects may use C#/.NET; standard Godot projects may use GDScript.
- For C# Godot projects, keep `.csproj`/solution files valid, use the Godot .NET build, run `dotnet build` when available, and verify Godot API names/signatures rather than translating GDScript idioms mechanically.
- Use typed GDScript for new code when the surrounding codebase does so.
- Prefer `@export` variables for tunable scene values and `@onready` references for child nodes that exist in the scene.
- Use signals to decouple UI, gameplay objects, and managers.
- Avoid hard-coded absolute node paths when a scene-local exported `NodePath`, group lookup, or signal connection is more robust.
- In Godot 4, use `CharacterBody2D/3D`, `Area2D/3D`, `RigidBody2D/3D`, `Callable`, and `await` idioms instead of Godot 3-only patterns.
- For player controllers, keep input gathering, velocity/physics integration, animation state, and interaction logic easy to test and tune.

### Scenes, Nodes, and Resources

- Prefer adding or modifying scripts/resources over hand-editing large scene graphs when the same outcome can be achieved safely in code.
- When editing `.tscn` files, update resource declarations and node references consistently.
- Keep reusable gameplay data in `.tres` resources when the project already uses resources for data-driven content.
- Verify exported property names match the attached script exactly.
- Use idiomatic nodes for the target dimension and system: `CharacterBody2D/3D` for controllable actors, `Area2D/3D` for triggers, `RayCast2D/3D` or shape casts for probes, `AnimationPlayer`/`AnimationTree` for animation, and `Control`/container nodes for UI.
- For UI hierarchies, consider `CanvasLayer` for HUDs and overlays that should remain independent from world camera movement.

### Assets and Texture Handling

- Confirm imported assets exist before referencing them from scenes or scripts.
- Assign textures/materials through existing import/resource conventions, especially for `Sprite2D`, `AnimatedSprite2D`, `Sprite3D`, meshes, and UI `TextureRect` nodes.
- Preserve `.import` sidecar behavior and avoid committing generated cache files unless the repository already tracks them.
- Keep asset paths stable; if moving or renaming files, update all scene, resource, script, and UID references.

### Input, UI, and Accessibility

- Add input actions in `project.godot` rather than checking raw key codes throughout gameplay code.
- Support keyboard/gamepad where appropriate; avoid pointer-only gameplay unless requested.
- For UI, use Control containers, anchors, and theme resources rather than absolute positioning unless the existing project uses fixed layouts.
- Preserve readable contrast and scalable text.

### Saving and Progression

- Store save data through a dedicated manager/autoload if one exists.
- Use `user://` paths for runtime saves.
- Validate save/load paths for missing, corrupt, or older-version data.

## Debugging and Visual QA

- Do not trust code-only reasoning for visual changes. Inspect captured screenshots/frames for scale, clipping, z-order, camera framing, missing assets, animation state, and UI readability.
- When a screenshot/video check fails, fix the issue before calling the task done. After repeated fix cycles, replan if the root cause is architecture or assets; escalate to the user if the fix is ambiguous.
- Reproduce runtime issues with the smallest relevant scene or project entry point.
- Capture Godot stdout/stderr and editor/MCP logs when available; include script errors, missing resource messages, and node path failures in the diagnosis.
- Inspect metadata such as active scene path, autoloads, input actions, and resource load paths before changing unrelated systems.
- Treat missing scripts/resources, invalid signal targets, UID mismatches, and stale exported property names as first-class suspects for scene load failures.

## Validation Commands

Use commands that fit the project and installed engine. Common checks include:

```bash
godot --headless --path . --quit
godot --headless --path . --check-only
godot --headless --path . -s addons/gut/gut_cmdln.gd
godot --headless --path . --run-tests
dotnet build
timeout 30 godot --headless --quit
xvfb-run -a godot --headless --quit
```

If the executable is named differently, try `godot4` or the repository's documented command. Report the exact commands run and whether failures are code issues or environment limitations.

## Reference

For a compact review checklist, read `references/godot-review-checklist.md` when preparing or reviewing Godot changes.
