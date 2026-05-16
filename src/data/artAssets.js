export const interfaceArt = [
  { key: 'art-logo', fileName: 'logo.svg', path: new URL('../assets/images/logo.svg', import.meta.url).href },
  { key: 'art-junior-scientist', fileName: 'junior-scientist.svg', path: new URL('../assets/images/junior-scientist.svg', import.meta.url).href },
  { key: 'art-lab-bench', fileName: 'lab-bench.svg', path: new URL('../assets/images/lab-bench.svg', import.meta.url).href },
];

export const reagentArt = [
  { key: 'art-reagent-fizz-powder', reagentId: 'fizz-powder', fileName: 'reagent-fizz-powder.svg', path: new URL('../assets/images/reagent-fizz-powder.svg', import.meta.url).href },
  { key: 'art-reagent-sour-drops', reagentId: 'sour-drops', fileName: 'reagent-sour-drops.svg', path: new URL('../assets/images/reagent-sour-drops.svg', import.meta.url).href },
  { key: 'art-reagent-bubble-base', reagentId: 'bubble-base', fileName: 'reagent-bubble-base.svg', path: new URL('../assets/images/reagent-bubble-base.svg', import.meta.url).href },
  { key: 'art-reagent-purple-potion', reagentId: 'purple-potion', fileName: 'reagent-purple-potion.svg', path: new URL('../assets/images/reagent-purple-potion.svg', import.meta.url).href },
  { key: 'art-reagent-glimmer-salt', reagentId: 'glimmer-salt', fileName: 'reagent-glimmer-salt.svg', path: new URL('../assets/images/reagent-glimmer-salt.svg', import.meta.url).href },
  { key: 'art-reagent-goo-gel', reagentId: 'goo-gel', fileName: 'reagent-goo-gel.svg', path: new URL('../assets/images/reagent-goo-gel.svg', import.meta.url).href },
];

export const artAssets = [...interfaceArt, ...reagentArt];

export function findReagentArt(reagentId) {
  return reagentArt.find((asset) => asset.reagentId === reagentId);
}
