import React from 'react'
import { storiesOf } from '@storybook/react'
import MergedCells from './components/Spanning/MergedCells'
import ColumnSpan from './components/Spanning/ColumnSpan'
import ColRowSpan from './components/Spanning/ColRowSpan'

storiesOf('Spanning', module)
  .add('Merged Cells/ Row spanning', () => <MergedCells />)
  .add('Merged Columns/ Column spanning', () => <ColumnSpan />)
  .add('Column spanning & Row spanning', () => <ColRowSpan />)
