# 链接转附件插件（侧边栏）

在飞书多维表格中，将多个链接字段中的 URL 批量下载为文件并写入指定的附件字段。支持多组字段映射、分隔符拆分、追加/覆盖模式以及进度、暂停/继续控制，适用于内容导入与清洗场景。

## 技术栈
- React 18 + Ant Design 5 + TypeScript
- Vite 5（`base: './'` 已配置）
- `@lark-base-open/js-sdk@0.4.0`

## 环境要求
- 推荐 `Node.js >= 18.10`
- 飞书多维表格（Bitable）环境用于真实运行；本地支持开发与自测

## 快速开始
- 安装依赖：`npm install`
- 启动开发：`npm run dev`
- 访问开发地址：`http://localhost:5173/`
- 在多维表格中打开插件面板 → 自定义插件 → `+新增插件` → 输入 `http://localhost:5173/` 即可加载本地页面

提示：本地开发时 `index.html` 中已注明 SDK 可能受 CORS 限制；在飞书环境会自动注入 `bitable`。同时在 `src/main.tsx` 内提供了模拟数据以便本地自测。

## 使用步骤
- 在当前数据表至少准备一个 `URL` 字段和一个 `附件` 字段
- 在插件中：
  - 为每一组选择「链接字段」与「附件字段」
  - 设置 URL 分隔符（如 `,` 或 `;`），用于拆分同一单元格的多个链接
  - 切换写入模式：`追加` 或 `覆盖`
  - 点击「开始处理」，可中途暂停/继续，查看总进度与成功/失败统计

## 核心实现（代码位置）
- 字段获取：`getUrlFields`、`getAttachmentFields`（`src/utils/larkSdk.ts`）
- 记录遍历：`getRecordIds`
- 链接解析：`readMultipleUrlValues`
- 下载文件：`downloadMultipleFiles`（分批并发 + 超时保护，`src/utils/fileDownload.ts`）
- 写入附件：`saveAttachmentValue`（支持追加/覆盖）与 `setAttachmentValue`（兼容单文件写入）
- 交互组件：`FieldSelector` 与 `ProcessButton`（配置与进度控制，`src/components/`）
- 样式：统一中性配色与扁平容器（`src/assets/main.css`）

## 重要限制与安全
- 单文件大小不超过 `2GB`；文件名长度不超过 `250`
- 附件 URL 为临时链接，有效期约 `10 分钟`
- 仅在飞书授权范围内读写数据；不向外部服务发送表格数据

## 开发与构建
- 类型检查：`npm run check`
- 生产构建：`npm run build`（产物在 `dist/`）
- 直接上传产物：`package.json` 中已设置 `output: "dist"`，可用于跳过打包流程直接上传指定目录
- 本地代理：`vite.config.js` 已配置 `/api` 代理到 `https://open.feishu.cn`，便于联调

## 目录结构（关键）
- 入口：`src/main.tsx`、`src/App.tsx`
- 组件：`src/components/FieldSelector.tsx`、`src/components/ProcessButton.tsx`
- 工具：`src/utils/larkSdk.ts`、`src/utils/fileDownload.ts`
- 样式：`src/assets/main.css`
- 帮助文档：`lark-help/`（API 使用指南与类型定义）

## TODO
- 数据表、视图、字段的图标组件（与管理器图标保持一致）
- 明暗模式兼容（与多维表格主题联动）

## 许可证
- 详见 `LICENSE`
