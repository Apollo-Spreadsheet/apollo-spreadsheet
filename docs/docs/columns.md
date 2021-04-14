---
id: column
title: Columns
sidebar_label: Columns
slug: /column
---

Creating columns is one of the first steps to get started on Apollo, since they will build the headers for your grid

**id:** key

**acessor:** Created in a `.ts` file, it will define the interface of each column

**width:** The width for each column can be provided as long as it doesn't surprass 100%. If no width ir provided, or if it's provided only for some of the columns, Apollo will calculate the remaining and distribute it equally

Example

```typescript
const columns: Column[] = useMemo(
  () => [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Add new row',
      width: '3%',
    },
    {
      id: 'client',
      title: 'Client',
      accessor: 'client',
      tooltip: "Client's list",
      width: '30%',
      maxLength: 50,
      editorProps: {
        className: classes.cellEditor,
      },
    },
  ],
  [classes.cellEditor],
)
```

Return

```typecript
<ApolloSpreadSheet
    .
    .
    .
	columns={columns}
/>
```
