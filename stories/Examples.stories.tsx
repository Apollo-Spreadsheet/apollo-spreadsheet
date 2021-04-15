import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Table/Table'
import { Spreadsheet } from './components/Spreadsheet/Spreadsheet'
import { VPD } from './components/VPD'
import { TableWithNestedRows } from './components/Table/TableWithNestedRows'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
storiesOf('Examples', module)
  .add('Table', () => <Table />)
  .add('Table with NestedRows', () => <TableWithNestedRows />)

if (isDevelopmentOnly) {
  storiesOf('Examples', module)
    .add('Spreadsheet', () => <Spreadsheet />)
    .add('VPD', () => <VPD />)
}
