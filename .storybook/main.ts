import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook configuration. The stories double as living documentation of the
 * reusable filter system — every input type, the full builder, and the generic
 * table, each exercisable in isolation.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
};

export default config;
