export const hero = {
  name: 'Henry the Mad Scientist',
  shortName: 'Henry',
  title: 'Henry the Mad Scientist',
  tagline: 'Henry the Mad Scientist',
  intro: "Meet Henry the Mad Scientist — goggles-first experimenter. He loves predictions, fizzes, and funny lab surprises.",
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
  ingredientQuips: [
    'A brave little splash joins the science party!',
    'Into the flask you go — goggles are watching.',
    'Henry notes: excellent plop velocity.',
    'Tiny ingredient, enormous possibility!',
    'The flask just whispered, “interesting choice!”',
  ],
  toolQuips: [
    'A tool! My favorite kind of dramatic punctuation.',
    'Procedure step complete — with extra flair.',
    'Henry approves this careful chaos.',
    'The lab bench gives that move two rubber-gloved thumbs up.',
    'Aha! Changing one thing can change everything.',
  ],
  dangerQuips: [
    'Eyebrows status: cautiously elevated.',
    'The chaos meter is doing jumping jacks.',
    'That wobble has a wobble. Fascinating!',
    'Henry suggests a dramatic pause and a careful choice.',
  ],
  nearSuccessQuips: [
    'The clues are lining up like tiny lab ducks.',
    'Henry senses a recipe trying to reveal itself.',
    'That looks suspiciously close to a discovery.',
    'The flask is practically begging for the right tool.',
  ],
  failureQuips: [
    'Note to self: that was NOT the plan.',
    'The flask says sorry about the mess.',
    "I'm not cleaning that up. OK fine, I am.",
    'My best fails make my best stories!',
    'Whoops. Science is 90% whoops.',
    'The lab goblin left a tiny mop and many QUESTIONS.',
  ],
};

export function greeting(index = 0) {
  return hero.greetings[index % hero.greetings.length];
}

export function randomQuip(kind = 'success') {
  const pools = {
    success: hero.successQuips,
    failure: hero.failureQuips,
    ingredient: hero.ingredientQuips,
    tool: hero.toolQuips,
    danger: hero.dangerQuips,
    nearSuccess: hero.nearSuccessQuips,
  };
  const pool = pools[kind] ?? hero.failureQuips;
  return pool[Math.floor(Math.random() * pool.length)];
}
