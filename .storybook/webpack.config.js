module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [require.resolve('babel-preset-react-app')],
    },
  })

  config.resolve.extensions.push('.ts', '.tsx')
  config.externals = {
    'styled-components': {
      commonjs: 'styled-components',
      commonjs2: 'styled-components',
      amd: 'styled-components',
    },
  }
  return config
}
