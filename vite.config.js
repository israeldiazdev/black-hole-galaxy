import { defineConfig } from 'vite';

const repoName = 'black-hole-galaxy';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repoName}/` : '/'
}));
