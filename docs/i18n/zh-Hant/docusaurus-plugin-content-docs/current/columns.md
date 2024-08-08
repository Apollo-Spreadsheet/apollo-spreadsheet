---
id: column
title: 欄位
sidebar_label: 欄位
slug: /column
---

建立欄位是開始使用 Apollo 的第一步，因為這些欄位將構建網格的標頭。

**id:** 鍵

**acessor:** 在 `.ts` 檔案中創建，它將定義每個欄位的接口

**width:** 可以為每個欄位提供寬度，只要它不超過 100%。如果未提供寬度，或僅為某些欄位提供了寬度，Apollo 將計算剩餘部分並平均分配。

範例：

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
