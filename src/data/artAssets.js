const reagentSize = { width: 160, height: 190 };
const heroPortraitSize = { width: 128, height: 128 };
const heroPortraitStates = ['happy', 'thinking', 'surprised', 'worried', 'celebrating'];

export const interfaceArt = [
  { key: 'art-logo', fileName: 'logo.svg', path: new URL('../assets/images/logo.svg', import.meta.url).href, width: 640, height: 180 },
  { key: 'art-junior-scientist', fileName: 'junior-scientist.svg', path: new URL('../assets/images/junior-scientist.svg', import.meta.url).href, width: 220, height: 280 },
  { key: 'art-lab-bench', fileName: 'lab-bench.svg', path: new URL('../assets/images/lab-bench.svg', import.meta.url).href, width: 1024, height: 640 },
];

export const heroPortraitArt = ['henry', 'pauling'].flatMap((heroId) => heroPortraitStates.map((state) => ({
  key: `art-hero-${heroId}-${state}`,
  heroId,
  state,
  fileName: `hero-${heroId}-${state}.svg`,
  path: new URL(`../assets/images/hero-${heroId}-${state}.svg`, import.meta.url).href,
  ...heroPortraitSize,
})));

export const reagentArt = [
  { key: 'art-reagent-fizz-powder', reagentId: 'fizz-powder', fileName: 'reagent-fizz-powder.svg', path: new URL('../assets/images/reagent-fizz-powder.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-sour-drops', reagentId: 'sour-drops', fileName: 'reagent-sour-drops.svg', path: new URL('../assets/images/reagent-sour-drops.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-bubble-base', reagentId: 'bubble-base', fileName: 'reagent-bubble-base.svg', path: new URL('../assets/images/reagent-bubble-base.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-purple-potion', reagentId: 'purple-potion', fileName: 'reagent-purple-potion.svg', path: new URL('../assets/images/reagent-purple-potion.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-glimmer-salt', reagentId: 'glimmer-salt', fileName: 'reagent-glimmer-salt.svg', path: new URL('../assets/images/reagent-glimmer-salt.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-goo-gel', reagentId: 'goo-gel', fileName: 'reagent-goo-gel.svg', path: new URL('../assets/images/reagent-goo-gel.svg', import.meta.url).href, ...reagentSize },
];

export const artAssets = [...interfaceArt, ...heroPortraitArt, ...reagentArt];

export function findReagentArt(reagentId) {
  return reagentArt.find((asset) => asset.reagentId === reagentId);
}
