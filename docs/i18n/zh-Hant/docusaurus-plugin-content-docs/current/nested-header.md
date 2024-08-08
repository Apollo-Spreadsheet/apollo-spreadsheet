---

id: nested-header
title: 巢狀標題列
sidebar_label: 巢狀標題列
slug: /nested-header
---

Apollo 允許為你的標題列創建巢狀標題

- @todo 實作範例

```typescript
import { ApolloSpreadSheet, NestedHeader } from 'apollo-spreadsheet'
```

創建

```typescript
const nestedHeaders: NestedHeader[][]
```

返回

```typescript
<ApolloSpreadSheet
    .
    .
    .
    nestedHeaders={nestedHeaders}
    nestedRows
/>
```

範例

```typescript
const nestedHeaders: NestedHeader[][] = useMemo(
  () => [
    [
      {
        title: '巢狀標題 1',
        colSpan: 2,
        className: classes.headerClass,
      },
      {
        title: '巢狀標題 2',
        colSpan: 3,
        className: classes.headerClass,
      },
    ],
  ],
  [classes.headerClass],
)
```

`colSpan:` 標題包含的列數 <br/>
`className:` 可選