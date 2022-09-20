const { addParameters } = require('@storybook/react')
const grommetLight = require('./theme')

addParameters({
  options: {
    theme: grommetLight,
    enableShortcuts: false,
    showNav: true,
    showPanel: false, // show the code panel by default
  },
})

module.exports = {
  stories: ['../stories/**/*.stories.tsx'],
  features: {
    postcss: false,
  },
  addons: ['storybook-css-modules-preset'],
}
