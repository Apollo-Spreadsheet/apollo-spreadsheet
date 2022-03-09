import React, { useState } from 'react'
import { Box, Grid } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { ColumnOne } from '../Financial/ColumnOne'
import { ColumnTwo } from '../Financial/ColumnTwo'

interface GroupRow {
  id: string
  name: string
  name2?: string
  city: string
  city2?: string
  country: string
  job: string
  // order: number
  __children?: GroupRow[]
}

interface SingleRow {
  order: number
}

const generateRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    name2: faker.name.findName(),
    city: faker.address.city(),
    city2: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    //  order: i + 1,
  }))
}

const generateFirstRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    order: i + 1,
  }))
}

export function BudgetTest() {
  const [firstRows, setFirstRows] = useState<SingleRow[]>(() => {
    return generateFirstRows(15)
  })
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(15)
  })
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
  }

  const onCreateRowClick = () => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        name: '',
        city: '',
        country: '',
        job: '',
        order: prev.length + 1,
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }

  const firstHeader: Column[] = [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Create your new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
    },
  ]

  const headers: Column[] = [
    // {
    //   id: 'order',
    //   title: '',
    //   accessor: 'order',
    //   readOnly: true,
    //   tooltip: 'Create your new row',
    //   disableBackspace: true,
    //   disableCellCut: true,
    //   disableCellPaste: true,
    // },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      __children: [{ id: 'name2', title: 'Name2', accessor: 'name2' }],
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      __children: [
        { id: 'city2', title: 'City2', accessor: 'city2' },
        { id: 'city3', title: 'City3', accessor: 'city3' },
      ],
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
    },
  ]

  const onCellChange = (params: CellChangeParams) => {
    const headersWithChildren: any = []

    const iterateThroughHeaders = (array: Column[]) => {
      array.forEach(e => {
        headersWithChildren.push(e)

        if (e.__children !== undefined && apiRef.current.isColumnExpanded(e.id)) {
          iterateThroughHeaders(e.__children)
        }
      })
    }
    iterateThroughHeaders(headers)
    const updateRow = prev => {
      const updatedRows = [...prev]

      const header = headersWithChildren[params.coords.colIndex]

      updatedRows.forEach(e => {
        if (e.id === (params.row as GroupRow).id) {
          e[header?.accessor] = params.newValue
        }
        if (e.__children !== undefined) {
          updateRow(e.__children)
        }
      })
      return updatedRows
    }
    setRows(prev => {
      return updateRow(prev)
    })
  }

  return (
    <Grid container display={'inline-flex'}>
      <ColumnOne />
      <ColumnTwo />
    </Grid>
  )
}
