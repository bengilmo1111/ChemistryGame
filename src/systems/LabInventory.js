import { reagents } from '../data/reagents.js';

export default class LabInventory {
  constructor() {
    this.available = reagents;
    this.selected = [];
  }

  add(reagentId) {
    if (!this.selected.includes(reagentId)) {
      this.selected.push(reagentId);
    }
    return this.selected;
  }

  clear() {
    this.selected = [];
  }

  has(reagentId) {
    return this.selected.includes(reagentId);
  }
}
