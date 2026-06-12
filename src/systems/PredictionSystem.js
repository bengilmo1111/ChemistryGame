export const predictions = [
  { id: 'foam', label: 'Foam climbs up', icon: '🫧', effects: ['foam'] },
  { id: 'color', label: 'Color changes', icon: '🌈', effects: ['rainbow', 'disco', 'galaxy'] },
  { id: 'crystal', label: 'Crystals grow', icon: '💎', effects: ['crystal', 'snow'] },
  { id: 'layers', label: 'Layers stack', icon: '🥞', effects: ['layers'] },
  { id: 'pressure', label: 'Pressure pops', icon: '🚀', effects: ['pop', 'cork'] },
  { id: 'speed', label: 'Motion speeds up', icon: '⚡', effects: ['swirl', 'lava'] },
  { id: 'chaos', label: 'Funny chaos', icon: '💥', effects: ['soot', 'slime', 'duck', 'tornado', 'burp', 'blob', 'dragon'] },
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
