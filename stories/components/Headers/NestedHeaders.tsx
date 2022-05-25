import { Box, IconButton } from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  ApolloSpreadSheet,
  StretchMode,
  Column,
  useApiRef,
  ColumnCellType,
  NestedHeader,
} from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'

interface NestedRows {
  id: string
  order: number
  name: string
  adress: string
  phone: string
  job: string
  company: string
}

const generateFakeData = () => {
  const entries = 49
  const rows: NestedRows[] = []
  for (let i = 0; i <= entries; i++) {
    rows.push({
      id: faker.datatype.uuid(),
      order: i + 1,
      name: faker.name.findName(),
      adress: faker.address.streetAddress(),
      phone: faker.phone.phoneNumber(),
      job: faker.name.jobTitle(),
      company: faker.company.companyName(),
    })
  }
  return rows
}

export function NestedHeaders() {
  const apiRef = useApiRef()

  const [rows, setRows] = useState<NestedRows[]>(() => {
    return generateFakeData()
  })

  const onCreateRowClick = useCallback(() => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        order: prev.length + 1,
        name: '',
        adress: '',
        phone: '',
        job: '',
        company: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }, [apiRef])

  const nestedHeaders: NestedHeader[][] = useMemo(
    () => [
      [
        {
          title: '',
          colSpan: 0,
        },
        {
          title: 'Personal Data',
          colSpan: 3,
        },
        {
          title: 'Company',
          colSpan: 2,
        },
      ],
    ],
    [],
  )

  const columns: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '7%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
        renderer: () => {
          return (
            <IconButton onClick={onCreateRowClick}>
              <AddCircleIcon />
            </IconButton>
          )
        },
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: '10%',
      },
      {
        id: 'adress',
        title: 'Adress',
        accessor: 'adress',
        width: '20%',
      },
      {
        id: 'phone',
        title: 'Phone',
        accessor: 'phone',
        width: '20%',
        type: ColumnCellType.Numeric,
      },
      {
        id: 'job',
        title: 'Job Title',
        accessor: 'job',
        width: '20%',
      },
      {
        id: 'company',
        title: 'Company Name',
        accessor: 'company',
        width: '20%',
      },
    ],
    [onCreateRowClick],
  )

  return (
    <Box width={'100%'} height={'calc(100vh - 200px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        stretchMode={StretchMode.All}
        nestedHeaders={nestedHeaders}
        columns={columns}
        rows={rows}
        disableSort
      />
    </Box>
  )
}
