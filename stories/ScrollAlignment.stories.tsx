/* eslint-disable react/require-default-props */
import React, { CSSProperties } from 'react'
import { storiesOf } from '@storybook/react'
import { StretchMode, Column, ApolloSpreadSheet } from '../src'
import faker from 'faker'
import { Alignment } from 'react-virtualized'
import { createColumnFixture } from '../src/columnGrid/fixtures/column.fixture'

interface ExampleTableProps {
  overrideRows?: any[]
  stretchMode: StretchMode
  headerData: Column[]
  scrollToAlignment?: Alignment
}

const ExampleTable = ({
  headerData,
  stretchMode,
  overrideRows,
  scrollToAlignment,
}: ExampleTableProps) => {
  const rows = new Array(20).fill(true).map(() => ({
    id: faker.datatype.number(),
    name: faker.name.findName(),
    country: faker.address.country(),
  }))
  const containerStyles: CSSProperties = {
    height: '500px',
    width: '100%',
    overflowY: 'hidden',
    flex: 1,
    display: 'flex',
  }

  return (
    <div style={containerStyles}>
      <ApolloSpreadSheet
        columns={headerData}
        rows={overrideRows ?? rows}
        minColumnWidth={120}
        stretchMode={stretchMode}
        scrollToAlignment={scrollToAlignment}
      />
    </div>
  )
}

storiesOf('Scroll Alignment', module)
  .add('Auto (default)', () => {
    const headers: Column[] = [
      createColumnFixture({ width: '20%', title: 'Id', accessor: 'id' }),
      createColumnFixture({ width: '30%', title: 'Name', accessor: 'name' }),
      createColumnFixture({ width: '10%', title: 'Country', accessor: 'country' }),
    ]
    return <ExampleTable headerData={headers} stretchMode={StretchMode.All} />
  })
  .add('Center', () => {
    const headers: Column[] = [
      createColumnFixture({ width: '20%', title: 'Id', accessor: 'id' }),
      createColumnFixture({ width: '30%', title: 'Name', accessor: 'name' }),
      createColumnFixture({ width: '10%', title: 'Country', accessor: 'country' }),
    ]
    return (
      <ExampleTable
        headerData={headers}
        stretchMode={StretchMode.All}
        scrollToAlignment={'center'}
      />
    )
  })
  .add('Start', () => {
    const headers: Column[] = [
      createColumnFixture({ width: '20%', title: 'Id', accessor: 'id' }),
      createColumnFixture({ width: '30%', title: 'Name', accessor: 'name' }),
      createColumnFixture({ width: '10%', title: 'Country', accessor: 'country' }),
    ]
    return (
      <ExampleTable
        headerData={headers}
        stretchMode={StretchMode.All}
        scrollToAlignment={'start'}
      />
    )
  })
  .add('End', () => {
    const headers: Column[] = [
      createColumnFixture({ width: '20%', title: 'Id', accessor: 'id' }),
      createColumnFixture({ width: '30%', title: 'Name', accessor: 'name' }),
      createColumnFixture({ width: '10%', title: 'Country', accessor: 'country' }),
    ]
    return (
      <ExampleTable headerData={headers} stretchMode={StretchMode.All} scrollToAlignment={'end'} />
    )
  })
