---
id: theme
title: 主題
sidebar_label: 主題
slug: /theme
---

Apollo 試算表預設使用 style-components，並且帶有一個使用 [Material UI](https://material-ui.com/) 建立的主題 <br/>
然而，Apollo 是完全可自訂的，可以輕鬆製作其他主題。

### 主題創建

創建一個檔案，例如：`/useApolloThemeConfig.tsx`

#### 主題導出

```typescript
export function useApolloThemeConfig() {
  const classes = useStyles()
  return { theme: classes as GridTheme, containerClass: classes.container }
}
```

#### 主題實作

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