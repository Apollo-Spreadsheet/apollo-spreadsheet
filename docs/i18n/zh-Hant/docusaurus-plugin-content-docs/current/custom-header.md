---
id: custom-header
title: 自訂標題列
sidebar_label: 自訂標題列
slug: /custom-header
---

你可以自訂標題列，並使用圖標代替文字，或簡單地將它們留空。

範例：

```typescript
const columns: Column[] = useMemo(
  () => [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      width: '3%',
      renderer: () => {
        return (
          <IconButton>
            <AddCircleIcon />
          </IconButton>
        )
      },
    },
    {
  ],
  [],
)
```
