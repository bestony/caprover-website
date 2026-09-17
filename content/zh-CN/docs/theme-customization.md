---
id: theme-customization
title: 自定义主题
sidebar_label: 自定义主题
---

_自 1.13 版本起_

CapRover 现在提供 theme customization，让你能更好地控制 dashboard 的外观和感觉。我们使用 Ant Design 作为 front-end framework，因此你可以调整 UI 来匹配自己的偏好。要开始使用，请参考 [Ant Design customization documentation](https://ant.design/docs/react/customize-theme) 获取详细指导。通过调整 primary color、border radius、font size 等变量，你可以创建一个体现品牌或品味的个性化主题。祝你主题定制愉快！

![](/img/themes.gif)

**几点说明：**

- Ant Design theme 是一个 javascript object，而不是 stringified JSON。keys 没有双引号。
- 有 3 个变量会传递给 Ant Design theme：`isDarkMode`、`darkAlgorithm` 和 `defaultAlgorithm`。例如，你可以使用 `colorBg: isDarkMode?'#010101':'#ffffff'`

### 其他自定义

除了 Ant Design theme customizations 外，还有另外两种方式可以自定义 dashboard：

#### 将元素嵌入 `<head>`

这通常用于注入字体。例如，legacy theme 使用：

```html
<link
  href="https://fonts.googleapis.com/css?family=Quicksand:300,500"
  rel="stylesheet"
/>
```

用于加载 Quicksand 字体，因为 customized Ant Design theme 会用到它。但实际上，你可以用这个输入框做任何事情！

你可以插入自定义 JS，以任意方式完全修改 dashboard 上的元素。你甚至可以插入 Google analytics tags！

#### CapRover 额外配置：

有些自定义项默认无法通过 Ant Design 修改。这些自定义项可以通过 CapRover extra configuration box 修改。

目前这里唯一的参数是 dashboard 上 side bar 的主题（light 或 dark），但未来可能会有更多参数。

```js
{
  siderTheme: "dark";
}
```



### 提交你的自定义主题！

如果你构建了一个新的有趣主题，欢迎提交 pull request，把它加入 [our built-in themes](https://github.com/caprover/caprover/tree/master/template/themes)
