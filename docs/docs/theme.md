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
