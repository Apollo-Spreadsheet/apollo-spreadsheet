---

id: getting-started
title: 入門指南
sidebar_label: 入門指南
slug: /
---

## 介紹

Apollo Spreadsheet 支援表格和網格，它是使用 React hooks 和 styled-components 構建的，並且完全用 TypeScript 編寫。

### 安裝

```typescript
npm i apollo-spreadsheet
```

或

```typescript
yarn add apollo-spreadsheet
```

範例

```typescript
import { Box } from '@mui/material'
import React, { useMemo, useState, useCallback } from 'react'
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

### 功能

- 文件
- 輕量
- 支援 styled-components 和 CSS
- 排序
- 像 Excel 一樣的導航
- 行選擇
- 行分組
- 行和列跨越/合併單元格
- 可虛擬化
- 可調整大小
- 不可變
- 編輯（附帶文本、數字和日曆編輯器，並且允許你創建自己的編輯器）
- 匯出（支援 CSV、Excel 和 JSON）- 即將推出
- 自定義渲染器支援（允許開發者提供自己的單元格/標題渲染器）
- 開發者友好的 API