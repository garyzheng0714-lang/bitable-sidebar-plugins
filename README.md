# 飞书多维表格边栏插件合集

> Feishu / Lark Bitable sidebar plugin collection

本仓库集中维护多个飞书多维表格边栏插件。边栏插件以 iframe 形式运行在多维表格侧边栏中，通常提供完整前端界面，适合批量处理、人工配置、预览编辑和多步骤工作流。

字段捷径合集请见：[bitable-field-shortcuts](https://github.com/garyzheng0714-lang/bitable-field-shortcuts)。

## 插件目录

| 项目 | 说明 | 技术栈 |
| --- | --- | --- |
| [lark-base-plugin-sidebar-text-to-table-image](./lark-base-plugin-sidebar-text-to-table-image/) | 将文本字段中的结构化数据渲染为表格图片，并支持上传到对象存储 | Vue 3、Element Plus、Lark Base JS SDK |
| [lark-base-plugin-sidebar-Web-Extractor](./lark-base-plugin-sidebar-Web-Extractor/) | 网页信息提取工具，包含标题提取和榜单层级提取视图 | Vue 3、Element Plus、vue-i18n |
| [lark-base-plugin-sidebar-multi-link-to-attachment](./lark-base-plugin-sidebar-multi-link-to-attachment/) | 将多组链接字段批量转换为附件字段，支持字段映射和追加 / 覆盖模式 | React、Ant Design、TypeScript |
| [lark-base-plugin-sidebar-row-to-document](./lark-base-plugin-sidebar-row-to-document/) | 基于 Word 模板和多维表格记录批量生成文档 | Vue 3、Element Plus、docxtemplater |
| [feishu-md5-encrypt-plugin](./feishu-md5-encrypt-plugin/) | 批量加密 / 编码助手，支持 MD5、SHA、SM3、Base64、HMAC-SHA256 | React、TypeScript、crypto-js |
| [bitable-poster-generator](./bitable-poster-generator/) | 基于画布编辑器和表格数据批量生成海报 | React、Semi Design、Fabric.js、Express |

## 与字段捷径的区别

| 特性 | 边栏插件 | 字段捷径 |
| --- | --- | --- |
| 运行方式 | 前端 iframe，运行在多维表格侧边栏 | 后端 FaaS 函数 |
| 交互方式 | 有完整 UI，可配置、预览、批量操作 | 通过字段触发，通常无 UI |
| 适用场景 | 批量任务、人工确认、多步骤操作 | 单元格计算、自动转换、轻量 API 调用 |
| 开发重点 | 前端体验、SDK 读写、状态管理 | 函数输入输出、沙箱兼容、外部 API |

## 技术栈

本仓库的子项目彼此独立，主要使用：

- `@lark-base-open/js-sdk`
- Vue 3 / React
- Vite
- Element Plus / Ant Design / Semi Design
- TypeScript 或 JavaScript
- Fabric.js、docxtemplater、对象存储 SDK、加密库等插件专用依赖

## 项目结构

```text
.
├── README.md
├── lark-base-plugin-sidebar-text-to-table-image/
├── lark-base-plugin-sidebar-Web-Extractor/
├── lark-base-plugin-sidebar-multi-link-to-attachment/
├── lark-base-plugin-sidebar-row-to-document/
├── feishu-md5-encrypt-plugin/
└── bitable-poster-generator/
```

常见子项目结构：

```text
<plugin>/
├── src/
├── public/
├── index.html
├── package.json
├── vite.config.*
└── README.md
```

## 开始开发

进入具体插件目录后安装依赖并启动开发服务：

```bash
cd lark-base-plugin-sidebar-multi-link-to-attachment
npm install
npm run dev
```

在飞书多维表格中加载本地插件：

1. 打开多维表格插件面板。
2. 选择自定义插件。
3. 新增插件并填写本地开发地址，例如 `http://localhost:5173/`。

不同插件可能使用不同端口或预览命令，请以子目录 `package.json` 为准。

## 常用命令

常见脚本：

```bash
npm run dev      # 启动 Vite 开发服务
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
npm run test     # 部分项目提供测试
npm run lint     # 部分项目提供 lint
```

## 配置说明

- 插件访问多维表格数据时依赖 `@lark-base-open/js-sdk`，需要在飞书多维表格环境中运行才能获取真实表格上下文。
- 涉及对象存储、登录、图片生成、文档生成或外部 API 的插件，可能需要在子项目中配置环境变量或后端服务。
- 本仓库根目录没有统一的 npm 工作区配置；请在对应子目录内运行命令。

## 注意事项

- 不同插件的 UI 框架和构建配置不同，调整公共说明时不要假设所有项目共享同一套脚本。
- 构建产物不要手动提交，除非子项目 README 明确要求。
- 新增插件时，请同步更新本 README 的插件目录表和子项目 README。
