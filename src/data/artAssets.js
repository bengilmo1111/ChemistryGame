const reagentSize = { width: 160, height: 190 };

export const interfaceArt = [
  { key: 'art-logo', fileName: 'logo.svg', path: new URL('../assets/images/logo.svg', import.meta.url).href, width: 640, height: 180 },
  { key: 'art-junior-scientist', fileName: 'junior-scientist.svg', path: new URL('../assets/images/junior-scientist.svg', import.meta.url).href, width: 220, height: 280 },
  { key: 'art-lab-bench', fileName: 'lab-bench.svg', path: new URL('../assets/images/lab-bench.svg', import.meta.url).href, width: 1024, height: 640 },
];

export const reagentArt = [
  { key: 'art-reagent-fizz-powder', reagentId: 'fizz-powder', fileName: 'reagent-fizz-powder.svg', path: new URL('../assets/images/reagent-fizz-powder.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-sour-drops', reagentId: 'sour-drops', fileName: 'reagent-sour-drops.svg', path: new URL('../assets/images/reagent-sour-drops.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-bubble-base', reagentId: 'bubble-base', fileName: 'reagent-bubble-base.svg', path: new URL('../assets/images/reagent-bubble-base.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-purple-potion', reagentId: 'purple-potion', fileName: 'reagent-purple-potion.svg', path: new URL('../assets/images/reagent-purple-potion.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-glimmer-salt', reagentId: 'glimmer-salt', fileName: 'reagent-glimmer-salt.svg', path: new URL('../assets/images/reagent-glimmer-salt.svg', import.meta.url).href, ...reagentSize },
  { key: 'art-reagent-goo-gel', reagentId: 'goo-gel', fileName: 'reagent-goo-gel.svg', path: new URL('../assets/images/reagent-goo-gel.svg', import.meta.url).href, ...reagentSize },
];

export const effectArt = [
  { key: 'art-effect-duck-portal', effectId: 'duck', fileName: 'effect-duck-portal.svg', path: new URL('../assets/images/effect-duck-portal.svg', import.meta.url).href, width: 220, height: 220 },
  { key: 'art-effect-dragon', effectId: 'dragon', fileName: 'effect-dragon.svg', path: new URL('../assets/images/effect-dragon.svg', import.meta.url).href, width: 220, height: 220 },
  { key: 'art-effect-tornado', effectId: 'tornado', fileName: 'effect-tornado.svg', path: new URL('../assets/images/effect-tornado.svg', import.meta.url).href, width: 220, height: 220 },
  { key: 'art-effect-burp-cloud', effectId: 'burp', fileName: 'effect-burp-cloud.svg', path: new URL('../assets/images/effect-burp-cloud.svg', import.meta.url).href, width: 220, height: 220 },
  { key: 'art-effect-disco-ball', effectId: 'disco', fileName: 'effect-disco-ball.svg', path: new URL('../assets/images/effect-disco-ball.svg', import.meta.url).href, width: 220, height: 220 },
  { key: 'art-effect-lava-blobs', effectId: 'lava', fileName: 'effect-lava-blobs.svg', path: new URL('../assets/images/effect-lava-blobs.svg', import.meta.url).href, width: 220, height: 220 },
];

export const artAssets = [...interfaceArt, ...reagentArt, ...effectArt];

export function findReagentArt(reagentId) {
  return reagentArt.find((asset) => asset.reagentId === reagentId);
}
