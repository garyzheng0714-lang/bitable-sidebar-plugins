// 单组字段映射配置
export interface FieldGroup {
  urlFieldId: string | null;
  attachmentFieldId: string | null;
  separator: string;
}

// 多组字段选择状态（覆盖写入模式作为全局设置）
export interface FieldSelection {
  groups: FieldGroup[];
  overwriteMode: boolean;
}

// 处理进度状态
export interface ProcessStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  isProcessing: boolean;
  isPaused: boolean; // 新增：是否暂停
  startTime?: number; // 新增：开始时间
  speed?: number; // 新增：处理速度（条/秒）
  estimatedTime?: number; // 新增：预计剩余时间（秒）
}

// 处理控制
export interface ProcessControl {
  shouldStop: boolean;
  isPaused: boolean;
}

// 错误信息
export interface ProcessError {
  recordId: string;
  url: string;
  error: string;
}

// 字段选项
export interface FieldOption {
  label: string;
  value: string;
}

// 文件下载结果
export interface DownloadResult {
  success: boolean;
  file?: File;
  error?: string;
}

// 多文件下载结果
export interface MultiDownloadResult {
  success: boolean;
  files: File[];
  errors: string[];
}

// 记录处理结果
export interface RecordProcessResult {
  recordId: string;
  urls: string[];
  downloadResults: DownloadResult[];
  success: boolean;
  error?: string;
}