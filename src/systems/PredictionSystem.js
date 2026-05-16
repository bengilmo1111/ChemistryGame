export const predictions = [
  { id: 'foam', label: 'Foam climbs up', icon: '🫧', effects: ['foam'] },
  { id: 'color', label: 'Color changes', icon: '🌈', effects: ['rainbow'] },
  { id: 'crystal', label: 'Crystals grow', icon: '💎', effects: ['crystal'] },
  { id: 'chaos', label: 'Funny chaos', icon: '💥', effects: ['cork', 'soot', 'slime', 'duck'] },
];

export default class PredictionSystem {
  constructor() {
    this.currentPrediction = null;
  }

  choose(predictionId) {
    this.currentPrediction = predictions.find((prediction) => prediction.id === predictionId) ?? null;
    return this.currentPrediction;
  }

  matchesOutcome(outcome) {
    return Boolean(this.currentPrediction?.effects.includes(outcome.effect));
  }
}
