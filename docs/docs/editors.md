---
id: editors
title: Editors
sidebar_label: Editors
slug: /editors
---

Editors (Cell editors) allow the user to interact and modify the cell input. Apollo works in an immutable way which means all the data update management is performed by the developer via onChange callback. Apollo brings three default editors, which can be used by importing ColumnCellType

External editors are also allowed, those editors are created using placement (e.g: Popper modal) and all that Apollo does is passes the target cell DOM element so you can anchor to it but all the management follows the practise of forwarding a reference that implements this X and Y methods

todo: link to storybook

```typescript
import { ApolloSpreadSheet, ColumnCellType } from 'apollo-spreadsheet'
```

## Text

```typescript
	{
		id: 'text',
		title: 'Text',
		accessor: 'text',
		type: ColumnCellType.TextArea,
	},
```

## Numeric

```typescript
	{
		id: 'number',
		title: 'Numbers',
		accessor: 'number',
		type: ColumnCellType.Numeric,
	},
```

## Calendar

```typescript
	{
	    id: 'calendar',
		title: 'Calendar'
		accessor: 'calendar',
		type: ColumnCellType.Calendar,
		editorProps: {
			className: classes.calendar,
		},
		delayEditorOpen: 500,
	},
```
