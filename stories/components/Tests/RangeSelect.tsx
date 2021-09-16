import { Box } from '@material-ui/core'
import React, { useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { ApolloSpreadSheet, Column, StretchMode, useApiRef, MergeCell } from '../../../src'
import { useLightModeTheme } from '../../theme/useLightModeTheme'

interface CustomRows {
  id: string
  order: number
  name: string
  country: string
  address: string
  email: string
}

const generateFakeData = () => {
  const entries = 50
  const rows: CustomRows[] = []
  for (let i = 0; i <= entries; i++) {
    rows.push({
      id: faker.datatype.uuid(),
      order: i + 1,
      name: faker.name.firstName(),
      country: faker.address.country(),
      address: faker.address.streetAddress(),
      email: faker.internet.email(),
    })
  }
  return rows
}

export function RangeSelect() {
  const apiRef = useApiRef()
  const lightTheme = useLightModeTheme()

  const [rows] = useState<CustomRows[]>(() => {
    return generateFakeData()
  })

  const mergeCellData: MergeCell[] = [
    {
      rowIndex: 0,
      colIndex: 1,
      colSpan: 0,
      rowSpan: 2,
    },
    {
      rowIndex: 2,
      colIndex: 1,
      colSpan: 0,
      rowSpan: 3,
    },
    {
      rowIndex: 5,
      colIndex: 1,
      colSpan: 0,
      rowSpan: 5,
    },
    //City
    {
      rowIndex: 0,
      colIndex: 2,
      colSpan: 0,
      rowSpan: 2,
    },
    {
      rowIndex: 2,
      colIndex: 2,
      colSpan: 0,
      rowSpan: 2,
    },
    {
      rowIndex: 5,
      colIndex: 2,
      colSpan: 0,
      rowSpan: 5,
    },
    //Film
    {
      rowIndex: 5,
      colIndex: 3,
      colSpan: 0,
      rowSpan: 2,
    },
    {
      rowIndex: 7,
      colIndex: 3,
      colSpan: 0,
      rowSpan: 3,
    },
  ]

  const columns: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '3%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: '25%',
      },
      {
        id: 'country',
        title: 'Country',
        accessor: 'country',
        width: '20%',
      },
      {
        id: 'address',
        title: 'Address',
        accessor: 'address',
        width: '20%',
      },
      {
        id: 'email',
        title: 'E-mail',
        accessor: 'email',
        width: '20%',
      },
    ],
    [],
  )

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        stretchMode={StretchMode.All}
        columns={columns}
        rows={rows}
        mergeCells={mergeCellData}
        theme={lightTheme.theme}
        highlightBorderColor={'#5984C2'}
        rangeSelection
      />
    </Box>
  )
}
