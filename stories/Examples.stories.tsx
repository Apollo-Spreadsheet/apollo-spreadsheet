import React from 'react'
import { storiesOf } from '@storybook/react'
import { Spreadsheet } from './components/Spreadsheet/Spreadsheet'
import { VPD } from './components/VPD'
import { MultiTheme } from './components/Table/MultiTheme'
import { ApolloGrid } from './components/Grid/ApolloGrid'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Examples', module)
    .add('Spreadsheet', () => <Spreadsheet />)
    .add('VPD', () => <VPD />)
}
storiesOf('Examples', module)
  .add('Multiple Themes', () => <MultiTheme />)
  .add('Grid', () => <ApolloGrid />)
