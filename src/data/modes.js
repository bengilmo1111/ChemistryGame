import { experiments as henryExperiments } from './henry/experiments.js';
import { experiments as paulingExperiments } from './pauling/experiments.js';
import { hero as henryHero } from './henry/hero.js';
import { funnyFailures as henryFailures, reactionOutcomes as henryOutcomes, secretReactions as henrySecrets } from './henry/reactions.js';
import { reactionOutcomes as paulingOutcomes, secretReactions as paulingSecrets } from './pauling/reactions.js';
import { reagents as henryReagents } from './henry/reagents.js';
import { reagents as paulingReagents } from './pauling/reagents.js';

const paulingHero = {
  name: 'Linus Pauling',
  shortName: 'Pauling',
  title: 'Scientific Mentor',
  tagline: 'Linus Pauling, Chemical Bond Explorer',
  intro: 'Study realistic classroom chemistry with Linus Pauling: predict, observe evidence, and connect reactions to molecular ideas.',
  greetings: [
    'Careful observations first — choose a prediction and test one variable.',
    'A good chemist records evidence before drawing a conclusion.',
    'Select reagents, use the appropriate tool, and compare your result with the model.',
    'Let the experiment show whether the hypothesis survives the evidence.',
  ],
  successQuips: [
    'The evidence supports the model.',
    'A clear observation is a beautiful thing.',
    'Excellent — now connect the macroscopic result to particles.',
    'That result belongs in the lab notebook.',
  ],
  failureQuips: [
    'Interesting — the evidence asks for a revised procedure.',
    'A negative result still teaches chemistry.',
    'Control the variables and try again.',
    'The model improves when observations disagree.',
  ],
};

const paulingFailures = [
  {
    id: 'no-reaction',
    title: 'No Reaction Observed',
    effect: 'soot',
    explanation: 'The selected reagents do not match a supported reaction model under these simulated conditions. Record the negative result, revise one variable, and test again.',
    vocabulary: ['evidence', 'variable', 'model'],
  },
  {
    id: 'incomplete-process',
    title: 'Incomplete Process',
    effect: 'swirl',
    explanation: 'The procedure started but did not provide enough evidence for a completed reaction. Check reagent identity, amounts, and the required process step before repeating the trial.',
    vocabulary: ['procedure', 'evidence', 'reactant'],
  },
  {
    id: 'missing-variable',
    title: 'Missing Variable',
    effect: 'layers',
    explanation: 'The ingredients were appropriate, but a required variable or tool step was missing. Change only that variable and compare the next observation.',
    vocabulary: ['controlled variable', 'procedure', 'observation'],
  },
  {
    id: 'uncontrolled-variable',
    title: 'Uncontrolled Variable',
    effect: 'tornado',
    explanation: 'Too many variables changed at once, so the simulated observation cannot support a clear conclusion. Reset the trial and control one factor at a time.',
    vocabulary: ['controlled variable', 'hypothesis', 'conclusion'],
  },
];

export const modes = {
  henry: {
    id: 'henry',
    label: 'Henry the Mad Scientist',
    tone: 'playful',
    hero: henryHero,
    experiments: henryExperiments,
    reagents: henryReagents,
    reactionOutcomes: henryOutcomes,
    secretReactions: henrySecrets,
    failures: henryFailures,
    safetyText: 'All reagents are pretend. Real experiments need a trusted grown-up, goggles, and safe school instructions.',
    colors: { menuBackground: '#15183a', labBackground: '#232a62', sandboxBackground: '#1a3a2a', accent: '#ffd166', cardFill: 0xfff7d6, cardStroke: 0x8a5a24 },
    labels: { play: 'Play as Henry', sandbox: '🧪 MAD MIX (Sandbox)', levelTitle: "Henry's Wild Lab Cards", labIngredients: '2. Grab Ingredients', labTools: '3. Lab Tools', meter: 'Chaos Meter', mix: 'MIX!' },
  },
  pauling: {
    id: 'pauling',
    label: 'Linus Pauling',
    tone: 'realistic/scientific',
    hero: paulingHero,
    experiments: paulingExperiments,
    reagents: paulingReagents,
    reactionOutcomes: paulingOutcomes,
    secretReactions: paulingSecrets,
    failures: paulingFailures,
    safetyText: 'Use classroom chemistry only with an instructor, goggles, labeled dilute solutions, and approved disposal instructions.',
    colors: { menuBackground: '#102334', labBackground: '#18354a', sandboxBackground: '#17352d', accent: '#9de8ff', cardFill: 0xf4fbff, cardStroke: 0x235b72 },
    labels: { play: 'Study with Linus Pauling', sandbox: '🔬 Open Exploration', levelTitle: 'Linus Pauling Scientific Investigations', labIngredients: '2. Select Reagents', labTools: '3. Procedure Tools', meter: 'Safety Meter', mix: 'React!' },
  },
};

export function getMode(modeId = 'henry') {
  return modes[modeId] ?? modes.henry;
}
