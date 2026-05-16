function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default class DangerMeter {
  constructor() {
    this.value = 0;
  }

  add(amount) {
    this.value = clamp(this.value + amount, 0, 100);
    return this.value;
  }

  label() {
    if (this.value < 35) return 'Curious';
    if (this.value < 70) return 'Wobbly';
    return 'Kaboom-ish';
  }
}
