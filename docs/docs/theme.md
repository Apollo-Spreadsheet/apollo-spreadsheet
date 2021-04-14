---
id: theme
title: Theme
sidebar_label: Theme
slug: /theme
---

Apollo spreadsheet uses by default style-components, and it brings a theme built using [Material UI](https://material-ui.com/) <br/>
However, Apollo is completely customizable and another theme can be easily implemented

### Theme Creation

Create a file e.g.: `/useApolloThemeConfig.tsx`

#### Theme Export

```typescript
export function useApolloThemeConfig() {
  const classes = useStyles()
  return { theme: classes as GridTheme, containerClass: classes.container }
}
```

#### Theme Implementation

```typescript
const apolloTheme = useApolloThemeConfig()
```

```typescript
<ApolloSpreadSheet
    .
    .
    .
    containerClassName={apolloTheme.containerClass}
    theme={apolloTheme.theme}
/>
```

### Customization Examples

#### Container

```typescript
	container: {
		height: '100%',
		width: '100%',
	},
```

#### Current Column

```typescript
	currentColumnClass: {
			color: 'blue'
	},
```

#### Current Row

```typescript
	currentRowClass: {
			color: 'blue',
			fontWeight: 400,
	},
```

#### Header

```typescript
	headerClass: {
			background: 'white',
			color: 'blue',
			border: 'none',
			fontWeight: 700,
	},
```

#### Cell

```typescript
	cellClass: {
		border: '1.5px solid white',
		boxShadow: '0 0px 6px 0 rgba(0,0,0,0.1)',
		backgroundColor: 'grey'
		color: 'grey',
	},
```

#### Editor

```typescript
	editorClass: {
		backgroundColor: 'grey'
		fontSize: '11px',
		fontFamily: 'Roboto',
		color: 'grey',
	},
```
