# PRD: Mad Flask Lab

## 1. Product summary

**Mad Flask Lab** is a 2D cartoon chemistry experiment game for late elementary / primary school children.

The player is a mischievous junior mad scientist who adds fictionalised chemistry ingredients to flasks, watches reactions, learns simple science ideas, and discovers funny failures such as foam eruptions, cork pops, soot blasts, slime escapes, rainbow sludge, and tiny cartoon explosions.

The game should be playful, safe, funny, and educational. It should teach observation, prediction, cause and effect, basic chemistry vocabulary, and simple lab thinking without giving children dangerous real-world chemical instructions.

## 2. Target audience

- Children aged approximately 8–12.
- Late primary / elementary school level.
- Suitable for casual play at home or school.
- Reading level should be simple, clear, and friendly.
- The game should be playable without prior chemistry knowledge.

## 3. Core design principles

1. **Real science concepts, fictional ingredients**
   - Use recognisable concepts like dissolving, gas, pressure, pH, density, crystals, temperature, and reaction speed.
   - Use safe fictional reagent names such as `Fizz Powder`, `Sour Drops`, `Purple Potion`, and `Bubble Base`.
   - Avoid real hazardous chemistry recipes.

2. **Failure is fun**
   - Incorrect combinations should not simply fail.
   - Mistakes should create funny visual outcomes: foam overflow, cork rocket, soot face, slime monster, potion goblin, duck portal, crystal jam, etc.

3. **Predict → Mix → Observe → Explain**
   - Each experiment should ask the player to predict what will happen.
   - The player mixes ingredients.
   - The reaction plays out visually.
   - A short child-friendly explanation appears.

4. **Short levels**
   - Each experiment should take 1–3 minutes.
   - Levels should be replayable to discover alternate outcomes.

5. **2D cartoon mechanics**
   - Build using Phaser.
   - Gameplay is based on dragging, dropping, pouring, stirring, heating, cooling, sealing, shaking, and observing.
   - Use cartoon particles, tweening, camera shake, animation, sprites, and UI meters.

## 4. Platform and technology

### Required stack

- **Game framework:** Phaser 3
- **Language:** JavaScript or TypeScript
- **Rendering:** 2D browser game
- **Physics:** Phaser Arcade Physics for simple sprite collision, falling objects, bouncing corks, flying bubbles, and lab chaos
- **Target:** Desktop browser first, mobile/tablet responsive second
- **Package manager:** npm
- **Build tool:** Vite recommended
- **Deployment target:** Static web hosting, e.g. Vercel or GitHub Pages

### Recommended project structure

```text
mad-flask-lab/
  package.json
  index.html
  src/
    main.js
    scenes/
      BootScene.js
      PreloadScene.js
      MenuScene.js
      LabScene.js
      LevelSelectScene.js
      ResultsScene.js
    data/
      experiments.js
      reagents.js
      reactions.js
      badges.js
    systems/
      ReactionEngine.js
      LabInventory.js
      DangerMeter.js
      PredictionSystem.js
      BadgeSystem.js
      DialogueSystem.js
    ui/
      Button.js
      Meter.js
      Tooltip.js
      LabNotebook.js
    assets/
      images/
      sprites/
      audio/
      sfx/
      generated/
  docs/
    imagegen-prompts.md
    experiment-design.md
```
