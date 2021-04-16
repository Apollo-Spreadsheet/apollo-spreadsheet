import React from 'react'
import { storiesOf } from '@storybook/react'
import { Table } from './components/Sort/Table'
import { TableSort } from './components/Sort/TableSort'

storiesOf('Sort', module)
  .add('Sort Enabled', () => <Table />)
  .add('Sort Disabled', () => <TableSort />)
