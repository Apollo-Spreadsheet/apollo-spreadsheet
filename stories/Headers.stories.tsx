import React from 'react'
import { storiesOf } from '@storybook/react'
import { NestedHeaders } from './components/Headers/NestedHeaders'
import { CustomHeaders } from './components/Headers/CustomHeaders'

storiesOf('Headers', module)
  .add('Nested Headers', () => <NestedHeaders />)
  .add('Custom Header Renderers', () => <CustomHeaders />)
