export const reagents = [
  {
    id: 'fizz-powder',
    artKey: 'art-reagent-fizz-powder',
    name: 'Fizz Powder',
    icon: '✦',
    color: 0xfff176,
    concept: 'gas bubbles',
    clue: 'Sprinkles invisible whoopee-cushion gas into sleepy liquids so foam can climb the flask.',
  },
  {
    id: 'sour-drops',
    artKey: 'art-reagent-sour-drops',
    name: 'Sour Drops',
    icon: '●',
    color: 0x72d6ff,
    concept: 'pH / acid',
    clue: 'A zingy pretend sour splash that makes pH drama without tasting anything in the lab.',
  },
  {
    id: 'bubble-base',
    artKey: 'art-reagent-bubble-base',
    name: 'Bubble Base',
    icon: '○',
    color: 0xb4ff7a,
    concept: 'base',
    clue: 'A slippery pretend base that moonwalks opposite sour drops and invites bubbles to the party.',
  },
  {
    id: 'purple-potion',
    artKey: 'art-reagent-purple-potion',
    name: 'Purple Potion',
    icon: '◆',
    color: 0xb388ff,
    concept: 'indicator',
    clue: 'A nosy purple color detective that tattles when a mixture turns sour or basic.',
  },
  {
    id: 'glimmer-salt',
    artKey: 'art-reagent-glimmer-salt',
    name: 'Glimmer Salt',
    icon: '✧',
    color: 0xffffff,
    concept: 'crystals',
    clue: 'Sparkly grains that queue up like tiny disco bricks to build silly crystal towers.',
  },
  {
    id: 'goo-gel',
    artKey: 'art-reagent-goo-gel',
    name: 'Goo Gel',
    icon: '☁',
    color: 0x67f2c4,
    concept: 'viscosity',
    clue: 'A gloopy syrup that makes liquids dawdle, stretch, and pour like runaway slime.',
  },
];

export function findReagent(id) {
  return reagents.find((reagent) => reagent.id === id);
}
