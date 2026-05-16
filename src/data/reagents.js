export const reagents = [
  {
    id: 'fizz-powder',
    name: 'Fizz Powder',
    icon: '✦',
    color: 0xfff176,
    concept: 'gas bubbles',
    clue: 'Makes sleepy liquids burp tiny gas bubbles.',
  },
  {
    id: 'sour-drops',
    name: 'Sour Drops',
    icon: '●',
    color: 0x72d6ff,
    concept: 'pH / acid',
    clue: 'A pretend sour liquid that changes how mixtures behave.',
  },
  {
    id: 'bubble-base',
    name: 'Bubble Base',
    icon: '○',
    color: 0xb4ff7a,
    concept: 'base',
    clue: 'A slippery pretend base that loves bubbles.',
  },
  {
    id: 'purple-potion',
    name: 'Purple Potion',
    icon: '◆',
    color: 0xb388ff,
    concept: 'indicator',
    clue: 'Changes color to show when a mixture is sour or basic.',
  },
  {
    id: 'glimmer-salt',
    name: 'Glimmer Salt',
    icon: '✧',
    color: 0xffffff,
    concept: 'crystals',
    clue: 'Sparkly grains that can stack into silly crystals.',
  },
  {
    id: 'goo-gel',
    name: 'Goo Gel',
    icon: '☁',
    color: 0x67f2c4,
    concept: 'viscosity',
    clue: 'Thickens a mixture so it pours slowly like slime.',
  },
];

export function findReagent(id) {
  return reagents.find((reagent) => reagent.id === id);
}
