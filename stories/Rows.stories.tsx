import React from 'react'
import { storiesOf } from '@storybook/react'
import { RowGrouping } from './components/Row/RowGrouping'
import { TestingEditors } from './components/Tests/TestingEditors'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Testing Editors', module).add('Editors', () => <TestingEditors />)
}
storiesOf('Rows', module).add('Row Grouping', () => <RowGrouping />)
