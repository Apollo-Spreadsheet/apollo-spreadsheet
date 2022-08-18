import React, { useCallback, useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, NavigationCoords } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { Box, Grid } from '@mui/material'
import dayjs from 'dayjs'
import { useLightModeTheme } from '../../theme/useLightModeTheme'

interface GroupRow {
  id: string
  subtotals: string
  units: string
  structure: string
  currency: string
  year: string
  year1: string
  order: number
  __children?: GroupRow[]
}

const generateRows = count => {
  const rows: GroupRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    structure: faker.finance.amount(),
    currency: faker.finance.currencySymbol(),
    year: faker.phone.phoneNumber(),
    year1: faker.random.alphaNumeric(),
    order: i + 1,
  }))

  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      subtotals: faker.address.country(),
      units: faker.name.jobType(),
      structure: faker.finance.amount(),
      currency: faker.finance.currencySymbol(),
      year: faker.phone.phoneNumber(),
      year1: faker.random.alphaNumeric(),
      order: 2.1,
      __children: [
        {
          id: faker.datatype.number().toString(),
          subtotals: faker.address.country(),
          units: faker.name.jobType(),
          structure: faker.finance.amount(),
          currency: faker.finance.currencySymbol(),
          year: faker.phone.phoneNumber(),
          year1: faker.random.alphaNumeric(),
          order: 2.2,
          __children: [
            {
              id: faker.datatype.number().toString(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
              structure: faker.finance.amount(),
              currency: faker.finance.currencySymbol(),
              year: faker.phone.phoneNumber(),
              year1: faker.random.alphaNumeric(),
              order: 2.3,
            },
            {
              id: faker.datatype.number().toString(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
              structure: faker.finance.amount(),
              currency: faker.finance.currencySymbol(),
              year: faker.phone.phoneNumber(),
              year1: faker.random.alphaNumeric(),
              order: 2.4,
            },
            {
              id: faker.datatype.number().toString(),
              subtotals: faker.address.country(),
              units: faker.name.jobType(),
              structure: faker.finance.amount(),
              currency: faker.finance.currencySymbol(),
              year: faker.phone.phoneNumber(),
              year1: faker.random.alphaNumeric(),
              order: 2.5,
            },
          ],
        },
      ],
    },
  ]
  rows.push({
    id: faker.datatype.number().toString(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    structure: faker.finance.amount(),
    currency: faker.finance.currencySymbol(),
    year: faker.phone.phoneNumber(),
    year1: faker.random.alphaNumeric(),
    order: 3,
    __children: [
      {
        id: faker.datatype.number().toString(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        structure: faker.finance.amount(),
        currency: faker.finance.currencySymbol(),
        year: faker.phone.phoneNumber(),
        year1: faker.random.alphaNumeric(),
        order: 3.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    structure: faker.finance.amount(),
    currency: faker.finance.currencySymbol(),
    year: faker.phone.phoneNumber(),
    year1: faker.random.alphaNumeric(),
    order: 4,
    __children: [
      {
        id: faker.datatype.number().toString(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        structure: faker.finance.amount(),
        currency: faker.finance.currencySymbol(),
        year: faker.phone.phoneNumber(),
        year1: faker.random.alphaNumeric(),
        order: 4.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    structure: faker.finance.amount(),
    currency: faker.finance.currencySymbol(),
    year: faker.phone.phoneNumber(),
    year1: faker.random.alphaNumeric(),
    order: 5,
    __children: [
      {
        id: faker.datatype.number().toString(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        structure: faker.finance.amount(),
        currency: faker.finance.currencySymbol(),
        year: faker.phone.phoneNumber(),
        year1: faker.random.alphaNumeric(),
        order: 5.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    subtotals: faker.address.country(),
    units: faker.name.jobType(),
    structure: faker.finance.amount(),
    currency: faker.finance.currencySymbol(),
    year: faker.phone.phoneNumber(),
    year1: faker.random.alphaNumeric(),
    order: 6,
    __children: [
      {
        id: faker.datatype.number().toString(),
        subtotals: faker.address.country(),
        units: faker.name.jobType(),
        structure: faker.finance.amount(),
        currency: faker.finance.currencySymbol(),
        year: faker.phone.phoneNumber(),
        year1: faker.random.alphaNumeric(),
        order: 6.1,
      },
    ],
  })
  return rows
}

export function Financial() {
  const [rows, setRows] = useState<GroupRow[]>(() => {
    return generateRows(2)
  })
  const apiRef = useApiRef()
  const apiRef2 = useApiRef()
  const apiRef3 = useApiRef()
  const apiRef4 = useApiRef()
  const useTheme = useLightModeTheme()

  const year = dayjs().year()
  const yearFormat = dayjs().format('YY')

  const year1 = dayjs().year(2023).format('YYYY')
  const year1Format = dayjs().year(2023).format('YY')

  const headerOne: Column[] = [
    {
      id: 'subtotals',
      title: 'Sub Totals',
      accessor: 'subtotals',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
    {
      id: 'units',
      title: 'Units',
      accessor: 'units',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 150,
    },
  ]

  const headerTwo: Column[] = [
    {
      id: 'year',
      title: year.toString(),
      accessor: 'year',
      width: 90,
      __children: [
        { id: `${year}-01`, title: `Jan ${yearFormat}`, accessor: `${year}-01`, width: 50 },
        { id: `${year}-02`, title: `Fev ${yearFormat}`, accessor: `${year}-02`, width: 50 },
        { id: `${year}-03`, title: `Mar ${yearFormat}`, accessor: `${year}-03`, width: 50 },
        { id: `${year}-04`, title: `Apr ${yearFormat}`, accessor: `${year}-04`, width: 50 },
        { id: `${year}-05`, title: `May ${yearFormat}`, accessor: `${year}-05`, width: 50 },
        { id: `${year}-06`, title: `Jun ${yearFormat}`, accessor: `${year}-06`, width: 50 },
        { id: `${year}-07`, title: `Jul ${yearFormat}`, accessor: `${year}-07`, width: 50 },
        { id: `${year}-08`, title: `Ago ${yearFormat}`, accessor: `${year}-08`, width: 50 },
        { id: `${year}-09`, title: `Sep ${yearFormat}`, accessor: `${year}-09`, width: 50 },
        { id: `${year}-10`, title: `Oct ${yearFormat}`, accessor: `${year}-10`, width: 50 },
        { id: `${year}-11`, title: `Nov ${yearFormat}`, accessor: `${year}-11`, width: 50 },
        { id: `${year}-12`, title: `Dez ${yearFormat}`, accessor: `${year}-12`, width: 50 },
      ],
    },
    {
      id: 'year1',
      title: year1.toString(),
      accessor: 'year1',
      width: 90,
      __children: [
        { id: `${year1}-01`, title: `Jan ${year1Format}`, accessor: `${year}-01`, width: 50 },
        { id: `${year1}-02`, title: `Fev ${year1Format}`, accessor: `${year}-02`, width: 50 },
        { id: `${year1}-03`, title: `Mar ${year1Format}`, accessor: `${year}-03`, width: 50 },
        { id: `${year1}-04`, title: `Apr ${year1Format}`, accessor: `${year}-04`, width: 50 },
        { id: `${year1}-05`, title: `May ${year1Format}`, accessor: `${year}-05`, width: 50 },
        { id: `${year1}-06`, title: `Jun ${year1Format}`, accessor: `${year}-06`, width: 50 },
        { id: `${year1}-07`, title: `Jul ${year1Format}`, accessor: `${year}-07`, width: 50 },
        { id: `${year1}-08`, title: `Ago ${year1Format}`, accessor: `${year}-08`, width: 50 },
        { id: `${year1}-09`, title: `Sep ${year1Format}`, accessor: `${year}-09`, width: 50 },
        { id: `${year1}-10`, title: `Oct ${year1Format}`, accessor: `${year}-10`, width: 50 },
        { id: `${year1}-11`, title: `Nov ${year1Format}`, accessor: `${year}-11`, width: 50 },
        { id: `${year1}-12`, title: `Dez ${year1Format}`, accessor: `${year}-12`, width: 50 },
      ],
    },
  ]

  const headerThree: Column[] = [
    {
      id: 'structure',
      title: 'Project Structure',
      accessor: 'structure',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 120,
    },
    {
      id: 'currency',
      title: '€',
      accessor: 'currency',
      readOnly: true,
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: 120,
    },
  ]

  const getExpandedColumns = useCallback(
    (columns: string) => {
      if (apiRef2?.current && apiRef4?.current) {
        apiRef2.current.toggleColumnExpand(columns)
      }
    },
    [apiRef2, apiRef4],
  )

  const getExpandedColumnsTwo = useCallback(
    (columns: string) => {
      if (apiRef2?.current && apiRef4?.current) {
        apiRef4.current.toggleColumnExpand(columns)
      }
    },
    [apiRef2, apiRef4],
  )

  const getExpandedRows = useCallback(
    (row: string) => {
      if (apiRef3?.current) {
        apiRef4.current.toggleRowExpand(row)
      }
    },
    [apiRef3, apiRef4],
  )

  const [firstTableSelectedRows, setFirstTableSelectedRows] = useState({ rowIndex: 0, colIndex: 0 })
  const [secondTableSelectedRows, setSecondTableSelectedRows] = useState({
    rowIndex: 0,
    colIndex: 0,
  })
  const [thirdsTableSelectedRows, setThirdTableSelectedRows] = useState({
    rowIndex: 0,
    colIndex: 0,
  })
  const [fourthTableSelectedRows, setFourthTableSelectedRows] = useState({
    rowIndex: 0,
    colIndex: 0,
  })

  const getSelectedCoords = useCallback((coords: NavigationCoords) => {
    //console.log({ coords })
  }, [])

  const getSelectedCoords1 = useCallback(
    (coords: NavigationCoords) => {
      if (
        apiRef2?.current &&
        apiRef?.current &&
        (firstTableSelectedRows.colIndex !== coords.colIndex ||
          firstTableSelectedRows.rowIndex !== coords.rowIndex)
      ) {
        setFirstTableSelectedRows(coords)
        const newCoords =
          secondTableSelectedRows.colIndex !== -1
            ? { ...secondTableSelectedRows, rowIndex: coords.rowIndex }
            : { colIndex: 0, rowIndex: coords.rowIndex }
        apiRef2.current.selectCell(newCoords, true)
        setSecondTableSelectedRows(newCoords)
        setThirdTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef3.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
        setFourthTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef4.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
      }
    },
    [apiRef, apiRef2, apiRef3, apiRef4, firstTableSelectedRows, secondTableSelectedRows],
  )

  const getSelectedCoords2 = useCallback(
    (coords: NavigationCoords) => {
      if (
        apiRef2?.current &&
        apiRef?.current &&
        (secondTableSelectedRows.colIndex !== coords.colIndex ||
          secondTableSelectedRows.rowIndex !== coords.rowIndex)
      ) {
        setSecondTableSelectedRows(coords)
        const newCoords =
          firstTableSelectedRows.colIndex !== -1
            ? { ...firstTableSelectedRows, rowIndex: coords.rowIndex }
            : { colIndex: 0, rowIndex: coords.rowIndex }
        apiRef.current.selectCell(newCoords, true)
        setFirstTableSelectedRows(newCoords)
        setThirdTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef3.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
        setFourthTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef4.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
      }
    },
    [
      apiRef,
      apiRef2,
      apiRef3,
      apiRef4,
      firstTableSelectedRows,
      secondTableSelectedRows.colIndex,
      secondTableSelectedRows.rowIndex,
    ],
  )

  const getSelectedCoords3 = useCallback(
    (coords: NavigationCoords) => {
      if (
        apiRef3?.current &&
        apiRef4?.current &&
        (thirdsTableSelectedRows.colIndex !== coords.colIndex ||
          thirdsTableSelectedRows.rowIndex !== coords.rowIndex)
      ) {
        setThirdTableSelectedRows(coords)
        const newCoords =
          fourthTableSelectedRows.colIndex !== -1
            ? { ...fourthTableSelectedRows, rowIndex: coords.rowIndex }
            : { colIndex: 0, rowIndex: coords.rowIndex }
        apiRef4.current.selectCell(newCoords, true)
        setFourthTableSelectedRows(newCoords)
        setFirstTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
        setSecondTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef2.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
      }
    },
    [
      apiRef,
      apiRef2,
      apiRef3,
      apiRef4,
      fourthTableSelectedRows,
      thirdsTableSelectedRows.colIndex,
      thirdsTableSelectedRows.rowIndex,
    ],
  )

  const getSelectedCoords4 = useCallback(
    (coords: NavigationCoords) => {
      if (
        apiRef3?.current &&
        apiRef4?.current &&
        (fourthTableSelectedRows.colIndex !== coords.colIndex ||
          fourthTableSelectedRows.rowIndex !== coords.rowIndex)
      ) {
        setFourthTableSelectedRows(coords)
        const newCoords =
          thirdsTableSelectedRows.colIndex !== -1
            ? { ...thirdsTableSelectedRows, rowIndex: coords.rowIndex }
            : { colIndex: 0, rowIndex: coords.rowIndex }
        apiRef3.current.selectCell(newCoords, true)
        setThirdTableSelectedRows(newCoords)
        setFirstTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
        setSecondTableSelectedRows({ colIndex: -1, rowIndex: -1 })
        apiRef2.current.selectCell({ colIndex: -1, rowIndex: -1 }, true)
      }
    },
    [
      apiRef,
      apiRef2,
      apiRef3,
      apiRef4,
      fourthTableSelectedRows.colIndex,
      fourthTableSelectedRows.rowIndex,
      thirdsTableSelectedRows,
    ],
  )

  return (
    <Grid container display={'inline-flex'}>
      <Box width={'20%'} height={'200px'} style={{ marginRight: -14 }}>
        <ApolloSpreadSheet
          apiRef={apiRef}
          columns={headerOne}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.All}
          disableSort
          nestedColumns
          id={'grid1'}
          connectToIds={['grid2']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
          getSelectedCoords={getSelectedCoords1}
          suppressNavigation
          defaultCoords={{ rowIndex: -1, colIndex: -1 }}
        />
      </Box>
      <Box width={'80%'} height={'200px'}>
        <ApolloSpreadSheet
          apiRef={apiRef2}
          columns={headerTwo}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.None}
          disableSort
          nestedColumns
          id={'grid2'}
          connectToIds={['grid1', 'grid4']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
          onColumnCollapseChange={getExpandedColumnsTwo}
          getSelectedCoords={getSelectedCoords2}
          suppressNavigation
          defaultCoords={{ rowIndex: -1, colIndex: -1 }}
        />
      </Box>
      <Box width={'20%'} height={'calc(80vh - 100px)'} style={{ marginRight: -14 }}>
        <ApolloSpreadSheet
          apiRef={apiRef3}
          columns={headerThree}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.All}
          disableSort
          nestedRows
          nestedColumns
          id={'grid3'}
          connectToIds={['grid4']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
          // onRowCollapseChange={getExpandedRows}
          getSelectedCoords={getSelectedCoords3}
          suppressNavigation
          defaultCoords={{ rowIndex: -1, colIndex: -1 }}
        />
      </Box>
      <Box width={'80%'} height={'calc(80vh - 100px)'}>
        <ApolloSpreadSheet
          apiRef={apiRef4}
          columns={headerTwo}
          rows={rows}
          minColumnWidth={10}
          fixedRowHeight
          fixedRowWidth
          rowHeight={30}
          stretchMode={StretchMode.None}
          disableSort
          nestedRows
          nestedColumns
          id={'grid4'}
          connectToIds={['grid3', 'grid2']}
          containerClassName={useTheme.containerClass}
          theme={useTheme.theme}
          onColumnCollapseChange={getExpandedColumns}
          displayCollapseIcon={false}
          getSelectedCoords={getSelectedCoords4}
          suppressNavigation
          defaultCoords={{ rowIndex: -1, colIndex: -1 }}
        />
      </Box>
    </Grid>
  )
}
