import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // Or another adapter like netlify, node, etc.

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
});