import React from 'react'
import { storiesOf } from '@storybook/react'
import { ColumnGrouping } from './components/Column/ColumnsGrouping'
import { TestingEditors } from './components/Tests/TestingEditors'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Testing Editors', module).add('Editors', () => <TestingEditors />)
}
storiesOf('Columns', module).add('Column Grouping', () => <ColumnGrouping />)
