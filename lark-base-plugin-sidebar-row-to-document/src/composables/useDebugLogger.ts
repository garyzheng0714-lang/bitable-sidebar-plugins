import { ref, reactive } from 'vue';

// 日志条目接口
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'click' | 'action' | 'error' | 'state' | 'api';
  category: string;
  message: string;
  data?: any;
  element?: string;
  location?: string;
}

// 调试日志记录器
export const useDebugLogger = () => {
  const logs = ref<LogEntry[]>([]);
  const isEnabled = ref(true);
  const maxLogs = ref(1000); // 最大日志条数

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // 格式化时间戳
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // 添加日志条目
  const addLog = (
    type: LogEntry['type'],
    category: string,
    message: string,
    data?: any,
    element?: string
  ) => {
    if (!isEnabled.value) return;

    const logEntry: LogEntry = {
      id: generateId(),
      timestamp: formatTimestamp(),
      type,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      element,
      location: window.location.href
    };

    logs.value.unshift(logEntry);

    // 限制日志数量
    if (logs.value.length > maxLogs.value) {
      logs.value = logs.value.slice(0, maxLogs.value);
    }

    // 同时输出到控制台
    const consoleMethod = type === 'error' ? 'error' : 'log';
    console[consoleMethod](`[${type.toUpperCase()}] ${category}: ${message}`, data || '');
  };

  // 记录点击事件
  const logClick = (element: string, data?: any) => {
    addLog('click', 'USER_INTERACTION', `点击了 ${element}`, data, element);
  };

  // 记录操作事件
  const logAction = (action: string, data?: any) => {
    addLog('action', 'USER_ACTION', action, data);
  };

  // 记录错误
  const logError = (error: string, data?: any) => {
    addLog('error', 'ERROR', error, data);
  };

  // 记录状态变化
  const logState = (state: string, data?: any) => {
    addLog('state', 'STATE_CHANGE', state, data);
  };

  // 记录API调用
  const logApi = (api: string, data?: any) => {
    addLog('api', 'API_CALL', api, data);
  };

  // 清空日志
  const clearLogs = () => {
    logs.value = [];
    console.clear();
    addLog('action', 'SYSTEM', '日志已清空');
  };

  // 导出日志
  const exportLogs = () => {
    const exportData = {
      timestamp: formatTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: logs.value
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('action', 'SYSTEM', '日志已导出');
  };

  // 获取日志摘要
  const getLogSummary = () => {
    const summary = {
      total: logs.value.length,
      clicks: logs.value.filter(log => log.type === 'click').length,
      actions: logs.value.filter(log => log.type === 'action').length,
      errors: logs.value.filter(log => log.type === 'error').length,
      states: logs.value.filter(log => log.type === 'state').length,
      apis: logs.value.filter(log => log.type === 'api').length,
      lastActivity: logs.value[0]?.timestamp || '无'
    };
    return summary;
  };

  // 获取格式化的日志文本
  const getFormattedLogs = () => {
    return logs.value.map(log => {
      let line = `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.category}: ${log.message}`;
      if (log.element) line += ` (元素: ${log.element})`;
      if (log.data) line += `\n  数据: ${JSON.stringify(log.data, null, 2)}`;
      return line;
    }).join('\n\n');
  };

  // 启用/禁用日志记录
  const toggleLogging = () => {
    isEnabled.value = !isEnabled.value;
    addLog('action', 'SYSTEM', `日志记录已${isEnabled.value ? '启用' : '禁用'}`);
  };

  return {
    logs,
    isEnabled,
    maxLogs,
    addLog,
    logClick,
    logAction,
    logError,
    logState,
    logApi,
    clearLogs,
    exportLogs,
    getLogSummary,
    getFormattedLogs,
    toggleLogging
  };
};

// 全局调试日志实例
export const debugLogger = useDebugLogger();