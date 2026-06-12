import { vocabularyDefinitions } from '../data/vocabulary.js';

const allWords = Object.keys(vocabularyDefinitions);

function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildQuiz(words = [], random = Math.random) {
  const known = words.filter((word) => vocabularyDefinitions[word]);
  if (!known.length) return null;
  const answer = known[Math.floor(random() * known.length)];
  const decoys = shuffle(allWords.filter((word) => word !== answer), random).slice(0, 2);
  return {
    question: `Which science word means "${vocabularyDefinitions[answer]}"?`,
    answer,
    options: shuffle([answer, ...decoys], random),
  };
}
