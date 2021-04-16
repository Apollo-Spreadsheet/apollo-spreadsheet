import React from 'react'
import { storiesOf } from '@storybook/react'
import { RowGrouping } from './components/Row/RowGrouping'
//import { Editors } from './components/Editors/Editors'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Rows', module).add('Editors', () => <Editors />)
}
storiesOf('Rows', module).add('Row Grouping', () => <RowGrouping />)
