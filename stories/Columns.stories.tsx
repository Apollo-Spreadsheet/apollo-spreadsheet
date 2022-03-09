import React from 'react'
import { storiesOf } from '@storybook/react'
import { ColumnGrouping } from './components/Column/ColumnsGrouping'
import { TestingEditors } from './components/Tests/TestingEditors'
import { BudgetTest } from './components/Column/BudgetTest'
import { TwoColumns } from './components/Financial/TwoColumns'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Testing Editors', module).add('Editors', () => <TestingEditors />)
}
if (isDevelopmentOnly) {
  storiesOf('Columns', module)
    .add('P&L', () => <BudgetTest />)
    .add('TwoColumns', () => <TwoColumns />)
}
storiesOf('Columns', module).add('Column Grouping', () => <ColumnGrouping />)
