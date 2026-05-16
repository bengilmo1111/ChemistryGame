export const hero = {
  name: 'Henry Gilmore',
  shortName: 'Henry',
  title: 'Junior Mad Scientist',
  tagline: 'Henry Gilmore, Junior Mad Scientist',
  intro: "Meet Henry Gilmore — junior mad scientist. He loves predictions, fizzes, and funny lab surprises.",
  greetings: [
    'Goggles on, Henry — what could happen here?',
    "Henry's lab notebook is ready. Make a prediction!",
    'Henry says: pick fictional ingredients and try a tool!',
    'Time to experiment, Henry. Predict first.',
  ],
};

export function greeting(index = 0) {
  return hero.greetings[index % hero.greetings.length];
}
