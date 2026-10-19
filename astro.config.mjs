// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: './playground',
  outDir: './playground-dist',
  publicDir: './playground/public',
  scopedStyleStrategy: 'where',
});
