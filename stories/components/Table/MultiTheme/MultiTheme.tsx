import { Box } from '@material-ui/core'
import React, { useCallback, useMemo, useState } from 'react'
import faker from 'faker'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef } from '../../../../src'
import { useDarkModeTheme } from '../../../theme/useDarkModeTheme'
import { useLightModeTheme } from '../../../theme/useLightModeTheme'
import { useColoredTheme } from '../../../theme/useColoredTheme'
import { ThemeSelectMenu } from './ThemeSelectMenu'

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

export function MultiTheme() {
  const apiRef = useApiRef()
  const coloredTheme = useColoredTheme()
  const darkTheme = useDarkModeTheme()
  const lightTheme = useLightModeTheme()
  const themeRecord = [darkTheme, lightTheme, coloredTheme]

  const [rows, setRows] = useState<CustomRows[]>(() => {
    return generateFakeData()
  })

  const onCreateRowClick = useCallback(() => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        order: prev.length + 1,
        name: '',
        country: '',
        address: '',
        email: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }, [apiRef])

  const [activeThemeIndex, setActiveThemeIndex] = useState(0)

  const handleChange = useCallback((index: number) => {
    setActiveThemeIndex(index)
  }, [])

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
      <ThemeSelectMenu activeThemeIndex={activeThemeIndex} handleChange={handleChange} />
      <ApolloSpreadSheet
        apiRef={apiRef}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        onCreateRow={onCreateRowClick}
        stretchMode={StretchMode.All}
        columns={columns}
        rows={rows}
        theme={themeRecord[activeThemeIndex].theme}
        highlightBorderColor={'#5984C2'}
      />
    </Box>
  )
}
