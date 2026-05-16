export const vocabularyDefinitions = {
  bubbles: 'round pockets of gas inside a liquid',
  crystals: 'solid pieces that can grow in repeating patterns',
  density: 'how packed-together something is for its size',
  dissolve: 'when tiny pieces spread out into a liquid',
  force: 'a push or pull that can move something',
  gas: 'a material that spreads out and takes up space',
  indicator: 'a color clue that changes when a mixture changes',
  layers: 'stacked parts that stay separate for a while',
  neutral: 'not very sour and not very basic',
  particles: 'tiny pretend pieces that make up materials',
  pH: 'a scale scientists use to compare sour, neutral, and basic mixtures',
  pressure: 'a push made when gas or liquid is crowded',
  'reaction speed': 'how quickly an observable change happens',
  temperature: 'how warm or cool something is',
  viscosity: 'how thick or runny a liquid is',
};

export function defineVocabulary(words = []) {
  return words.map((word) => ({
    word,
    definition: vocabularyDefinitions[word] ?? 'a science word to investigate by observing',
  }));
}

export function formatVocabularyDefinitions(words = []) {
  return defineVocabulary(words)
    .map(({ word, definition }) => `${word}: ${definition}`)
    .join('\n');
}
