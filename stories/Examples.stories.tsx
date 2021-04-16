import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Table/Table'
import { Spreadsheet } from './components/Spreadsheet/Spreadsheet'
import { VPD } from './components/VPD'
import MergedCells from './components/Spreadsheet/MergedCells'
import { MultiTheme } from './components/Table/MultiTheme'
import ColumnSpan from './components/Spreadsheet/ColumnSpan'
import ColRowSpan from './components/Spreadsheet/ColRowSpan'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Examples', module)
    .add('Spreadsheet', () => <Spreadsheet />)
    .add('VPD', () => <VPD />)
}
storiesOf('Examples', module)
  .add('Table', () => <Table />)
  .add('VPD', () => <VPD />)
  .add('Merged Cells/ Row spanning', () => <MergedCells />)
  .add('Merged Columns/ Column spanning', () => <ColumnSpan />)
  .add('Column spanning/ Row spanning', () => <ColRowSpan />)
  .add('Multiple Themes', () => <MultiTheme />)
