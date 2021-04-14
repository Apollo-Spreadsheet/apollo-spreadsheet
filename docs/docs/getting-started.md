---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
slug: /
---

## Introduction

Apollo spreadsheet supports tables and grids, it has been built using React hooks, styled-components, plus it’s fully written in Typescript

### Installation

```typescript
npm i apollo-spreadsheet
```

or

```
yarn add apollo-spreadsheet
```

Example

```typescript
import { Box } from '@material-ui/core'
import React, { useMemo } from 'react'
import { Column, ColumnCellType } from 'columnGrid'
import ApolloSpreadSheet from 'ApolloSpreadsheet'
import { useApiRef } from 'api'
import { StretchMode } from 'types'

interface SpreadsheetRow {
  id: string
  order: number
  name: string
  adress: string
  phone: string
  job: string
  company: string
}

export function Spreadsheet() {
  const apiRef = useApiRef()
  const [rows, setRows] = useState<SpreadsheetRow[]>([])

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

  const headers: Column[] = useMemo(
    () => [
      {
        id: 'order',
        title: '',
        accessor: 'order',
        width: '10%',
        readOnly: true,
        disableCellCut: true,
        disableCellPaste: true,
      },
      {
        id: 'name',
        title: 'Name',
        accessor: 'name',
        width: '20%',
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
    [],
  )

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        minColumnWidth={10}
        minRowHeight={30}
        stretchMode={StretchMode.All}
        nestedHeaders={nestedHeaders}
        columns={headers}
        rows={rows}
      />
    </Box>
  )
}
```

### Features

- Documentation
- Lightweight
- Supports styled-components and CSS
- Sorting
- Travel like Excel navigation
- Row Selection
- Row Grouping
- Row and Column spanning/ Merge Cells
- Virtualizable
- Resizable
- Immutable
- Editing (comes with a Text, Numeric and Calendar editor, plus it allows you to create your own editor)
- Exports (supports CSV, Excel and JSON) - Coming Soon
- Custom renderer support (allows the developer to provide their own cell/header renderer)
- Developer friendly API
