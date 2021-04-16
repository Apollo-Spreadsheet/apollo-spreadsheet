import React, { memo, useMemo, useState } from 'react'
import { Box } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, MergeCell } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'

interface MergedRows {
  id: string
  order: number
  country: string
  city: string
  film: string
  actor: string
}

const generateFakeData = () => {
  const entries = 11
  const rows: MergedRows[] = []
  for (let i = 0; i <= entries; i++) {
    rows.push({
      id: faker.datatype.uuid(),
      order: i + 1,
      country: faker.address.country(),
      city: faker.address.city(),
      film: faker.name.title(),
      actor: faker.name.findName(),
    })
  }
  return rows
}

const ColRowSpan = memo(() => {
  const apiRef = useApiRef()

  //const [rows, setRows] = useState(mergedData)

  const [rows, setRows] = useState<MergedRows[]>(() => {
    return generateFakeData()
  })

  const mergeCellData: MergeCell[] = [
    {
      rowIndex: 0,
      colIndex: 1,
      colSpan: 4,
      rowSpan: 3,
    },
    {
      rowIndex: 3,
      colIndex: 1,
      colSpan: 2,
      rowSpan: 3,
    },
    {
      rowIndex: 3,
      colIndex: 2,
      colSpan: 2,
      rowSpan: 3,
    },
    {
      rowIndex: 6,
      colIndex: 1,
      colSpan: 2,
      rowSpan: 3,
    },
    {
      rowIndex: 6,
      colIndex: 2,
      colSpan: 2,
      rowSpan: 3,
    },
  ]

  const columns: Column[] = useMemo(
    () => [
      {
        id: 'order',
        accessor: 'order',
        title: '',
        readOnly: true,
        disableBackspace: true,
        disableCellCut: true,
        width: '2%',
        metadata: {
          columnCreationType: 'order',
        },
      },
      {
        id: 'country',
        title: 'Country',
        accessor: 'country',
        width: '15%',
        readOnly: true,
        metadata: {
          columnCreationType: 'country',
        },
      },
      {
        id: 'city',
        title: 'City',
        accessor: 'city',
        width: '14%',
        readOnly: true,
        metadata: {
          columnCreationParent: 'country',
          columnCreationType: 'city',
        },
      },
      {
        id: 'film',
        accessor: 'film',
        title: 'Film',
        width: '14%',
        readOnly: true,
        metadata: {
          columnCreationParent: 'city',
          columnCreationType: 'film',
        },
      },
      {
        id: 'actor',
        accessor: 'actor',
        title: 'Actor',
        width: '15%',
        readOnly: true,
        metadata: {
          columnCreationParent: 'film',
          columnCreationType: 'actor',
        },
      },
    ],
    [],
  )

  return (
    <Box width={'100%'} height={500}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={columns}
        rows={rows}
        minRowHeight={24}
        minColumnHeight={30}
        minColumnWidth={10}
        stretchMode={StretchMode.All}
        mergeCells={mergeCellData}
        highlightBorderColor={'#5984C2'}
        disableSort
      />
    </Box>
  )
})

export default ColRowSpan
