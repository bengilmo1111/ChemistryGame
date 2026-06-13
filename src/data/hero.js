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
  successQuips: [
    "IT'S ALIIIVE! Well... sort of.",
    'My goggles! They do something after all!',
    'I meant to do that. Definitely. 100%.',
    'Quick, someone write that down. Oh wait — that\'s my job!',
    'Even my eyebrows are impressed.',
    'Science rules. The flask agrees.',
  ],
  failureQuips: [
    'Note to self: that was NOT the plan.',
    'The flask says sorry about the mess.',
    "I'm not cleaning that up. OK fine, I am.",
    'My best fails make my best stories!',
    'Whoops. Science is 90% whoops.',
    'The janitor is going to have QUESTIONS.',
  ],
};

export function greeting(index = 0) {
  return hero.greetings[index % hero.greetings.length];
}

export function randomQuip(kind = 'success') {
  const pool = kind === 'success' ? hero.successQuips : hero.failureQuips;
  return pool[Math.floor(Math.random() * pool.length)];
}
