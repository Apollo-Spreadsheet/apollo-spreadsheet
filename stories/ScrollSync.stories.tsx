import React from 'react'
import { storiesOf } from '@storybook/react'
import { ScrollExample } from './components/ScrollSync/ScrollExample'
import { BudgetTest } from './components/ScrollSync/BudgetTest'

storiesOf('ScrollSync', module)
  .add('scrollSync', () => <ScrollExample />)
  .add('P&L', () => <BudgetTest />)
