const { create } = require('@storybook/theming')

// https://storybook.js.org/docs/configurations/theming/

module.exports = create({
  base: 'light',

  colorSecondary: '#E15151',

  appBg: '#F8F8F8',
  appBorderColor: '#EDEDED',
  appBorderRadius: 6,

  barTextColor: '#999999',
  barSelectedColor: '#E15151',
  barBg: '#F2F2F2',

  inputBg: 'white',
  inputBorder: 'rgba(0,0,0,.1)',
  inputTextColor: '#333333',
  inputBorderRadius: 4,
})
