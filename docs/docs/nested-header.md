---
id: nested-header
title: Nested Headers
sidebar_label: Nested Headers
slug: /nested-header
---

Apollo allows the creation of Nested Headers for your columns

- @todo implement example

```typescript
import { ApolloSpreadSheet, NestedHeader } from 'apollo-spreadsheet'
```

Create

```typecript
const nestedHeaders: NestedHeader[][]
```

Return

```typecript
<ApolloSpreadSheet
    .
    .
    .
	nestedHeaders={nestedHeaders}
	nestedRows
/>
```

Example

```typescript
const nestedHeaders: NestedHeader[][] = useMemo(
  () => [
    [
      {
        title: 'Nested Header 1',
        colSpan: 2,
        className: classes.headerClass,
      },
      {
        title: 'Nested Header 2',
        colSpan: 3,
        className: classes.headerClass,
      },
    ],
  ],
  [classes.headerClass],
)
```

`colSpan:` Number of columns contained in the header <br/>
`className:` Optional
