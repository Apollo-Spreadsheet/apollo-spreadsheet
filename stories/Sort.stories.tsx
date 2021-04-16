import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Sort/Table'
import { TableSort } from './components/Sort/TableSort'

storiesOf('Sort', module)
  .add('Simple Table', () => <Table />)
  .add('Table With Sort', () => <TableSort />)
