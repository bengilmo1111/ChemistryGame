// Pixel-density multiplier used to render text and vector art crisply when the
// fixed 1024x640 game is upscaled by Scale.FIT on high-DPI / retina screens.
// Capped so we never build absurdly large textures on phones reporting dpr 3-4.
const MAX_SCALE = 3;

export function displayScale() {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  return Math.min(Math.max(dpr, 1), MAX_SCALE);
}
