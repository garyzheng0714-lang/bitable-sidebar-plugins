# 飞书多维表格边栏插件合集

> Feishu Bitable Sidebar Plugins Collection

本目录收录了所有飞书多维表格（Lark Bitable）边栏插件，这些插件以 iframe 形式运行在多维表格侧边栏中，拥有完整的前端 UI，支持批量操作。

## 目录

| 项目 | 说明 | 技术栈 |
|------|------|--------|
| [lark-base-plugin-sidebar-text-to-table-image](./lark-base-plugin-sidebar-text-to-table-image/) | 文字转表格图片，将文本字段中的结构化数据渲染为表格图片并上传至云存储 | React + TypeScript |
| [lark-base-plugin-sidebar-Web-Extractor](./lark-base-plugin-sidebar-Web-Extractor/) | 网页正文提取器，支持 Amazon 畅销榜结构化解析，批量提取写入 | Vue 3 + Element Plus |
| [lark-base-plugin-sidebar-multi-link-to-attachment](./lark-base-plugin-sidebar-multi-link-to-attachment/) | 链接批量转附件，多组字段映射、分隔符拆分、追加/覆盖模式 | React 18 + Ant Design 5 |
| [lark-base-plugin-sidebar-row-to-document](./lark-base-plugin-sidebar-row-to-document/) | 根据行记录生成文档 | - |
| [feishu-md5-encrypt-plugin](./feishu-md5-encrypt-plugin/) | MD5 加密插件，对表格数据进行 MD5 哈希 | - |
| [bitable-poster-generator](./bitable-poster-generator/) | 海报批量生成器，从表格数据批量生成海报 | React + TypeScript + Vite |

## 与字段捷径的区别

| 特性 | 边栏插件 | 字段捷径 |
|------|---------|---------|
| 运行方式 | 前端 iframe，有完整 UI | 后端 FaaS，无 UI |
| 触发方式 | 手动在侧边栏操作 | 字段值变更自动触发 |
| 批量能力 | 原生支持批量操作 | 逐行触发 |
| 开发复杂度 | 较高（需要前端框架） | 较低（纯函数） |

## 通用开发指南

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev

# 在多维表格中加载
# 打开插件面板 → 自定义插件 → +新增插件 → 输入 http://localhost:5173/
```
