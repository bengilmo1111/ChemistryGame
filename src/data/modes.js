import { experiments as henryExperiments } from './experiments.js';
import { hero as henryHero } from './hero.js';
import { funnyFailures as henryFailures, reactionOutcomes as henryOutcomes, secretReactions as henrySecrets } from './reactions.js';
import { reagents as henryReagents } from './reagents.js';

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

const paulingReagents = [
  { id: 'sodium-bicarbonate', artKey: 'art-reagent-fizz-powder', name: 'Sodium Bicarbonate', icon: 'NaHCO₃', color: 0xf4f1de, concept: 'carbonate base', clue: 'A safe classroom solid that releases carbon dioxide when it reacts with an acid.' },
  { id: 'acetic-acid', artKey: 'art-reagent-sour-drops', name: 'Dilute Acetic Acid', icon: 'CH₃COOH', color: 0x72d6ff, concept: 'weak acid', clue: 'Dilute vinegar-like acid donates hydrogen ions in acid-base reactions.' },
  { id: 'sodium-carbonate', artKey: 'art-reagent-bubble-base', name: 'Sodium Carbonate', icon: 'CO₃²⁻', color: 0xb4ff7a, concept: 'basic solution', clue: 'A basic carbonate solution that neutralizes acids and changes indicators.' },
  { id: 'red-cabbage-indicator', artKey: 'art-reagent-purple-potion', name: 'Cabbage Indicator', icon: 'pH', color: 0x8e44ad, concept: 'pH indicator', clue: 'Anthocyanin pigments shift color in acidic, neutral, and basic solutions.' },
  { id: 'copper-sulfate', artKey: 'art-reagent-glimmer-salt', name: 'Copper(II) Sulfate', icon: 'Cu²⁺', color: 0x4ea3ff, concept: 'ionic compound', clue: 'Blue copper ions can form crystals or precipitates with the right partner.' },
  { id: 'calcium-chloride', artKey: 'art-reagent-goo-gel', name: 'Calcium Chloride', icon: 'CaCl₂', color: 0xd8fbff, concept: 'salt solution', clue: 'Calcium ions can combine with carbonate ions to make an insoluble solid.' },
];

const paulingExperiments = [
  { id: 'co2-generation', title: 'Carbon Dioxide Generation', goal: 'Generate and observe carbon dioxide gas from an acid-carbonate reaction.', prompt: 'Will dilute acetic acid and sodium bicarbonate release a gas?', required: ['sodium-bicarbonate', 'acetic-acid'], requiredActions: ['stirred'], actionHint: 'Stir to bring the solid carbonate and acid into contact.', hints: ['Carbonates release carbon dioxide with acids.', 'Gas bubbles are evidence that a new substance formed.'], vocabulary: ['gas', 'bubbles', 'pressure'] },
  { id: 'indicator-neutralization', title: 'Indicator Neutralization', goal: 'Use an indicator to track acid-base neutralization.', prompt: 'Can cabbage indicator show whether the mixture moves toward neutral pH?', required: ['red-cabbage-indicator', 'sodium-carbonate', 'acetic-acid'], requiredActions: ['shaken'], actionHint: 'Shake gently so the indicator samples the acid and base evenly.', hints: ['Indicators change color with pH.', 'Acids and bases can neutralize each other.'], vocabulary: ['pH', 'indicator', 'neutral'] },
  { id: 'copper-crystallization', title: 'Copper Sulfate Crystallization', goal: 'Model crystal formation as dissolved ions arrange into a solid pattern.', prompt: 'Will cooling help copper sulfate form visible crystals?', required: ['copper-sulfate', 'calcium-chloride'], requiredActions: ['cooled'], actionHint: 'Cool the solution so dissolved particles move more slowly and arrange into crystals.', hints: ['Crystals have repeating particle patterns.', 'Temperature can affect solubility.'], vocabulary: ['crystals', 'dissolve', 'temperature'] },
  { id: 'precipitate-formation', title: 'Precipitate Formation', goal: 'Make an insoluble calcium carbonate precipitate from two clear solutions.', prompt: 'Will calcium ions and carbonate ions form a cloudy solid?', required: ['calcium-chloride', 'sodium-carbonate'], requiredActions: ['stirred'], actionHint: 'Stir so calcium ions and carbonate ions collide throughout the solution.', hints: ['A precipitate is an insoluble solid.', 'Cloudiness can indicate a new solid formed.'], vocabulary: ['precipitate', 'ions', 'solubility'] },
  { id: 'gas-pressure', title: 'Gas Pressure in a Closed Flask', goal: 'Connect gas production to pressure in a sealed container.', prompt: 'What happens if carbon dioxide forms in a sealed flask?', required: ['sodium-bicarbonate', 'acetic-acid', 'calcium-chloride'], requiredActions: ['sealed'], actionHint: 'Seal only after adding reagents so generated gas increases pressure.', hints: ['Gas particles push on container walls.', 'Pressure increases when gas is trapped.'], vocabulary: ['pressure', 'gas', 'force'] },
  { id: 'temperature-rate', title: 'Temperature and Reaction Rate', goal: 'Compare how warming changes the visible rate of an acid-carbonate reaction.', prompt: 'Will warming make bubbling appear faster?', required: ['sodium-bicarbonate', 'acetic-acid'], requiredActions: ['heated'], actionHint: 'Warm the flask to increase particle motion before comparing bubbling rate.', hints: ['Higher temperature often speeds reactions.', 'Faster particles collide more often.'], vocabulary: ['temperature', 'reaction speed', 'particles'] },
];

