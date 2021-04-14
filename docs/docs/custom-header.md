---
id: custom-header
title: Custom Header Renderers
sidebar_label: Custom Header Renderers
slug: /custom-header
---

You can customize your Headers and implement icons instead of text, or simply leaving them empty

Example

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
