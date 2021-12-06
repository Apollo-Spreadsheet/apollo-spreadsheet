import React from 'react'
import { storiesOf } from '@storybook/react'
import { WPR } from './components/WPR/WPR'

const isDevelopmentOnly = process.env.NODE_ENV === 'development'
if (isDevelopmentOnly) {
  storiesOf('Actions - WPR', module).add('WPR', () => <WPR />)
}
