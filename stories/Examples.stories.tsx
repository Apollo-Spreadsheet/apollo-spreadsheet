import React from 'react'
import { storiesOf } from '@storybook/react'
import { Spreadsheet } from './components/Spreadsheet/Spreadsheet'
import { VPD } from './components/VPD'
import { MultiTheme } from './components/Table/MultiTheme/MultiTheme'
import { ApolloGrid } from './components/Grid/ApolloGrid'
import { NoContentTableExample } from './components/Table/NoContentTableExample'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Examples', module).add('VPD', () => <VPD />)
}
storiesOf('Examples', module)
  .add('Multiple Themes', () => <MultiTheme />)
  .add('Grid', () => <ApolloGrid />)
  .add('Spreadsheet', () => <Spreadsheet />)
  .add('No content overlay', () => <NoContentTableExample />)
