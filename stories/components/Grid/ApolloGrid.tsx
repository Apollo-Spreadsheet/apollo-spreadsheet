import React, { useMemo, useState } from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { Box } from '@mui/material'
import {
  ApolloSpreadSheet,
  StretchMode,
  Column,
  useApiRef,
  CellChangeParams,
  NestedHeader,
} from '../../../src'

interface GridRow {
  id: string
  order: number
  name: string
  description: string
  car: string
  company: string
  job: string
  street: string
  state: string
  city: string
  zipCode: string
  __children?: GridRow[]
}

const generateRows = count => {
  const rows: GridRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    order: i + 1,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
  }))

  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      order: 2.1,
      name: faker.name.findName(),
      description: faker.name.jobDescriptor(),
      car: faker.vehicle.model(),
      company: faker.company.companyName(),
      job: faker.name.jobType(),
      street: faker.address.streetAddress(),
      state: faker.address.state(),
      city: faker.address.city(),
      zipCode: faker.address.zipCode(),
      __children: [
        {
          id: faker.datatype.number().toString(),
          order: 2.2,
          name: faker.name.findName(),
          description: faker.name.jobDescriptor(),
          car: faker.vehicle.model(),
          company: faker.company.companyName(),
          job: faker.name.jobType(),
          street: faker.address.streetAddress(),
          state: faker.address.state(),
          city: faker.address.city(),
          zipCode: faker.address.zipCode(),
          __children: [
            {
              id: faker.datatype.number().toString(),
              order: 2.3,
              name: faker.name.findName(),
              description: faker.name.jobDescriptor(),
              car: faker.vehicle.model(),
              company: faker.company.companyName(),
              job: faker.name.jobType(),
              street: faker.address.streetAddress(),
              state: faker.address.state(),
              city: faker.address.city(),
              zipCode: faker.address.zipCode(),
            },
            {
              id: faker.datatype.number().toString(),
              order: 2.4,
              name: faker.name.findName(),
              description: faker.name.jobDescriptor(),
              car: faker.vehicle.model(),
              company: faker.company.companyName(),
              job: faker.name.jobType(),
              street: faker.address.streetAddress(),
              state: faker.address.state(),
              city: faker.address.city(),
              zipCode: faker.address.zipCode(),
            },
            {
              id: faker.datatype.number().toString(),
              order: 2.5,
              name: faker.name.findName(),
              description: faker.name.jobDescriptor(),
              car: faker.vehicle.model(),
              company: faker.company.companyName(),
              job: faker.name.jobType(),
              street: faker.address.streetAddress(),
              state: faker.address.state(),
              city: faker.address.city(),
              zipCode: faker.address.zipCode(),
            },
          ],
        },
      ],
    },
  ]
  rows.push({
    id: faker.datatype.number().toString(),
    order: 3,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 3.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 4,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 4.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 5,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 5.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 6,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 6.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
      {
        id: faker.datatype.number().toString(),
        order: 6.2,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
      {
        id: faker.datatype.number().toString(),
        order: 6.3,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 6,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 6.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 7,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 7.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 8,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 8.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
      {
        id: faker.datatype.number().toString(),
        order: 8.2,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
      {
        id: faker.datatype.number().toString(),
        order: 8.3,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 9,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 9.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 10,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 10.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 11,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 11.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    order: 12,
    name: faker.name.findName(),
    description: faker.name.jobDescriptor(),
    car: faker.vehicle.model(),
    company: faker.company.companyName(),
    job: faker.name.jobType(),
    street: faker.address.streetAddress(),
    state: faker.address.state(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    __children: [
      {
        id: faker.datatype.number().toString(),
        order: 12.1,
        name: faker.name.findName(),
        description: faker.name.jobDescriptor(),
        car: faker.vehicle.model(),
        company: faker.company.companyName(),
        job: faker.name.jobType(),
        street: faker.address.streetAddress(),
        state: faker.address.state(),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
      },
    ],
  })
  return rows
}

export function ApolloGrid() {
  const [rows, setRows] = useState<GridRow[]>(() => {
    return generateRows(2)
  })
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
  }

  function disableSort(header: Column) {
    return header.id === 'order'
  }

  const nestedHeaders: NestedHeader[][] = useMemo(
    () => [
      [
        {
          title: '',
          colSpan: 0,
        },
        {
          title: 'Employee',
          colSpan: 3,
        },
        {
          title: 'Company',
          colSpan: 2,
        },
        {
          title: 'Adress',
          colSpan: 4,
        },
        {
          title: '',
          colSpan: 1,
        },
      ],
    ],
    [],
  )

  const headers: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '7%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: 200,
      },
      {
        id: 'description',
        title: 'Job Title',
        accessor: 'description',
        width: 200,
      },
      {
        id: 'car',
        title: 'Car Model',
        accessor: 'car',
        width: 140,
      },
      {
        id: 'company',
        title: 'Company',
        accessor: 'company',
        width: 300,
      },
      {
        id: 'job',
        title: 'Job',
        accessor: 'job',
        width: '10%',
      },
      {
        id: 'street',
        title: 'Street',
        accessor: 'street',
        width: '15%',
      },
      {
        id: 'state',
        title: 'State',
        accessor: 'state',
        width: 160,
      },
      {
        id: 'city',
        title: 'City',
        accessor: 'city',
        width: 160,
      },
      {
        id: 'zipCode',
        title: 'Zip Code',
        accessor: 'zipCode',
        width: '10%',
      },
    ],
    [],
  )

  const onCellChange = (params: CellChangeParams) => {
    setRows(prev => {
      const updatedRows = [...prev]
      const header = headers[params.coords.colIndex]
      updatedRows.forEach(e => {
        if (e.id === (params.row as GridRow).id) {
          e[header?.accessor] = params.newValue
        }
      })
      return updatedRows
    })
  }

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={headers}
        rows={rows}
        onCellChange={onCellChange}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={35}
        stretchMode={StretchMode.None}
        selection={{
          key: 'id',
          onHeaderIconClick,
        }}
        disableSort={disableSort}
        nestedRows
        defaultExpandedIds={['9X', '8X']}
        nestedHeaders={nestedHeaders}
      />
    </Box>
  )
}
