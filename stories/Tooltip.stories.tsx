import React from 'react'
import { storiesOf } from '@storybook/react'
import { ColumnTooltips } from './components/Tooltips/ColumnTooltips'
import { RowTooltips } from './components/Tooltips/RowTooltips'

storiesOf('Tooltips', module)
  .add('Column Tooltips', () => <ColumnTooltips />)
  .add('Row Tooltips', () => <RowTooltips />)
