import { presetCore, presetThemeDefault } from 'anu-vue'
import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWind,
  transformerDirectives
} from 'unocss'

export default defineConfig({
  safelist: ['i-ph-github-logo-bold', 'i-ph-google-logo-bold'],
  presets: [
    presetUno(),
    presetWind(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        height: '1.5em',
        'flex-shrink': '0',
        display: 'inline-block'
      }
    }),

    // anu-vue presets
    presetCore(),
    presetThemeDefault()
  ],
  transformers: [transformerDirectives()],
  rules: [['bg-base', { 'background-color': 'var(--n-bg)' }]],
  include: [/.*\/anu-vue\.js(.*)?$/, './**/*.vue', './**/*.md']
})
