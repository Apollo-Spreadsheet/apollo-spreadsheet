---
id: editors
title: 編輯器
sidebar_label: 編輯器
slug: /editors
---

編輯器（Cell editors）允許用戶互動並修改儲存格輸入。Apollo 以不可變的方式運作，這意味著所有數據更新管理都是通過 onChange 回調由開發者執行的。Apollo 提供了三個預設的編輯器，可以通過導入 ColumnCellType 來使用。

外部編輯器也是允許的，這些編輯器是使用定位（例如：Popper 模態）創建的，Apollo 所做的只是傳遞目標儲存格的 DOM 元素，以便你可以錨定到它，但所有的管理都遵循轉發實現了 X 和 Y 方法的參考實踐。

todo: link to storybook

```typescript
import { ApolloSpreadSheet, ColumnCellType } from 'apollo-spreadsheet'
```

## 文字

```typescript
{
	id: 'text',
	title: '文字',
	accessor: 'text',
	type: ColumnCellType.TextArea,
}
```

## 數字

```typescript
{
	id: 'number',
	title: '數字',
	accessor: 'number',
	type: ColumnCellType.Numeric,
}
```

## 日曆

```typescript
{
	id: 'calendar',
	title: '日曆',
	accessor: 'calendar',
	type: ColumnCellType.Calendar,
	editorProps: {
		className: classes.calendar,
	},
	delayEditorOpen: 500,
}
```
