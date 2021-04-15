import React from 'react'
import { storiesOf } from '@storybook/react'
import { RowGrouping } from './components/Row/RowGrouping'
import { Editors } from './components/Editors/Editors'

storiesOf('Rows', module)
  .add('Row Grouping', () => <RowGrouping />)
  .add('Editors', () => <Editors />)