const paulingOutcomes = [
  { id: 'carbon-dioxide-bubbles', experimentId: 'co2-generation', ingredients: ['sodium-bicarbonate', 'acetic-acid'], requiredActions: ['stirred'], kind: 'success', title: 'Carbon Dioxide Bubbles', effect: 'foam', badge: 'bubble-boss', explanation: 'Acetic acid reacted with bicarbonate to form carbon dioxide gas, water, and acetate ions. The visible bubbles are evidence of gas production.' },
  { id: 'neutral-indicator-shift', experimentId: 'indicator-neutralization', ingredients: ['red-cabbage-indicator', 'sodium-carbonate', 'acetic-acid'], requiredActions: ['shaken'], kind: 'success', title: 'Indicator Color Shift', effect: 'rainbow', badge: 'indicator-ace', explanation: 'The indicator changed as acid and base particles neutralized each other, showing that pH moved toward a different range.' },
  { id: 'blue-crystals', experimentId: 'copper-crystallization', ingredients: ['copper-sulfate', 'calcium-chloride'], requiredActions: ['cooled'], kind: 'success', title: 'Blue Crystal Pattern', effect: 'crystal', badge: 'crystal-wrangler', explanation: 'Cooling reduced particle motion, allowing dissolved ions to arrange into an ordered crystal-like pattern.' },
  { id: 'calcium-carbonate-cloud', experimentId: 'precipitate-formation', ingredients: ['calcium-chloride', 'sodium-carbonate'], requiredActions: ['stirred'], kind: 'success', title: 'Calcium Carbonate Cloud', effect: 'layers', badge: 'layer-legend', explanation: 'Calcium ions and carbonate ions formed calcium carbonate, an insoluble solid that appeared as cloudiness in the liquid.' },
  { id: 'closed-flask-pressure', experimentId: 'gas-pressure', ingredients: ['sodium-bicarbonate', 'acetic-acid', 'calcium-chloride'], requiredActions: ['sealed'], kind: 'success', title: 'Measured Pressure Pop', effect: 'pop', badge: 'pressure-pal', explanation: 'Carbon dioxide gas formed in the sealed flask, so particle collisions with the stopper increased pressure until it moved.' },
  { id: 'warm-rate-increase', experimentId: 'temperature-rate', ingredients: ['sodium-bicarbonate', 'acetic-acid'], requiredActions: ['heated'], kind: 'success', title: 'Faster Warm Reaction', effect: 'swirl', badge: 'speed-sleuth', explanation: 'Warming increased particle motion, making effective collisions more frequent and the bubbling appear faster.' },
];

const paulingSecrets = [
  { id: 'double-carbonate-test', secret: true, ingredients: ['sodium-bicarbonate', 'sodium-carbonate'], requiredActions: ['heated'], kind: 'success', title: 'Carbonate Comparison', effect: 'lava', badge: 'secret-scientist', hint: 'Warm two carbonate sources and compare their behavior.', explanation: 'Heating the carbonate mixture models how related ions can behave differently under changed conditions.', vocabulary: ['carbonate', 'temperature'] },
  { id: 'indicator-basic-purple', secret: true, ingredients: ['red-cabbage-indicator', 'sodium-carbonate'], requiredActions: ['shaken'], kind: 'success', title: 'Basic Indicator Color', effect: 'galaxy', badge: 'secret-scientist', hint: 'Shake the indicator with a carbonate base.', explanation: 'Cabbage indicator shifted in basic solution because its pigment structure changed with pH.', vocabulary: ['indicator', 'pH'] },
  { id: 'copper-carbonate-precipitate', secret: true, ingredients: ['copper-sulfate', 'sodium-carbonate'], requiredActions: ['stirred'], kind: 'success', title: 'Copper Carbonate Precipitate', effect: 'disco', badge: 'secret-scientist', hint: 'Combine blue copper ions with carbonate ions and stir.', explanation: 'Copper ions and carbonate ions can form a low-solubility solid, producing a visible precipitate.', vocabulary: ['precipitate', 'ions', 'solubility'] },
];

const paulingFailures = henryFailures.map((failure) => ({
  ...failure,
  title: failure.id === 'duck-portal' ? 'Uncontrolled Variable' : failure.title,
  explanation: failure.id === 'duck-portal'
    ? 'The combination did not match a supported reaction model. Revise one variable, then test again.'
    : failure.explanation.replace(/pretend|cartoon/gi, 'classroom-model'),
}));

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
    funnyFailures: henryFailures,
    safetyText: 'All reagents are pretend. Real experiments need a trusted grown-up, goggles, and safe school instructions.',
    colors: { menuBackground: '#15183a', labBackground: '#232a62', sandboxBackground: '#1a3a2a', accent: '#ffd166', cardFill: 0xfff7d6, cardStroke: 0x8a5a24 },
    labels: { play: 'Play as Henry', sandbox: '🧪 MAD MIX (Sandbox)', levelTitle: 'Choose a Lab Card', labIngredients: '2. Grab Ingredients', labTools: '3. Lab Tools', meter: 'Chaos Meter', mix: 'MIX!' },
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
    funnyFailures: paulingFailures,
    safetyText: 'Use classroom chemistry only with an instructor, goggles, labeled dilute solutions, and approved disposal instructions.',
    colors: { menuBackground: '#102334', labBackground: '#18354a', sandboxBackground: '#17352d', accent: '#9de8ff', cardFill: 0xf4fbff, cardStroke: 0x235b72 },
    labels: { play: 'Study with Linus Pauling', sandbox: '🔬 Open Exploration', levelTitle: 'Choose a Chemistry Investigation', labIngredients: '2. Select Reagents', labTools: '3. Procedure Tools', meter: 'Safety Meter', mix: 'React!' },
  },
};

export function getMode(modeId = 'henry') {
  return modes[modeId] ?? modes.henry;
}
