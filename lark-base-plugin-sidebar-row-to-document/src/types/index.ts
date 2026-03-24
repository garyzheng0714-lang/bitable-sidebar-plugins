// 模板数据模型
export interface Template {
  id: string;
  name: string;
  fileToken: string;
  version: string;
  tags?: string[];
  notes?: string;
  updatedAt: string;
  createdBy?: string;
  status?: 'active' | 'inactive';
}

// 渲染任务数据模型
export interface RenderJob {
  id: string;
  templateId: string;
  tableId: string;
  recordIds: string[];
  output: {
    type: 'attachment' | 'download' | 'print';
    fieldId?: string;
  };
  status: 'pending' | 'running' | 'success' | 'partial' | 'failed';
  stats: {
    total: number;
    ok: number;
    fail: number;
    durationMs?: number;
  };
  logs: Array<{
    recordId: string;
    ok: boolean;
    message?: string;
  }>;
}

// 字段信息
export interface FieldInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// 表格信息
export interface TableInfo {
  id: string;
  name: string;
  fields: FieldInfo[];
}

// 主题模式
export type ThemeMode = 'LIGHT' | 'DARK';

// 输出配置
export interface OutputConfig {
  type: 'attachment' | 'download' | 'print';
  fieldId?: string;
  filename?: string;
}

// 渲染上下文
export interface RenderContext {
  template: Template;
  records: any[];
  fields: FieldInfo[];
  output: OutputConfig;
}