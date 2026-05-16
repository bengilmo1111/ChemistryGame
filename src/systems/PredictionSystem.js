export const predictions = [
  { id: 'foam', label: 'Foam climbs up', icon: '🫧' },
  { id: 'color', label: 'Color changes', icon: '🌈' },
  { id: 'crystal', label: 'Crystals grow', icon: '💎' },
  { id: 'chaos', label: 'Funny chaos', icon: '💥' },
];

export default class PredictionSystem {
  constructor() {
    this.currentPrediction = null;
  }

  choose(predictionId) {
    this.currentPrediction = predictions.find((prediction) => prediction.id === predictionId) ?? null;
    return this.currentPrediction;
  }
}
