import { defineConfig } from 'vite';

// Phaser's File loader assumes every `data:` URL is base64-encoded and
// calls atob() on it unconditionally (see Phaser 3.90 File.load). Vite's
// default `assetsInlineLimit` inlines small SVGs as URL-encoded data URIs
// (data:image/svg+xml,%3csvg...) rather than base64, which trips
// atob() with `InvalidCharacterError` on stricter engines like iOS
// Safari — the PreloadScene then crashes mid-load and the boot text
// is left frozen on the home screen.
//
// Force every asset to be emitted as a separate file (no inlining) so
// Phaser fetches it over XHR via its normal, working path.
export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
});
