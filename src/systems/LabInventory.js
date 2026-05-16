import { reagents } from '../data/reagents.js';

export default class LabInventory {
  constructor() {
    this.available = reagents;
    this.selected = [];
  }

  add(reagentId) {
    if (this.selected.includes(reagentId)) {
      return false;
    }

    this.selected.push(reagentId);
    return true;
  }

  clear() {
    this.selected = [];
  }

  has(reagentId) {
    return this.selected.includes(reagentId);
  }
}
