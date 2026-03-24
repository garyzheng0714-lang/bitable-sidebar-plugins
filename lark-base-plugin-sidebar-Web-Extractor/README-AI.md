# 🚀 AI 开发注意事项

## 📝 提示词

### 🎯 项目介绍

我正在开发一个飞书多维表格的侧边栏插件，该插件将通过 iframe 形式嵌入到多维表格界面中。现在提供的项目是插件的 Demo 项目代码模板，已在多维表格中正常展示。我的目标是让你熟悉该插件的整体开发结构。

### ✨ 项目特点

- 📌 以 iframe 形式嵌入多维表格界面
- ✅ 已完成基础环境搭建和展示功能
- 🔧 可作为后续开发的基础模板

### 📂 项目目录结构

- 以下是项目目录结构，请仔细阅读理解，方便后续开发项目。

```
📁 lark-base-plugin-sidebar-template
├── .gitignore               Git忽略文件配置
├── LICENSE                  许可证文件
├── README-AI.md             AI开发相关说明文档
├── README.md                项目主要说明文档
├── auto-imports.d.ts        自动导入API的类型声明文件
├── components.d.ts          组件自动导入的类型声明文件
├── env.d.ts                 环境变量类型声明文件
├── index.html               项目HTML入口文件
├── lark-help/               飞书插件API帮助文档
│   ├── help-md/             多维表格 JS SDK 的API使用指南
│   └── help-ts/             多维表格 JS SDK 的 TypeScript 类型定义文件
├── package.json             项目配置和依赖管理
├── public/                  静态资源文件夹
├── src/                     源代码目录
│   ├── App.vue              应用根组件
│   ├── assets/              静态资源(图片、样式等)
│   ├── locales/             国际化语言配置
│   ├── main.js              应用入口文件
│   └── views/               视图组件目录
│       └── Form.vue         插件显示的主要页面
├── tsconfig.json            TypeScript配置
├── tsconfig.node.json       Node.js相关的TypeScript配置
└── vite.config.js           Vite构建工具配置
```

### 🛠️ 主要技术栈

- 🖥️ Vue 3：使用 `<script setup>` 语法
- 🎨 Element-Plus
- 📘 TypeScript
- 🌍 vue-i18n
- ⚡ Vite
- 📄 HTML
- 🎯 CSS

### 📦 项目已集成

- 🔄 unplugin-auto-import
- 🧩 unplugin-vue-components
  用于 Vue 相关 API 的自动导入和组件注册

参考文档

1. help-ts - API 类型定义文件

- 包含完整的 TypeScript 类型声明
- 用于类型检查和代码提示

2. help-md - API 使用指南

- 详细的接口说明
- 具体的使用方法

开发目标

1. 熟悉项目基础

- 理解项目结构和运行机制
- 掌握 API 类型定义和使用方法
- 了解 Demo 项目的实现方式

2. 功能开发要求

- 基于提供的 API 实现新功能
- 确保 TypeScript 类型安全
- 遵循 Vue 3 + Element-Plus 最佳实践
- 保证 iframe 环境下的正常运行

3. 代码实现规范

- 提供完整的代码方案
- 添加必要的代码注释
- 说明关键实现细节
- 注意可能的兼容性问题

特别说明
由于插件运行在 iframe 环境中，开发时需要特别注意：

- iframe 相关的使用限制
- 与多维表格的通信机制
- 可能的兼容性问题

### 🎨 主题设置

多维表格的主题色是：`#0442d2`

- 按钮的背景色和文字的高亮都用这个主题色

## 🔄 兼容性

### 🌍 国际化文案

- 🇺🇸 英文
  - 默认语言，在当前多维表格语言为非中文和日文时，默认使用英文
- 🇨🇳 中文
- 🇯🇵 日文
